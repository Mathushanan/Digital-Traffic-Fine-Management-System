import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import IssueFine from "./IssueFine";
import Notifications from "./Notifications";
import Verification from "./Verification";
import Dashboard from "./Dashboard";

const TrafficPoliceRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/issue-fine/*" element={<IssueFine />} />
        <Route path="/notifications/*" element={<Notifications />} />
        <Route path="/verification/*" element={<Verification />} />
      </Routes>
    </div>
  );
};

export default TrafficPoliceRoutes;
