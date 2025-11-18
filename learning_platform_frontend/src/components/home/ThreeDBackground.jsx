import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * ThreeDBackground
 * Lightweight canvas-based animated background with floating particles and parallax effect.
 * Non-blocking and pause-on-tab-hidden for performance.
 *
 * Props:
 * - className?: string
 * - style?: React.CSSProperties
 */
export default function ThreeDBackground({ className = "", style }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    const initParticles = () => {
      const count = Math.max(40, Math.floor((canvas.width / devicePixelRatio) * (canvas.height / devicePixelRatio) / 14000));
      particlesRef.current = new Array(count).fill(0).map(() => ({
        x: Math.random() * (canvas.width / devicePixelRatio),
        y: Math.random() * (canvas.height / devicePixelRatio),
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        hue: 210 + Math.random() * 40, // blue tones
        alpha: 0.15 + Math.random() * 0.35,
      }));
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const onVisibility = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      } else if (!document.hidden && !rafRef.current) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(32, ts - lastTsRef.current); // cap dt
      lastTsRef.current = ts;

      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;

      // clear
      ctx.clearRect(0, 0, w, h);

      // gentle parallax shift
      const px = mouseRef.current.x * 8;
      const py = mouseRef.current.y * 8;

      // draw connections and particles
      const parts = particlesRef.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx * dt * 0.06 + px * 0.004;
        p.y += p.vy * dt * 0.06 + py * 0.004;

        // wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.y < -10) p.y = h + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y > h + 10) p.y = -10;
      }

      // draw lines between close particles
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i];
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const alpha = (1 - Math.sqrt(d2) / 120) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 85%, 60%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 85%, 60%, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // init
    handleResize();
    initParticles();
    window.addEventListener("resize", handleResize, { passive: true });
    canvas.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Animated decorative background"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
