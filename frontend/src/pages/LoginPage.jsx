import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../api/apiError";
import GoogleSignInButton from "../components/GoogleSignInButton";

// The OAuth flow reports failures via redirect query params, not API errors
const externalAuthErrors = {
  "external-auth-failed": "Google sign-in didn't complete. Please try again.",
  "external-email-unverified":
    "Your Google account email is unverified, so it can't be used to sign in.",
  locked: "Account temporarily locked. Try again in a few minutes.",
  "google-not-configured": "Google sign-in isn't available right now.",
};

function LoginPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(
    externalAuthErrors[searchParams.get("error")] ?? ""
  );
  const [notice, setNotice] = useState(
    searchParams.get("reset") === "success"
      ? "Password updated. Log in with your new password."
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/app" replace />;

  const handleChange = (e) => {
    setFormData((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/app");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-12 transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm transition-colors">
        <h1 className="mb-2 text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mb-6 text-sm text-ink-muted">
          Log in to continue managing your customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-ink">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-strong hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-danger">{error}</p>
          )}
          {notice && (
            <p className="text-sm font-medium text-primary-strong">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs uppercase tracking-wide text-ink-faint">
            or
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <GoogleSignInButton />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-strong hover:text-primary"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;