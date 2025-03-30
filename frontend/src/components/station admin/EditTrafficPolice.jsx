// EditTrafficPolice.jsx

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import ConfirmationModal from "../common/ConfirmationModal";
import EditTrafficPoliceModal from "./EditTrafficPoliceModal";

const EditTrafficPolice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trafficPolices, setTrafficPolices] = useState([]);
  const [filteredTrafficPolices, setFilteredTrafficPolices] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTrafficPolice, setCurrentTrafficPolice] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const fetchTrafficPolice = async () => {
    try {
      const fetchTrafficPoliceUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-traffic-police`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchTrafficPoliceUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const fetchedTrafficPolices = response.data;
        setTrafficPolices(fetchedTrafficPolices);
        setFilteredTrafficPolices(fetchedTrafficPolices);
      } else {
        setMessage("Failed to fetch traffic police officers");
        setMessageType("error");
      }
    } catch (error) {
      const msg = error.response ? error.response.data : error.message;
      setMessage("Failed to fetch traffic police officers: " + msg);
      setMessageType("error");
      console.error("Fetch failed:", msg);
    }
  };

  useEffect(() => {
    fetchTrafficPolice();
  }, []);

  useEffect(() => {
    if (trafficPolices && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const isNumericSearch = !isNaN(searchTerm);

      const filtered = trafficPolices.filter(
        (tp) =>
          tp.firstName.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.lastName.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.contactNumber.includes(lowercasedSearchTerm) ||
          (isNumericSearch &&
            tp.badgeNumber?.toString().includes(searchTerm)) ||
          tp.licenseNumber?.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.nicNumber?.toLowerCase().includes(lowercasedSearchTerm)
      );

      setFilteredTrafficPolices(filtered);
    } else {
      setFilteredTrafficPolices(trafficPolices);
    }
  }, [searchTerm, trafficPolices]);

  const handleEditClick = (trafficPolice) => {
    setCurrentTrafficPolice(trafficPolice);
    setShowEditModal(true);
  };

  const handleDeleteClick = (trafficPolice) => {
    setCurrentTrafficPolice(trafficPolice);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteTrafficPolice(currentTrafficPolice);
  };

  const handleDeleteTrafficPolice = async (trafficPolice) => {
    try {
      const deleteUrl = `${import.meta.env.VITE_API_BASE_URL}/delete-user`;
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(deleteUrl, {
        data: { userId: trafficPolice.userId },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchTrafficPolice();
        setMessage("Traffic police deleted successfully!");
        setMessageType("success");
      } else {
        throw new Error("Failed to delete the traffic police!");
      }
    } catch (error) {
      const msg = error.response ? error.response.data : error.message;
      setMessage(msg);
      setMessageType("error");
      console.error("Deletion failed:", msg);
    }
  };

  const handleSave = async (updatedTrafficPolice) => {
    try {
      await handleUpdateTrafficPolice(updatedTrafficPolice);
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpdateTrafficPolice = async (updatedTrafficPolice) => {
    try {
      const updateUrl = `${import.meta.env.VITE_API_BASE_URL}/update-user`;
      const token = localStorage.getItem("authToken");

      const response = await axios.put(updateUrl, updatedTrafficPolice, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchTrafficPolice();
        setMessage("Traffic police updated successfully!");
        setMessageType("success");
      } else {
        throw new Error("Failed to update traffic police!");
      }
    } catch (error) {
      const msg = error.response ? error.response.data : error.message;
      setMessage(msg);
      setMessageType("error");
      console.error("Update failed:", msg);
    }
  };

  return (
    <>
      {message && (
        <div
          className={`alert ${messageClass} alert-dismissible fade show mt-4`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {messageType === "success" ? (
              <FaCheckCircle className="me-2" />
            ) : (
              <FaTimesCircle className="me-2" />
            )}
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setMessage(null);
              setMessageType(null);
            }}
          ></button>
        </div>
      )}

      <div className="container my-5">
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search Traffic police officers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredTrafficPolices.length > 0 ? (
            filteredTrafficPolices.map((tp) => (
              <div className="col" key={tp.userId}>
                <div className="card shadow-lg rounded-3 border-light p-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                      <h5 className="card-title fs-6 text-muted mb-0 me-2">
                        {tp.firstName} {tp.lastName}
                      </h5>
                      <p
                        className="px-2 py-1 rounded mb-0 text-success"
                        style={{ fontSize: "12px", backgroundColor: "#d4f8d4" }}
                      >
                        {tp.badgeNumber}
                      </p>
                    </div>

                    <h6
                      className="card-subtitle mb-3 text-muted text-start"
                      style={{ color: "#555", fontSize: "12px" }}
                    >
                      {tp.registeredStationName}
                      {", "}
                      {tp.registeredStationDistrict}
                    </h6>

                    <div className="text-start">
                      <h6>Contact</h6>
                      <p style={{ fontSize: "13px" }}>
                        {tp.contactNumber} |{" "}
                        <a href={`mailto:${tp.email}`}>{tp.email}</a>
                      </p>
                    </div>

                    <div className="text-start">
                      <h6>Personal Details</h6>
                      <p style={{ fontSize: "13px" }}>
                        NIC No: {tp.nicNumber} <br />
                        License No: {tp.licenseNumber} <br />
                        Date Of Birth:{" "}
                        {tp.dateOfBirth
                          ? new Date(tp.dateOfBirth).toLocaleDateString()
                          : "N/A"}{" "}
                        <br />
                        Address: {tp.address} <br />
                        Gender: {tp.gender}
                      </p>
                    </div>

                    <div className="d-flex">
                      <button
                        className="btn btn-warning btn-sm w-50"
                        onClick={() => handleEditClick(tp)}
                      >
                        <FaEdit className="me-2" /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm w-50 ms-2"
                        onClick={() => handleDeleteClick(tp)}
                      >
                        <FaTrash className="me-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No traffic police officers found</p>
          )}
        </div>
      </div>

      <EditTrafficPoliceModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        trafficPolice={currentTrafficPolice}
        onSave={handleSave}
      />

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${currentTrafficPolice?.FirstName} ${currentTrafficPolice?.LastName}?`}
      />
    </>
  );
};

export default EditTrafficPolice;
