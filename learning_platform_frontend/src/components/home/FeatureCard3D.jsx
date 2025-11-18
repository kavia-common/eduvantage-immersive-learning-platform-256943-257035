import React, { useRef } from "react";
import Card from "../common/Card";
import Button from "../common/Button";

/**
 * PUBLIC_INTERFACE
 * FeatureCard3D
 * Glass card with 3D tilt-on-hover and Live Preview button.
 *
 * Props:
 * - title: string
 * - description: string
 * - emoji?: string
 * - onPreview: () => void
 */
export default function FeatureCard3D({ title, description, emoji, onPreview }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = (0.5 - y) * 10; // tilt range
    const ry = (x - 0.5) * 12;
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        transition: "transform 200ms ease",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <Card
        ref={ref}
        variant="glass"
        className="is-interactive"
        style={{
          width: "min(100%, 300px)",
          minHeight: 190,
          padding: "1.1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
        aria-label={`${title} feature card`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ fontSize: "1.5rem" }} aria-hidden="true">
            {emoji}
          </div>
          <div style={{ fontWeight: 800 }}>{title}</div>
        </div>
        <div style={{ color: "var(--color-muted)" }}>{description}</div>
        <div className="glass-divider" style={{ marginTop: "0.5rem" }} />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Button
            variant="glass"
            className="is-interactive"
            aria-label={`Live Preview ${title}`}
            onClick={onPreview}
          >
            Live Preview
          </Button>
        </div>
      </Card>
    </div>
  );
}
