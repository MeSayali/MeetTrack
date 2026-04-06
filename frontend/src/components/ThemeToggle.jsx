import { motion as Motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import useTheme from "../context/useTheme";
import { buttonHoverProps } from "../lib/motionPresets";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      {...buttonHoverProps}
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-violet-600" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </Motion.button>
  );
}
