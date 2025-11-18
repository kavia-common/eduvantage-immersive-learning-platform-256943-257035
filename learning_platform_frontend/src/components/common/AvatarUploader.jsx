import React, { useEffect, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible AvatarUploader with image preview and client-side validation.
 *
 * Props:
 * - initialUrl?: string
 * - onFileSelected?: (file: File | null, previewUrl: string | null) => void
 * - maxSizeMB?: number (default 2)
 * - accepted?: string (input accept attribute; default 'image/*')
 * - label?: string (accessible label for input)
 */
export default function AvatarUploader({
  initialUrl = "",
  onFileSelected = () => {},
  maxSizeMB = 2,
  accepted = "image/*",
  label = "Upload avatar",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(initialUrl || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(initialUrl || "");
  }, [initialUrl]);

  function validate(file) {
    if (!file) return { ok: true };
    if (!file.type.startsWith("image/")) {
      return { ok: false, message: "Please select a valid image file." };
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { ok: false, message: `File is too large. Max ${maxSizeMB}MB.` };
    }
    return { ok: true };
  }

  const onChange = (e) => {
    const file = e.target.files?.[0] || null;
    const v = validate(file);
    if (!v.ok) {
      setError(v.message || "Invalid file.");
      onFileSelected(null, null);
      return;
    }
    setError("");
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelected(file, url);
    } else {
      setPreview(initialUrl || "");
      onFileSelected(null, initialUrl || null);
    }
  };

  return (
    <div>
      <div
        className="surface"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.75rem",
          borderRadius: "9999px",
        }}
      >
        <img
          src={preview || initialUrl || "https://api.dicebear.com/7.x/thumbs/svg?seed=User"}
          alt="Current avatar preview"
          width={64}
          height={64}
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }}
        />
        <div>
          <button
            type="button"
            className="btn"
            onClick={() => inputRef.current?.click()}
            aria-label={label}
          >
            Change Avatar
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accepted}
            aria-label={label}
            onChange={onChange}
            style={{ display: "none" }}
          />
          {error ? (
            <div role="alert" style={{ color: "var(--color-error)", marginTop: "0.5rem" }}>
              {error}
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              JPG/PNG up to {maxSizeMB}MB.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
