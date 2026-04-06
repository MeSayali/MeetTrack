import { motion as Motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { historyMeetings } from "../data/mockData";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => historyMeetings.filter((meeting) => meeting.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <Motion.div className="space-y-6" {...fadeInProps}>
      <Motion.h1
        className="text-3xl font-bold text-slate-900 dark:text-slate-100"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={subtle}
      >
        Meeting History
      </Motion.h1>
      <label className="relative block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search past meetings"
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-slate-900 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
        />
      </label>
      <Motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...subtle, delay: 0.06 }}
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Meeting</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((meeting) => (
              <tr key={meeting.id} className="border-t border-slate-100 dark:border-slate-700/80">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{meeting.title}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.date}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.participants}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.duration}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.status}</td>
                <td className="px-4 py-3">
                  <Motion.button
                    type="button"
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/25 dark:shadow-violet-900/40"
                    {...buttonHoverProps}
                  >
                    View Insights
                  </Motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Motion.div>
    </Motion.div>
  );
}
