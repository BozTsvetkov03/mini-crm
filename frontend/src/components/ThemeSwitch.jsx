import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Animated sliding theme switch. Knob slides left (light) → right (dark).
 * On = dark mode.
 */
function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${
        isDark ? "bg-primary-strong" : "bg-line-strong"
      }`}
    >
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-surface shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon size={13} className="text-primary-strong" />
        ) : (
          <Sun size={13} className="text-warning" />
        )}
      </span>
    </button>
  );
}

export default ThemeSwitch;
