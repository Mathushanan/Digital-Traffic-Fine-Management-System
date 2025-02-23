import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SystemAdminRoutes from "../../../components/system admin/SystemAdminRoutes";

// Mock the components to test their rendering
jest.mock(".../../../components/system admin/Audits", () => () => (
  <div>Audits Page</div>
));
jest.mock("../../../components/system admin/Dashboard", () => () => (
  <div>Dashboard Page</div>
));
jest.mock("../../../components/system admin/ManageStations", () => () => (
  <div>Manage Stations Page</div>
));
jest.mock("../../../components/system admin/ManageUsers", () => () => (
  <div>Manage Users Page</div>
));
jest.mock("../../../components/system admin/Notifications", () => () => (
  <div>Notifications Page</div>
));
jest.mock("../../../components/system admin/TrafficViolations", () => () => (
  <div>Traffic Violations Page</div>
));

describe("SystemAdminRoutes Component", () => {
  test("redirects to dashboard on root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders Audits component on /audits path", () => {
    render(
      <MemoryRouter initialEntries={["/audits"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Audits Page")).toBeInTheDocument();
  });

  test("renders Dashboard component on /dashboard path", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders ManageStations component on /manage-stations/* path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-stations"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Stations Page")).toBeInTheDocument();
  });

  test("renders ManageUsers component on /manage-users path", () => {
    render(
      <MemoryRouter initialEntries={["/manage-users"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Manage Users Page")).toBeInTheDocument();
  });

  test("renders Notifications component on /notifications path", () => {
    render(
      <MemoryRouter initialEntries={["/notifications"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Notifications Page")).toBeInTheDocument();
  });

  test("renders TrafficViolations component on /traffic-violations path", () => {
    render(
      <MemoryRouter initialEntries={["/traffic-violations"]}>
        <SystemAdminRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText("Traffic Violations Page")).toBeInTheDocument();
  });
});
