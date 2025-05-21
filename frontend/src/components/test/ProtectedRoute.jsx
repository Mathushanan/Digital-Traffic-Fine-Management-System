import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../common/ProtectedRoute";
import verifyJwtToken from "../../utils/verifyJwtToken";

// Mock verifyJwtToken function
jest.mock("../../../utils/verifyJwtToken");

const DummyComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe("ProtectedRoute Component", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders children when token is valid", () => {
    verifyJwtToken.mockReturnValue({
      valid: true,
      role: "user",
      stateMessage: "",
    });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <DummyComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to login when token is invalid", () => {
    verifyJwtToken.mockReturnValue({
      valid: false,
      role: "",
      stateMessage: "Invalid token",
    });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <DummyComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects to login when token is missing", () => {
    localStorage.removeItem("authToken");
    verifyJwtToken.mockReturnValue({
      valid: false,
      role: "",
      stateMessage: "Token missing",
    });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <DummyComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
