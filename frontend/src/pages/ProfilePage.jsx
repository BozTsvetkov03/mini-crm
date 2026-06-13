import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getSettings, updateProfile, updateReminderSettings } from "../api/settingsApi";
import { setPassword as setPasswordApi } from "../api/authApi";
import { getApiErrorMessage } from "../api/apiError";
import { User, Palette, Bell, Lock } from "lucide-react";
import ThemeSwitch from "../components/ThemeSwitch";

const BROWSER_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const TIME_ZONES =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [BROWSER_TIME_ZONE];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function ProfilePage() {
  const { user, login: _login } = useAuth();
  const { theme } = useTheme();

  // --- Account section ---
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);
    setSaving(true);
    try {
      await updateProfile(name.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // --- Security section ---
  // Google-created accounts start without a password; flips to true after set
  const [hasPassword, setHasPassword] = useState(user?.hasPassword ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPwError("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await setPasswordApi(hasPassword ? currentPassword : null, newPassword);
      setPwSuccess(hasPassword ? "Password changed." : "Password set. You can now also log in with it.");
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(getApiErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  // --- Email reminders section ---
  const [reminders, setReminders] = useState(null); // null while loading
  const [remSaving, setRemSaving] = useState(false);
  const [remError, setRemError] = useState("");
  const [remSuccess, setRemSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => {
        if (cancelled) return;
        setReminders({
          enabled: s.emailRemindersEnabled,
          days: s.remindDaysBefore,
          hour: s.digestHour,
          timeZone: s.timeZone || "UTC",
        });
      })
      .catch(() => {
        if (!cancelled) setRemError("Failed to load notification settings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleReminders = () => {
    setReminders((r) => ({
      ...r,
      enabled: !r.enabled,
      // First enable: default to the browser's timezone instead of UTC
      timeZone: !r.enabled && r.timeZone === "UTC" ? BROWSER_TIME_ZONE : r.timeZone,
    }));
  };

  const handleSaveReminders = async (e) => {
    e.preventDefault();
    setRemError("");
    setRemSuccess(false);
    setRemSaving(true);
    try {
      await updateReminderSettings({
        emailRemindersEnabled: reminders.enabled,
        remindDaysBefore: Number(reminders.days),
        digestHour: Number(reminders.hour),
        timeZone: reminders.timeZone,
      });
      setRemSuccess(true);
      setTimeout(() => setRemSuccess(false), 3000);
    } catch (err) {
      setRemError(getApiErrorMessage(err));
    } finally {
      setRemSaving(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-6 py-10 transition-colors">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">Profile</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Account card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-primary-strong" />
            <h2 className="text-lg font-semibold text-ink">Account</h2>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4">
            {/* Email — read-only */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-line bg-line px-3 py-2 text-ink-muted outline-none"
              />
            </div>

            {/* Name — editable */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                required
                className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>

            {saveError && (
              <p className="text-sm font-medium text-danger">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm font-medium text-primary-strong">
                Name updated successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-strong px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        {/* Security card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors">
          <div className="mb-4 flex items-center gap-2">
            <Lock size={18} className="text-primary-strong" />
            <h2 className="text-lg font-semibold text-ink">Security</h2>
          </div>

          {!hasPassword && (
            <p className="mb-4 text-sm text-ink-muted">
              You signed in with Google and don&apos;t have a password yet.
              Setting one lets you log in with email and password too.
            </p>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            {hasPassword && (
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  maxLength={128}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                maxLength={128}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                maxLength={128}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>

            {pwError && (
              <p className="text-sm font-medium text-danger">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm font-medium text-primary-strong">
                {pwSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className="rounded-xl bg-primary-strong px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pwSaving
                ? "Saving…"
                : hasPassword
                  ? "Change password"
                  : "Set password"}
            </button>
          </form>
        </section>

        {/* Preferences card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors">
          <div className="mb-4 flex items-center gap-2">
            <Palette size={18} className="text-primary-strong" />
            <h2 className="text-lg font-semibold text-ink">Preferences</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Theme</p>
              <p className="text-xs text-ink-muted">
                {isDark ? "Dark mode is on" : "Light mode is on"}
              </p>
            </div>
            <ThemeSwitch />
          </div>
        </section>

        {/* Notifications card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={18} className="text-primary-strong" />
            <h2 className="text-lg font-semibold text-ink">Notifications</h2>
          </div>

          {reminders === null ? (
            <p className="text-sm text-ink-muted">
              {remError || "Loading…"}
            </p>
          ) : (
            <form onSubmit={handleSaveReminders} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Email reminders</p>
                  <p className="text-xs text-ink-muted">
                    A daily digest of tasks that are due soon or overdue.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminders.enabled}
                  aria-label={reminders.enabled ? "Disable email reminders" : "Enable email reminders"}
                  onClick={handleToggleReminders}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${
                    reminders.enabled ? "bg-primary-strong" : "bg-line-strong"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-surface shadow-md transition-transform duration-300 ${
                      reminders.enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {reminders.enabled && (
                <div className="space-y-4 border-t border-line pt-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">
                      Remind me about tasks due within
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={reminders.days}
                        onChange={(e) => setReminders((r) => ({ ...r, days: e.target.value }))}
                        required
                        className="w-24 rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-sm text-ink-muted">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">
                      Send the digest after
                    </label>
                    <select
                      value={reminders.hour}
                      onChange={(e) => setReminders((r) => ({ ...r, hour: e.target.value }))}
                      className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-ink-muted">
                      Sent once a day, within about half an hour of this time.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">
                      Time zone
                    </label>
                    <select
                      value={reminders.timeZone}
                      onChange={(e) => setReminders((r) => ({ ...r, timeZone: e.target.value }))}
                      className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {!TIME_ZONES.includes(reminders.timeZone) && (
                        <option value={reminders.timeZone}>{reminders.timeZone}</option>
                      )}
                      {TIME_ZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {remError && (
                <p className="text-sm font-medium text-danger">{remError}</p>
              )}
              {remSuccess && (
                <p className="text-sm font-medium text-primary-strong">
                  Notification settings saved.
                </p>
              )}

              <button
                type="submit"
                disabled={remSaving}
                className="rounded-xl bg-primary-strong px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {remSaving ? "Saving…" : "Save"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
