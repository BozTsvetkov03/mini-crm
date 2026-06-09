import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { updateProfile } from "../api/settingsApi";
import { getApiErrorMessage } from "../api/apiError";
import { User, Palette, Bell } from "lucide-react";
import ThemeSwitch from "../components/ThemeSwitch";

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

        {/* Notifications card — coming soon */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email reminders</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
            </div>
            {/* Toggle visual — disabled */}
            <div className="relative">
              <div className="h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
