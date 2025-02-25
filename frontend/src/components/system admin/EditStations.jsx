import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";

const EditStations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stations, setStations] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    setCurrentStation(station);
    console.log(station);
    setShowEditModal(true);
  };

  const handleDeleteClick = (station) => {
    setCurrentStation(station);
    console.log(station);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteStation(currentStation);
  };

  const handleDeleteStation = async (station) => {
    try {
      const deleteStationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/delete-station`;

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      const stationCodeToDelete = station.StationCode;
      const response = await axios.delete(deleteStationUrl, {
        data: { stationCode: stationCodeToDelete },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchStations();
        setMessage(`Station Deleted successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to delete station");
      }
    } catch (error) {
      setMessage(error.response ? error.response.data : error.message);
      setMessageType("error");
      console.error(
        "Deletion failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSave = async (updatedStation) => {
    try {
      await handleUpdateStation(updatedStation);
      setShowEditModal(false); // Close the modal after saving
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpdateStation = async (updatedStation) => {
    try {
      const updateStationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/update-station`;

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");

      const response = await axios.put(updateStationUrl, updatedStation, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchStations();
        setMessage(`Station Updated successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to update station");
      }
    } catch (error) {
      setMessage(error.response ? error.response.data : error.message);
      setMessageType("error");
      console.error(
        "Update failed:",
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
            filteredStations.map((station) => {
              const adminUser = station.Users.$values.find(
                (user) => user.UserId === station.StationAdminId
              );

              return (
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
                            <a href={`mailto:${station.Email}`} className="">
                              {station.Email}
                            </a>
                          </span>
                          <br />
                          {station.Address}
                        </p>
                      </div>
                      {/* Admin Details */}
                      {adminUser ? (
                        <div className="text-start" key={adminUser.UserId}>
                          <h6>Admin</h6>
                          <p className="fs-7">
                            {adminUser.FirstName} (Badge no:{" "}
                            {adminUser.BadgeNumber})
                            <br />
                            {adminUser.ContactNumber} |{" "}
                            <span>
                              <a
                                href={`mailto:${adminUser.Email}`}
                                className=""
                              >
                                {adminUser.Email}
                              </a>
                            </span>
                            <br />
                          </p>
                        </div>
                      ) : (
                        <p>No admin assigned</p>
                      )}
                      {/* Button Section */}
                      <div className="d-flex">
                        <button
                          className="btn btn-warning btn-sm d-flex align-items-center justify-content-center w-50"
                          onClick={() => handleEditClick(station)}
                        >
                          <FaEdit className="me-2" /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-50 ms-2"
                          onClick={() => handleDeleteClick(station)}
                        >
                          <FaTrash className="me-2" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No stations found</p>
          )}
        </div>
      </div>
      {/* Modal for editing */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        station={currentStation}
        onSave={handleSave}
        aria-hidden={showEditModal ? "false" : "true"}
      />
      <ConfirmationModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
        message={"Are you sure, Do you want to delete this station?"}
      />
    </>
  );
};

export default EditStations;
