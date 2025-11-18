import React, { useEffect, useMemo, useState } from "react";
import "../styles/utilities.css";
import "../styles/theme.css";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import AvatarUploader from "../components/common/AvatarUploader";
import { getCurrentUserProfile, updateProfile } from "../services/profileService";

/**
 * PUBLIC_INTERFACE
 * Profile page providing editable profile info, learning progress,
 * account settings, and security actions organized via tabs.
 * Accessible and responsive, using glassmorphism utilities and gradient buttons.
 */
export default function Profile() {
  const navigate = useNavigate();

  // Tabs and selection
  const tabs = useMemo(
    () => [
      { id: "info", label: "Profile Info", aria: "Profile information" },
      { id: "progress", label: "Learning Progress", aria: "Learning progress" },
      { id: "account", label: "Account Settings", aria: "Account settings" },
      { id: "security", label: "Security", aria: "Security settings" },
    ],
    []
  );
  const [activeTab, setActiveTab] = useState("info");

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    displayName: "",
    role: "",
    interest: "",
    dateOfBirth: "",
    email: "",
    bio: "",
    avatarUrl: "",
    stats: { courses: 0, streak: 0, hours: 0 },
    progress: [
      { course: "Mathematics Fundamentals", percent: 72 },
      { course: "Physics for Engineers", percent: 38 },
      { course: "Modern Web Development", percent: 86 },
    ],
    preferences: {
      darkMode: false,
      emailNotifications: true,
      weeklySummary: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCurrentUserProfile();
        if (!mounted) return;
        setProfile((prev) => ({
          ...prev,
          ...data,
          name: data?.name || data?.displayName || prev.name,
          displayName: data?.displayName || data?.name || prev.displayName,
          avatarUrl: data?.avatarUrl || prev.avatarUrl,
          stats: { ...prev.stats, ...(data?.stats || {}) },
          preferences: { ...prev.preferences, ...(data?.preferences || {}) },
          progress: data?.progress?.length ? data.progress : prev.progress,
        }));
      } catch (e) {
        // Non-fatal: keep defaults but surface a message
        setError("Failed to load profile. Using defaults.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Editing state clone
  const [draft, setDraft] = useState(profile);
  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    setError("");
    setDraft(profile);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({
        displayName: draft.displayName || draft.name,
        name: draft.name || draft.displayName,
        email: draft.email,
        bio: draft.bio,
        role: draft.role,
        interest: draft.interest,
        dateOfBirth: draft.dateOfBirth,
        avatarPreview: draft.avatarUrl,
      });
      // Support both direct profile or wrapper {profile}
      const updatedProfile = updated?.profile || updated;
      setProfile((p) => ({ ...p, ...updatedProfile }));
      setEditing(false);
    } catch (e) {
      setError("Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = (_file, previewUrl) => {
    setDraft((d) => ({ ...d, avatarUrl: previewUrl || d.avatarUrl }));
    if (!editing) setEditing(true);
  };

  const fieldChange = (key) => (e) => {
    const value = e?.target?.value ?? e;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const prefToggle = (key) => () => {
    setDraft((d) => ({
      ...d,
      preferences: { ...d.preferences, [key]: !d.preferences[key] },
    }));
    if (!editing) setEditing(true);
  };

  const statCard = (label, value, ariaLabel) => (
    <div
      className="glass p-4 rounded-xl shadow-sm flex flex-col items-start gap-1"
      role="group"
      aria-label={ariaLabel}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );

  const ProgressBar = ({ percent }) => (
    <div className="w-full">
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(percent, 0), 100)}%`,
            backgroundImage: "linear-gradient(90deg, #3b82f6, #6366f1)",
            transition: "width .3s ease",
          }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass p-6 rounded-2xl animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" aria-labelledby="profile-title">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 id="profile-title" className="text-2xl md:text-3xl font-semibold text-gray-900">
            Your Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your personal info, track learning, and update account preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button variant="primary" aria-label="Edit profile" onClick={handleEditToggle}>
              Edit
            </Button>
          ) : (
            <>
              <Button variant="glass" aria-label="Cancel editing" onClick={handleEditToggle}>
                Cancel
              </Button>
              <Button
                variant="success"
                aria-label="Save profile changes"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Layout: Left profile card + Right tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <aside className="lg:col-span-1">
          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <AvatarUploader
                initialUrl={editing ? draft.avatarUrl : profile.avatarUrl}
                onFileSelected={onAvatarChange}
                label="Upload avatar"
              />
              <div className="min-w-0" style={{ width: "100%" }}>
                {!editing ? (
                  <>
                    <div className="text-xl font-semibold text-gray-900 truncate">
                      {profile.displayName || profile.name || "Unnamed Learner"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {profile.role || "Student"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{profile.email}</div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      aria-label="Display name"
                      className="w-full glass-input"
                      placeholder="Display name"
                      value={draft.displayName}
                      onChange={fieldChange("displayName")}
                    />
                    <input
                      aria-label="Full name"
                      className="w-full glass-input"
                      placeholder="Full name"
                      value={draft.name}
                      onChange={fieldChange("name")}
                    />
                    <input
                      aria-label="Email address"
                      className="w-full glass-input"
                      placeholder="Email"
                      value={draft.email}
                      onChange={fieldChange("email")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {statCard("Courses", profile.stats.courses, "Courses completed")}
              {statCard("Streak", `${profile.stats.streak}d`, "Learning streak days")}
              {statCard("Hours", profile.stats.hours, "Hours learned")}
            </div>

            {editing ? (
              <div className="mt-6">
                <textarea
                  aria-label="Bio"
                  className="w-full glass-input min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  value={draft.bio}
                  onChange={fieldChange("bio")}
                />
              </div>
            ) : (
              <p className="text-gray-600 mt-6">{profile.bio || "No bio added yet."}</p>
            )}
          </Card>
          {error && (
            <div className="mt-3 text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </div>
          )}
        </aside>

        {/* Right Tabs */}
        <section className="lg:col-span-2">
          <div className="glass rounded-2xl p-2">
            <nav className="flex gap-1" role="tablist" aria-label="Profile sections">
              {tabs.map((t) => {
                const selected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition focus:outline-none ${
                      selected
                        ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={{ outlineOffset: 2 }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-3 glass rounded-2xl p-6">
            {/* Profile Info Tab */}
            {activeTab === "info" && (
              <div id="panel-info" role="tabpanel" aria-labelledby="tab-info" className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="info-displayName">
                      Display Name
                    </label>
                    <input
                      id="info-displayName"
                      aria-label="Display name"
                      className="w-full glass-input"
                      value={draft.displayName}
                      onChange={fieldChange("displayName")}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="info-name">
                      Full Name
                    </label>
                    <input
                      id="info-name"
                      aria-label="Full name"
                      className="w-full glass-input"
                      value={draft.name}
                      onChange={fieldChange("name")}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="info-role">
                      Role
                    </label>
                    <input
                      id="info-role"
                      aria-label="Role"
                      className="w-full glass-input"
                      value={draft.role}
                      onChange={fieldChange("role")}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="info-interest">
                      Interests
                    </label>
                    <input
                      id="info-interest"
                      aria-label="Interests"
                      className="w-full glass-input"
                      value={draft.interest}
                      onChange={fieldChange("interest")}
                      disabled={!editing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label" htmlFor="info-email">
                      Email
                    </label>
                    <input
                      id="info-email"
                      type="email"
                      aria-label="Email address"
                      className="w-full glass-input"
                      value={draft.email}
                      onChange={fieldChange("email")}
                      disabled={!editing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label" htmlFor="info-dob">
                      Date of Birth
                    </label>
                    <input
                      id="info-dob"
                      type="date"
                      aria-label="Date of birth"
                      className="w-full glass-input"
                      value={draft.dateOfBirth}
                      onChange={fieldChange("dateOfBirth")}
                      disabled={!editing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label" htmlFor="info-bio">
                      Bio
                    </label>
                    <textarea
                      id="info-bio"
                      aria-label="Bio"
                      className="w-full glass-input min-h-[100px]"
                      value={draft.bio}
                      onChange={fieldChange("bio")}
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="purple" aria-label="View dashboard" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="glass"
                    aria-label="Preview profile"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            )}

            {/* Learning Progress Tab */}
            {activeTab === "progress" && (
              <div
                id="panel-progress"
                role="tabpanel"
                aria-labelledby="tab-progress"
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-900">Learning Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {statCard(
                    "Completed Courses",
                    profile.stats.courses || 4,
                    "Completed courses"
                  )}
                  {statCard(
                    "Active Streak",
                    `${profile.stats.streak || 7} days`,
                    "Active streak"
                  )}
                  {statCard(
                    "Total Hours",
                    profile.stats.hours || 56,
                    "Total hours learned"
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {profile.progress.map((p) => (
                    <div key={p.course} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-800">{p.course}</div>
                        <div className="text-sm text-gray-600">{p.percent}%</div>
                      </div>
                      <ProgressBar percent={p.percent} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === "account" && (
              <div
                id="panel-account"
                role="tabpanel"
                aria-labelledby="tab-account"
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between glass p-4 rounded-xl">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-500">
                        Receive important updates and course reminders.
                      </div>
                    </div>
                    <Button
                      variant={draft.preferences.emailNotifications ? "success" : "warning"}
                      aria-pressed={draft.preferences.emailNotifications}
                      aria-label="Toggle email notifications"
                      onClick={prefToggle("emailNotifications")}
                    >
                      {draft.preferences.emailNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between glass p-4 rounded-xl">
                    <div>
                      <div className="font-medium">Weekly Summary</div>
                      <div className="text-sm text-gray-500">
                        Get weekly learning insights by email.
                      </div>
                    </div>
                    <Button
                      variant={draft.preferences.weeklySummary ? "success" : "warning"}
                      aria-pressed={draft.preferences.weeklySummary}
                      aria-label="Toggle weekly summary"
                      onClick={prefToggle("weeklySummary")}
                    >
                      {draft.preferences.weeklySummary ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between glass p-4 rounded-xl">
                    <div>
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-gray-500">
                        Reduce eye strain with a darker color scheme.
                      </div>
                    </div>
                    <Button
                      variant={draft.preferences.darkMode ? "success" : "warning"}
                      aria-pressed={draft.preferences.darkMode}
                      aria-label="Toggle dark mode"
                      onClick={prefToggle("darkMode")}
                    >
                      {draft.preferences.darkMode ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div
                id="panel-security"
                role="tabpanel"
                aria-labelledby="tab-security"
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-gray-500">
                        Update your password regularly to keep your account secure.
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      aria-label="Change password"
                      onClick={() => navigate("/settings")}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="glass p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">
                        Add an extra layer of security to your account.
                      </div>
                    </div>
                    <Button
                      variant="purple"
                      aria-label="Manage two-factor authentication"
                      onClick={() => navigate("/settings")}
                    >
                      Manage
                    </Button>
                  </div>
                  <div className="glass p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-medium">Sign Out of All Devices</div>
                      <div className="text-sm text-gray-500">
                        Force sign-out from all other sessions.
                      </div>
                    </div>
                    <Button
                      variant="warning"
                      aria-label="Sign out of all devices"
                      onClick={() => alert("All sessions will be signed out.")}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
