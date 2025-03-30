import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBuildingColumns, FaClipboardCheck } from "react-icons/fa6";
import { GiPoliceOfficerHead, GiMoneyStack } from "react-icons/gi";
import { RiMoneyEuroCircleFill } from "react-icons/ri";
import { MdVerifiedUser } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import {
  FaTachometerAlt,
  FaUserCog,
  FaCarCrash,
  FaBell,
  FaUsersCog,
  FaTimes,
  FaBars,
  FaSignInAlt,
  FaSignOutAlt,
  FaGavel,
  FaQuestionCircle,
  FaInfoCircle,
} from "react-icons/fa";
import logo from "../../assets/logo-gov-lk.png";
import verifyJwtToken from "../../utils/verifyJwtToken";

const SideBar = ({ user, role }) => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* hamburger button */}
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <nav
        className={` nav flex-column bg-light p-3 shadow-sm border me-4 sidebar ${
          isOpen
            ? "open"
            : "nav flex-column bg-light p-3 shadow-sm border me-4 sidebar"
        }`}
      >
        {/* close button*/}
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <FaTimes />
        </button>

        {message && (
          <div className="alert alert-info mt-3 text-center w-100">
            {/* Add message here */}
          </div>
        )}

        {/* logo */}
        <div className="mt-5">
          <img src={logo} alt="" className="w-50 lion-logo" />
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
                  onClick={() => setIsOpen(false)}
                >
                  <AiFillHome className="me-2 nav-link-icon" /> HOME
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/about"
                  onClick={() => setIsOpen(false)}
                >
                  <FaInfoCircle className="me-2" /> ABOUT
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/aboutjj"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/faq"
                  onClick={() => setIsOpen(false)}
                >
                  <FaQuestionCircle className="me-2" /> FAQ
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/legal"
                  onClick={() => setIsOpen(false)}
                >
                  <FaGavel className="me-2" /> LEGAL & TERMS
                </NavLink>
              </div>
            </>
          )}

          {/* system admin */}
          {user && role == "SystemAdmin" && (
            <>
              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTachometerAlt className="me-2" /> DASHBOARD
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/manage-stations"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBuildingColumns className="me-2" /> MANAGE STATIONS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/manage-users"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserCog className="me-2" /> MANAGE USERS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/traffic-violations"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/notifications"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBell className="me-2" /> NOTIFICATIONS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/system-admin/audits"
                  onClick={() => setIsOpen(false)}
                >
                  <FaClipboardCheck className="me-2" /> AUDITS
                </NavLink>
              </div>
            </>
          )}
          {/* station admin */}
          {user && role == "StationAdmin" && (
            <>
              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTachometerAlt className="me-2" /> DASHBOARD
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/payments"
                  onClick={() => setIsOpen(false)}
                >
                  <RiMoneyEuroCircleFill className="me-2" /> PAYMENTS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/manage-officers"
                  onClick={() => setIsOpen(false)}
                >
                  <GiPoliceOfficerHead className="me-2" /> MANAGE OFFICERS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/manage-public"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUsersCog className="me-2" /> MANAGE PUBLIC
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/traffic-violations"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCarCrash className="me-2" /> TRAFFIC VIOLATIONS
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/station-admin/notifications"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBell className="me-2" /> NOTIFICATIONS
                </NavLink>
              </div>
            </>
          )}
          {/* traffic police */}
          {user && role == "TrafficPolice" && (
            <>
              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/traffic-police/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTachometerAlt className="me-2" /> DASHBOARD
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/traffic-police/verification"
                  onClick={() => setIsOpen(false)}
                >
                  <MdVerifiedUser className="me-2" /> VERIFICATION
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/traffic-police/issue-fine"
                  onClick={() => setIsOpen(false)}
                >
                  <GiMoneyStack className="me-2" /> ISSUE FINE
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/traffic-police/notifications"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBell className="me-2" /> NOTIFICATIONS
                </NavLink>
              </div>
            </>
          )}
          {/* public user */}
          {user && role == "PublicUser" && (
            <>
              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/public-user/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTachometerAlt className="me-2" /> DASHBOARD
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/public-user/manage-fines"
                  onClick={() => setIsOpen(false)}
                >
                  <GiMoneyStack className="me-2" /> MANAGE FINES
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/public-user/manage-account"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserCog className="me-2" /> MANAGE ACCOUNT
                </NavLink>
              </div>

              <div className="nav-item mb-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to="/public-user/notifications"
                  onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
            >
              <FaSignInAlt className="me-2" /> LOGIN
            </NavLink>
          </div>
        )}
      </nav>
    </>
  );
};

export default SideBar;
