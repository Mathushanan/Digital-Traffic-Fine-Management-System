import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import ManageOfficers from "./ManageOfficers";
import ManagePublic from "./ManagePublic";
import Notifications from "./Notifications";
import Payments from "./Payments";
import TrafficViolations from "./TrafficViolations";

const StationAdminRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-officers" element={<ManageOfficers />} />
        <Route path="/manage-public" element={<ManagePublic />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/traffic-violations" element={<TrafficViolations />} />
      </Routes>
    </div>
  );
};

export default StationAdminRoutes;
