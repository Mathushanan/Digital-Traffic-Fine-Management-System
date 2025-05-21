import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../common/LoginPage";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Mock the necessary dependencies
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

// Mocking the import.meta.env for the test
beforeAll(() => {
  globalThis.importMeta = {
    env: { VITE_API_BASE_URL: "http://localhost:7225/api" },
  };
});

describe("LoginPage Component", () => {
  const setUserMock = jest.fn();
  const setRoleMock = jest.fn();
  const setMessageMock = jest.fn();
  const setMessageTypeMock = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate); // Ensure useNavigate mock is properly set
  });

  test("renders LoginPage correctly", () => {
    render(
      <LoginPage
        setUser={setUserMock}
        setRole={setRoleMock}
        setMessage={setMessageMock}
        setMessageType={setMessageTypeMock}
      />
    );

    // Check if the form elements are present
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("displays an error message when login fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: "Invalid credentials" },
    });

    render(
      <LoginPage
        setUser={setUserMock}
        setRole={setRoleMock}
        setMessage={setMessageMock}
        setMessageType={setMessageTypeMock}
      />
    );

    // Simulate filling out the form and submitting it
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(setMessageMock).toHaveBeenCalledWith(
        expect.stringContaining("Invalid credentials")
      )
    );

    expect(setMessageTypeMock).toHaveBeenCalledWith("error");
  });

  test("logs in the user successfully and navigates based on user type", async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: "mockedToken" },
    });

    // Simulate a decoded JWT token
    jwtDecode.mockReturnValue({ UserType: "SystemAdmin" });

    render(
      <LoginPage
        setUser={setUserMock}
        setRole={setRoleMock}
        setMessage={setMessageMock}
        setMessageType={setMessageTypeMock}
      />
    );

    // Simulate filling out the form and submitting it
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "correctpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Wait for the success message and check if the navigate function is called
    await waitFor(() => expect(setUserMock).toHaveBeenCalledWith(true));
    expect(setRoleMock).toHaveBeenCalledWith("SystemAdmin");
    expect(mockNavigate).toHaveBeenCalledWith("/system-admin");
  });
});
