import React from "react";
import Dashboard from "./Dashboard";
import ManageFines from "./ManageFines";
import ManageAccount from "./ManageAccount";
import Notifications from "./Notifications";
import { Route, Routes } from "react-router-dom";

const PublicUserRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-account" element={<ManageAccount />} />
        <Route path="/manage-fines" element={<ManageFines />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </div>
  );
};

export default PublicUserRoutes;
