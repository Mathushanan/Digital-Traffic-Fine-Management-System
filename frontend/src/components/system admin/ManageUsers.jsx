import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStation from "./RegisterStation";
import EditStations from "./EditStations";
import RegisterStationAdmin from "./RegisterStationAdmin";
import EditStationAdmins from "./EditStationAdmins";

const ManageUsers = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/system-admin/manage-users/register" // Absolute path
            className={`nav-link ${
              location.pathname.includes("register") ? "active" : ""
            }`}
          >
            Add Station Admin
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/system-admin/manage-users/edit" // Absolute path
            className={`nav-link ${
              location.pathname.includes("edit") ? "active" : ""
            }`}
          >
            Edit Station Admins
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="register" />} />
          <Route path="register" element={<RegisterStationAdmin />} />
          <Route path="edit" element={<EditStationAdmins />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManageUsers;
