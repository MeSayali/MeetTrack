import { motion as Motion } from "framer-motion";
import { Mail, MapPin, Phone, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

const surface =
  "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.message) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(data.message || "Message sent successfully!");
        setFormData({
          fullName: "",
          email: "",
          message: "",
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.detail || "Failed to submit message");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrorMessage("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Email Card - Clickable */}
        <Motion.a
          href="mailto:meettrack.ai@gmail.com"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...subtle, delay: 0.05 }}
          className={`${surface} cursor-pointer transition-all hover:shadow-md hover:shadow-violet-300/40 dark:hover:shadow-violet-900/40`}
        >
          <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Email</h3>
          <p className="text-sm text-violet-600 dark:text-violet-400 hover:underline">meettrack.ai@gmail.com</p>
        </Motion.a>

        {/* Phone Card */}
        <Motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...subtle, delay: 0.1 }}
          className={surface}
        >
          <Phone className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Phone</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">+1 (555) 987-1234</p>
        </Motion.article>

        {/* Address Card */}
        <Motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...subtle, delay: 0.15 }}
          className={surface}
        >
          <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Address</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">PICT,Pune</p>
        </Motion.article>
      </section>
      
      {successMessage && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-300"
        >
          <Check className="h-5 w-5" />
          {successMessage}
        </Motion.div>
      )}

      {errorMessage && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 flex items-center gap-3 text-red-700 dark:text-red-300"
        >
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </Motion.div>
      )}

      <Motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...subtle, delay: 0.12 }}
        className={`space-y-4 p-5 ${surface}`}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Send us a message</h2>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Full name"
          disabled={isSubmitting}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Email address"
          disabled={isSubmitting}
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="How can we help?"
          disabled={isSubmitting}
        />
        <Motion.button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white shadow-sm shadow-violet-600/25 dark:shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          {...buttonHoverProps}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Motion.button>
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
