import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "../../../components/common/HomePage";
import ImageSlider from "../../../components/common/ImageSlider";
import HomePageCards from "../../../components/common/HomePageCards";

// Mock child components to isolate HomePage testing
jest.mock("../../../components/common/ImageSlider", () => () => (
  <div data-testid="image-slider">ImageSlider Component</div>
));
jest.mock("../../../components/common/HomePageCards", () => () => (
  <div data-testid="home-page-cards">HomePageCards Component</div>
));

describe("HomePage Component", () => {
  test("renders HomePage correctly", () => {
    render(<HomePage />);

    // Ensure ImageSlider component is rendered
    expect(screen.getByTestId("image-slider")).toBeInTheDocument();

    // Ensure HomePageCards component is rendered
    expect(screen.getByTestId("home-page-cards")).toBeInTheDocument();
  });
});
