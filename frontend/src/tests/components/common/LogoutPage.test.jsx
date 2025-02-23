import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import LogoutPage from "../../../components/common/LogoutPage";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("LogoutPage Component", () => {
  const mockSetUser = jest.fn();
  const mockSetRole = jest.fn();
  const mockNavigate = jest.fn(); // Initialize mockNavigate manually

  beforeEach(() => {
    // Clear any mocks before each test
    mockSetUser.mockClear();
    mockSetRole.mockClear();
    mockNavigate.mockClear(); // Now this will work
    Storage.prototype.removeItem = jest.fn();

    // Ensure the mockNavigate is used in the component
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders the logging out message", async () => {
    render(
      <MemoryRouter initialEntries={["/logout"]}>
        <Routes>
          <Route
            path="/logout"
            element={<LogoutPage setUser={mockSetUser} setRole={mockSetRole} />}
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Logging out...")).toBeInTheDocument();
    });
  });

  test("calls setUser, setRole, and navigate correctly on logout", async () => {
    render(
      <MemoryRouter initialEntries={["/logout"]}>
        <Routes>
          <Route
            path="/logout"
            element={<LogoutPage setUser={mockSetUser} setRole={mockSetRole} />}
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the useEffect to complete and simulate logout action
    await act(async () => {
      // Ensure localStorage.removeItem is called
      expect(localStorage.removeItem).toHaveBeenCalledWith("authToken");

      // Ensure setUser and setRole are called with the correct arguments
      expect(mockSetUser).toHaveBeenCalledWith(false);
      expect(mockSetRole).toHaveBeenCalledWith(null);

      // Ensure navigate is called with "/login"
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });
});
