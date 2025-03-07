import React, { useState } from "react";

import { FaSignInAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import { FaPlus } from "react-icons/fa";

const RegisterTrafficViolation = () => {
  const [violationType, setViolationType] = useState("");
  const [provision, setProvision] = useState("");
  const [sectionOfAct, setSectionOfAct] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [points, setPoints] = useState("");
  const [dueDays, setDueDays] = useState("");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const violationTypes = [
    { value: "", label: "Select a Violation Category" },
    { value: "court&fine", label: "Handled in Court & Requires Fine Payment" },
    { value: "fine", label: "Requires only a Fine Payment" },
  ];

  const validateForm = () => {
    if (!/^[0-9]+(\.[0-9]+)?$/.test(fineAmount)) {
      return "Fine Amount must be a valid decimal number.";
    }
    if (!/^[0-9]+$/.test(points)) {
      return "Points must be a valid integer.";
    }
    if (!/^[0-9]+$/.test(dueDays)) {
      return "Due Days must be a valid integer.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(violationType);

    const errorMessage = validateForm();
    if (errorMessage) {
      setMessage(errorMessage);
      setMessageType("error");
      return;
    }

    try {
      const registerTrafficViolationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/register-traffic-violation`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        registerTrafficViolationUrl,
        {
          violationType: violationType,
          provision: provision,
          fineAmount: fineAmount,
          points: points,
          dueDays: dueDays,
          sectionOfAct: sectionOfAct,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        setMessage(`New Traffic violation registered successfully!`);
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
          <h3 className="text-start mb-4">Register Traffic Violation</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3 text-start position-relative">
              <select
                className="form-control fs-6 pe-5"
                id="violationType"
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                required
                style={{ appearance: "none", color: "#555" }}
              >
                {violationTypes.map((violationType) => (
                  <option key={violationType.value} value={violationType.value}>
                    {violationType.label}
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
                id="sectionOfAct"
                value={sectionOfAct}
                onChange={(e) => setSectionOfAct(e.target.value)}
                required
                placeholder="Section Of Act"
              />
            </div>

            <div class="form-group mb-3 text-start">
              <textarea
                className="form-control fs-6"
                id="provision"
                name="provision"
                required
                placeholder="Provision"
                rows="4"
                value={provision}
                onChange={(e) => setProvision(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="number"
                className="form-control fs-6"
                id="finaAmount"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                required
                placeholder="Fine Amount"
              />
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="number"
                className="form-control fs-6"
                id="points"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
                placeholder="Allocated Points"
              />
            </div>

            <div className="form-group mb-3 text-start">
              <input
                type="number"
                className="form-control fs-6 h-80"
                id="dueDays"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
                required
                placeholder="Due Days"
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

export default RegisterTrafficViolation;
