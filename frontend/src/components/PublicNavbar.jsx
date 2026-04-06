import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`;

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <BrandLogo />
        <button className="rounded-lg p-2 text-slate-800 dark:text-slate-200 md:hidden" onClick={() => setOpen((value) => !value)}>
          <Menu className="h-5 w-5" />
        </button>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
          <Link
            to="/auth"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-shadow hover:shadow-md hover:shadow-violet-600/30 dark:shadow-violet-900/40"
          >
            Login / Register
          </Link>
        </nav>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className="block rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200">
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex justify-center">
            <ThemeToggle />
          </div>
          <Link to="/auth" className="mt-2 block rounded-lg bg-violet-600 px-3 py-2 text-center text-white">
            Login / Register
          </Link>
        </div>
      )}
    </header>
  );
}
