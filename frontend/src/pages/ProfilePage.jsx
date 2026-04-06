import { motion as Motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BriefcaseBusiness, Globe, Mail, MapPin, User, Save, X, Plus, Check, AlertCircle } from "lucide-react";
import { buttonHoverProps, fadeInProps, subtle } from "../lib/motionPresets";
import useAuth from "../context/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    jobTitle: "",
    department: "",
    employeeId: "",
    managerName: "",
    skills: [],
    location: "",
    workMode: "Office",
    timezone: "",
  });
  const [originalProfile, setOriginalProfile] = useState(profile);

  // Fetch profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        console.log("No user ID available");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        console.log("Fetching profile for user:", user.id);
        
        const response = await fetch(`http://127.0.0.1:8000/profile/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          console.log("Profile data loaded:", profileData);
          
          const skills = Array.isArray(profileData.skills) 
            ? profileData.skills 
            : (typeof profileData.skills === 'string' ? JSON.parse(profileData.skills || "[]") : []);
          
          const newProfile = {
            fullName: profileData.full_name || user.full_name || "",
            email: profileData.email || user.email || "",
            phoneNumber: profileData.phone_number || "",
            bio: profileData.bio || "",
            jobTitle: profileData.job_title || "",
            department: profileData.department || "",
            employeeId: profileData.employee_id || "",
            managerName: profileData.manager_name || "",
            skills: skills,
            location: profileData.location || "",
            workMode: profileData.work_mode || "Office",
            timezone: profileData.timezone || "",
          };
          
          setProfile(newProfile);
        } else {
          console.warn("Failed to load profile, using fallback data");
          // Fallback to user data from localStorage if endpoint fails
          setProfile(prev => ({
            ...prev,
            fullName: user.full_name || "",
            email: user.email || "",
            phoneNumber: user.phone_number || "",
            bio: user.bio || "",
            jobTitle: user.job_title || "",
            department: user.department || "",
            employeeId: user.employee_id || "",
            managerName: user.manager_name || "",
            skills: Array.isArray(user.skills) ? user.skills : [],
            location: user.location || "",
            workMode: user.work_mode || "Office",
            timezone: user.timezone || "",
          }));
          // Image removed
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        // Fallback to user data
        setProfile(prev => ({
          ...prev,
          fullName: user.full_name || "",
          email: user.email || "",
          phoneNumber: user.phone_number || "",
          bio: user.bio || "",
          jobTitle: user.job_title || "",
          department: user.department || "",
          employeeId: user.employee_id || "",
          managerName: user.manager_name || "",
          skills: Array.isArray(user.skills) ? user.skills : [],
          location: user.location || "",
          workMode: user.work_mode || "Office",
          timezone: user.timezone || "",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, user]);

  const updateField = (key, value) => setProfile((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateField("skills", [...profile.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    updateField("skills", profile.skills.filter(s => s !== skillToRemove));
  };

  const handleEdit = () => {
    setOriginalProfile(profile);
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setErrorMessage("User ID not found");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const token = localStorage.getItem("access_token");
      
      // Update profile
      const response = await fetch(`http://127.0.0.1:8000/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.fullName,
          phone_number: profile.phoneNumber || null,
          bio: profile.bio || null,
          job_title: profile.jobTitle || null,
          department: profile.department || null,
          employee_id: profile.employeeId || null,
          manager_name: profile.managerName || null,
          skills: profile.skills,
          location: profile.location || null,
          work_mode: profile.workMode || null,
          timezone: profile.timezone || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const updatedUserData = await response.json();
      
      // Update user in localStorage
      const updatedUser = {
        ...user,
        full_name: profile.fullName,
        email: profile.email,
        phone_number: profile.phoneNumber,
        bio: profile.bio,
        job_title: profile.jobTitle,
        department: profile.department,
        employee_id: profile.employeeId,
        manager_name: profile.managerName,
        skills: profile.skills,
        location: profile.location,
        work_mode: profile.workMode,
        timezone: profile.timezone,
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccessMessage("✅ Profile updated successfully!");
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("❌ " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Motion.div className="space-y-6 pb-10" {...fadeInProps}>
      {/* Success/Error Messages */}
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

      {/* Main Profile Card */}
      <Motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={subtle}
        className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-slate-50 shadow-lg shadow-slate-200/40 dark:border-violet-900/50 dark:from-slate-900 dark:to-slate-800 dark:shadow-black/40"
      >
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 px-8 py-8">
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,...')] dark:opacity-10"></div>
          
          <div className="relative flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                👤 <span>Profile</span>
              </h1>
              <p className="mt-2 text-violet-100 text-lg">Manage your professional presence</p>
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Motion.button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    {...buttonHoverProps}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Motion.button>
                  <Motion.button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl bg-red-500/20 backdrop-blur-sm px-6 py-3 text-sm font-bold text-red-100 hover:bg-red-500/30 transition-all"
                    {...buttonHoverProps}
                  >
                    <X className="h-4 w-4" />
                  </Motion.button>
                </>
              ) : (
                <Motion.button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white hover:bg-white/30 transition-all"
                  {...buttonHoverProps}
                >
                  ✏️ Edit Profile
                </Motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 lg:p-10 space-y-10">
          {/* Personal Information */}
          <Section title="Personal Information" icon="👤">
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField
                label="Full Name"
                icon={User}
                value={profile.fullName}
                onChange={(value) => updateField("fullName", value)}
                disabled={!isEditing}
                placeholder="Your full name"
              />
              <ProfileField
                label="Email Address"
                icon={Mail}
                value={profile.email}
                onChange={() => {}}
                disabled={true}
                placeholder="email@example.com"
              />
              <ProfileField
                label="Phone Number"
                icon={User}
                value={profile.phoneNumber}
                onChange={(value) => updateField("phoneNumber", value)}
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block mt-6">
                <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Bio
                </span>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className={`w-full rounded-lg border-2 px-4 py-3 text-slate-700 outline-none transition-all resize-none font-medium ${
                    isEditing
                      ? "border-violet-300 bg-white hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-violet-700 dark:bg-slate-800 dark:hover:border-violet-600 dark:focus:border-violet-400"
                      : "border-slate-300 bg-slate-100 cursor-not-allowed text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                />
              </label>
            </div>
          </Section>

          {/* 2️⃣ Professional Details */}
          <Section title="Professional Details" icon="💼">
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField
                label="Job Title"
                icon={BriefcaseBusiness}
                value={profile.jobTitle}
                onChange={(value) => updateField("jobTitle", value)}
                disabled={!isEditing}
                placeholder="Your position"
              />
              <ProfileField
                label="Department"
                icon={BriefcaseBusiness}
                value={profile.department}
                onChange={(value) => updateField("department", value)}
                disabled={!isEditing}
                placeholder="Department name"
              />
              <ProfileField
                label="Employee ID"
                icon={User}
                value={profile.employeeId}
                onChange={(value) => updateField("employeeId", value)}
                disabled={!isEditing}
                placeholder="EMP-12345"
              />
              <ProfileField
                label="Manager Name"
                icon={User}
                value={profile.managerName}
                onChange={(value) => updateField("managerName", value)}
                disabled={!isEditing}
                placeholder="Your manager's name"
              />
            </div>
            
            {/* Skills Section */}
            <div className="border-t-2 border-slate-100 dark:border-slate-700 pt-6 mt-6">
              <label className="block">
                <span className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  🏷️ Skills & Expertise
                </span>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="Add a skill (e.g., Python, Leadership)"
                      className="flex-1 rounded-xl border-2 border-violet-200 bg-violet-50/50 px-4 py-2 text-sm font-medium outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white p-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all font-bold"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/50"
                    >
                      ✓ {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-200 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No skills added yet</p>
                  )}
                </div>
              </label>
            </div>
          </Section>

          {/* 3️⃣ Location & Work Info */}
          <Section title="Location & Work Info" icon="📍">
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField
                label="Location"
                icon={MapPin}
                value={profile.location}
                onChange={(value) => updateField("location", value)}
                disabled={!isEditing}
                placeholder="City, Country"
              />
              <div>
                <label className="block">
                  <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    💼 Work Arrangement
                  </span>
                  <select
                    value={profile.workMode}
                    onChange={(e) => updateField("workMode", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full rounded-xl border-2 px-4 py-2 font-bold outline-none transition-all ${
                      isEditing
                        ? "border-violet-200 bg-violet-50/50 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-slate-200"
                        : "border-slate-200 bg-slate-100/50 cursor-not-allowed text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
                    }`}
                  >
                    <option value="Office">🏢 Office</option>
                    <option value="Hybrid">🔄 Hybrid</option>
                    <option value="Remote">🏠 Remote</option>
                  </select>
                </label>
              </div>
              <ProfileField
                label="Timezone"
                icon={Globe}
                value={profile.timezone}
                onChange={(value) => updateField("timezone", value)}
                disabled={!isEditing}
                placeholder="UTC, EST, PST, etc."
              />
            </div>
          </Section>
        </div>
      </Motion.section>
    </Motion.div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 pb-3 border-b-2 border-violet-100 dark:border-violet-900/50">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function ProfileField({ label, icon, value, onChange, disabled, placeholder = "" }) {
  const FieldIcon = icon;
  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        <FieldIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-xl border-2 px-4 py-3 font-medium outline-none transition-all ${
          disabled
            ? "border-slate-200 bg-slate-100/50 cursor-not-allowed text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
            : "border-violet-200 bg-violet-50/50 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:bg-white text-slate-700 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-slate-200 dark:hover:border-violet-600 dark:focus:border-violet-400 dark:focus:ring-violet-900"
        }`}
      />
    </label>
  );
}
