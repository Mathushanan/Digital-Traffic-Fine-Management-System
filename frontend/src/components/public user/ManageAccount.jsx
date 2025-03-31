import React, { useState, useEffect } from "react";
import { MdOutlineUpdate } from "react-icons/md";
import { jwtDecode } from "jwt-decode";

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

const ManageAccount = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userId, setUserId] = useState("");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      setNicNumber(decoded.NicNumber || "");
      setLicenseNumber(decoded.LicenseNumber || "");
    }
  }, []);

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

    // Validate password only if it contains at least one character
    if (password.length > 0) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setMessage(
          "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
        );
        setMessageType("error");
        return false;
      }
    }

    // Allow submission if both fields are empty
    if (password.length === 0 && confirmPassword.length === 0) {
      return true;
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
      const updatePublicUserUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/update-user`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        updatePublicUserUrl,
        {
          firstName: firstName,
          lastName: lastName,
          address: address,
          contactNumber: contactNumber,
          email: email,
          nicNumber: nicNumber,
          licenseNumber: licenseNumber,
          dateOfBirth: dateOfBirth,
          gender: gender,
          password: confirmPassword,
          availablePoints: availablePoints,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        setMessage(`User Account updated successfully!`);
        setMessageType("success");
      } else {
        setMessage(`Failed to update the user account!`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`${error.response.data}`);
      setMessageType("error");
    }
  };

  const handleSearch = async () => {
    try {
      const searchPublicUserUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-public-user`;

      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchPublicUserUrl,
        { nicNumber: nicNumber, licenseNumber: licenseNumber },
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
        setLicenseNumber(fetchedUser.licenseNumber);
        setNicNumber(fetchedUser.nicNumber);
        setUserId(fetchedUser.userId);
        setAvailablePoints(fetchedUser.availablePoints);
        setUserId(fetchedUser.userId);
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

  useEffect(() => {
    if (nicNumber && licenseNumber) {
      handleSearch();
    }
  }, [nicNumber, licenseNumber]);

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
          <h3 className="text-start mb-4">Update User Account</h3>
          <form onSubmit={handleSubmit}>
            <div className="details">
              <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                <div className="col">
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

                <div className="col">
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

              <div className="form-group mb-3 text-start">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="availablePoints"
                  value={availablePoints}
                  onChange={(e) => setAvailablePoints(e.target.value)}
                  required
                  placeholder="Available Points"
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                <div className="col">
                  <input
                    type="text"
                    className="form-control fs-6"
                    id="submissionLicenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    placeholder="License Number"
                    readOnly
                    disabled
                  />
                </div>
                <div className="col">
                  <input
                    type="text"
                    className="form-control fs-6"
                    id="submissionNicNumber"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    required
                    placeholder="NIC Number"
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
                />
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

              <div className="form-group mb-3 text-start position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control fs-6 h-80"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          </form>
        </div>
      </div>
    </>
  );
};

export default ManageAccount;
