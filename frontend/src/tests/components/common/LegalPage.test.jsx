import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LegalTermsPage from "../../../components/common/LegalPage";

describe("LegalTermsPage Component", () => {
  test("renders the LegalTermsPage component", () => {
    render(<LegalTermsPage />);
    expect(screen.getByText(/legal & terms/i)).toBeInTheDocument();
  });

  test("renders the Terms of Service section", () => {
    render(<LegalTermsPage />);
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/eligibility:/i)).toBeInTheDocument();
    expect(screen.getByText(/intellectual property:/i)).toBeInTheDocument();
  });

  test("renders the Privacy Policy section", () => {
    render(<LegalTermsPage />);
    // Use getByRole to make sure we are selecting the correct heading
    expect(
      screen.getByRole("heading", { level: 3, name: /privacy policy/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/data collection:/i)).toBeInTheDocument();
    expect(screen.getByText(/data protection:/i)).toBeInTheDocument();
  });

  test("renders the Disclaimer section", () => {
    render(<LegalTermsPage />);
    expect(screen.getByText(/disclaimer/i)).toBeInTheDocument();
    expect(screen.getByText(/accuracy:/i)).toBeInTheDocument();
    expect(screen.getByText(/liability:/i)).toBeInTheDocument();
  });
});
