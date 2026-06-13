import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../api/authApi";
import { getApiErrorMessage } from "../api/apiError";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const linkValid = email && token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(email, token, password);
      navigate("/login?reset=success");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-12 transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm transition-colors">
        <h1 className="mb-2 text-3xl font-bold text-ink">
          Reset password
        </h1>

        {!linkValid ? (
          <p className="text-sm text-ink-muted">
            This reset link is incomplete. Request a new one from the{" "}
            <Link
              to="/forgot-password"
              className="font-medium text-primary-strong hover:text-primary"
            >
              forgot password
            </Link>{" "}
            page.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-muted">
              Choose a new password for <strong>{email}</strong>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={128}
                  placeholder="Create a password"
                  required
                  className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={128}
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default ResetPasswordPage;
