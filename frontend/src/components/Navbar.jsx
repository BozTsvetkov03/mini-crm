import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "text-emerald-600 font-semibold dark:text-emerald-400"
        : "text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm transition-colors dark:border-gray-800 dark:bg-gray-900/90">
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
              <span className="text-sm text-gray-600 dark:text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 hover:cursor-pointer dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Log out
              </button>
              <ThemeToggle />
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