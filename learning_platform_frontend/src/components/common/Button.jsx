import React from "react";
import "../../styles/theme.css";
import "../../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Button
 *
 * A reusable button that supports centralized design token variants.
 *
 * Props:
 * - children: ReactNode - Button label or content
 * - onClick: function - Click handler
 * - disabled: boolean - Disable interaction
 * - type: "button" | "submit" | "reset" - Button type
 * - variant: "primary" | "secondary" | "analytics" | "aiTutor" | string - Visual style variant.
 *            Unknown values are passed through to preserve backward compatibility (legacy gradient classes).
 * - className: string - Additional class names
 * - size: "sm" | "md" | "lg" | "xl" - Preset sizing helpers
 *
 * Notes:
 * - Colors are driven by CSS variables in styles/variables.css and classes in theme.css/utilities.css.
 * - Existing variants continue to work if they already map to CSS classes (backward compatible).
 */
export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  className = "",
  size = "md",
  "aria-label": ariaLabel,
  ...props
}) {
  const classes = ["btn", "is-interactive"];

  // Normalize aiTutor casing
  const normalizedVariant =
    typeof variant === "string" && variant.toLowerCase() === "aitutor"
      ? "aiTutor"
      : variant;

  // New supported variants
  const newVariants = ["primary", "secondary", "analytics", "aiTutor"];

  if (newVariants.includes(normalizedVariant)) {
    classes.push(`btn-${normalizedVariant}`);
  } else {
    // Backward compatibility: map common legacy names to existing classes
    switch (normalizedVariant) {
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
        // Fallback to gradient primary for unknown legacy values
        classes.push("btn-gradient-primary");
        break;
    }
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

  if (disabled) classes.push("btn-disabled");

  return (
    <button
      type={type}
      className={`${classes.join(" ")} ${className}`}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
