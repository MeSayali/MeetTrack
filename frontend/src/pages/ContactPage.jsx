import { motion as Motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

const cards = [
  { icon: Mail, title: "Email", value: "support@meettrack.ai" },
  { icon: Phone, title: "Phone", value: "+1 (555) 987-1234" },
  { icon: MapPin, title: "Address", value: "120 Innovation Ave, Seattle, WA" },
];

const surface =
  "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <Motion.div className="space-y-8" {...fadeInProps}>
      <Motion.h1
        className="text-4xl font-bold text-slate-900 dark:text-slate-100"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={subtle}
      >
        Contact MeetTrack
      </Motion.h1>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...subtle, delay: 0.05 + index * 0.06 }}
              className={surface}
            >
              <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{card.value}</p>
            </Motion.article>
          );
        })}
      </section>
      <Motion.form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...subtle, delay: 0.12 }}
        className={`space-y-4 p-5 ${surface}`}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Send us a message</h2>
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Full name"
        />
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Email address"
        />
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="How can we help?"
        />
        <Motion.button
          type="submit"
          className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white shadow-sm shadow-violet-600/25 dark:shadow-violet-900/40"
          {...buttonHoverProps}
        >
          Submit
        </Motion.button>
        {sent && <p className="text-sm text-emerald-700 dark:text-emerald-400">Message submitted. We will get back shortly.</p>}
      </Motion.form>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Explore docs:{" "}
        <a className="text-violet-700 underline dark:text-violet-400" href="#">
          Documentation
        </a>{" "}
        and{" "}
        <a className="text-violet-700 underline dark:text-violet-400" href="#">
          Support Resources
        </a>
        .
      </p>
    </Motion.div>
  );
}
