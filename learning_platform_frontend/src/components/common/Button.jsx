import React from "react";

/**
 * Button component using theme variables.
 * Variant: primary (default) | secondary | ghost
 */

// PUBLIC_INTERFACE
export default function Button({ children, variant = "primary", className = "", ...props }) {
  const classes = ["btn"];
  if (variant === "secondary") classes.push("secondary");
  if (variant === "ghost") classes.push("ghost");
  return (
    <button className={`${classes.join(" ")} ${className}`} {...props}>
      {children}
    </button>
  );
}
