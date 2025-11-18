import React from "react";
import "../../styles/theme.css";
import "../../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Button
 * A universal, accessible button with gradient variants and sizes aligned to the Ocean Professional theme.
 *
 * Variants:
 * - primary (blue gradient)
 * - success (teal/amber success accent)
 * - danger (red gradient)
 * - warning (amber gradient)
 * - purple (purple/indigo gradient)
 * - glass (glassmorphism button on light surface)
 * - glassDark (glassmorphism button on dark surface)
 *
 * Sizes:
 * - sm, md (default), lg, xl
 *
 * Accessibility:
 * - Focus ring visible and high contrast
 * - Forwards aria- attributes and native button props
 * - Disabled state is consistent across variants
 *
 * Forwards all native button props; defaults to type="button".
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
  ...props
}) {
  // Base classes
  const classes = ["btn", "is-interactive"];

  // Variant classes
  switch (variant) {
    case "primary":
      classes.push("btn-gradient-primary");
      break;
    case "success":
      classes.push("btn-gradient-success");
      break;
    case "danger":
      classes.push("btn-gradient-danger");
      break;
    case "warning":
      classes.push("btn-gradient-warning");
      break;
    case "purple":
      classes.push("btn-gradient-purple");
      break;
    case "glass":
      classes.push("glass", "btn-glass");
      break;
    case "glassDark":
      classes.push("glass-dark", "btn-glass-dark");
      break;
    default:
      classes.push("btn-gradient-primary");
      break;
  }

  // Size classes
  switch (size) {
    case "sm":
      classes.push("btn-sm");
      break;
    case "lg":
      classes.push("btn-lg");
      break;
    case "xl":
      classes.push("btn-xl");
      break;
    default:
      classes.push("btn-md");
  }

  // Disabled state class
  if (disabled) classes.push("btn-disabled");

  return (
    <button
      type={type}
      className={`${classes.join(" ")} ${className}`}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
