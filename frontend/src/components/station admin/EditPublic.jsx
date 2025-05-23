// EditTrafficPolice.jsx

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import ConfirmationModal from "../common/ConfirmationModal";
import EditTrafficPoliceModal from "./EditTrafficPoliceModal";
import EditPublicModal from "./EditPublicModal";
import { jsPDF } from "jspdf";
import dmt_logo from "../../assets/logo-header.png"; // Replace this with your logo path
import { IoMdPrint } from "react-icons/io";

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

  const generatePublicUserPDF = (officers) => {
    const doc = new jsPDF();

    const drawPageBorder = () => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(15, 8, 180, 280);
    };

    const drawHeader = () => {
      doc.addImage(dmt_logo, "PNG", 20, 10, 170, 30);
      doc.setFontSize(20);
      const title = "List of Registered Public Users";
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.width;
      const xPosition = (pageWidth - titleWidth) / 2;
      doc.setTextColor(0, 0, 0);
      doc.text(title, xPosition, 50);

      doc.setLineWidth(0.5);
      doc.line(20, 60, 190, 60);
    };

    const drawFooter = () => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Generated by Department of Motor Traffic System", 20, 280);
    };

    const drawOfficer = (officer, index, yPosition) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 80);
      doc.text(`Public User ${index + 1}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${officer.firstName} ${officer.lastName}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Badge Number: ${officer.badgeNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Email: ${officer.email}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Contact Number: ${officer.contactNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(`NIC Number: ${officer.nicNumber}`, 20, yPosition);
      yPosition += 6;
      doc.text(
        `Date of Birth: ${new Date(officer.dateOfBirth).toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(`Gender: ${officer.gender}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("License Details:", 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`License Number: ${officer.licenseNumber}`, 20, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("Station Details:", 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Registered Station Name: ${officer.registeredStationName}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Registered District: ${officer.registeredStationDistrict}`,
        20,
        yPosition
      );
      yPosition += 6;
      doc.text(`Station Address: ${officer.address}`, 20, yPosition, {
        maxWidth: 170,
      });
      yPosition += 10;

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
    let officersOnPage = 0;

    officers.forEach((officer, index) => {
      if (officersOnPage === 2) {
        drawFooter();
        doc.addPage();
        drawPageBorder();
        drawHeader();
        yPosition = 70;
        officersOnPage = 0;
      }

      yPosition = drawOfficer(officer, index, yPosition);
      officersOnPage++;
    });

    drawFooter();
    doc.save("public_user_report.pdf");
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

      <div className="container">
        <div className="mb-2 d-flex align-items-center justify-content-end">
          <button
            className="btn custom-print-button d-flex align-items-center"
            onClick={() => generatePublicUserPDF(filteredPublicUsers)}
          >
            <IoMdPrint className="me-2" style={{ fontSize: "20px" }} />
            <span className="print-text">Print Report</span>
          </button>
        </div>
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
        message={`Are you sure you want to delete ${currentPublicUser?.firstName} ${currentPublicUser?.lastName}?`}
      />
    </>
  );
};

export default EditPublic;
