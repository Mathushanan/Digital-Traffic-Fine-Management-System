import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";
import RegisterStations from "./RegisterStation";
import RegisterTrafficViolation from "./RegisterTrafficViolation";
import EditTrafficViolations from "./EditTrafficViolations";

const TrafficViolations = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/traffic-violations/register" // Absolute path
            className={`nav-link ${
              location.pathname.includes("register") ? "active" : ""
            }`}
          >
            Add Traffic Violation
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/traffic-violations/edit" // Absolute path
            className={`nav-link ${
              location.pathname.includes("edit") ? "active" : ""
            }`}
          >
            Edit Traffic Violations
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="register" />} />
          <Route path="register" element={<RegisterTrafficViolation />} />
          <Route path="edit" element={<EditTrafficViolations />} />
        </Routes>
      </div>
    </div>
  );
};

export default TrafficViolations;
