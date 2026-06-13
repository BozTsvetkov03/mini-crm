using Backend.Data;
using Backend.Models;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
var isDev = builder.Environment.IsDevelopment();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

    // Required when running behind Render / reverse proxies
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Google sign-in only lights up when credentials are configured (same
// pattern as Resend); without them the app runs with password auth only
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    builder.Services.AddAuthentication().AddGoogle(options =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;

        // Must live under /api so the Vite dev proxy forwards it; in prod the
        // SPA fallback would otherwise swallow the callback URL
        options.CallbackPath = "/api/auth/google/callback";

        // Not mapped by default; AuthController refuses to link accounts
        // unless Google says the email is verified
        options.ClaimActions.MapJsonKey("email_verified", "email_verified");

        // Covers user cancelling the consent screen and stale/missing
        // correlation cookies, which otherwise surface as a 500
        options.Events.OnRemoteFailure = ctx =>
        {
            ctx.Response.Redirect("/login?error=external-auth-failed");
            ctx.HandleResponse();
            return Task.CompletedTask;
        };
    });
}

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = ".crm.auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = isDev ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.ExpireTimeSpan = TimeSpan.FromDays(3);
    options.SlidingExpiration = true;

    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = ".crm.csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = isDev ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// Keys live in Postgres so they survive Render's ephemeral filesystem;
// losing them on deploy would invalidate every auth cookie and antiforgery token
builder.Services.AddDataProtection()
    .PersistKeysToDbContext<AppDbContext>()
    .SetApplicationName("crm-mini");

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter()
    );
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                Window = TimeSpan.FromMinutes(1),
                PermitLimit = 45,
                QueueLimit = 0
            }));

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                Window = TimeSpan.FromMinutes(1),
                PermitLimit = 15,
                QueueLimit = 0
            }));
});

builder.Services.Configure<Backend.Options.EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.AddSingleton(TimeProvider.System);

// Prefer Resend's HTTPS API when a key is configured (Render blocks outbound
// SMTP); SMTP remains the dev path so Mailpit keeps working locally
if (!string.IsNullOrWhiteSpace(builder.Configuration["Email:ResendApiKey"]))
    builder.Services.AddHttpClient<IEmailSender, ResendEmailSender>();
else
    builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

builder.Services.AddScoped<IReminderDigestService, ReminderDigestService>();

builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IUserSettingsService, UserSettingsService>();
builder.Services.AddScoped<IFocusSessionService, FocusSessionService>();
builder.Services.AddScoped<INotebookService, NotebookService>();

var app = builder.Build();

// Apply pending migrations on startup so Render DB stays in sync
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Must be early so ASP.NET correctly sees HTTPS behind Render proxy
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

// Serve the built SPA from wwwroot; placed before the rate limiter so
// static assets don't consume the per-IP request budget
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("frontend");

app.UseAuthentication();

app.UseRateLimiter();

app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
        var tokens = antiforgery.GetAndStoreTokens(context);

        context.Response.Cookies.Append(
            "XSRF-TOKEN",
            tokens.RequestToken!,
            new CookieOptions
            {
                HttpOnly = false,
                Secure = !app.Environment.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
    }

    await next();
});

app.UseAuthorization();

app.MapControllers();

// SPA fallback: any non-API, non-file route gets index.html for client-side routing
app.MapFallbackToFile("index.html");

app.Run();