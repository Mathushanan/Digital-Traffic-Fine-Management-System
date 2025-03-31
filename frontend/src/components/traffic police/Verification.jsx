import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";

import ViewNotifications from "./ViewNotifications";
import VerifyPublicAndVehicle from "./VerifyLicenseAndVehicle";
import ViolationHistory from "./ViolationHistory";
import VerifyLicenseAndVehicle from "./VerifyLicenseAndVehicle";

const Verification = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/traffic-police/verification/verify" // Absolute path
            className={`nav-link ${
              location.pathname.includes("verify") ? "active" : ""
            }`}
          >
            Verify License & Vehicle
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/traffic-police/verification/violation-history" // Absolute path
            className={`nav-link ${
              location.pathname.includes("violation-history") ? "active" : ""
            }`}
          >
            Violation History
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="verify" />} />
          <Route path="verify" element={<VerifyLicenseAndVehicle />} />
          <Route path="violation-history" element={<ViolationHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default Verification;
