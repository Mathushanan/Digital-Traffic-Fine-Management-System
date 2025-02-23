import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LogoHeader from "../../../components/common/LogoHeader";
import logoHeader from "../../../assets/logo-header.png"; // assuming path

describe("LogoHeader Component", () => {
  test("renders the logo image with correct src and alt attributes", () => {
    render(<LogoHeader />);

    // Find the image element by alt text
    const logoImage = screen.getByAltText("logoHeader");

    // Check if the image is in the document
    expect(logoImage).toBeInTheDocument();

    // Check if the image has the correct src
    expect(logoImage).toHaveAttribute("src", logoHeader);
  });
});
