import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { jwtDecode } from "jwt-decode";

const ViewNotifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const fetchNotifications = async () => {
    try {
      const fetchNotificationsByEmailUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-traffic-police-notifications`;
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const email = decodedToken.Email;

      const response = await axios.post(
        fetchNotificationsByEmailUrl,
        { senderEmail: email }, // Send as JSON body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure JSON content type
          },
        }
      );

      if (response.status === 200) {
        const fetchedNotifications = response.data;
        setNotifications(fetchedNotifications);
        setFilteredNotifications(fetchedNotifications.$values);
      } else {
        setMessage("Failed to fetch notifications!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch notifications: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch notifications:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter stations based on search term
  useEffect(() => {
    if (notifications && searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = notifications.$values.filter(
        (notification) =>
          notification.Message.toLowerCase().includes(lowercasedSearchTerm) ||
          notification.ReceiverType.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications(notifications ? notifications.$values : []);
    }
  }, [searchTerm, notifications]);

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
            placeholder="Search Messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              return (
                <div
                  className="card shadow-lg rounded-3 p-1"
                  style={{ borderLeft: "5px solid #55798f" }}
                  key={notification.NotificationId}
                >
                  <div className="card-body">
                    <p
                      className="text-start"
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      {"Sent by: " + notification.NotifiedBy}
                      <br />
                      {"Sent to: " + notification.ReceiverType}
                      <br />
                      {"Sent At: " + notification.SentAt}
                    </p>

                    <div className="d-flex justify-content-between align-items-center w-100 ">
                      <h5 className="card-title fs-6 text-muted text-start mb-0 ">
                        {notification.Message}
                      </h5>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No notifications found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewNotifications;
