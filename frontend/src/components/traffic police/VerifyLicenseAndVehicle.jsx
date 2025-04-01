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
import { MdVerifiedUser } from "react-icons/md";
import srilankanFlag from "../../assets/srilankan_flag.png"; // Import your image here
import srilankanGovSymbol from "../../assets/srilankan_gov_symbol.png"; // Import your image here
import { HiStatusOnline } from "react-icons/hi";
import { FaBan } from "react-icons/fa";
import vehicleRegistrationHeader from "../../assets/vehicle_registration_header.png"; // Import your image here
import { MdPending } from "react-icons/md";

const VerifyLicenseAndVehicle = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [availablePoints, setAvailablePoints] = useState("");
  const [registeredStation, setRegisteredStation] = useState("");
  const [isLicenseActive, setIsLicenseActive] = useState(false);
  const [permittedVehicles, setPermittedVehicles] = useState("A, A1");

  const [vehicleOwnerNicNumber, setVehicleOwnerNicNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [isRoadTaxPaid, setIsRoadTaxPaid] = useState("");
  const [isInsuranced, setIsInsuranced] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState("");

  const [isFinePaid, setIsFinePaid] = useState(true);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showLicenseHolderDetails, setShowLicenseHolderDetails] =
    useState(false);
  const [showVehicleRegistrationDetails, setShowVehicleRegistrationDetails] =
    useState(false);

  const handleLicenseSearch = async (e) => {
    e.preventDefault();

    try {
      const searchLicenseHolderUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-license-holder-details`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchLicenseHolderUrl,
        { licenseNumber: licenseNumber },
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
        setLicenseExpiryDate(fetchedUser.licenseExpiryDate);
        setLicenseIssueDate(fetchedUser.licenseIssueDate);
        setAvailablePoints(fetchedUser.availablePoints);
        setRegisteredStation(fetchedUser.registeredStationName);
        setAvailablePoints(fetchedUser.availablePoints);
        setNicNumber(fetchedUser.nicNumber);

        setShowLicenseHolderDetails(true);
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

  const handleVehicleSearch = async (e) => {
    e.preventDefault();

    try {
      const searchVehicleRegistrationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-vehicle-registration-details`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchVehicleRegistrationUrl,
        { vehicleNumber: vehicleNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedVehicle = response.data;
        console.log(fetchedVehicle);
        setVehicleOwnerNicNumber(fetchedVehicle.nicNumber);
        setMake(fetchedVehicle.make);
        setModel(fetchedVehicle.model);
        setYear(new Date(fetchedVehicle.year).toISOString().split("T")[0]);
        setColor(fetchedVehicle.color);
        setRegistrationNumber(fetchedVehicle.registrationNo);
        setRegistrationDate(
          new Date(fetchedVehicle.registrationDate).toISOString().split("T")[0]
        );
        setIsInsuranced(fetchedVehicle.isInsuranced);
        setIsRoadTaxPaid(fetchedVehicle.isRoadTaxPaid);
        setVehicleCategory(fetchedVehicle.vehicleCategory);

        setShowVehicleRegistrationDetails(true);
      } else {
        setMessage("Failed to fetch vehicle details!");
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

  const handleSearchBoth = (e) => {
    handleLicenseSearch(e);
    handleVehicleSearch(e);
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
          <h3 className="text-start mb-4">Verify License & Vehicle</h3>
          <form>
            <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3 search">
              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="licenseNumber"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                  placeholder="License Number"
                />
              </div>

              <div className="col">
                <input
                  type="text"
                  className="form-control fs-6"
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                  placeholder="Vehicle Number"
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
                onClick={handleSearchBoth}
              >
                <MdVerifiedUser
                  style={{ marginRight: "8px", fontSize: "20px" }}
                />{" "}
                Verify
              </button>
            </div>
            {/* License Details*/}
            {showLicenseHolderDetails && (
              <div className="license-card mb-4 mt-4 shadow-lg p-3 rounded  card">
                <div className="license-header text-center ">
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Left Image */}
                    <div
                      className=" d-flex justify-content-center align-items-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <img
                        src={srilankanFlag}
                        alt="srilankan_flag"
                        className="w-100 h-100 object-fit-contain"
                      />
                    </div>

                    {/* Center Text */}
                    <div className="flex-grow-1 text-center px-3">
                      <h5 className="mb-1" style={{ fontWeight: "bold" }}>
                        DRIVING LICENSE
                      </h5>
                      <p
                        className="m-0 text-uppercase"
                        style={{ fontSize: "12px" }}
                      >
                        Democratic Socialist Republic of Sri Lanka
                      </p>
                    </div>

                    {/* Right Image */}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <img
                        src={srilankanGovSymbol}
                        alt="srilankan_Gov_symbol"
                        className="w-50 h-100 object-fit-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="license-body text-start text-dark p-3">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row">
                        {/* Left Column */}
                        <div className="col-md-6">
                          <p>
                            <strong>Name:</strong> {firstName} {lastName}
                          </p>
                          <p>
                            <strong>Gender:</strong> {gender}
                          </p>
                          <p>
                            <strong>Date of Birth:</strong>{" "}
                            {new Date(dateOfBirth).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Contact:</strong> {contactNumber}
                          </p>
                        </div>
                        {/* Right Column */}
                        <div className="col-md-6">
                          <p>
                            <strong>Nic Number:</strong> {nicNumber}
                          </p>
                          <p>
                            <strong>License Number:</strong> {licenseNumber}
                          </p>
                          <p>
                            <strong>License Issued:</strong>{" "}
                            {new Date(licenseIssueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>License Expiry:</strong>{" "}
                            {new Date(licenseExpiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="row align-items-center">
                        <div className="col-md-9 ">
                          <p>
                            <strong>Address:</strong> {address}
                          </p>
                          <p className="">
                            <strong>Registered Station:</strong>{" "}
                            {registeredStation}
                          </p>
                        </div>
                        <div className="col-md-3 ">
                          <p
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#1A73E8",
                              margin: "10px 0",
                            }}
                          >
                            <strong>{permittedVehicles}</strong>{" "}
                          </p>
                        </div>
                      </div>
                      <div className="row align-items-center justify-content-between mt-2">
                        {availablePoints && (
                          <div className="col-md-3 available-points">
                            <span
                              className="status-text"
                              style={{
                                color: " #b8860b",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {availablePoints} Points
                            </span>
                          </div>
                        )}
                        {new Date(licenseExpiryDate) > Date.now() ? (
                          <div className="col-md-3 license-active-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#28a745",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Active
                              <HiStatusOnline
                                style={{ marginLeft: "5px", fontSize: "20px" }}
                              />
                            </span>
                          </div>
                        ) : (
                          <div className="col-md-3 license-disabled-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#dc3545",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Expired
                              <FaBan
                                style={{ marginLeft: "5px", fontSize: "18px" }}
                              />
                            </span>
                          </div>
                        )}
                        {isFinePaid ? (
                          <div className="col-md-3 tax-paid-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#28a745",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Fine Paid
                              <FaCheckCircle
                                style={{ marginLeft: "5px", fontSize: "15px" }}
                              />
                            </span>
                          </div>
                        ) : (
                          <div className="col-md-3 not-tax-paid-status ">
                            <span
                              className="status-text"
                              style={{
                                color: "#dc3545",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Fine pending
                              <MdPending
                                style={{ marginLeft: "5px", fontSize: "18px" }}
                              />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showVehicleRegistrationDetails && (
              <div className="license-card mb-4 shadow-lg p-3 rounded  card">
                <div className="license-header text-center ">
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Left Image */}

                    {/* Center Text */}
                    <div className="flex-grow-1 text-start ">
                      <h5 className="mb-1" style={{ fontWeight: "bold" }}>
                        VEHICLE REGISTRATION
                      </h5>
                      <p
                        className="m-0 text-uppercase"
                        style={{ fontSize: "12px" }}
                      >
                        Department of Motor Traffic (DMT)
                      </p>
                    </div>

                    {/* Right Image */}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <img
                        src={vehicleRegistrationHeader}
                        alt="srilankan_Gov_symbol"
                        className="w-100 h-100 object-fit-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="license-body text-start  text-dark p-3">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row">
                        {/* Left Column */}
                        <div className="col-md-6">
                          <p>
                            <strong>Make:</strong> {make}
                          </p>
                          <p>
                            <strong>Modal:</strong> {model}
                          </p>
                          <p>
                            <strong>Color:</strong> {color}
                          </p>
                          <p>
                            <strong>Category:</strong> {vehicleCategory}
                          </p>
                        </div>
                        {/* Right Column */}
                        <div className="col-md-6">
                          <p>
                            <strong>Owner's NIC:</strong>{" "}
                            {vehicleOwnerNicNumber}
                          </p>
                          <p>
                            <strong>Year:</strong> {year}
                          </p>
                          <p>
                            <strong>Registration No:</strong>{" "}
                            {registrationNumber}
                          </p>
                          <p>
                            <strong>Registration Date:</strong>{" "}
                            {new Date(registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="row align-items-center justify-content-between mt-2">
                        {isInsuranced ? (
                          <div className="col-md-4 insuranced-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#28a745",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Insured
                              <FaCheckCircle
                                style={{ marginLeft: "5px", fontSize: "15px" }}
                              />
                            </span>
                          </div>
                        ) : (
                          <div className="col-md-4 not-insuranced-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#dc3545",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Not Insured
                              <FaTimesCircle
                                style={{ marginLeft: "5px", fontSize: "15px" }}
                              />
                            </span>
                          </div>
                        )}
                        {!isRoadTaxPaid ? (
                          <div className="col-md-4 tax-paid-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#28a745",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Tax Paid
                              <FaCheckCircle
                                style={{ marginLeft: "5px", fontSize: "15px" }}
                              />
                            </span>
                          </div>
                        ) : (
                          <div className="col-md-4 not-tax-paid-status ">
                            <span
                              className="status-text"
                              style={{
                                color: "#dc3545",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Tax not paid
                              <FaTimesCircle
                                style={{ marginLeft: "5px", fontSize: "15px" }}
                              />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyLicenseAndVehicle;
