import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PageNotFound from "../../../components/common/PageNotFound"; // Adjust the import path as needed

describe("PageNotFound Component", () => {
  test("renders the 404 error message", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Check if the 404 message is rendered
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  test("renders the 'Page Not Found' message", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Check if the 'Page Not Found' message is rendered
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  test("renders the 'Go back to Home' button", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Check if the 'Go back to Home' button is rendered
    expect(screen.getByText("Go back to Home")).toBeInTheDocument();
  });

  test("navigates to home when 'Go back to Home' button is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/some/invalid/path"]}>
        <PageNotFound />
      </MemoryRouter>
    );

    // Click the 'Go back to Home' button
    fireEvent.click(screen.getByText("Go back to Home"));

    // Check if the navigation redirects to the home page
    expect(window.location.pathname).toBe("/");
  });
});
