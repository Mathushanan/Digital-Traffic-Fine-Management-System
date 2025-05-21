import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaChevronDown } from "react-icons/fa"; // Import React Icons
import { MdVerifiedUser } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import { FaPlus } from "react-icons/fa";

const AddFine = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [fetchedUser, setFetchedUser] = useState(null);
  const [fetchedVehicle, setFetchedVehicle] = useState(null);
  const [fetchedCourts, setFetchedCourts] = useState(null);

  const [courtId, setCourtId] = useState("");
  const [stationId, setStationId] = useState("");
  const [issuerEmail, setIssuerEmail] = useState("");
  const [violationDate, setViolationDate] = useState(new Date());
  const [status, setStatus] = useState("pending");

  const [isFinePaid, setIsFinePaid] = useState(true);

  const [newFine, setNewFine] = useState("");
  const [fetchedTrafficViolations, setFetchedTrafficViolations] = useState([]);
  const [applicableFines, setApplicableFines] = useState([]);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showLicenseHolderDetails, setShowLicenseHolderDetails] =
    useState(false);
  const [showVehicleRegistrationDetails, setShowVehicleRegistrationDetails] =
    useState(false);

  // Define state variables for latitude and longitude
  const [latitude, setLatitude] = useState("0.0");
  const [longitude, setLongitude] = useState("0.0");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              alert("Please allow location access to use this feature.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              alert(
                "We couldn't determine your location. Please check your device/location settings."
              );
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              alert("Getting location timed out. Please try again.");
              break;
            default:
              console.error("An unknown error occurred.");
              alert(
                "An unknown error occurred while trying to get your location."
              );
          }
        },
        {
          enableHighAccuracy: true, // Try to use GPS if available
          timeout: 10000, // 10 seconds
          maximumAge: 0, // Do not use cached location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      alert("Your browser doesn't support geolocation.");
    }
  }, []);

  const calculateTotalFine = () => {
    return applicableFines.reduce((sum, fine) => sum + fine.fineAmount, 0);
  };

  const calculateTotalPoints = () => {
    return applicableFines.reduce((sum, fine) => sum + fine.points, 0);
  };

  const assignApplicableFines = (fetchedTrafficViolations) => {
    if (!fetchedTrafficViolations || fetchedTrafficViolations.length === 0)
      return;

    const applicableFines = [];
    const now = new Date();

    if (new Date(fetchedUser.licenseExpiryDate) < now) {
      const fine = fetchedTrafficViolations.find(
        (violation) => violation.sectionOfAct === "130B"
      );
      if (fine) applicableFines.push(fine);
    }

    if (!fetchedVehicle.isInsuranced == true) {
      const fine = fetchedTrafficViolations.find(
        (violation) => violation.sectionOfAct === "199B"
      );
      if (fine) applicableFines.push(fine);
    }

    if (!fetchedVehicle.isRoadTaxPaid == true) {
      const fine = fetchedTrafficViolations.find(
        (violation) => violation.sectionOfAct === "198A"
      );
      if (fine) applicableFines.push(fine);
    }

    if (
      !fetchedUser.permittedVehicles.includes(fetchedVehicle.vehicleCategory)
    ) {
      const fine = fetchedTrafficViolations.find(
        (violation) => violation.sectionOfAct === "130"
      );
      if (fine) applicableFines.push(fine);
    }

    setApplicableFines(applicableFines);
  };

  const fetchTrafficViolations = async () => {
    try {
      const fetchTrafficViolationsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-traffic-violations`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchTrafficViolationsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedTrafficViolations = response.data;
        setFetchedTrafficViolations(fetchedTrafficViolations);
      } else {
        setMessage("Failed to fetch traffic violations!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch traffic violations: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch traffic violations:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchCourts = async () => {
    try {
      const fetchCourtsUrl = `${import.meta.env.VITE_API_BASE_URL}/get-courts`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchCourtsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedCourts = response.data;

        setFetchedCourts(fetchedCourts);
      } else {
        setMessage("Failed to fetch courts!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch courts: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch courts:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setStationId(jwtDecode(token).RegisteredStationId);
    setIssuerEmail(jwtDecode(token).Email);
  }, [stationId]);

  useEffect(() => {
    fetchTrafficViolations();
    fetchCourts();
  }, []);

  const handleLicenseSearch = async (e) => {
    e.preventDefault();
    try {
      const searchLicenseHolderUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-license-holder-details`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchLicenseHolderUrl,
        { licenseNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedUser = response.data;
        setFetchedUser(fetchedUser);

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
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        searchVehicleRegistrationUrl,
        { vehicleNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedVehicle = response.data;
        setFetchedVehicle(fetchedVehicle);

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

  const handleSearchBoth = async (e) => {
    e.preventDefault();

    try {
      // Wait for both the license and vehicle searches to finish
      await Promise.all([handleLicenseSearch(e), handleVehicleSearch(e)]);
    } catch (error) {
      console.error("Error fetching user and vehicle details:", error);
    }
  };

  useEffect(() => {
    if (fetchedUser && fetchedVehicle && fetchedTrafficViolations.length > 0) {
      assignApplicableFines(fetchedTrafficViolations);
    }
  }, [fetchedUser, fetchedVehicle, fetchedTrafficViolations]);

  const handleAddFine = (fineId) => {
    const fine = fetchedTrafficViolations.find(
      (violation) => String(violation.violationId) === String(fineId)
    );

    if (
      fine &&
      !applicableFines.some((f) => f.violationId === fine.violationId)
    ) {
      setApplicableFines((prevFines) => [...prevFines, fine]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      issuerEmail: issuerEmail,
      licenseNumber: licenseNumber,
      vehicleNumber: vehicleNumber,
      stationId: stationId,
      courtId: courtId,
      violationDate: violationDate,
      longitude: longitude,
      latitude: latitude,
      status: status,
      assignedFines: applicableFines,
    };

    try {
      const registerTrafficViolationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/add-fine`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(registerTrafficViolationUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status == 200) {
        setMessage(`New traffic violation registered successfully!`);
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
          <h3 className="text-start mb-4">Add New Fine</h3>
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
              <>
                <div className="d-flex flex-column gap-3 ">
                  <h3 className="text-start mb-2">Applicable Fines</h3>
                  {applicableFines.length > 0 ? (
                    applicableFines.map((applicableFine) => {
                      return (
                        <div
                          className="card shadow-lg rounded-3 p-1"
                          style={{ borderLeft: "5px solid #55798f" }}
                          key={applicableFine.violationId}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center w-100 ">
                              <div className="col-md-9">
                                <h5 className="card-title fs-6 text-muted text-start mb-0 ">
                                  {applicableFine.provision}
                                </h5>
                                <p
                                  className="text-start"
                                  style={{ color: "#555", fontSize: "14px" }}
                                >
                                  {"Section Of Act: " +
                                    applicableFine.sectionOfAct}
                                </p>
                              </div>
                              <div className="col-md-3">
                                <div
                                  className="text-start "
                                  style={{ fontSize: "14px" }}
                                >
                                  <p
                                    className="mb-1 text-success"
                                    style={{
                                      backgroundColor: "#eafbe7",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      display: "flex",
                                      borderRadius: "4px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {applicableFine.points} Points
                                  </p>
                                  <p className="mb-0">
                                    Due Days: {applicableFine.dueDays}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <h6
                              className="card-subtitle text-muted text-start"
                              style={{ color: "#555", fontSize: "14px" }}
                            >
                              Fine Amount:{" "}
                              <span className="text-danger">
                                {applicableFine.fineAmount} LKR
                              </span>
                            </h6>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No applicable fines found</p>
                  )}
                </div>

                <div className="  justify-content-center align-items-center mt-2  ">
                  <div className="">
                    <div className="mt-3 text-start w-100">
                      <label
                        htmlFor="newFine"
                        className="text-start form-label fw-bold"
                      >
                        Add more fines:
                      </label>
                      <select
                        id="newFine"
                        className="form-select w-100"
                        value={newFine}
                        style={{ maxWidth: "100%" }}
                        onChange={(e) => {
                          setNewFine(e.target.value);
                          handleAddFine(e.target.value);
                        }}
                      >
                        <option value="">Select a fine to add</option>
                        {fetchedTrafficViolations
                          .filter(
                            (trafficViolation) =>
                              !applicableFines.some(
                                (f) =>
                                  f.violationId === trafficViolation.violationId
                              )
                          )
                          .map((trafficViolation) => (
                            <option
                              key={trafficViolation.violationId}
                              value={trafficViolation.violationId}
                            >
                              {trafficViolation.provision} -{" "}
                              {trafficViolation.fineAmount} LKR
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="mt-3 text-start  p-4 rounded shadow-lg d-flex flex-column justify-content-center align-items-start ">
                      <div className="d-flex justify-content-between w-100">
                        <h6 className="mb-1" style={{ fontWeight: "bold" }}>
                          Total Fine Amount:
                          <span className="text-danger fw-semibold ms-2">
                            {calculateTotalFine()} LKR
                          </span>
                        </h6>
                      </div>
                      <div className="d-flex justify-content-between w-100">
                        <h6 className="mb-0" style={{ fontWeight: "bold" }}>
                          Total Points Deducted:
                          <span className="text-warning fw-semibold ms-2">
                            {calculateTotalPoints()} Points
                          </span>
                        </h6>
                      </div>
                    </div>

                    <div className="form-group mb-3 mt-3 text-start position-relative">
                      <select
                        className="form-control fs-6 h-80"
                        id="courtId"
                        value={courtId} // Bind to the correct state
                        onChange={(e) => setCourtId(e.target.value)} // Update state on change
                        required
                        style={{ appearance: "none", color: "#555" }}
                      >
                        <option value="" disabled>
                          Select a Court
                        </option>
                        {fetchedCourts && fetchedCourts.length > 0 ? (
                          fetchedCourts.map((court) => (
                            <option key={court.courtId} value={court.courtId}>
                              {court.courtName}, {court.location}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No courts available
                          </option>
                        )}
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
                        onClick={handleSubmit}
                      >
                        <FaPlus
                          style={{ marginRight: "8px", fontSize: "20px" }}
                        />{" "}
                        Add Fine
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default AddFine;
