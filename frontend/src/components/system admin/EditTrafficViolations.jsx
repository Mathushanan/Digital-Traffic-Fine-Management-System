import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";
import EditTrafficViolationModal from "./EditTrafficViolationModal";
import { jsPDF } from "jspdf";
import dmt_logo from "../../assets/logo-header.png"; // Replace this with your logo path
import { IoMdPrint } from "react-icons/io";

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
      }/get-traffic-violations`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchTrafficViolationsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedTrafficViolations = response.data;
        setTrafficViolations(fetchedTrafficViolations);
        console.log(fetchedTrafficViolations);
        setFilteredTrafficViolations(fetchedTrafficViolations);
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
      const filtered = trafficViolations.filter(
        (trafficViolation) =>
          trafficViolation.provision
            .toLowerCase()
            .includes(lowercasedSearchTerm) ||
          trafficViolation.sectionOfAct
            .toLowerCase()
            .includes(lowercasedSearchTerm)
      );
      setFilteredTrafficViolations(filtered);
    } else {
      setFilteredTrafficViolations(trafficViolations ? trafficViolations : []);
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

  const generateViolationsPDF = (violations) => {
    const doc = new jsPDF();

    const drawPageBorder = () => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(15, 8, 180, 280);
    };

    const drawHeader = () => {
      // Add logo
      doc.addImage(dmt_logo, "PNG", 20, 10, 170, 30);

      // Title
      doc.setFontSize(20);
      const title = "List of Registered Violations";
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.width;
      const xPosition = (pageWidth - titleWidth) / 2;
      doc.setTextColor(0, 0, 0);
      doc.text(title, xPosition, 50);

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, 60, 190, 60);
    };

    const drawFooter = () => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Generated by Department of Motor Traffic System", 20, 280);
    };

    const drawViolation = (violation, index, yPosition) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 80);
      doc.text(`Violation ${index + 1}`, 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Violation ID: ${violation.violationId}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Violation Type: ${violation.violationType}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Provision: ${violation.provision}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Section of Act: ${violation.sectionOfAct}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Fine Amount: Rs. ${violation.fineAmount}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Points: ${violation.points}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Due Days: ${violation.dueDays} days`, 20, yPosition);
      yPosition += 10; // Space after each violation

      // Draw separator line
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;

      return yPosition;
    };

    // Start drawing
    drawPageBorder();
    drawHeader();

    let yPosition = 70;
    let violationsOnPage = 0;

    violations.forEach((violation, index) => {
      if (yPosition > 250) {
        // If too low, add new page
        drawFooter();
        doc.addPage();
        drawPageBorder();
        drawHeader();
        yPosition = 70;
      }

      yPosition = drawViolation(violation, index, yPosition);
      violationsOnPage++;
    });

    // Final footer
    drawFooter();

    // Save PDF
    doc.save("violations_report.pdf");
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

      <div className="container">
        <div className="mb-2 d-flex align-items-center justify-content-end">
          <button
            className="btn custom-print-button d-flex align-items-center"
            onClick={() => generateViolationsPDF(filteredTrafficViolations)}
          >
            <IoMdPrint className="me-2" style={{ fontSize: "20px" }} />
            <span className="print-text">Print Report</span>
          </button>
        </div>
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
                  key={trafficViolation.violationId}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center w-100 ">
                      <div className="">
                        <h5 className="card-title fs-6 text-muted text-start mb-0 ">
                          {trafficViolation.provision}
                        </h5>
                        <p
                          className="text-start"
                          style={{ color: "#555", fontSize: "14px" }}
                        >
                          {"Section Of Act: " + trafficViolation.sectionOfAct}
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
                      Fine Amount: {trafficViolation.fineAmount} LKR
                    </h6>

                    <div
                      className="text-start "
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      <p className="mb-1">
                        Allocated Points: {trafficViolation.points}
                      </p>
                      <p className="mb-0">
                        Due Days: {trafficViolation.dueDays}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No traffic violations found</p>
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
