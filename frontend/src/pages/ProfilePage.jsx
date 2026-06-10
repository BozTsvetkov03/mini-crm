import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getSettings, updateProfile, updateReminderSettings } from "../api/settingsApi";
import { getApiErrorMessage } from "../api/apiError";
import { User, Palette, Bell } from "lucide-react";
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
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-10 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Account card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4">
            {/* Email — read-only */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
              />
            </div>

            {/* Name — editable */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
              />
            </div>

            {saveError && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Name updated successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        {/* Preferences card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Palette size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferences</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isDark ? "Dark mode is on" : "Light mode is on"}
              </p>
            </div>
            <ThemeSwitch />
          </div>
        </section>

        {/* Notifications card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
          </div>

          {reminders === null ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {remError || "Loading…"}
            </p>
          ) : (
            <form onSubmit={handleSaveReminders} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email reminders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    A daily digest of tasks that are due soon or overdue.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminders.enabled}
                  aria-label={reminders.enabled ? "Disable email reminders" : "Enable email reminders"}
                  onClick={handleToggleReminders}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-800 ${
                    reminders.enabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      reminders.enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {reminders.enabled && (
                <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="w-24 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-emerald-900"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Send the digest after
                    </label>
                    <select
                      value={reminders.hour}
                      onChange={(e) => setReminders((r) => ({ ...r, hour: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-emerald-900"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Sent once a day, within about half an hour of this time.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time zone
                    </label>
                    <select
                      value={reminders.timeZone}
                      onChange={(e) => setReminders((r) => ({ ...r, timeZone: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-emerald-900"
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
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{remError}</p>
              )}
              {remSuccess && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Notification settings saved.
                </p>
              )}

              <button
                type="submit"
                disabled={remSaving}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
