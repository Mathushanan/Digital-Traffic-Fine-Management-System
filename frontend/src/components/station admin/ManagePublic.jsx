import React from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import RegisterStationAdmin from "../system admin/RegisterStationAdmin";
import EditStationAdmins from "../system admin/EditStationAdmins";
import RegisterTrafficPolice from "./RegisterTrafficPolice";
import EditTrafficPolice from "./EditTrafficPolice";
import EditPublic from "./EditPublic";
import RegisterPublic from "./RegisterPublic";

const ManagePublic = () => {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/station-admin/manage-public/register" // Absolute path
            className={`nav-link ${
              location.pathname.includes("register") ? "active" : ""
            }`}
          >
            Add Public User
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/station-admin/manage-public/edit" // Absolute path
            className={`nav-link ${
              location.pathname.includes("edit") ? "active" : ""
            }`}
          >
            Edit Public User
          </Link>
        </li>
      </ul>
      <div className="mt-3">
        <Routes>
          {/* Ensure the correct routing without duplicating paths */}
          <Route path="/" element={<Navigate to="register" />} />
          <Route path="register" element={<RegisterPublic />} />
          <Route path="edit" element={<EditPublic />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagePublic;
