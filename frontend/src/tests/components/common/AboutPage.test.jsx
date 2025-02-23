import React from "react";
import { render, screen } from "@testing-library/react";
import AboutPage from "../../../components/common/AboutPage.jsx"; // Adjust the import path as necessary

// Test Suite for AboutPage
describe("AboutPage Component", () => {
  test("renders Vision section", () => {
    render(<AboutPage />);
    const visionHeading = screen.getByRole("heading", { name: /Vision/i });
    expect(visionHeading).toBeInTheDocument();

    const visionText = screen.getByText(
      /A responsive organization aspiring towards excellence through modern technology in motor traffic regulation!/i
    );
    expect(visionText).toBeInTheDocument();
  });

  test("renders Mission section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Mission/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Efficiently executing rules and regulations through teamwork and technology to create a responsive government organization!/i
      )
    ).toBeInTheDocument();
  });

  test("renders Values section with all value titles", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Values/i)).toBeInTheDocument();
    expect(screen.getByText(/Public Appreciation/i)).toBeInTheDocument();
    expect(screen.getByText(/Efficiency & Effectiveness/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer Satisfaction/i)).toBeInTheDocument();
    expect(screen.getByText(/Employee Motivation/i)).toBeInTheDocument();
  });

  test("renders Quality Policy section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Quality Policy/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /We at the Department of Motor Traffic abide by the Motor Traffic Act of Sri Lanka/i
      )
    ).toBeInTheDocument();
  });
});
