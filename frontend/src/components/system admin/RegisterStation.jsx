import React, { useState } from "react";

import { FaSignInAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import { FaPlus } from "react-icons/fa";

const RegisterStations = () => {
  const [stationCode, setStationCode] = useState("");
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const districts = [
    { value: "", label: "Select District" },
    { value: "colombo", label: "Colombo" },
    { value: "gampaha", label: "Gampaha" },
    { value: "kalutara", label: "Kalutara" },
    { value: "kandy", label: "Kandy" },
    { value: "matale", label: "Matale" },
    { value: "nuwara_eliya", label: "Nuwara Eliya" },
    { value: "galle", label: "Galle" },
    { value: "hambantota", label: "Hambantota" },
    { value: "matara", label: "Matara" },
    { value: "jaffna", label: "Jaffna" },
    { value: "killinochchi", label: "Killinochchi" },
    { value: "mannar", label: "Mannar" },
    { value: "mullaitivu", label: "Mullaitivu" },
    { value: "vavuniya", label: "Vavuniya" },
    { value: "badulla", label: "Badulla" },
    { value: "moneragala", label: "Moneragala" },
    { value: "ratnapura", label: "Ratnapura" },
    { value: "kegalle", label: "Kegalle" },
    { value: "puttalam", label: "Puttalam" },
    { value: "kurunegala", label: "Kurunegala" },
    { value: "trincomalee", label: "Trincomalee" },
    { value: "batticaloa", label: "Batticaloa" },
    { value: "ampara", label: "Ampara" },
    { value: "polonnaruwa", label: "Polonnaruwa" },
    { value: "anuradhapura", label: "Anuradhapura" },
  ];

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
          <h3 className="text-start mb-4">Register Station</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="stationCode"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                required
                placeholder="Station Code"
              />
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="stationName"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                required
                placeholder="Station Name"
              />
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Address"
              />
            </div>
            <div className="form-group mb-3 text-start position-relative">
              <select
                className="form-control fs-6 pe-5"
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                style={{ appearance: "none", color: "#555" }}
              >
                {districts.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
              <FaChevronDown
                className="position-absolute"
                style={{
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#555",
                }}
              />
            </div>
            <div className="form-group mb-3 text-start">
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
            <div className="form-group mb-3 text-start">
              <input
                type="email"
                className="form-control fs-6 h-80"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
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
                <FaPlus style={{ marginRight: "8px", fontSize: "20px" }} />{" "}
                REGISTER
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterStations;
