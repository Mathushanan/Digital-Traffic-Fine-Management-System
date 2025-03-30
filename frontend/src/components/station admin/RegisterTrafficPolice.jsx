import React, { useState, useEffect } from "react";

import { FaSignInAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import { FaSearch } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

const RegisterTrafficPolice = () => {
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
  const [submissionBadgeNumber, setSubmissionBadgeNumber] = useState("");
  const [submissionNicNumber, setSubmissionNicNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showDetails, setShowDetails] = useState(false);

  const validateForm = () => {
    // Validate address
    if (address.length < 5) {
      setMessage("Address must be at least 5 characters long.");
      setMessageType("error");
      return false;
    }

    // Validate contact number (should contain digits, spaces, and + sign, and should be 10-18 characters)
    const contactNumberPattern = /^[\d\s+]{10,18}$/;

    if (!contactNumberPattern.test(contactNumber)) {
      setMessage("Contact number must be valid.");
      setMessageType("error");
      return false;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      setMessageType("error");
      return false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setMessage("Password and confirm password do not match.");
      setMessageType("error");
      return false;
    }

    // If all validations pass
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform form validation
    if (!validateForm()) {
      return;
    }

    try {
      const registerTrafficPoliceUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/register-traffic-police`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        registerTrafficPoliceUrl,
        {
          firstName: firstName,
          lastName: lastName,
          address: address,
          contactNumber: contactNumber,
          email: email,
          badgeNumber: submissionBadgeNumber,
          nicNumber: submissionNicNumber,
          licenseNumber: licenseNumber,
          dateOfBirth: dateOfBirth,
          hiredDate: hiredDate,
          gender: gender,
          password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        setMessage(`Traffic police registered successfully!`);
        setMessageType("success");
        setShowDetails(false);
      } else {
        setMessage(`Failed to register the traffic police!`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`${error.response.data}`);
      setMessageType("error");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const searchTrafficPoliceUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/search-traffic-police`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchTrafficPoliceUrl,
        { nicNumber: nicNumber, badgeNumber: badgeNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedUser = response.data;
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
        setLicenseNumber(fetchedUser.licenseNumber);
        setSubmissionBadgeNumber(fetchedUser.badgeNumber);
        setSubmissionNicNumber(fetchedUser.nicNumber);
        setShowDetails(true);
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
          <h3 className="text-start mb-4">Register Traffic Police</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3 search">
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
            {showDetails && (
              <div className="details">
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
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    placeholder="License Number"
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group mb-3 text-start position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control fs-6 h-80"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </span>
                </div>

                <div className="form-group mb-3 text-start position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control fs-6 h-80"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm Password"
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </span>
                </div>

                <div className="form-group mb-3 text-start d-none">
                  <input
                    type="text"
                    className="form-control fs-6"
                    id="submissionNicNumber"
                    value={submissionNicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    required
                    placeholder="NIC Number"
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group mb-3 text-start d-none">
                  <input
                    type="text"
                    className="form-control fs-6"
                    id="submissionBadgeNumber"
                    value={submissionBadgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    required
                    placeholder="Badge Number"
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
                    <FaUserPlus
                      style={{ marginRight: "8px", fontSize: "20px" }}
                    />{" "}
                    REGISTER
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterTrafficPolice;
