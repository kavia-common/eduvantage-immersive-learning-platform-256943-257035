import React from "react";
import PropTypes from "prop-types";

// PUBLIC_INTERFACE
export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor"
};

/**
 * RoleSelector component for accessible selection of user role ("student" or "instructor") following Ocean Professional theme.
 *
 * @param {object} props
 * @param {string} props.value Current selected role
 * @param {(value: string) => void} props.onChange Handler when selection changes
 * @param {string} [props.error] Optional error message for validation
 * @param {boolean} [props.disabled] Whether the selector is disabled
 */
export default function RoleSelector({ value, onChange, error, disabled }) {
  return (
    <fieldset
      className="role-selector ocean-shadow ocean-role-group"
      aria-labelledby="role-selector-legend"
      disabled={disabled}
      style={{
        border: "none",
        margin: 0,
        padding: 0
      }}
    >
      <legend
        id="role-selector-legend"
        className="block text-sm font-medium text-[#2563EB] mb-2"
      >
        Role <span aria-hidden="true" style={{color: "#EF4444"}}>*</span>
      </legend>
      <div className="flex gap-4 mb-1">
        <label
          className="flex-1 cursor-pointer rounded-lg transition border border-gray-200 focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:ring-offset-2 shadow-sm bg-white px-4 py-3
            hover:border-[#2563EB]
            aria-checked:ring-2 aria-checked-ring-[#2563EB]
            "
          htmlFor="role-student"
          tabIndex={disabled ? -1 : 0}
        >
          <input
            type="radio"
            id="role-student"
            name="role"
            value={ROLES.STUDENT}
            checked={value === ROLES.STUDENT}
            onChange={() => onChange(ROLES.STUDENT)}
            aria-checked={value === ROLES.STUDENT}
            aria-label="Select student role"
            disabled={disabled}
            className="mr-2 accent-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
            required
          />
          <span className="font-semibold text-[#2563EB] select-none">Student</span>
        </label>
        <label
          className="flex-1 cursor-pointer rounded-lg transition border border-gray-200 focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:ring-offset-2 shadow-sm bg-white px-4 py-3
            hover:border-[#2563EB]
            aria-checked:ring-2 aria-checked-ring-[#2563EB]
            "
          htmlFor="role-instructor"
          tabIndex={disabled ? -1 : 0}
        >
          <input
            type="radio"
            id="role-instructor"
            name="role"
            value={ROLES.INSTRUCTOR}
            checked={value === ROLES.INSTRUCTOR}
            onChange={() => onChange(ROLES.INSTRUCTOR)}
            aria-checked={value === ROLES.INSTRUCTOR}
            aria-label="Select instructor role"
            disabled={disabled}
            className="mr-2 accent-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]"
            required
          />
          <span className="font-semibold text-[#F59E0B] select-none">Instructor</span>
        </label>
      </div>
      {error && (
        <div
          className="text-[#EF4444] text-xs pt-1"
          role="alert"
          aria-live="assertive"
          id="role-error"
        >
          {error}
        </div>
      )}
      <style>{`
        .ocean-shadow {
          box-shadow: 0 2px 8px rgb(37 99 235 / 0.08);
        }
        .ocean-role-group input[type="radio"]:focus + span,
        .ocean-role-group label:focus-within {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
      `}
      </style>
    </fieldset>
  );
}

RoleSelector.propTypes = {
  value: PropTypes.oneOf(Object.values(ROLES)).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool
};
