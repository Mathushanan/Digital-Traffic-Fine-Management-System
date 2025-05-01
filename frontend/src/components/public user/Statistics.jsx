import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import srilankanFlag from "../../assets/srilankan_flag.png"; // Import your image here
import srilankanGovSymbol from "../../assets/srilankan_gov_symbol.png"; // Import your image here
import { HiStatusOnline } from "react-icons/hi";
import { FaBan } from "react-icons/fa";
import { MdPending } from "react-icons/md";

const Statistics = () => {
  const [fetchedFines, setFetchedFines] = useState(null);
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
  const [permittedVehicles, setPermittedVehicles] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [statistics, setStatistics] = useState([]);

  const fetchFines = async () => {
    try {
      const fetchFinesUrl = `${import.meta.env.VITE_API_BASE_URL}/get-fines`;
      const token = localStorage.getItem("authToken");

      const decodedToken = jwtDecode(token);
      console.log(decodedToken);

      const response = await axios.post(
        fetchFinesUrl,
        { licenseNumber: decodedToken.LicenseNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedFines = response.data;
        console.log(fetchedFines);
        setFetchedFines(fetchedFines);
      } else {
        setMessage("Failed to fetch fines!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch fines: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch fines:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchStatistics = async () => {
    try {
      const fetchStatisticsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-public-user-statistics`;
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      const offenderEmail = decodedToken.Email;

      const response = await axios.post(
        fetchStatisticsUrl,
        { offenderEmail: offenderEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const fetchedStatistics = response.data;
        console.log(fetchedStatistics);
        setStatistics(fetchedStatistics);
      } else {
        setMessage("Failed to fetch statistics!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch statistics: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch statistics:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStatistics();
    handleLicenseSearch();
    fetchFines();
  }, []);

  const handleLicenseSearch = async () => {
    try {
      const searchLicenseHolderUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-license-holder-details`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const response = await axios.post(
        searchLicenseHolderUrl,
        { licenseNumber: decodedToken.LicenseNumber },
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
        setPermittedVehicles(fetchedUser.permittedVehicles);
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

      <div className="container py-2">
        <div className="row g-4">
          {/* Row 1 */}

          {/* Row 2 */}

          {/* Row 3 */}
          <div className="col-md-3">
            <div
              className="card shadow-sm h-100"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <h6 className="card-title text-muted">Total Fine Paid</h6>
                <h2 className="card-text text-soft-purple fw-bold">
                  {statistics.totalRevenueGenarated} LKR
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div
              className="card shadow-sm h-100"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body d-flex flex-column">
                <h6 className="card-title text-center text-muted">
                  Total Fines Recorded
                </h6>
                <h2 className="card-text text-center text-soft-teal fw-bold">
                  {statistics.totalFinesIssued}
                </h2>

                <div className="row mt-4 g-3 mt-auto">
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Paid Fines</h6>
                        <h5 className="text-success fw-bold">
                          {statistics.paidFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Pending Fines</h6>
                        <h5 className="text-warning fw-bold">
                          {statistics.pendingFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Disputed Fines</h6>
                        <h5 className="text-danger fw-bold">
                          {statistics.disputedFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12 text-center d-flex justify-content-center ">
            <div className=" " style={{ maxWidth: "600px", width: "100%" }}>
              <div className="license-card shadow-lg p-3 rounded  card">
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
                <div className="license-body text-start text-dark px-3 py-2">
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
                        {fetchedFines == null ? (
                          <div className="col-md-3 tax-paid-status">
                            <span
                              className="status-text"
                              style={{
                                color: "#28a745",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Fine paid
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
