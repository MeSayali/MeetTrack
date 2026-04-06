import { motion as Motion } from "framer-motion";
import { Brain, LockKeyhole, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

const MotionLink = Motion.create(Link);

const features = [
  { title: "Audio-to-Text", desc: "Upload .mp3 recordings and generate transcripts with speaker labels.", icon: Mic },
  { title: "NLP Insights", desc: "Get summaries, entities, and action items automatically.", icon: Brain },
  { title: "Secure Storage", desc: "Keep your meeting knowledge safe and searchable in one workspace.", icon: LockKeyhole },
];

const featureCard =
  "rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30";

export default function LandingPage() {
  return (
    <Motion.div className="space-y-10" {...fadeInProps}>
      <section className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-900/20 md:p-14 dark:shadow-black/40">
        <Motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={subtle}
          className="text-4xl font-bold md:text-6xl"
        >
          AI-Powered Meeting Intelligence
        </Motion.h1>
        <p className="mt-4 max-w-2xl text-violet-100">
          MeetTrack transforms meeting recordings into executive summaries, entity insights, and automated next actions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <MotionLink
            to="/auth"
            className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 shadow-sm"
            {...buttonHoverProps}
          >
            Get Started
          </MotionLink>
          <MotionLink
            to="/about"
            className="inline-block rounded-xl border border-white/40 px-5 py-3 font-semibold text-white"
            {...buttonHoverProps}
          >
            Learn More
          </MotionLink>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...subtle, delay: 0.08 + index * 0.07 }}
              className={featureCard}
            >
              <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </Motion.article>
          );
        })}
      </section>
    </Motion.div>
  );
}
