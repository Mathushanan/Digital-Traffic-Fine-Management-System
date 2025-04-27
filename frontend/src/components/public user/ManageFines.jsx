import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";

import ViewPendingFines from "./ViewPendingFines";
import ViewPaidFines from "./ViewPaidFines";
import ViewAllFines from "./ViewAllFines";
import ViewDisputedFines from "./ViewDisputedFines";
import PaymentSuccess from "./PaymentSuccess";
import PaymentCancel from "./PaymentCancel";

const ManageFines = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/public-user/manage-fines/pending" // Absolute path
            className={`nav-link ${
              location.pathname.includes("pending") ? "active" : ""
            }`}
          >
            Peding Fines
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/public-user/manage-fines/paid" // Absolute path
            className={`nav-link ${
              location.pathname.includes("paid") ? "active" : ""
            }`}
          >
            Piad Fines
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/public-user/manage-fines/disputes" // Absolute path
            className={`nav-link ${
              location.pathname.includes("disputes") ? "active" : ""
            }`}
          >
            Disputes
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/public-user/manage-fines/all" // Absolute path
            className={`nav-link ${
              location.pathname.includes("all") ? "active" : ""
            }`}
          >
            Fine history
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="pending" />} />
          <Route path="pending" element={<ViewPendingFines />} />
          <Route path="paid" element={<ViewPaidFines />} />
          <Route path="all" element={<ViewAllFines />} />
          <Route path="disputes" element={<ViewDisputedFines />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancel" element={<PaymentCancel />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManageFines;
