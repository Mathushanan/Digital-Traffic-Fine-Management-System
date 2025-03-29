import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";
import RegisterStations from "./RegisterStation";
import RegisterTrafficViolation from "./RegisterTrafficViolation";
import EditTrafficViolations from "./EditTrafficViolations";
import SendNotification from "./SendNotifications";
import ViewNotifications from "./ViewNotifications";

const Notifications = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/notifications/send" // Absolute path
            className={`nav-link ${
              location.pathname.includes("send") ? "active" : ""
            }`}
          >
            Send Message
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/notifications/view" // Absolute path
            className={`nav-link ${
              location.pathname.includes("view") ? "active" : ""
            }`}
          >
            View Messages
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="send" />} />
          <Route path="send" element={<SendNotification />} />
          <Route path="view" element={<ViewNotifications />} />
        </Routes>
      </div>
    </div>
  );
};

export default Notifications;
