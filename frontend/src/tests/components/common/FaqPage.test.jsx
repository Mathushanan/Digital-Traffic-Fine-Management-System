import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FAQPage from "../../../components/common/FAQPage";

describe("FAQPage Component", () => {
  test("renders FAQ page correctly", () => {
    render(<FAQPage />);

    // Check if the heading is displayed
    expect(
      screen.getByRole("heading", { name: /frequently asked questions/i })
    ).toBeInTheDocument();
  });

  test("renders all FAQ questions", () => {
    render(<FAQPage />);

    const questions = [
      "What is the Department of Motor Traffic?",
      "How can I renew my vehicle registration?",
      "What are the requirements for a driver's license?",
      "How can I report a traffic violation?",
      "What services are offered by the Department of Motor Traffic?",
    ];

    questions.forEach((question) => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  });

  test("expands an FAQ answer when a question is clicked", () => {
    render(<FAQPage />);

    // Select the first FAQ button
    const firstQuestion = screen.getByText(
      /what is the department of motor traffic\?/i
    );

    // Click the first question
    fireEvent.click(firstQuestion);

    // Check if the answer appears
    expect(
      screen.getByText(
        /The Department of Motor Traffic is a government agency responsible for regulating and managing motor vehicles and traffic laws in Sri Lanka./i
      )
    ).toBeInTheDocument();
  });
});
