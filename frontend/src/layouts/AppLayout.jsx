import { History, LayoutDashboard, LogOut, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import ThemeToggle from "../components/ThemeToggle";
import useAuth from "../context/useAuth";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
      : "text-slate-700 hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;

export default function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 transition-colors dark:bg-[#0c0f18]">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex items-center justify-between gap-2">
          <BrandLogo to="/dashboard" />
          <ThemeToggle />
        </div>
        <p className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-700 dark:bg-violet-950/60 dark:text-violet-200">
          Signed in as {user?.email}
        </p>
        <nav className="mt-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 dark:text-slate-200 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 lg:p-8 dark:bg-[#0c0f18]">
        <Outlet />
      </main>
    </div>
  );
}
