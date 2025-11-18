import React, { useEffect, useRef } from "react";
import Button from "../common/Button";
import Card from "../common/Card";

/**
 * PUBLIC_INTERFACE
 * PreviewModal
 * Accessible modal with overlay and internal focus trap.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title: string
 * - children: React.ReactNode
 */
export default function PreviewModal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  // Close on ESC and lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Basic focus trap: keep focus within dialog while open
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelectors =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
    const getFocusable = () => Array.from(dialog.querySelectorAll(focusableSelectors));

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const nodes = getFocusable();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    // focus the dialog container
    setTimeout(() => {
      const nodes = getFocusable();
      (nodes[0] || dialog).focus();
    }, 0);

    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.55)",
        backdropFilter: "blur(3px)",
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        variant="glass"
        className="is-interactive"
        style={{
          width: "min(880px, 96vw)",
          maxHeight: "85vh",
          overflow: "auto",
          padding: "1rem",
          outline: "none",
        }}
        tabIndex={0}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <h3 id="preview-modal-title" style={{ margin: 0 }}>
            {title}
          </h3>
          <Button variant="glass" className="is-interactive" aria-label="Close preview" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="glass-divider" />
        <div style={{ marginTop: "0.75rem" }}>{children}</div>
      </Card>
    </div>
  );
}
