import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import QuizForm, { getQuizValidationError } from "../QuizForm";

// Edge unit for Zod schema
describe("QuizForm validation", () => {
  it("rejects empty title", () => {
    const quiz = {
      title: "",
      description: "",
      published: true,
      time_limit: 30,
      questions: [
        {
          text: "Q1",
          type: "single",
          options: ["yes", "no"],
          correct_answers: [0],
          points: 5,
          order: 1,
        },
      ],
    };
    expect(getQuizValidationError(quiz)).toBeTruthy();
  });

  it("accepts valid quiz", () => {
    const quiz = {
      title: "Final Exam",
      description: "The big one",
      published: false,
      time_limit: 60,
      questions: [
        {
          text: "Question?",
          type: "multiple",
          options: ["A", "B"],
          correct_answers: [0, 1],
          points: 10,
          order: 1,
        },
      ],
    };
    expect(getQuizValidationError(quiz)).toBeFalsy();
  });

  it("rejects questions with <2 options", () => {
    const quiz = {
      title: "Short Quiz",
      description: "",
      published: false,
      time_limit: 10,
      questions: [
        {
          text: "Q1",
          type: "single",
          options: ["Only one"],
          correct_answers: [0],
          points: 1,
          order: 1,
        },
      ],
    };
    expect(getQuizValidationError(quiz)).toBeTruthy();
  });
});
