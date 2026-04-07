import { motion as Motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";
import useAuth from "../context/useAuth";

export default function HistoryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch meetings from backend
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/meetings", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
        }
      } catch (err) {
        console.error("Error loading meetings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user?.id]);

  const filtered = useMemo(
    () => meetings.filter((meeting) => meeting.title.toLowerCase().includes(query.toLowerCase())),
    [query, meetings],
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
        className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30"
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading meetings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No meetings found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Meeting Name</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Action Items</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((meeting) => {
                const meetingDate = new Date(meeting.date);
                const formattedDate = meetingDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric"
                });
                const formattedTime = meetingDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr key={meeting.id} className="border-t border-slate-100 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{meeting.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formattedDate} {formattedTime}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.participants}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{meeting.duration} min</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        meeting.status === "Analyzed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={meeting.summary}>
                      {meeting.summary ? meeting.summary.substring(0, 50) + "..." : "No summary"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-center">{meeting.action_items}</td>
                    <td className="px-4 py-3">
                      <Motion.button
                        type="button"
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/25 hover:bg-violet-700 dark:shadow-violet-900/40 transition-colors"
                        {...buttonHoverProps}
                      >
                        View Insights
                      </Motion.button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Motion.div>
    </Motion.div>
  );
}
