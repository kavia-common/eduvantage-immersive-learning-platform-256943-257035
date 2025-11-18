import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AvatarUploader from "../components/common/AvatarUploader";
import { getCurrentUserProfile, updateProfile, changePassword } from "../services/profileService";
import { useAuth } from "../auth/AuthProvider";

/**
 * PUBLIC_INTERFACE
 * Profile - authenticated user profile with editable form and password change.
 * Accessibility: labeled controls, semantic grouping, keyboard-friendly.
 */
export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);

  // Existing fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // New profile fields
  const [role, setRole] = useState("");
  const [interest, setInterest] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Password fields
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  // Validation helpers
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const displayNameValid = displayName.trim().length >= 2;
  const emailValid = emailRegex.test(email.trim());
  const bioValid = bio.length <= 500;

  // New field validations
  const isDateInFuture = (value) => {
    if (!value) return false;
    try {
      const input = new Date(value);
      const today = new Date();
      // zero time for date-only compare
      input.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      return input > today;
    } catch {
      return true;
    }
  };
  const dobValid = dateOfBirth ? !isDateInFuture(dateOfBirth) : true;
  const roleValid = role.length <= 120;
  const interestValid = interest.length <= 200;
  const pwdValid =
    newPwd.length >= 8 &&
    /[A-Z]/.test(newPwd) &&
    /[a-z]/.test(newPwd) &&
    /\d/.test(newPwd) &&
    /[^A-Za-z0-9]/.test(newPwd) &&
    newPwd === confirmPwd &&
    currentPwd.length > 0;

  const dirty = useMemo(() => {
    if (!initial) return false;
    return (
      displayName !== (initial.displayName || "") ||
      email !== (initial.email || "") ||
      bio !== (initial.bio || "") ||
      role !== (initial.role || "") ||
      interest !== (initial.interest || "") ||
      dateOfBirth !== (initial.dateOfBirth || "") ||
      !!avatarFile
    );
  }, [displayName, email, bio, role, interest, dateOfBirth, avatarFile, initial]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCurrentUserProfile();
        if (!mounted) return;
        setInitial(data);
        setDisplayName(data?.displayName || data?.name || "");
        setEmail(data?.email || user?.email || "");
        setBio(data?.bio || "");
        setRole(data?.role || "");
        setInterest(data?.interest || "");
        setDateOfBirth(data?.dateOfBirth || "");
        setAvatarPreview(data?.avatarUrl || "");
      } catch (e) {
        setToast({ type: "error", message: "Failed to load profile." });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.email]);

  function resetToInitial() {
    if (!initial) return;
    setDisplayName(initial.displayName || initial.name || "");
    setEmail(initial.email || user?.email || "");
    setBio(initial.bio || "");
    setRole(initial.role || "");
    setInterest(initial.interest || "");
    setDateOfBirth(initial.dateOfBirth || "");
    setAvatarFile(null);
    setAvatarPreview(initial.avatarUrl || "");
    setToast({ type: "", message: "" });
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    if (!dirty || !displayNameValid || !emailValid || !bioValid || !dobValid || !roleValid || !interestValid) return;
    setSaving(true);
    setToast({ type: "", message: "" });
    try {
      const result = await updateProfile({
        // keep both displayName and name for compatibility
        displayName: displayName.trim(),
        name: displayName.trim(),
        email: email.trim(),
        bio,
        role,
        interest,
        dateOfBirth,
        avatarFile,
        avatarPreview,
      });
      const next = result?.profile || {
        ...initial,
        displayName: displayName.trim(),
        name: displayName.trim(),
        email: email.trim(),
        bio,
        role,
        interest,
        dateOfBirth,
        avatarUrl: avatarPreview || initial?.avatarUrl,
      };
      setInitial(next);
      setToast({ type: "success", message: "Profile updated successfully." });
      setAvatarFile(null);
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (!pwdValid) return;
    setPwdSaving(true);
    setToast({ type: "", message: "" });
    try {
      await changePassword(currentPwd, newPwd);
      setToast({ type: "success", message: "Password changed successfully." });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Password change failed." });
    } finally {
      setPwdSaving(false);
    }
  }

  const emailEditable = true; // Flip to false to lock email if needed

  return (
    <div className="container" style={{ paddingTop: "1rem", paddingBottom: "2rem" }}>
      <Card className="gradient-bg" style={{ padding: "1.25rem" }}>
        <h2 style={{ margin: 0, color: "var(--color-text)" }}>Profile</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)", marginTop: "0.5rem" }}>
          Manage your account details and preferences.
        </p>
      </Card>

      {/* Toasts */}
      {toast.message ? (
        <div
          role="status"
          aria-live="polite"
          className="surface"
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderLeft: `4px solid ${toast.type === "error" ? "var(--color-error)" : "var(--color-secondary)"}`,
            color: toast.type === "error" ? "var(--color-error)" : "var(--color-text)",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem", gridTemplateColumns: "1fr" }}>
        {/* Profile Details */}
        <Card>
          <form onSubmit={onSaveProfile} aria-labelledby="profile-details-heading">
            <h3 id="profile-details-heading" style={{ marginTop: 0, color: "var(--color-text)" }}>
              Profile details
            </h3>
            {loading ? (
              <p style={{ color: "var(--color-muted)" }}>Loading profile…</p>
            ) : !initial ? (
              <p style={{ color: "var(--color-muted)" }}>
                No profile data found. You can create your profile by filling the form below and saving.
              </p>
            ) : (
              <>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr)" }}>
                  <div>
                    <label htmlFor="displayName" style={{ display: "block", fontWeight: 600 }}>
                      Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      aria-invalid={!displayNameValid}
                      aria-describedby={!displayNameValid ? "displayName-err" : undefined}
                      placeholder="Your full name"
                      style={inputStyle()}
                    />
                    {!displayNameValid && (
                      <span id="displayName-err" role="alert" style={errorStyle()}>
                        Name must be at least 2 characters.
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" style={{ display: "block", fontWeight: 600 }}>
                      Role
                    </label>
                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      aria-invalid={!roleValid}
                      aria-describedby={!roleValid ? "role-err" : "role-hint"}
                      placeholder="e.g., Student, Instructor"
                      style={inputStyle()}
                    />
                    {!roleValid ? (
                      <span id="role-err" role="alert" style={errorStyle()}>
                        Role must be 120 characters or fewer.
                      </span>
                    ) : (
                      <span id="role-hint" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                        Optional
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="interest" style={{ display: "block", fontWeight: 600 }}>
                      Interest
                    </label>
                    <input
                      id="interest"
                      name="interest"
                      type="text"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      aria-invalid={!interestValid}
                      aria-describedby={!interestValid ? "interest-err" : "interest-hint"}
                      placeholder="e.g., AI, Web Development"
                      style={inputStyle()}
                    />
                    {!interestValid ? (
                      <span id="interest-err" role="alert" style={errorStyle()}>
                        Interest must be 200 characters or fewer.
                      </span>
                    ) : (
                      <span id="interest-hint" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                        Optional
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" style={{ display: "block", fontWeight: 600 }}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!emailValid}
                      aria-describedby={!emailValid ? "email-err" : "email-hint"}
                      placeholder="you@example.com"
                      style={{
                        ...inputStyle(),
                        ...(emailEditable ? {} : { background: "var(--color-background)", opacity: 0.8 }),
                      }}
                      disabled={!emailEditable}
                    />
                    {!emailValid ? (
                      <span id="email-err" role="alert" style={errorStyle()}>
                        Provide a valid email address.
                      </span>
                    ) : (
                      <span id="email-hint" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                        Required
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="dob" style={{ display: "block", fontWeight: 600 }}>
                      Date of Birth
                    </label>
                    <input
                      id="dob"
                      name="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      aria-invalid={!dobValid}
                      aria-describedby={!dobValid ? "dob-err" : "dob-hint"}
                      style={inputStyle()}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {!dobValid ? (
                      <span id="dob-err" role="alert" style={errorStyle()}>
                        Date of Birth cannot be in the future.
                      </span>
                    ) : (
                      <span id="dob-hint" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                        Optional
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" style={{ display: "block", fontWeight: 600 }}>
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      aria-invalid={!bioValid}
                      aria-describedby={!bioValid ? "bio-err" : "bio-hint"}
                      placeholder="Tell us about yourself"
                      style={textareaStyle()}
                    />
                    {!bioValid ? (
                      <span id="bio-err" role="alert" style={errorStyle()}>
                        Bio must be 500 characters or less.
                      </span>
                    ) : (
                      <span id="bio-hint" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                        {bio.length}/500
                      </span>
                    )}
                  </div>

                  <div>
                    <span style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Avatar</span>
                    <AvatarUploader
                      initialUrl={avatarPreview}
                      onFileSelected={(file, previewUrl) => {
                        setAvatarFile(file || null);
                        setAvatarPreview(previewUrl || "");
                      }}
                      label="Upload profile avatar"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <Button
                    type="submit"
                    disabled={
                      !dirty ||
                      !displayNameValid ||
                      !emailValid ||
                      !bioValid ||
                      !dobValid ||
                      !roleValid ||
                      !interestValid ||
                      saving
                    }
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetToInitial}
                    disabled={!dirty || saving}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>

        {/* Password change */}
        <Card>
          <form onSubmit={onChangePassword} aria-labelledby="password-change-heading">
            <h3 id="password-change-heading" style={{ marginTop: 0, color: "var(--color-text)" }}>
              Change password
            </h3>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr)" }}>
              <div>
                <label htmlFor="currentPwd" style={{ display: "block", fontWeight: 600 }}>
                  Current password
                </label>
                <input
                  id="currentPwd"
                  name="currentPwd"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  autoComplete="current-password"
                  style={inputStyle()}
                />
              </div>
              <div>
                <label htmlFor="newPwd" style={{ display: "block", fontWeight: 600 }}>
                  New password
                </label>
                <input
                  id="newPwd"
                  name="newPwd"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  autoComplete="new-password"
                  aria-describedby="pwd-hint"
                  style={inputStyle()}
                />
              </div>
              <div>
                <label htmlFor="confirmPwd" style={{ display: "block", fontWeight: 600 }}>
                  Confirm new password
                </label>
                <input
                  id="confirmPwd"
                  name="confirmPwd"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  autoComplete="new-password"
                  style={inputStyle()}
                />
              </div>
              <p id="pwd-hint" style={{ color: "var(--color-muted)", margin: 0 }}>
                Use at least 8 characters with upper/lowercase, a number, and a symbol.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <Button type="submit" disabled={!pwdValid || pwdSaving}>
                {pwdSaving ? "Updating…" : "Update password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentPwd("");
                  setNewPwd("");
                  setConfirmPwd("");
                }}
                disabled={pwdSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    padding: "0.6rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    outline: "none",
    transition: "box-shadow var(--transition-soft)",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02) inset",
  };
}

function textareaStyle() {
  return {
    ...inputStyle(),
    resize: "vertical",
  };
}

function errorStyle() {
  return {
    display: "block",
    marginTop: "0.35rem",
    color: "var(--color-error)",
    fontSize: "0.9rem",
  };
}
