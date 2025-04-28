import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "./EditStationModal";
import ConfirmationModal from "../common/ConfirmationModal";
import EditStationAdminModal from "./EditStationAdminModal";
import { jsPDF } from "jspdf";
import dmt_logo from "../../assets/logo-header.png"; // Replace this with your logo path
import { IoMdPrint } from "react-icons/io";

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
  const [currentStationAdmin, setCurrentStationAdmin] = useState(null);

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
        setFilteredStationAdmins(fetchedStationAdmins); // Initialize filtered stations
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

      const filtered = stationAdmins.filter(
        (stationAdmin) =>
          stationAdmin.firstName.toLowerCase().includes(lowercasedSearchTerm) ||
          stationAdmin.lastName.toLowerCase().includes(lowercasedSearchTerm) ||
          stationAdmin.contactNumber.includes(lowercasedSearchTerm) ||
          (isNumericSearch &&
            stationAdmin.badgeNumber.toString().includes(searchTerm)) ||
          stationAdmin.licenseNumber
            .toLowerCase()
            .includes(lowercasedSearchTerm) ||
          stationAdmin.nicNumber.toLowerCase().includes(lowercasedSearchTerm)
      );

      setFilteredStationAdmins(filtered);
    } else {
      setFilteredStationAdmins(stationAdmins ? stationAdmins : []);
    }
  }, [searchTerm, stationAdmins]);

  const handleEditClick = (stationAdmin) => {
    setCurrentStationAdmin(stationAdmin);
    console.log(currentStationAdmin);
    setShowEditModal(true);
  };

  const handleDeleteClick = (stationAdmin) => {
    setCurrentStationAdmin(stationAdmin);

    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteStationAdmin(currentStationAdmin);
  };

  const handleDeleteStationAdmin = async (stationAdmin) => {
    try {
      const deleteStationAdminUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/delete-user`;

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      const stationAdminIdToDelete = stationAdmin.userId;
      const response = await axios.delete(deleteStationAdminUrl, {
        data: { userId: stationAdminIdToDelete },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchStationAdmins();
        setMessage(`Station Admin Deleted successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to delete the station admin!");
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

  const handleSave = async (updatedStationAdmin) => {
    try {
      await handleUpdateStationAdmin(updatedStationAdmin);
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleUpdateStationAdmin = async (updatedStationAdmin) => {
    try {
      const updateStationAdminUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/update-user`;

      // Get the token from localStorage
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        updateStationAdminUrl,
        updatedStationAdmin,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        fetchStationAdmins();
        setMessage(`Station Admin Updated successfully!`);
        setMessageType("success");
      } else {
        throw new Error("Failed to update station admin!");
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

  const generateStationAdminPDF = (admins) => {
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
      const title = "List Of Registered Station Admins";
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

    const drawAdmin = (admin, index, yPosition) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 80);
      doc.text(`Admin ${index + 1}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${admin.firstName} ${admin.lastName}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Badge Number: ${admin.badgeNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Email: ${admin.email}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Contact Number: ${admin.contactNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(`NIC Number: ${admin.nicNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(
        `Date of Birth: ${new Date(admin.dateOfBirth).toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(`Gender: ${admin.gender}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("License Details:", 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`License Number: ${admin.licenseNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(
        `Issue Date: ${new Date(admin.licenseIssueDate).toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Expiry Date: ${new Date(
          admin.licenseExpiryDate
        ).toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 6;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("Station Details:", 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Registered Station Name: ${admin.registeredStationName}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Registered District: ${admin.registeredStationDistrict}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(`Station Address: ${admin.address}`, 20, yPosition, {
        maxWidth: 170,
      });
      yPosition += 10; // Some extra space after each admin

      // Draw separator line
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      return yPosition;
    };

    drawPageBorder();
    drawHeader();

    let yPosition = 70;
    let adminsOnPage = 0;

    admins.forEach((admin, index) => {
      if (adminsOnPage === 2) {
        drawFooter();
        doc.addPage();
        drawPageBorder();
        drawHeader();
        yPosition = 70;
        adminsOnPage = 0;
      }

      yPosition = drawAdmin(admin, index, yPosition);
      adminsOnPage++;
    });

    // Final footer
    drawFooter();

    // Save the PDF
    doc.save("station_admins_report.pdf");
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

      <div className="container ">
        <div className="mb-2 d-flex align-items-center justify-content-end">
          <button
            className="btn custom-print-button d-flex align-items-center"
            onClick={() => generateStationAdminPDF(filteredStationAdmins)}
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
            placeholder="Search Station Admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredStationAdmins.length > 0 ? (
            filteredStationAdmins.map((stationAdmin) => {
              return (
                <div className="col" key={stationAdmin.userId}>
                  <div className="card shadow-lg rounded-3 border-light p-2">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                        <h5 className="card-title fs-6 text-muted mb-0 me-2">
                          {stationAdmin.firstName} {stationAdmin.lastName}
                        </h5>
                        <p
                          className="px-2 py-1 rounded mb-0 text-success"
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#d4f8d4",
                          }}
                        >
                          {stationAdmin.badgeNumber}
                        </p>
                      </div>
                      <h6
                        className="card-subtitle mb-3 text-muted text-start"
                        style={{ color: "#555", fontSize: "12px" }}
                      >
                        {stationAdmin.registeredStationName}
                        {", "}
                        {stationAdmin.registeredStationDistrict}
                      </h6>
                      <div className="text-start">
                        <h6>Contact</h6>
                        <p className="" style={{ fontSize: "13px" }}>
                          {stationAdmin.contactNumber}
                          {" | "}
                          <span>
                            <a
                              href={`mailto:${stationAdmin.email}`}
                              className=""
                            >
                              {stationAdmin.email}
                            </a>
                          </span>
                        </p>
                      </div>
                      <div className="text-start">
                        <h6>Personal Details</h6>
                        <p className="" style={{ fontSize: "13px" }}>
                          NIC No: {stationAdmin.nicNumber}
                          <br />
                          License No: {stationAdmin.licenseNumber}
                          <br />
                          Date Of Birth:{" "}
                          {
                            new Date(stationAdmin.dateOfBirth)
                              .toISOString()
                              .split("T")[0]
                          }
                          <br />
                          Address: {stationAdmin.address}
                          <br />
                          Gender: {stationAdmin.gender}
                        </p>
                      </div>

                      {/* Button Section */}
                      <div className="d-flex">
                        <button
                          className="btn btn-warning btn-sm d-flex align-items-center justify-content-center w-50"
                          onClick={() => handleEditClick(stationAdmin)}
                        >
                          <FaEdit className="me-2" /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-50 ms-2"
                          onClick={() => handleDeleteClick(stationAdmin)}
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
      <EditStationAdminModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        stationAdmin={currentStationAdmin}
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
