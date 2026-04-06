import { Mic } from "lucide-react";
import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/" }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 text-violet-700 dark:text-violet-300">
      <span className="rounded-xl bg-violet-100 p-2 dark:bg-violet-900/50">
        <Mic className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight">MeetTrack</span>
    </Link>
  );
}
