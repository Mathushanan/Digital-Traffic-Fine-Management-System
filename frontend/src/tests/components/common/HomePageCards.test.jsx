import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePageCards from "../../../components/common/HomePageCards";

describe("HomePageCards Component", () => {
  test("renders all cards with correct titles and text", () => {
    render(<HomePageCards />);

    // Define expected titles and texts
    const sections = [
      { title: "E-Services", text: "Report your Complaints" },
      { title: "Media", text: "Press Releases & News Updates" },
      { title: "Gallery", text: "Image & Video Collection" },
      { title: "Contact us", text: "Telephone & Police Stations" },
      { title: "Join", text: "Become a Peace Officer" },
    ];

    sections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      expect(screen.getByText(section.text)).toBeInTheDocument();
    });
  });

  test("renders the correct number of cards", () => {
    render(<HomePageCards />);
    const cards = screen.getAllByRole("heading", { level: 5 }); // Select all <h5> elements (card titles)
    expect(cards.length).toBe(5); // Should render 5 cards
  });
});
