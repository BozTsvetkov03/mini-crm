import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../api/authApi";
import { getApiErrorMessage } from "../api/apiError";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setSent(true);
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
          Forgot password
        </h1>

        {sent ? (
          <p className="text-sm text-ink-muted">
            If an account exists for <strong>{email.trim()}</strong>, we&apos;ve
            sent it a password reset link. Check your inbox.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-muted">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-strong hover:text-primary"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
