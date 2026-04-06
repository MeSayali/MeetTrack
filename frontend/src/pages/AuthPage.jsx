import * as Tabs from "@radix-ui/react-tabs";
import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";

const initialState = { email: "", password: "", fullName: "", role: "employee" };

export default function AuthPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Use a valid email and password with at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Use a valid email and password with at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(form.email, form.password, form.fullName, form.role);
      // Auto-login after registration
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event) => {
    if (activeTab === "login") {
      handleLogin(event);
    } else {
      handleRegister(event);
    }
  };

  return (
    <Motion.section
      className="grid min-h-[75vh] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-black/40 md:grid-cols-2"
      {...fadeInProps}
    >
      <div className="hidden bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-white md:block">
        <h2 className="text-3xl font-bold">Welcome to MeetTrack</h2>
        <p className="mt-3 text-violet-100">Analyze every conversation with clarity and confidence.</p>
      </div>
      <div className="p-6 md:p-10">
        <Tabs.Root defaultValue="login" onValueChange={setActiveTab}>
          <Tabs.List className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <Tabs.Trigger
              value="login"
              className="rounded-lg px-3 py-2 text-slate-700 data-[state=active]:bg-white dark:text-slate-200 dark:data-[state=active]:bg-slate-900"
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              value="register"
              className="rounded-lg px-3 py-2 text-slate-700 data-[state=active]:bg-white dark:text-slate-200 dark:data-[state=active]:bg-slate-900"
            >
              Register
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="login" className="pt-6">
            <AuthForm
              form={form}
              setForm={setForm}
              error={error}
              onSubmit={onSubmit}
              buttonText="Login"
              loading={loading}
              isRegister={false}
            />
          </Tabs.Content>
          <Tabs.Content value="register" className="pt-6">
            <AuthForm
              form={form}
              setForm={setForm}
              error={error}
              onSubmit={onSubmit}
              buttonText="Register"
              loading={loading}
              isRegister={true}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Motion.section>
  );
}

function AuthForm({ form, setForm, error, onSubmit, buttonText, loading, isRegister }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isRegister && (
        <>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Full Name
            <input
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="John Doe"
              disabled={loading}
            />
          </label>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            User Type
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              disabled={loading}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </label>
        </>
      )}
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        Email
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="you@company.com"
          disabled={loading}
        />
      </label>
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="******"
          disabled={loading}
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Motion.button
        type="submit"
        className="w-full rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white shadow-sm shadow-violet-600/25 disabled:opacity-60 dark:shadow-violet-900/40"
        {...buttonHoverProps}
        transition={{ ...subtle, duration: 0.22 }}
        disabled={loading}
      >
        {loading ? "Loading..." : buttonText}
      </Motion.button>
    </form>
  );
}
