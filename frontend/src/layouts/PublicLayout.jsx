import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-[#0c0f18]">
      <PublicNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
