import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";

import ViewNotifications from "./ViewNotifications";
import VerifyPublicAndVehicle from "./VerifyLicenseAndVehicle";
import ViolationHistory from "./ViolationHistory";
import VerifyLicenseAndVehicle from "./VerifyLicenseAndVehicle";
import FineHistory from "./FineHistory";
import AddFine from "./AddFine";

const IssueFine = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/traffic-police/issue-fine/add-fine" // Absolute path
            className={`nav-link ${
              location.pathname.includes("add-fine") ? "active" : ""
            }`}
          >
            Add Fine
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/traffic-police/issue-fine/fine-history" // Absolute path
            className={`nav-link ${
              location.pathname.includes("fine-history") ? "active" : ""
            }`}
          >
            Issued Fine History
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="add-fine" />} />
          <Route path="add-fine" element={<AddFine />} />
          <Route path="fine-history" element={<FineHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default IssueFine;
