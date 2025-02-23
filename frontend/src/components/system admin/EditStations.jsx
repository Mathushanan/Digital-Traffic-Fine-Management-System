import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";

const EditStations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stations, setStations] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showModal, setShowModal] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);

  const fetchStations = async () => {
    try {
      const fetchStationsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-stations`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchStationsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedStations = response.data;
        setStations(fetchedStations);
        setFilteredStations(fetchedStations.$values); // Initialize filtered stations
        setMessage("Stations fetched successfully!");
        setMessageType("success");
      } else {
        setMessage("Failed to fetch stations");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch stations: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch stations:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Filter stations based on search term
  useEffect(() => {
    if (stations && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = stations.$values.filter((station) =>
        station.StationName.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations ? stations.$values : []);
    }
  }, [searchTerm, stations]);

  const handleEditClick = (station) => {
    setCurrentStation(station); // Set current station details to be passed to the modal
    console.log(station);
    setShowModal(true); // Show the modal
  };

  const handleSave = (updatedStation) => {
    // Logic to update station data, possibly making an API call to save the data
    handleSubmit();
    setShowModal(false); // Close the modal after saving
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registerStationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/update-station`;

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
        setMessage(`${stationName} updated successfully!`);
        setMessageType("success");
      }
    } catch (error) {
      setMessage(`${error.response ? error.response.data : error.message}`);
      setMessageType("error");
      console.error(
        "update failed:",
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

      <div className="container my-5">
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search Stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <div className="col" key={station.StationId}>
                <div className="card shadow-lg rounded-3 border-light p-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                      <h5 className="card-title fs-6 text-muted mb-0 me-2">
                        {station.StationName}
                      </h5>
                      <p
                        className="px-2 py-1 rounded mb-0 text-success"
                        style={{
                          fontSize: "12px",
                          backgroundColor: "#d4f8d4",
                        }}
                      >
                        {station.StationCode}
                      </p>
                    </div>

                    <h6
                      className="card-subtitle mb-3 text-muted text-start"
                      style={{ color: "#555", fontSize: "12px" }}
                    >
                      {station.District}
                    </h6>
                    <div className="text-start">
                      <h6>Contact</h6>
                      <p className="fs-6">
                        {station.ContactNumber} |{" "}
                        <span>
                          <a href={`mailto:${station.email}`} className="">
                            {station.Email}
                          </a>
                        </span>
                        <br />
                        {station.Address}
                      </p>
                    </div>

                    {/* Admin Details */}
                    {station.Users.$values.length === 0 ? (
                      <p>No users</p>
                    ) : (
                      station.Users.$values.map((user) => (
                        <div className="text-start" key={user.BadgeNumber}>
                          <h6>Admin</h6>
                          <p className="fs-7">
                            {user.FirstName} (Badge no: {user.BadgeNumber})
                            <br />
                            {user.ContactNumber} |{" "}
                            <span>
                              <a href={`mailto:${user.Email}`} className="">
                                {user.Email}
                              </a>
                            </span>{" "}
                            <br />
                          </p>
                        </div>
                      ))
                    )}

                    {/* Button Section */}
                    <div className="d-flex">
                      <button
                        className="btn btn-warning btn-sm d-flex align-items-center justify-content-center w-50"
                        onClick={() => handleEditClick(station)} // Open modal on click
                      >
                        <FaEdit className="me-2" /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-50 ms-2">
                        <FaTrash className="me-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No stations found</p>
          )}
        </div>
      </div>
      {/* Modal for editing */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        station={currentStation}
        onSave={handleSave}
      />
    </>
  );
};

export default EditStations;
