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
import SystemAdminRoutes from "./components/system admin/SystemAdminRoutes";
import StationAdminRoutes from "./components/station admin/StationAdminRoutes";
import TrafficPoliceRoutes from "./components/traffic police/TrafficPoliceRoutes";
import PublicUserRoutes from "./components/public user/PublicUserRoutes";
import LogoutPage from "./components/common/LogoutPage";
import { useState, useEffect } from "react";
import verifyJwtToken from "./utils/verifyJwtToken";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PageNotFound from "./components/common/PageNotFound";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const newToken = localStorage.getItem("authToken");
    if (newToken) {
      const { valid, userType, stateMessage } = verifyJwtToken(newToken);
      setUser(valid);
      setRole(userType);
      setMessage(stateMessage);
    } else {
      setUser(null);
      setRole(null);
      setMessage(null);
    }
  }, [token]);

  return (
    <div className="d-flex">
      <Router>
        <SideBar user={user} role={role} />
        <div className="flex-grow-1">
          <LogoHeader />
          <div className="me-3 routes-div">
            <Routes>
              {!user ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route
                    path="/login"
                    element={<LoginPage setRole={setRole} setUser={setUser} />}
                  />
                  {/* Redirect to Login Page for other routes if no user */}
                  <Route path="*" element={<PageNotFound />} />
                </>
              ) : (
                <>
                  {/* Redirect to Login Page for other routes if no user */}
                  <Route path="*" element={<PageNotFound />} />
                  {/* Redirect from "/" to the respective dashboard */}
                  <Route
                    path="/"
                    element={
                      role === "SystemAdmin" ? (
                        <Navigate to="/system-admin" replace />
                      ) : role === "station-admin" ? (
                        <Navigate to="/station-admin" replace />
                      ) : role === "public-user" ? (
                        <Navigate to="/public-user" replace />
                      ) : role === "traffic-police" ? (
                        <Navigate to="/traffic-police" replace />
                      ) : (
                        <HomePage />
                      )
                    }
                  />
                  {role === "SystemAdmin" && (
                    <Route
                      path="/system-admin/*"
                      element={
                        <ProtectedRoute>
                          <SystemAdminRoutes />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {role === "station-admin" && (
                    <Route
                      path="/station-admin/*"
                      element={<StationAdminRoutes />}
                    />
                  )}
                  {role === "public-user" && (
                    <Route
                      path="/public-user/*"
                      element={<PublicUserRoutes />}
                    />
                  )}
                  {role === "traffic-police" && (
                    <Route
                      path="/traffic-police/*"
                      element={<TrafficPoliceRoutes />}
                    />
                  )}
                  <Route
                    path="/logout"
                    element={<LogoutPage setRole={setRole} setUser={setUser} />}
                  />
                </>
              )}
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
