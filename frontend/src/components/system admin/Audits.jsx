import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";
import RegisterStations from "./RegisterStation";
import RegisterTrafficViolation from "./RegisterTrafficViolation";
import EditTrafficViolations from "./EditTrafficViolations";
import SendNotification from "./SendNotifications";
import ViewNotifications from "./ViewNotifications";
import ViewAudits from "./ViewAudits";

const Audits = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/audits/view" // Absolute path
            className={`nav-link ${
              location.pathname.includes("view") ? "active" : ""
            }`}
          >
            View Audits
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="view" />} />
          <Route path="view" element={<ViewAudits />} />
        </Routes>
      </div>
    </div>
  );
};

export default Audits;
