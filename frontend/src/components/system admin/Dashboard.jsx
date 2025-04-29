import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";
import RegisterStations from "./RegisterStation";
import RegisterTrafficViolation from "./RegisterTrafficViolation";
import EditTrafficViolations from "./EditTrafficViolations";
import SendNotification from "./SendNotifications";
import ViewNotifications from "./ViewNotifications";
import Analysis from "./Analysis";
import MapView from "./MapView";
import Statistics from "./Statistics";

const Dashboard = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/dashboard/statistics" // Absolute path
            className={`nav-link ${
              location.pathname.includes("statistics") ? "active" : ""
            }`}
          >
            Satistics
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/dashboard/analysis" // Absolute path
            className={`nav-link ${
              location.pathname.includes("analysis") ? "active" : ""
            }`}
          >
            Analysis
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/dashboard/map" // Absolute path
            className={`nav-link ${
              location.pathname.includes("map") ? "active" : ""
            }`}
          >
            Map View
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="statistics" />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="map" element={<MapView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
