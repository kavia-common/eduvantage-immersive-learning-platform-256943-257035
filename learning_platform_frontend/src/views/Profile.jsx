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

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

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
      !!avatarFile
    );
  }, [displayName, email, bio, avatarFile, initial]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCurrentUserProfile();
        if (!mounted) return;
        setInitial(data);
        setDisplayName(data?.displayName || "");
        setEmail(data?.email || user?.email || "");
        setBio(data?.bio || "");
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
    setDisplayName(initial.displayName || "");
    setEmail(initial.email || user?.email || "");
    setBio(initial.bio || "");
    setAvatarFile(null);
    setAvatarPreview(initial.avatarUrl || "");
    setToast({ type: "", message: "" });
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    if (!dirty || !displayNameValid || !emailValid || !bioValid) return;
    setSaving(true);
    setToast({ type: "", message: "" });
    try {
      const result = await updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        bio,
        avatarFile,
        avatarPreview,
      });
      const next = result?.profile || {
        ...initial,
        displayName: displayName.trim(),
        email: email.trim(),
        bio,
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
            ) : (
              <>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr)" }}>
                  <div>
                    <label htmlFor="displayName" style={{ display: "block", fontWeight: 600 }}>
                      Display name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      aria-invalid={!displayNameValid}
                      aria-describedby={!displayNameValid ? "displayName-err" : undefined}
                      placeholder="Your public name"
                      style={inputStyle()}
                    />
                    {!displayNameValid && (
                      <span id="displayName-err" role="alert" style={errorStyle()}>
                        Name must be at least 2 characters.
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
                      aria-describedby={!emailValid ? "email-err" : undefined}
                      placeholder="you@example.com"
                      style={{
                        ...inputStyle(),
                        ...(emailEditable ? {} : { background: "var(--color-background)", opacity: 0.8 }),
                      }}
                      disabled={!emailEditable}
                    />
                    {!emailValid && (
                      <span id="email-err" role="alert" style={errorStyle()}>
                        Provide a valid email address.
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
                  <Button type="submit" disabled={!dirty || !displayNameValid || !emailValid || !bioValid || saving}>
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
