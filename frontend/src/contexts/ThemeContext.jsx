import { createContext, useContext, useEffect, useState } from "react";
import { updateTheme, getSettings } from "../api/settingsApi";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  // The inline script in index.html already applied the correct class
  // before React mounted, so initialize from the live DOM state to avoid
  // any mismatch / flash.
  const [theme, setThemeState] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  /**
   * Apply `value` to the DOM + localStorage always. Persist to the DB only
   * when signed in — signed-out users keep a local-only preference (no 401 spam).
   */
  const applyTheme = (value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
    try {
      localStorage.setItem("theme", value);
    } catch {
      // ignore storage errors (e.g. private mode)
    }
    if (user) {
      updateTheme(value).catch(() => {});
    }
    setThemeState(value);
  };

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");
  const setTheme = (value) => applyTheme(value);

  // When a user signs in, their stored DB preference is authoritative —
  // hydrate from the server (server wins over the local value). We set state
  // directly here (not via applyTheme) so we don't echo the value back to the DB.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getSettings()
      .then((settings) => {
        if (cancelled || !settings?.theme) return;
        document.documentElement.classList.toggle("dark", settings.theme === "dark");
        try {
          localStorage.setItem("theme", settings.theme);
        } catch {
          // ignore storage errors
        }
        setThemeState(settings.theme);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
