import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png"

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive ? "text-emerald-600 font-semibold" : "text-gray-700 hover:text-emerald-600"
    }`;

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-[92%] max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-xl font-bold text-gray-900 tracking-tight"
        >
                <img className="h-25 w-auto" src={logo} alt="CRM-mini"/>
        </Link>

        <nav className="flex items-center gap-6">
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
        </nav>
      </div>
    </header>
  );
}

export default Navbar;