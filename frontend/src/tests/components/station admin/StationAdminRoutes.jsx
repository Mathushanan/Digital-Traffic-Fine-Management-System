import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StationAdminRoutes from "../../../components/station admin/StationAdminRoutes";

// Mock the components to test their rendering
jest.mock("../../../components/station admin/Dashboard", () => () => (
  <div>Dashboard Page</div>
));
jest.mock(".../../../components/station admin/ManageOfficers", () => () => (
  <div>Manage Officers Page</div>
));
jest.mock("../../../components/station admin/ManagePublic", () => () => (
  <div>Manage Public Page</div>
));
jest.mock("../../../components/station admin/Notifications", () => () => (
  <div>Notifications Page</div>
));
jest.mock("../../../components/station admin/Payments", () => () => (
  <div>Payments Page</div>
));
jest.mock("../../../components/station admin/TrafficViolations", () => () => (
  <div>Traffic Violations Page</div>
));

describe("StationAdminRoutes Component", () => {
  test("redirects to dashboard on root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders Dashboard component on /dashboard path", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders ManageOfficers component on /manage-officers path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-officers"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Officers Page")).toBeInTheDocument();
  });

  test("renders ManagePublic component on /manage-public path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-public"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Public Page")).toBeInTheDocument();
  });

  test("renders Notifications component on /notifications path", () => {
    render(
      <MemoryRouter initialEntries={["/notifications"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Notifications Page")).toBeInTheDocument();
  });

  test("renders Payments component on /payments path", () => {
    render(
      <MemoryRouter initialEntries={["/payments"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Payments Page")).toBeInTheDocument();
  });

  test("renders TrafficViolations component on /traffic-violations path", () => {
    render(
      <MemoryRouter initialEntries={["/traffic-violations"]}>
        <StationAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Traffic Violations Page")).toBeInTheDocument();
  });
});
