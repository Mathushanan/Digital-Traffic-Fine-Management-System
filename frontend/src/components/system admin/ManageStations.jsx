import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";

const ManageStations = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/manage-stations/register" // Absolute path
            className={`nav-link ${
              location.pathname.includes("register") ? "active" : ""
            }`}
          >
            Register Station
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/manage-stations/edit" // Absolute path
            className={`nav-link ${
              location.pathname.includes("edit") ? "active" : ""
            }`}
          >
            Edit Stations
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="register" />} />
          <Route path="register" element={<RegisterStation />} />
          <Route path="edit" element={<EditStations />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManageStations;
