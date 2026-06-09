import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "text-emerald-600 font-semibold dark:text-emerald-400"
        : "text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
    }`;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Close dropdown on navigation
  const handleNavToProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <header className="relative z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm transition-colors dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex h-16 w-[92%] max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
        >
          <img className="h-25 w-auto" src={theme === "dark" ? logoDark : logo} alt="CRM-mini" />
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <NavLink to="/app" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/calendar" className={navLinkClass}>
                Calendar
              </NavLink>

              <ThemeToggle />

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={handleNavToProfile}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <User size={15} />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleNavToProfile}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <Settings size={15} />
                      Preferences
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:cursor-pointer dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
              >
                Get Started
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;