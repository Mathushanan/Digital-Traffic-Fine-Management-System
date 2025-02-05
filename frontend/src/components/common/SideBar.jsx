import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt } from "react-icons/fa";
import { FaUserCog } from "react-icons/fa";
import { FaBuildingColumns } from "react-icons/fa6";
import { FaClipboardCheck } from "react-icons/fa6";
import { FaCarCrash } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { GiPoliceOfficerHead } from "react-icons/gi";
import { FaUsersCog } from "react-icons/fa";
import { RiMoneyEuroCircleFill } from "react-icons/ri";
import { MdVerifiedUser } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { FaInfoCircle } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { FaGavel } from "react-icons/fa";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import logo from "../../assets/logo-gov-lk.png";

const SideBar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("public-user");
  const [user, setUser] = useState(false);

  /*useEffect(() => {
    // Get JWT from local storage
    const jwt = localStorage.getItem("winLanka.Jwt");

    if (jwt === null) {
      navigate("login");
    }

    try {
      // Decode JWT
      const decodedJwt = jwt_decode(jwt);

      // Extract scopes as string
      const scopeString = decodedJwt.scope;

      // Convert string to array
      const scopes = scopeString.split(",").map((scope) => scope.trim());

      // Extract active status
      const isUserActive = decodedJwt.active;

      // Get the current date & time
      const currentTime = Math.floor(Date.now() / 1000);

      // Map of roles
      const rolesMap = {
        1: "admin",
        2: "storekeeper",
        3: "storemanager",
      };

      // Check whether JWT is expired or not
      if (decodedJwt.exp < currentTime) {
        navigate("/login", {
          state: { stateMessage: "Jwt expired!" },
          replace: true,
        });
      }

      // Check whether user is active
      if (isUserActive === "False") {
        navigate("/login", {
          state: { stateMessage: "User isn't activated!" },
          replace: true,
        });
      }

      // Filter the valid roles using extracted JWT scopes
      const validRoles = scopes
        .filter((scope) => rolesMap[scope])
        .map((scope) => rolesMap[scope]); // Map to role names

      // Check if user has at least 1 role assigned
      if (validRoles.length === 0) {
        setMessage("User is not registered for roles!");
        return;
      }

      // Check if the user is an admin
      if (validRoles.includes("admin")) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error decoding JWT:", error);
      navigate("/login", {
        state: { stateMessage: "Invalid JWT" },
        replace: true,
      });
    }
  }, [navigate]);*/

  return (
    <nav
      className="nav flex-column bg-light p-3 shadow-sm border me-4"
      style={{
        minHeight: "100vh",
        width: "300px",
        flexShrink: "0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {message && (
        <div className="alert alert-info mt-3 text-center w-100">
          {/* Add message here */}
        </div>
      )}

      {/* logo */}
      <div className="mt-5">
        <img src={logo} alt="" className="w-50" />
      </div>

      {/* nav items */}
      <div>
        {/* common for all users */}
        {!user && (
          <>
            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/"
              >
                <AiFillHome className="me-2" /> HOME
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/audit-dashboard"
              >
                <FaInfoCircle className="me-2" /> ABOUT
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/add-stock-items"
              >
                <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/stock-summary"
              >
                <FaQuestionCircle className="me-2" /> FAQ
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/daily-summary"
              >
                <FaGavel className="me-2" /> LEGAL & TERMS
              </NavLink>
            </div>
          </>
        )}

        {/* system admin */}
        {user && role == "system-admin" && (
          <>
            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/manage-users"
              >
                <FaTachometerAlt className="me-2" /> DASHBOARD
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/audit-dashboard"
              >
                <FaBuildingColumns className="me-2" /> MANAGE STATIONS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/add-stock-items"
              >
                <FaUserCog className="me-2" /> MANAGE USERS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/stock-summary"
              >
                <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/daily-summary"
              >
                <FaBell className="me-2" /> NOTIFICATIONS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/grn"
              >
                <FaClipboardCheck className="me-2" /> AUDITS
              </NavLink>
            </div>
          </>
        )}
        {/* station admin */}
        {user && role == "station-admin" && (
          <>
            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/manage-users"
              >
                <FaTachometerAlt className="me-2" /> DASHBOARD
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/audit-dashboard"
              >
                <RiMoneyEuroCircleFill className="me-2" /> PAYMENTS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/add-stock-items"
              >
                <GiPoliceOfficerHead className="me-2" /> MANAGE OFFICERS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/stock-summary"
              >
                <FaUsersCog className="me-2" /> MANAGE PUBLIC
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/daily-summary"
              >
                <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/grn"
              >
                <FaBell className="me-2" /> NOTIFICATIONS
              </NavLink>
            </div>
          </>
        )}
        {/* traffic police */}
        {user && role == "traffic-police" && (
          <>
            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/manage-users"
              >
                <FaTachometerAlt className="me-2" /> DASHBOARD
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/audit-dashboard"
              >
                <MdVerifiedUser className="me-2" /> VERIFY
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/add-stock-items"
              >
                <GiMoneyStack className="me-2" /> ISSUE FINE
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/daily-summary"
              >
                <FaBell className="me-2" /> NOTIFICATIONS
              </NavLink>
            </div>
          </>
        )}
        {/* public user */}
        {user && role == "public-user" && (
          <>
            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/manage-users"
              >
                <FaTachometerAlt className="me-2" /> DASHBOARD
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin-dashboard/audit-dashboard"
              >
                <GiMoneyStack className="me-2" /> MANAGE FINES
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/add-stock-items"
              >
                <FaUserCog className="me-2" /> MANAGE ACCOUNT
              </NavLink>
            </div>

            <div className="nav-item mb-2">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/storekeeper-dashboard/daily-summary"
              >
                <FaBell className="me-2" /> NOTIFICATIONS
              </NavLink>
            </div>
          </>
        )}
      </div>

      {/* logout */}
      {user ? (
        <div className="nav-item mb-2 ">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active logout-btn" : "nav-link logout-btn "
            }
            to="/logout"
          >
            <FaSignOutAlt className="me-2" /> LOGOUT
          </NavLink>
        </div>
      ) : (
        <div className="nav-item mb-2">
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active login-btn" : "nav-link login-btn"
            }
            to="/login"
          >
            <FaSignInAlt className="me-2" /> LOGIN
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default SideBar;
