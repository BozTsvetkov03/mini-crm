import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { WORKSPACE_NAV } from "./workspaceNav";
import logo from "../../assets/new_logo.png";
import logoDark from "../../assets/new_logo_dark.png";

// Shared by rail and bottom bar so active/hover styling stays in one place
const railLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary/10 text-primary-strong"
      : "text-ink-muted hover:bg-ink/5 hover:text-ink"
  }`;

// Labels are always in the DOM; the rail's overflow-hidden clips them while
// collapsed and group-hover fades them in as the rail widens
const railLabelClass =
  "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

const mobileTabClass = (isActive) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
    isActive
      ? "text-primary-strong"
      : "text-ink-muted"
  }`;

function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === "dark";
  const [moreOpen, setMoreOpen] = useState(false);

  // Crossing into another page always dismisses the sheet
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const mobilePrimary = WORKSPACE_NAV.filter((item) => item.mobilePrimary);
  const mobileSecondary = WORKSPACE_NAV.filter((item) => !item.mobilePrimary);
  // "More" lights up when the active page lives inside the sheet
  const secondaryActive =
    mobileSecondary.some((item) => location.pathname.startsWith(item.to)) ||
    location.pathname.startsWith("/profile");

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Desktop: fixed icon rail, expands on hover without shifting content */}
      <aside className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-200 hover:w-56 focus-within:w-56 md:flex">
        <NavLink
          to="/app"
          className="flex items-center gap-3 px-[1.125rem] pt-5 pb-4 text-ink"
        >
          <img
            className="h-7 w-7 shrink-0 object-contain"
            src={isDark ? logoDark : logo}
            alt=""
          />
          <span className={`${railLabelClass} font-brand text-2xl font-semibold italic text-brand`}>
            Atelier
          </span>
        </NavLink>

        <nav className="flex-1 space-y-1 px-2 pt-2">
          {WORKSPACE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={railLinkClass} title={label}>
              <Icon size={24} className="shrink-0" />
              <span className={railLabelClass}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line px-2 py-3">
          <NavLink to="/profile" className={railLinkClass} title="Profile">
            <UserRound size={24} className="shrink-0" />
            <span className={`${railLabelClass} max-w-[9rem] truncate`}>
              {user?.name ?? "Profile"}
            </span>
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:cursor-pointer hover:bg-ink/5 hover:text-ink"
          >
            {isDark ? <Sun size={24} className="shrink-0" /> : <Moon size={24} className="shrink-0" />}
            <span className={railLabelClass}>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:cursor-pointer hover:bg-danger/10"
          >
            <LogOut size={24} className="shrink-0" />
            <span className={railLabelClass}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile: primary destinations + a "More" sheet for everything else,
          so the bar stays uncrowded as modules are added */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div className="fixed inset-x-0 bottom-14 z-50 rounded-t-2xl border-t border-line bg-surface p-2 pb-3 shadow-2xl md:hidden">
          {mobileSecondary.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary-strong"
                    : "text-ink"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                isActive
                  ? "bg-primary/10 text-primary-strong"
                  : "text-ink"
              }`
            }
          >
            <UserRound size={18} />
            {user?.name ?? "Profile"}
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          <hr className="my-1 border-line" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 border-t border-line bg-surface md:hidden">
        {mobilePrimary.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) => mobileTabClass(isActive)}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          title="More"
          aria-expanded={moreOpen}
          className={mobileTabClass(moreOpen || secondaryActive)}
        >
          <Menu size={20} />
          More
        </button>
      </nav>

      {/* pl clears the rail on desktop; pb clears the bottom bar on mobile */}
      <div className="pb-16 md:pb-0 md:pl-16">
        <Outlet />
      </div>
    </div>
  );
}

export default WorkspaceLayout;
