// EditTrafficPolice.jsx

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import ConfirmationModal from "../common/ConfirmationModal";
import EditTrafficPoliceModal from "./EditTrafficPoliceModal";
import EditPublicModal from "./EditPublicModal";

const EditPublic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [publicUsers, setPublicUsers] = useState([]);
  const [filteredPublicUsers, setFilteredPublicUsers] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPublicUser, setCurrentPublicUser] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const fetchPublicUsers = async () => {
    try {
      const fetchPublicUsersUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-public-users`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchPublicUsersUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const fetchedPublicUsers = response.data;
        console.log(fetchedPublicUsers);
        setPublicUsers(fetchedPublicUsers);
        setFilteredPublicUsers(fetchedPublicUsers);
      } else {
        setMessage("Failed to fetch public users");
        setMessageType("error");
      }
    } catch (error) {
      const msg = error.response ? error.response.data : error.message;
      setMessage("Failed to fetch public users: " + msg);
      setMessageType("error");
      console.error("Fetch failed:", msg);
    }
  };

  useEffect(() => {
    fetchPublicUsers();
  }, []);

  useEffect(() => {
    if (publicUsers && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const isNumericSearch = !isNaN(searchTerm);

      const filtered = publicUsers.filter(
        (tp) =>
          tp.firstName.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.lastName.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.contactNumber.includes(lowercasedSearchTerm) ||
          tp.licenseNumber?.toLowerCase().includes(lowercasedSearchTerm) ||
          tp.nicNumber?.toLowerCase().includes(lowercasedSearchTerm)
      );

      setFilteredPublicUsers(filtered);
    } else {
      setFilteredPublicUsers(publicUsers);
    }
  }, [searchTerm, publicUsers]);

  const handleEditClick = (publicUser) => {
    setCurrentPublicUser(publicUser);
    setShowEditModal(true);
  };

  const handleDeleteClick = (publicUser) => {
    setCurrentPublicUser(publicUser);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeletePublicUser(currentPublicUser);
  };

  const handleDeletePublicUser = async (publicUser) => {
    try {
      const deleteUrl = `${import.meta.env.VITE_API_BASE_URL}/delete-user`;
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(deleteUrl, {
        data: { userId: publicUser.userId },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchPublicUsers();
        setMessage("Public user deleted successfully!");
        setMessageType("success");
      } else {
        throw new Error("Failed to delete the public user!");
      }
    } catch (error) {
      const msg = error.response ? error.response.data : error.message;
      setMessage(msg);
      setMessageType("error");
      console.error("Deletion failed:", msg);
    }
  };

  const handleSave = async (updatedPublicUser) => {
    try {
      await handleUpdatePublicUser(updatedPublicUser);
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpdatePublicUser = async (updatedPublicUser) => {
    try {
      const updateUrl = `${import.meta.env.VITE_API_BASE_URL}/update-user`;
      const token = localStorage.getItem("authToken");

      const response = await axios.put(updateUrl, updatedPublicUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchPublicUsers();
        setMessage("Public user updated successfully!");
        setMessageType("success");
      } else {
        throw new Error("Failed to update public user!");
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
            placeholder="Search Public Users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredPublicUsers.length > 0 ? (
            filteredPublicUsers.map((pu) => (
              <div className="col" key={pu.userId}>
                <div className="card shadow-lg rounded-3 border-light p-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                      <h5 className="card-title fs-6 text-muted mb-0 me-2">
                        {pu.firstName} {pu.lastName}
                      </h5>
                      <p
                        className="px-2 py-1 rounded mb-0 text-success"
                        style={{ fontSize: "12px", backgroundColor: "#d4f8d4" }}
                      >
                        {"Available Points: " + pu.availablePoints}
                      </p>
                    </div>

                    <h6
                      className="card-subtitle mb-3 text-muted text-start"
                      style={{ color: "#555", fontSize: "12px" }}
                    >
                      {pu.registeredStationName}
                      {", "}
                      {pu.registeredStationDistrict}
                    </h6>

                    <div className="text-start">
                      <h6>Contact</h6>
                      <p style={{ fontSize: "13px" }}>
                        {pu.contactNumber} |{" "}
                        <a href={`mailto:${pu.email}`}>{pu.email}</a>
                      </p>
                    </div>

                    <div className="text-start">
                      <h6>Personal Details</h6>
                      <p style={{ fontSize: "13px" }}>
                        NIC No: {pu.nicNumber} <br />
                        License No: {pu.licenseNumber} <br />
                        Date Of Birth:{" "}
                        {pu.dateOfBirth
                          ? new Date(pu.dateOfBirth).toLocaleDateString()
                          : "N/A"}{" "}
                        <br />
                        Address: {pu.address} <br />
                        Gender: {pu.gender}
                      </p>
                    </div>

                    <div className="d-flex">
                      <button
                        className="btn btn-warning btn-sm w-50"
                        onClick={() => handleEditClick(pu)}
                      >
                        <FaEdit className="me-2" /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm w-50 ms-2"
                        onClick={() => handleDeleteClick(pu)}
                      >
                        <FaTrash className="me-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No public users found</p>
          )}
        </div>
      </div>

      <EditPublicModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        publicUser={currentPublicUser}
        onSave={handleSave}
      />

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${currentPublicUser?.FirstName} ${currentPublicUser?.LastName}?`}
      />
    </>
  );
};

export default EditPublic;
