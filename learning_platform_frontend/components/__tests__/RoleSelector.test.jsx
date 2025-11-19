import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import RoleSelector, { ROLES } from "../common/RoleSelector";

describe("RoleSelector", () => {
  it("renders both student and instructor options", () => {
    render(<RoleSelector value={ROLES.STUDENT} onChange={() => {}} />);
    expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instructor/i)).toBeInTheDocument();
  });

  it("selects the correct role", () => {
    const onChange = jest.fn();
    render(<RoleSelector value={ROLES.INSTRUCTOR} onChange={onChange} />);
    const instructor = screen.getByLabelText(/instructor/i);
    fireEvent.click(instructor);
    // click triggers onChange but state handled outside
    expect(onChange).toHaveBeenCalledWith(ROLES.INSTRUCTOR);
  });

  it("shows an error if provided", () => {
    render(
      <RoleSelector
        value={ROLES.STUDENT}
        onChange={() => {}}
        error="Must pick a role"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/must pick a role/i);
  });

  it("prevents selecting when disabled", () => {
    const onChange = jest.fn();
    render(
      <RoleSelector value={ROLES.STUDENT} onChange={onChange} disabled={true} />
    );
    const student = screen.getByLabelText(/student/i);
    fireEvent.click(student);
    expect(onChange).not.toHaveBeenCalled();
  });
});
