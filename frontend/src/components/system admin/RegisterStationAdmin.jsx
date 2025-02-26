import React, { useState } from "react";

import { FaSignInAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import { FaSearch } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
const RegisterStationAdmin = () => {
  const [registeredStationCode, setRegisteredStationCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [hiredDate, setHiredDate] = useState("");
  const [gender, setGender] = useState("");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registerStationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/register-station`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        registerStationUrl,
        {
          stationCode: stationCode,
          stationName: stationName,
          address: address,
          district: district,
          contactNumber: contactNumber,
          email: email,
          stationAdminBadgeNumber: stationAdminBadgeNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        setMessage(`${stationName} registered successfully!`);
        setMessageType("success");
      }
    } catch (error) {
      setMessage(`${error.response ? error.response.data : error.message}`);
      setMessageType("error");
      console.error(
        "Registration failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const searchStationAdminUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/search-station-admin`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchStationAdminUrl,
        { nicNumber: nicNumber, badgeNumber: badgeNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedUser = response.data;
        console.log(fetchedUser);
        setFirstName(fetchedUser.firstName);
        setLastName(fetchedUser.lastName);
        setDateOfBirth(
          new Date(fetchedUser.dateOfBirth).toISOString().split("T")[0]
        );
        setGender(fetchedUser.gender);
        setContactNumber(fetchedUser.contactNumber);
        setEmail(fetchedUser.email);
        setAddress(fetchedUser.address);
        setHiredDate(
          new Date(fetchedUser.hiredDate).toISOString().split("T")[0]
        );
        setRegisteredStationCode(fetchedUser.stationCode);
        setLicenseNumber(fetchedUser.licenseNumber);
      } else {
        setMessage("Failed to fetch user details!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`${error.response ? error.response.data : error.message}`);
      setMessageType("error");
      console.error(
        "Failed to fetch:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      {/* Message Display Section */}
      {message && (
        <div
          className={`alert ${messageClass} alert-dismissible fade show w-100 w-md-50 shadow-lg rounded start-50 translate-middle-x mt-4`}
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

      <div className="container d-flex justify-content-center align-items-center mt-2">
        <div className="p-4" style={{ maxWidth: "600px", width: "100%" }}>
          <h3 className="text-start mb-4">Register Station Admin</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="nicNumber"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                  required
                  placeholder="NIC Number"
                />
              </div>

              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="badgeNumber"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  required
                  placeholder="Badge Number"
                />
              </div>
            </div>
            <div className="form-group mb-3">
              <button
                type="button"
                className="btn w-100"
                style={{
                  backgroundColor: "#55798f",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={handleSearch}
              >
                <FaSearch style={{ marginRight: "8px", fontSize: "20px" }} />{" "}
                Search
              </button>
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6 disable"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First Name"
                readOnly
                disabled
              />
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Last Name"
                readOnly
                disabled
              />
            </div>
            <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  placeholder="Date of Birth"
                  readOnly
                  disabled
                />
              </div>

              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  placeholder="Gender"
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  placeholder="Contact Number"
                  readOnly
                  disabled
                />
              </div>
              <div className="col">
                <input
                  type="email"
                  className="form-control fs-6 h-80"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6 h-80"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Address"
                readOnly
                disabled
              />
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6 h-80"
                id="hiredDate"
                value={hiredDate}
                onChange={(e) => setHiredDate(e.target.value)}
                required
                placeholder="Hired Date"
                readOnly
                disabled
              />
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6 h-80"
                id="registeredStationCode"
                value={registeredStationCode}
                onChange={(e) => setRegisteredStationCode(e.target.value)}
                required
                placeholder="Registered Station Code"
                readOnly
                disabled
              />
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6 h-80"
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
                placeholder="License Number"
                readOnly
                disabled
              />
            </div>

            <div className="form-group mb-3">
              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: "#55798f",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FaUserPlus style={{ marginRight: "8px", fontSize: "20px" }} />{" "}
                REGISTER
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterStationAdmin;
