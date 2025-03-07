import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";

const EditStationAdmins = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stationAdmins, setStationAdmins] = useState(null);
  const [filteredStationAdmins, setFilteredStationAdmins] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);

  const fetchStationAdmins = async () => {
    try {
      const fetchStationsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-station-admins`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchStationsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedStationAdmins = response.data;
        setStationAdmins(fetchedStationAdmins);
        console.log(fetchedStationAdmins);
        setFilteredStationAdmins(fetchedStationAdmins.$values); // Initialize filtered stations
      } else {
        setMessage("Failed to fetch station admins");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch station admins: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch station admins:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStationAdmins();
  }, []);

  // Filter stations based on search term
  useEffect(() => {
    if (stationAdmins && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const isNumericSearch = !isNaN(searchTerm); // Check if searchTerm is a number

      const filtered = stationAdmins.$values.filter(
        (stationAdmin) =>
          stationAdmin.FirstName.toLowerCase().includes(lowercasedSearchTerm) ||
          stationAdmin.LastName.toLowerCase().includes(lowercasedSearchTerm) ||
          stationAdmin.ContactNumber.includes(lowercasedSearchTerm) ||
          (isNumericSearch &&
            stationAdmin.BadgeNumber.toString().includes(searchTerm)) ||
          stationAdmin.LicenseNumber.toLowerCase().includes(
            lowercasedSearchTerm
          ) ||
          stationAdmin.NicNumber.toLowerCase().includes(lowercasedSearchTerm)
      );

      setFilteredStationAdmins(filtered);
    } else {
      setFilteredStationAdmins(stationAdmins ? stationAdmins.$values : []);
    }
  }, [searchTerm, stationAdmins]);

  const handleEditClick = (stationAdmin) => {
    setCurrentStation(stationAdmin);
    console.log(stationAdmin);
    setShowEditModal(true);
  };

  const handleDeleteClick = (stationAdmin) => {
    setCurrentStation(stationAdmin);
    console.log(stationAdmin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteStation(currentStationAdmin);
  };

  const handleDeleteStation = async (stationAdmin) => {
    try {
      const deleteStationAdminUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/delete-station-admin`;

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
            placeholder="Search Station Admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredStationAdmins.length > 0 ? (
            filteredStationAdmins.map((stationAdmin) => {
              return (
                <div className="col" key={stationAdmin.UserId}>
                  <div className="card shadow-lg rounded-3 border-light p-2">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                        <h5 className="card-title fs-6 text-muted mb-0 me-2">
                          {stationAdmin.FirstName} {stationAdmin.LastName}
                        </h5>
                        <p
                          className="px-2 py-1 rounded mb-0 text-success"
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#d4f8d4",
                          }}
                        >
                          {stationAdmin.BadgeNumber}
                        </p>
                      </div>
                      <h6
                        className="card-subtitle mb-3 text-muted text-start"
                        style={{ color: "#555", fontSize: "12px" }}
                      >
                        {stationAdmin.RegisteredStation.StationName}
                        {", "}
                        {stationAdmin.RegisteredStation.District}
                      </h6>
                      <div className="text-start">
                        <h6>Contact</h6>
                        <p className="fs-6">
                          {stationAdmin.ContactNumber}
                          {" | "}
                          <span>
                            <a
                              href={`mailto:${stationAdmin.Email}`}
                              className=""
                            >
                              {stationAdmin.Email}
                            </a>
                          </span>
                        </p>
                      </div>
                      <div className="text-start">
                        <h6>Personal Details</h6>
                        <p className="fs-6">
                          NIC No: {stationAdmin.NicNumber}
                          <br />
                          License No: {stationAdmin.LicenseNumber}
                          <br />
                          Date Of Birth:{" "}
                          {
                            new Date(stationAdmin.DateOfBirth)
                              .toISOString()
                              .split("T")[0]
                          }
                          <br />
                          Gender: {stationAdmin.Gender}
                        </p>
                      </div>

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
        message={"Are you sure, Do you want to delete this station admin?"}
      />
    </>
  );
};

export default EditStationAdmins;
