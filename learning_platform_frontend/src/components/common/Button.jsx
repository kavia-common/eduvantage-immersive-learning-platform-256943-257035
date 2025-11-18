import React from "react";

/**
 * Button component using theme variables.
 * Variant: primary (default) | secondary | ghost
 *
 * PUBLIC_INTERFACE
 * - Forwards all native button props including onClick, disabled, aria-*.
 * - Defaults to type="button" to prevent accidental form submissions.
 */

// PUBLIC_INTERFACE
export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const classes = ["btn"];
  if (variant === "secondary") classes.push("secondary");
  if (variant === "ghost") classes.push("ghost");
  return (
    <button type={type} className={`${classes.join(" ")} ${className}`} {...props}>
      {children}
    </button>
  );
}
