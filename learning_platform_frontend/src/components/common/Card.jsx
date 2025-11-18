import React from "react";
import "../../styles/theme.css";
import "../../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Card
 * A surface wrapper with optional variant, adds glassmorphism by default.
 *
 * Props:
 * - className?: string
 * - variant?: 'default' | 'glass' | 'solid' | 'glass-dark'
 * - children: React.ReactNode
 */
export default function Card({ children, className = "", variant = "glass", ...props }) {
  const variantClass =
    variant === "glass-dark" ? "glass-dark" : variant === "solid" ? "" : "glass";

  return (
    <div className={`surface ${variantClass} ${className}`} style={{ padding: "1rem" }} {...props}>
      {children}
    </div>
  );
}
