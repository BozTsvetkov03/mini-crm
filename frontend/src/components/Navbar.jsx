import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/new_logo.png";
import logoDark from "../assets/new_logo_dark.png";
import { ChevronDown, User, Settings, LogOut, Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "text-primary-strong font-semibold"
        : "text-ink hover:text-primary-strong"
    }`;

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
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

  // Any navigation closes the mobile sheet
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdown on navigation
  const handleNavToProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-base font-medium transition ${
      isActive
        ? "bg-primary/10 text-primary-strong"
        : "text-ink hover:bg-ink/5"
    }`;

  return (
    <header className="relative z-50 border-b border-line bg-surface/90 backdrop-blur-sm transition-colors">
      <div className="mx-auto flex h-16 w-[92%] max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="flex shrink-0 items-center text-xl font-bold tracking-tight text-ink"
        >
          <img
            className="h-11 w-11 object-contain"
            src={theme === "dark" ? logoDark : logo}
            alt=""
          />
          <span className="ml-2 font-brand text-2xl font-semibold italic whitespace-nowrap text-brand">
            Atelier
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
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
                  className="flex items-center gap-1.5 rounded-xl border border-line-strong px-3 py-2 text-sm font-medium text-ink transition hover:cursor-pointer hover:bg-ink/5"
                >
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-line bg-surface py-1 shadow-lg transition-colors">
                    <button
                      type="button"
                      onClick={handleNavToProfile}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-ink/5 hover:cursor-pointer"
                    >
                      <User size={15} />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleNavToProfile}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-ink/5 hover:cursor-pointer"
                    >
                      <Settings size={15} />
                      Preferences
                    </button>
                    <hr className="my-1 border-line" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 hover:cursor-pointer"
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
                className="rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:bg-primary-strong/85"
              >
                Get Started
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="rounded-xl border border-line-strong p-2 text-ink transition hover:cursor-pointer hover:bg-ink/5"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-x-0 top-16 z-50 border-b border-line bg-surface p-3 shadow-lg md:hidden">
            {user ? (
              <>
                <NavLink to="/app" className={mobileLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/calendar" className={mobileLinkClass}>
                  Calendar
                </NavLink>
                <NavLink to="/profile" className={mobileLinkClass}>
                  Profile
                </NavLink>
                <hr className="my-1 border-line" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-danger transition hover:cursor-pointer hover:bg-danger/10"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" className={mobileLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/login" className={mobileLinkClass}>
                  Login
                </NavLink>
                <Link
                  to="/register"
                  className="mt-1 block rounded-xl bg-primary-strong px-4 py-3 text-center text-base font-medium text-white transition hover:bg-primary-strong/85"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
}

export default Navbar;
