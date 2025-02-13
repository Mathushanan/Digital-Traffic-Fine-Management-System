import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SideBar from "./components/common/SideBar";
import LogoHeader from "./components/common/LogoHeader";
import HomePage from "./components/common/HomePage";
import AboutPage from "./components/common/AboutPage";
import FaqPage from "./components/common/FaqPage";
import LegalPage from "./components/common/LegalPage";
import LoginPage from "./components/common/LoginPage";
import ManageStations from "./components/system admin/ManageStations";
import SystemAdminRoutes from "./components/system admin/SystemAdminRoutes";
import StationAdminRoutes from "./components/station admin/StationAdminRoutes";
import { useState } from "react";
import TrafficPoliceRoutes from "./components/traffic police/TrafficPoliceRoutes";
import PublicUserRoutes from "./components/public user/PublicUserRoutes";

function App() {
  const [role, setRole] = useState("public-user");
  const [user, setUser] = useState(false);

  return (
    <>
      <div className="d-flex">
        <Router>
          <SideBar />
          <div className="flex-grow-1">
            <LogoHeader />
            <div className="me-3 routes-div">
              <Routes>
                {!user && (
                  <>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/login" element={<LoginPage />} />
                  </>
                )}
                {user && role == "system-admin" && (
                  <>
                    <Route
                      path="/"
                      element={<Navigate to="/system-admin/dashboard" />}
                    />
                    <Route
                      path="/system-admin/*"
                      element={<SystemAdminRoutes />}
                    />
                    <Route
                      path="/system-admin"
                      element={<Navigate to="/system-admin/dashboard" />}
                    />
                  </>
                )}
                {user && role == "station-admin" && (
                  <>
                    <Route
                      path="/"
                      element={<Navigate to="/station-admin/dashboard" />}
                    />
                    <Route
                      path="/station-admin/*"
                      element={<StationAdminRoutes />}
                    />
                    <Route
                      path="/station-admin"
                      element={<Navigate to="/station-admin/dashboard" />}
                    />
                  </>
                )}
                {user && role == "public-user" && (
                  <>
                    <Route
                      path="/"
                      element={<Navigate to="/public-user/dashboard" />}
                    />
                    <Route
                      path="/public-user/*"
                      element={<PublicUserRoutes />}
                    />
                    <Route
                      path="/public-user"
                      element={<Navigate to="/public-user/dashboard" />}
                    />
                  </>
                )}
                {user && role == "traffic-police" && (
                  <>
                    <Route
                      path="/"
                      element={<Navigate to="/traffic-police/dashboard" />}
                    />
                    <Route
                      path="/traffic-police/*"
                      element={<TrafficPoliceRoutes />}
                    />
                    <Route
                      path="/traffic-police"
                      element={<Navigate to="/traffic-police/dashboard" />}
                    />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;
