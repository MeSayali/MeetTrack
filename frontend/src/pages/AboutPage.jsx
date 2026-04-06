import { motion as Motion } from "framer-motion";
import { Shield, Target, Users, Zap } from "lucide-react";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

const values = [
  {
    title: "Our Mission",
    desc: "To revolutionize how teams capture, analyze, and act on meeting insights using cutting-edge AI technology.",
    icon: Target,
  },
  {
    title: "Team Focused",
    desc: "Built by professionals who understand the challenges of meeting management and information overload.",
    icon: Users,
  },
  {
    title: "Innovation First",
    desc: "Leveraging the latest advancements in NLP and machine learning to deliver unparalleled accuracy.",
    icon: Zap,
  },
  {
    title: "Privacy & Security",
    desc: "Your data is protected with enterprise-grade encryption and secure storage protocols.",
    icon: Shield,
  },
];

const team = [
  { name: "Dr. Sarah Chen", role: "Chief Technology Officer", area: "AI & Machine Learning" },
  { name: "Michael Rodriguez", role: "Head of Product", area: "UX & Product Design" },
  { name: "Jennifer Park", role: "Lead NLP Engineer", area: "Natural Language Processing" },
];

const card =
  "rounded-2xl border border-slate-100/90 bg-white p-6 text-center shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30";

export default function AboutPage() {
  return (
    <Motion.div className="space-y-14 pb-10" {...fadeInProps}>
      <section className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-violet-600 dark:text-violet-400">About MeetTrack</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          We're on a mission to transform how organizations capture and utilize meeting intelligence through the power
          of artificial intelligence.
        </p>
      </section>

      <Motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...subtle, delay: 0.05 }}
        className="mx-auto max-w-4xl rounded-2xl border border-slate-100/90 bg-white p-8 shadow-md shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-black/35"
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Our Story</h2>
        <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-400">
          <p>
            MeetTrack was born from a simple observation: too much valuable information gets lost in meetings.
            Despite hours of discussion, critical action items slip through the cracks, key insights are forgotten, and
            teams struggle to maintain accountability.
          </p>
          <p>
            Founded in 2025, our team of AI researchers, software engineers, and product designers came together to
            solve this problem. We combined expertise in natural language processing, speech recognition, and
            enterprise software to create a platform that does not just transcribe, it understands.
          </p>
          <p>
            Today, MeetTrack serves teams across industries, from startups to Fortune 500 companies, helping them
            make every meeting count. Our AI-powered platform automatically captures conversations, identifies speakers,
            extracts action items, and surfaces the insights that matter most.
          </p>
        </div>
      </Motion.section>

      <section>
        <h2 className="text-center text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">What Drives Us</h2>
        <p className="mt-2 text-center text-slate-500 dark:text-slate-400">The principles that guide everything we do</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Motion.article
                key={value.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...subtle, delay: 0.06 + index * 0.05 }}
                className={card}
              >
                <span className="mx-auto inline-flex rounded-xl bg-violet-600 p-2 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{value.desc}</p>
              </Motion.article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-center text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Meet the Team</h2>
        <p className="mt-2 text-center text-slate-500 dark:text-slate-400">The experts behind MeetTrack</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {team.map((member, index) => (
            <Motion.article
              key={member.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...subtle, delay: 0.08 + index * 0.06 }}
              className={card}
            >
              <span className="mx-auto inline-flex rounded-full bg-violet-600/90 p-4 text-white">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">{member.name}</h3>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{member.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{member.area}</p>
            </Motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-400 px-8 py-10 text-center text-white shadow-lg shadow-violet-900/25 dark:shadow-black/40">
        <h2 className="text-5xl font-extrabold tracking-tight">Join Us on This Journey</h2>
        <p className="mt-2 text-violet-100">Experience the future of meeting intelligence</p>
        <Motion.a href="/auth" className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-600" {...buttonHoverProps}>
          Get Started Today
        </Motion.a>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>MeetTrack. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/about" className="hover:text-violet-600 dark:hover:text-violet-400">About</a>
          <a href="/contact" className="hover:text-violet-600 dark:hover:text-violet-400">Contact</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400">Privacy</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400">Terms</a>
        </div>
      </footer>
    </Motion.div>
  );
}
