import React from "react";

/**
 * Card container with surface styling.
 */

// PUBLIC_INTERFACE
export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`surface ${className}`} style={{ padding: "1rem" }} {...props}>
      {children}
    </div>
  );
}
