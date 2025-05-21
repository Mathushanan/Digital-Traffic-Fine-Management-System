import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import TrafficViolations from "./components/common/TrafficViolations";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  useEffect(() => {
    const newToken = localStorage.getItem("authToken");
    if (newToken) {
      const { valid, userType, stateMessage } = verifyJwtToken(newToken);
      setUser(valid);
      setRole(userType);
      if (stateMessage.type === "error") {
        setMessage(stateMessage.message);
        setMessageType(stateMessage.type);
      }
    } else {
      setUser(null);
      setRole(null);
      setMessage(null);
      setMessageType(null);
    }
  }, [token]);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  return (
    <div className="d-flex">
      <Router>
        <SideBar user={user} role={role} />
        <div className="flex-grow-1">
          <LogoHeader />

          <div className="me-3 routes-div">
            {/* Message Display Section */}
            {message && (
              <div
                className={`alert ${messageClass} alert-dismissible fade show start-50 translate-middle-x mt-4 w-50 shadow-lg rounded`}
                role="alert"
              >
                {/* Optional Icon based on message type */}
                <div className="d-flex align-items-center">
                  {messageClass === "alert-success" && (
                    <FaCheckCircle className="me-2" />
                  )}
                  {messageClass === "alert-danger" && (
                    <FaTimesCircle className="me-2" />
                  )}
                  <span>{message}</span>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                  onClick={() => {
                    setMessage(null);
                    setMessageType(null);
                  }}
                ></button>
              </div>
            )}

            <Routes>
              {!user ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route
                    path="/traffic-violations"
                    element={<TrafficViolations />}
                  />
                  <Route
                    path="/login"
                    element={
                      <LoginPage
                        setRole={setRole}
                        setUser={setUser}
                        setMessage={setMessage}
                        setMessageType={setMessageType}
                      />
                    }
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
                      ) : role === "StationAdmin" ? (
                        <Navigate to="/station-admin" replace />
                      ) : role === "PublicUser" ? (
                        <Navigate to="/public-user" replace />
                      ) : role === "TrafficPolice" ? (
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
                  {role === "StationAdmin" && (
                    <Route
                      path="/station-admin/*"
                      element={
                        <ProtectedRoute>
                          <StationAdminRoutes />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {role === "PublicUser" && (
                    <Route
                      path="/public-user/*"
                      element={
                        <ProtectedRoute>
                          <PublicUserRoutes />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {role === "TrafficPolice" && (
                    <Route
                      path="/traffic-police/*"
                      element={
                        <ProtectedRoute>
                          <TrafficPoliceRoutes />
                        </ProtectedRoute>
                      }
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
