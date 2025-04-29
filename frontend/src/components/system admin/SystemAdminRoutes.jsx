import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../common/HomePage";
import Audits from "./Audits";
import Dashboard from "./Dashboard";
import ManageStations from "./ManageStations";
import ManageUsers from "./ManageUsers";
import Notifications from "./Notifications";
import TrafficViolations from "./TrafficViolations";
import RegisterStations from "./RegisterStation";
import EditStations from "./EditStations";

const SystemAdminRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="/audits/*" element={<Audits />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/manage-stations/*" element={<ManageStations />} />
        <Route path="/manage-users/*" element={<ManageUsers />} />
        <Route path="/notifications/*" element={<Notifications />} />
        <Route path="/traffic-violations/*" element={<TrafficViolations />} />
      </Routes>
    </div>
  );
};

export default SystemAdminRoutes;
