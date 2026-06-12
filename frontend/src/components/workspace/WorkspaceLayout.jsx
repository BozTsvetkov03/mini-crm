import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Boxes, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { WORKSPACE_NAV } from "./workspaceNav";

// Shared by rail and bottom bar so active/hover styling stays in one place
const railLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
  }`;

// Labels are always in the DOM; the rail's overflow-hidden clips them while
// collapsed and group-hover fades them in as the rail widens
const railLabelClass =
  "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      {/* Desktop: fixed icon rail, expands on hover without shifting content */}
      <aside className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 hover:w-56 focus-within:w-56 md:flex dark:border-gray-800 dark:bg-gray-900">
        <NavLink
          to="/app"
          className="flex items-center gap-3 px-[1.375rem] pt-5 pb-4 text-gray-900 dark:text-gray-100"
        >
          <Boxes size={24} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className={`${railLabelClass} text-base font-bold tracking-tight`}>
            CRM Mini
          </span>
        </NavLink>

        <nav className="flex-1 space-y-1 px-2 pt-2">
          {WORKSPACE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={railLinkClass} title={label}>
              <Icon size={24} className="shrink-0" />
              <span className={railLabelClass}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-gray-200 px-2 py-3 dark:border-gray-800">
          <NavLink to="/profile" className={railLinkClass} title="Profile">
            <UserRound size={24} className="shrink-0" />
            <span className={`${railLabelClass} max-w-[9rem] truncate`}>
              {user?.name ?? "Profile"}
            </span>
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {isDark ? <Sun size={24} className="shrink-0" /> : <Moon size={24} className="shrink-0" />}
            <span className={railLabelClass}>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={24} className="shrink-0" />
            <span className={railLabelClass}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile: bottom icon bar (hover doesn't exist on touch) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900">
        {WORKSPACE_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          title="Profile"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
            }`
          }
        >
          <UserRound size={20} />
          Profile
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-red-500 dark:text-red-400"
        >
          <LogOut size={20} />
          Log out
        </button>
      </nav>

      {/* pl clears the rail on desktop; pb clears the bottom bar on mobile */}
      <div className="pb-16 md:pb-0 md:pl-16">
        <Outlet />
      </div>
    </div>
  );
}

export default WorkspaceLayout;
