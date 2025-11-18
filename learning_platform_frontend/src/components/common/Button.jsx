import React from "react";
import "../../styles/theme.css";
import "../../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Button component using theme variables.
 * Variants:
 * - primary (default)
 * - secondary
 * - ghost
 * - glass (light glass surface)
 * - glassDark (dark glass surface)
 *
 * Forwards all native button props; defaults to type="button".
 */
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
  if (variant === "glass") classes.push("glass", "is-interactive");
  if (variant === "glassDark") classes.push("glass-dark", "is-interactive");

  return (
    <button type={type} className={`${classes.join(" ")} ${className}`} {...props}>
      {children}
    </button>
  );
}
