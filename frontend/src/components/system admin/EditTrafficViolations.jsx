import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";
import EditTrafficViolationModal from "./EditTrafficViolationModal";

const EditTrafficViolations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trafficViolations, setTrafficViolations] = useState(null);
  const [filteredTrafficViolations, setFilteredTrafficViolations] = useState(
    []
  );
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTrafficViolation, setCurrentTrafficViolation] = useState(null);

  const fetchTrafficViolations = async () => {
    try {
      const fetchTrafficViolationsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-traffic-violations`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchTrafficViolationsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedTrafficViolations = response.data;
        setTrafficViolations(fetchedTrafficViolations);
        setFilteredTrafficViolations(fetchedTrafficViolations.$values);
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

  useEffect(() => {
    fetchTrafficViolations();
  }, []);

  // Filter stations based on search term
  useEffect(() => {
    if (trafficViolations && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = trafficViolations.$values.filter(
        (trafficViolation) =>
          trafficViolation.Provision.toLowerCase().includes(
            lowercasedSearchTerm
          ) ||
          trafficViolation.SectionOfAct.toLowerCase().includes(
            lowercasedSearchTerm
          )
      );
      setFilteredTrafficViolations(filtered);
    } else {
      setFilteredTrafficViolations(
        trafficViolations ? trafficViolations.$values : []
      );
    }
  }, [searchTerm, trafficViolations]);

  const handleEditClick = (trafficViolation) => {
    setCurrentTrafficViolation(trafficViolation);
    setShowEditModal(true);
  };

  const handleDeleteClick = (trafficViolation) => {
    setCurrentTrafficViolation(trafficViolation);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteTrafficViolation(currentTrafficViolation);
  };

  const handleDeleteTrafficViolation = async (trafficViolation) => {
    try {
      const deleteTrafficViolationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/delete-traffic-violation`;

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      const trafficViolationIdToDelete = trafficViolation.ViolationId;
      const response = await axios.delete(deleteTrafficViolationUrl, {
        data: { violationId: trafficViolationIdToDelete },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchTrafficViolations();
        setMessage(`Traffic Violation Deleted successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to delete traffic violation!");
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

  const handleSave = async (updatedTrafficViolation) => {
    try {
      await handleUpdateTrafficViolation(updatedTrafficViolation);
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpdateTrafficViolation = async (updatedTrafficViolation) => {
    try {
      const updateTrafficViolationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/update-traffic-violation`;

      console.log(updatedTrafficViolation);

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        updateTrafficViolationUrl,
        updatedTrafficViolation,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        fetchTrafficViolations();
        setMessage(`Traffic Violation Updated successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to update traffic violation!");
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
            placeholder="Search Traffcic Violations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-3">
          {filteredTrafficViolations.length > 0 ? (
            filteredTrafficViolations.map((trafficViolation) => {
              return (
                <div
                  className="card shadow-lg rounded-3 p-1"
                  style={{ borderLeft: "5px solid #55798f" }}
                  key={trafficViolation.ViolationId}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center w-100 ">
                      <div className="">
                        <h5 className="card-title fs-6 text-muted text-start mb-0 ">
                          {trafficViolation.Provision}
                        </h5>
                        <p
                          className="text-start"
                          style={{ color: "#555", fontSize: "14px" }}
                        >
                          {"Section Of Act: " + trafficViolation.SectionOfAct}
                        </p>
                      </div>

                      {/* Button Section */}
                      <div className="d-flex">
                        <button
                          className="btn btn-warning btn-sm d-flex align-items-center justify-content-center w-50"
                          onClick={() => handleEditClick(trafficViolation)}
                        >
                          <FaEdit className="me-2" /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-50 ms-2"
                          onClick={() => handleDeleteClick(trafficViolation)}
                        >
                          <FaTrash className="me-2" /> Delete
                        </button>
                      </div>
                    </div>

                    <h6
                      className="card-subtitle mb-3 text-muted text-start"
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      Fine Amount: {trafficViolation.FineAmount} LKR
                    </h6>

                    <div
                      className="text-start "
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      <p className="mb-1">
                        Allocated Points: {trafficViolation.Points}
                      </p>
                      <p className="mb-0">
                        Due Days: {trafficViolation.DueDays}
                      </p>
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
      <EditTrafficViolationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        trafficViolation={currentTrafficViolation}
        onSave={handleSave}
        aria-hidden={showEditModal ? "false" : "true"}
      />
      <ConfirmationModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
        message={"Are you sure, Do you want to delete this traffic violation?"}
      />
    </>
  );
};

export default EditTrafficViolations;
