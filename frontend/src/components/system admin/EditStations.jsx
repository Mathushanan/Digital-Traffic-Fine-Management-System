import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";
import EditStationModal from "./EditStationModal";
import { IoMdPrint } from "react-icons/io";
import { jsPDF } from "jspdf";
import dmt_logo from "../../assets/logo-header.png"; // Replace this with your logo path

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
        console.log(fetchedStations);
        setFilteredStations(fetchedStations); // Initialize filtered stations
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
      const filtered = stations.filter((station) =>
        station.stationName.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations ? stations : []);
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
      const stationCodeToDelete = station.stationCode;
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

  const generatePoliceStationsPDF = (stations) => {
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
      const title = "List Of Registered Stations";
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

    const drawStation = (station, index, yPosition) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 80);
      doc.text(`Station ${index + 1}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${station.stationName}`, 20, yPosition);
      yPosition += 6;
      doc.text(`District: ${station.district}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Station Code: ${station.stationCode}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Address: ${station.address}`, 20, yPosition, { maxWidth: 170 });
      yPosition += 6;
      doc.text(`Station Email: ${station.email}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Station Contact: ${station.contactNumber}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("Admin Details:", 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${station.adminFirstName}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Badge Number: ${station.adminBadgeNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Admin Email: ${station.adminEmail}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Admin Contact: ${station.adminContactNumber}`, 20, yPosition);
      yPosition += 6;

      // Draw a separator line
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10; // Some extra space after a station

      return yPosition;
    };

    drawPageBorder();
    drawHeader();

    let yPosition = 70;
    let stationsOnPage = 0;

    stations.forEach((station, index) => {
      if (stationsOnPage === 2) {
        drawFooter();
        doc.addPage();
        drawPageBorder();
        drawHeader();
        yPosition = 70;
        stationsOnPage = 0;
      }

      yPosition = drawStation(station, index, yPosition);
      stationsOnPage++;
    });

    // Final footer
    drawFooter();

    // Save the PDF
    doc.save("police_stations_report.pdf");
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
        {/* Search Bar */}

        <div className="mb-2 d-flex align-items-center justify-content-end">
          <button
            className="btn custom-print-button d-flex align-items-center"
            onClick={() => generatePoliceStationsPDF(filteredStations)}
          >
            <IoMdPrint className="me-2" style={{ fontSize: "20px" }} />
            <span className="print-text">Print Report</span>
          </button>
        </div>

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
              return (
                <div className="col" key={station.stationId}>
                  <div className="card shadow-lg rounded-3 border-light p-2">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                        <h5 className="card-title fs-6 text-muted mb-0 me-2">
                          {station.stationName}
                        </h5>
                        <p
                          className="px-2 py-1 rounded mb-0 text-success"
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#d4f8d4",
                          }}
                        >
                          {station.stationCode}
                        </p>
                      </div>
                      <h6
                        className="card-subtitle mb-3 text-muted text-start"
                        style={{ color: "#555", fontSize: "12px" }}
                      >
                        {station.district}
                      </h6>
                      <div className="text-start">
                        <h6>Contact</h6>
                        <p className="" style={{ fontSize: "13px" }}>
                          {station.contactNumber} |{" "}
                          <span>
                            <a href={`mailto:${station.email}`} className="">
                              {station.email}
                            </a>
                          </span>
                          <br />
                          {station.address}
                        </p>
                      </div>
                      {/* Admin Details */}
                      {
                        <div className="text-start" key={station.adminId}>
                          <h6>Admin</h6>
                          <p className="" style={{ fontSize: "13px" }}>
                            {station.adminFirstName} (Badge no:{" "}
                            {station.adminBadgeNumber})
                            <br />
                            {station.adminContactNumber} |{" "}
                            <span>
                              <a
                                href={`mailto:${station.adminEmail}`}
                                className=""
                              >
                                {station.adminEmail}
                              </a>
                            </span>
                            <br />
                          </p>
                        </div>
                      }
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
      <EditStationModal
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
