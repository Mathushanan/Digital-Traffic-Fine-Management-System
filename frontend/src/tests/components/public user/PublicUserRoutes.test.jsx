import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicUserRoutes from "../../../components/public user/PublicUserRoutes";

// Mock the components to test their rendering
jest.mock("../../../components/public user/Dashboard", () => () => (
  <div>Dashboard Page</div>
));
jest.mock("../../../components/public user/ManageFines", () => () => (
  <div>Manage Fines Page</div>
));
jest.mock("../../../components/public user/ManageAccount", () => () => (
  <div>Manage Account Page</div>
));
jest.mock("../../../components/public user/Notifications", () => () => (
  <div>Notifications Page</div>
));

describe("PublicUserRoutes Component", () => {
  test("redirects to dashboard on root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <PublicUserRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders Dashboard component on /dashboard path", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <PublicUserRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders ManageAccount component on /manage-account path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-account"]}>
        <PublicUserRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Account Page")).toBeInTheDocument();
  });

  test("renders ManageFines component on /manage-fines path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-fines"]}>
        <PublicUserRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Fines Page")).toBeInTheDocument();
  });

  test("renders Notifications component on /notifications path", () => {
    render(
      <MemoryRouter initialEntries={["/notifications"]}>
        <PublicUserRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Notifications Page")).toBeInTheDocument();
  });
});
