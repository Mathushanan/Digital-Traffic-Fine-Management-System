import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Analysis from "./Analysis";
import Statistics from "./Statistics";

const Dashboard = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/traffic-police/dashboard/statistics" // Absolute path
            className={`nav-link ${
              location.pathname.includes("statistics") ? "active" : ""
            }`}
          >
            Satistics
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/traffic-police/dashboard/analysis" // Absolute path
            className={`nav-link ${
              location.pathname.includes("analysis") ? "active" : ""
            }`}
          >
            Analysis
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="statistics" />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="statistics" element={<Statistics />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
