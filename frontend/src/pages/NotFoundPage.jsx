import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { buttonHoverProps, fadeInProps } from "../lib/motionPresets";

const MotionLink = Motion.create(Link);

export default function NotFoundPage() {
  return (
    <Motion.div
      className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30"
      {...fadeInProps}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Page not found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">The page you requested does not exist.</p>
      <MotionLink to="/" className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-white shadow-sm" {...buttonHoverProps}>
        Go Home
      </MotionLink>
    </Motion.div>
  );
}
