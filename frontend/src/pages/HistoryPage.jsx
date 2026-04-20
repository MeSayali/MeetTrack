import { motion as Motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fadeInProps, subtle } from "../lib/motionPresets";
import useAuth from "../context/useAuth";

export default function HistoryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // 7 or 30 days
  const [error, setError] = useState(null);

  // Fetch meetings from backend
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/meetings", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMeetings(Array.isArray(data) ? data : []);
        } else {
          setMeetings([]);
          setError("Failed to load meetings");
        }
      } catch (err) {
        console.error("Error loading meetings:", err);
        setMeetings([]);
        setError(null); // Don't show error, just continue
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user?.id]);

  const filtered = useMemo(
    () => meetings.filter((meeting) => 
      (meeting.title || "").toLowerCase().includes(query.toLowerCase())
    ),
    [query, meetings],
  );

  // Prepare analytics data - group action items by date
  const analyticsData = useMemo(() => {
    try {
      if (!meetings || meetings.length === 0) return [];

      const today = new Date();
      const daysToShow = timeRange;

      // Create a map of dates with action item counts
      const dateMap = {};
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        dateMap[dateKey] = 0;
      }

      // Count action items per date
      meetings.forEach((meeting) => {
        try {
          if (!meeting.created_at) return;
          
          const meetingDate = new Date(meeting.created_at);
          if (isNaN(meetingDate.getTime())) return; // Skip invalid dates
          
          const dateKey = meetingDate.toISOString().split("T")[0];

          if (dateMap.hasOwnProperty(dateKey)) {
            // Count action items - can be a number or an array
            const itemCount = Array.isArray(meeting.action_items)
              ? meeting.action_items.length
              : (typeof meeting.action_items === 'number' ? meeting.action_items : 0);
            dateMap[dateKey] += itemCount;
          }
        } catch (e) {
          console.warn("Error processing meeting:", e);
        }
      });

      // Convert to chart data format
      return Object.entries(dateMap)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, count]) => {
          const dateObj = new Date(date + "T00:00:00");
          return {
            date: dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fullDate: date,
            actionItems: count,
          };
        });
    } catch (e) {
      console.error("Error preparing analytics data:", e);
      return [];
    }
  }, [meetings, timeRange]);

  // Format date helper
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date unavailable";
      
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formattedDate} at ${formattedTime}`;
    } catch (e) {
      return "Date unavailable";
    }
  };

  // Truncate summary to 2-3 lines (approx 150 characters)
  const truncateSummary = (text) => {
    if (!text || typeof text !== 'string') return "No summary available";
    if (text.length > 150) return text.substring(0, 150) + "...";
    return text;
  };

  return (
    <Motion.div className="space-y-8 px-4 py-6" {...fadeInProps}>
      {/* Header */}
      <div>
        <Motion.h1
          className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={subtle}
        >
          Meeting History
        </Motion.h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and manage all your meeting records and action items
        </p>
      </div>

      {/* Analytics Section */}
      {!isLoading && meetings.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...subtle, delay: 0.06 }}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30"
        >
          {/* Analytics Header with Toggle */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Action Items Over Time
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Total action items tracked per day
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange(7)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  timeRange === 7
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-600/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange(30)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  timeRange === 30
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-600/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Chart */}
          {analyticsData && analyticsData.length > 0 ? (
            <div className="w-full h-72 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                    formatter={(value) => [`${value} items`, "Action Items"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="actionItems"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ fill: "#7c3aed", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">No action items data available</p>
            </div>
          )}
        </Motion.div>
      )}

      {/* Search Bar */}
      <label className="relative block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search meetings..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-slate-900 transition-all dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
        />
      </label>

      {/* Loading State */}
      {isLoading && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-96 items-center justify-center rounded-2xl border border-slate-200/90 bg-white dark:border-slate-700/80 dark:bg-slate-900/60"
        >
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600 dark:border-violet-900/40 dark:border-t-violet-600"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading meetings...</p>
          </div>
        </Motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && meetings.length === 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30"
        >
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No meetings yet</p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Upload an audio file to get started
            </p>
          </div>
        </Motion.div>
      )}

      {/* No Results from Search */}
      {!isLoading && filtered.length === 0 && meetings.length > 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30"
        >
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No results found</p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Try adjusting your search terms
            </p>
          </div>
        </Motion.div>
      )}

      {/* Meeting Cards Grid */}
      {!isLoading && filtered.length > 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...subtle, delay: 0.12 }}
          className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((meeting, index) => {
            try {
              const actionItemCount = Array.isArray(meeting.action_items)
                ? meeting.action_items.length
                : (typeof meeting.action_items === 'number' ? meeting.action_items : 0);

              return (
                <Motion.div
                  key={meeting.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...subtle, delay: 0.12 + index * 0.05 }}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:shadow-md hover:shadow-slate-300/40 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30 dark:hover:shadow-xl dark:hover:shadow-black/40"
                >
                  {/* Meeting Title */}
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {meeting.title || "Untitled Meeting"}
                  </h3>

                  {/* Date & Time */}
                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatDateTime(meeting.created_at)}
                  </p>

                  {/* Divider */}
                  <div className="mb-4 h-px bg-slate-200 dark:bg-slate-700/50"></div>

                  {/* Summary */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-1 uppercase tracking-wide">
                      Summary
                    </p>
                    <p className="line-clamp-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {truncateSummary(meeting.summary)}
                    </p>
                  </div>

                  {/* Action Items */}
                  <div className="rounded-lg bg-violet-50/40 p-3 dark:bg-violet-950/20">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Action Items
                      </p>
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-violet-600 text-xs font-semibold text-white">
                        {actionItemCount}
                      </span>
                    </div>

                    {/* Action Items List */}
                    {actionItemCount > 0 ? (
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <p>• Pending action items to track</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 italic">
                        No action items
                      </p>
                    )}
                  </div>
                </Motion.div>
              );
            } catch (e) {
              console.warn("Error rendering meeting card:", e);
              return null;
            }
          })}
        </Motion.div>
      )}
    </Motion.div>
  );
}
