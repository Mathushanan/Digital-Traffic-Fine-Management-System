import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageSlider from "../../../components/common/ImageSlider";

describe("ImageSlider Component", () => {
  test("renders the ImageSlider component", () => {
    render(<ImageSlider />);
    expect(
      screen.getByRole("button", { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  test("displays the first image initially", () => {
    render(<ImageSlider />);
    const firstImage = screen.getByAltText("First slide");
    expect(firstImage).toBeInTheDocument();
    expect(firstImage).toHaveClass("d-block w-100");
  });

  test("clicking next button changes slide", () => {
    render(<ImageSlider />);
    const nextButton = screen.getByRole("button", { name: /next/i });

    fireEvent.click(nextButton);

    // Ensure the second slide becomes active
    expect(screen.getByAltText("Second slide")).toBeInTheDocument();
  });

  test("clicking previous button changes slide", () => {
    render(<ImageSlider />);
    const prevButton = screen.getByRole("button", { name: /previous/i });

    fireEvent.click(prevButton);

    // Since it's cyclic, the last image should be displayed
    expect(screen.getByAltText("Third slide")).toBeInTheDocument();
  });
});
