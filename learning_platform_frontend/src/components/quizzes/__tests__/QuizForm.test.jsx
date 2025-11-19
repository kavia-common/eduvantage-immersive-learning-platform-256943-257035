import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import QuizForm from "../QuizForm";

describe("QuizForm", () => {
  it("renders with initial values and submits properly", async () => {
    const submitMock = jest.fn();
    render(
      <QuizForm
        initialQuiz={{
          title: "Sample Quiz",
          description: "A test quiz",
          questions: ["Question 1", "Question 2"],
        }}
        onSubmit={submitMock}
      />
    );
    expect(screen.getByLabelText(/Quiz Title/i)).toHaveValue("Sample Quiz");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("A test quiz");
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/New question text/i), {
      target: { value: "New Question X" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add question/i }));
    expect(screen.getByText("New Question X")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Quiz Title/i), {
      target: { value: "Updated Quiz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Quiz/i }));
    expect(submitMock).toHaveBeenCalledWith({
      title: "Updated Quiz",
      description: "A test quiz",
      questions: ["Question 1", "Question 2", "New Question X"],
    });
  });

  it("shows validation error with empty title and questions", async () => {
    const submitMock = jest.fn();
    render(<QuizForm initialQuiz={{}} onSubmit={submitMock} />);
    fireEvent.click(screen.getByRole("button", { name: /Create Quiz/i }));
    expect(screen.getByText(/Quiz title is required/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Quiz Title/i), {
      target: { value: "Actual Title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Quiz/i }));
    expect(screen.getByText(/At least one question is required/i)).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("removes a question by clicking remove", async () => {
    const submitMock = jest.fn();
    render(
      <QuizForm
        initialQuiz={{
          title: "Quiz",
          description: "",
          questions: ["Q1", "Q2"],
        }}
        onSubmit={submitMock}
      />
    );
    const removeBtn = screen.getAllByRole("button", { name: /^Remove question \d+$/i })[0];
    fireEvent.click(removeBtn);
    expect(screen.queryByText("Q1")).not.toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
  });
});
