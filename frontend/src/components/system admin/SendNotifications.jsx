import React, { useState, useEffect } from "react";

import { FaSignInAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Import React Icons
import { FaPlus } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";

const SendNotification = () => {
  const [messageReceiver, setMessageReceiver] = useState("");
  const [messageSender, setMessageSender] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sentAt, setSentAt] = useState("");

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString(); // Formats to local date and time
    setSentAt(formattedDate);

    const token = localStorage.getItem("authToken");
    const decodedToken = jwtDecode(token);
    const email = decodedToken.Email;
    setMessageSender(email);
  }, []);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const messageReceivers = [
    { value: "", label: "Select target receivers" },
    { value: "toAllUsers", label: "To all users" },
    { value: "toAllStationAdmins", label: "To all station admins" },
    { value: "toAllTrafficPolices", label: "To all traffic police officers" },
    { value: "toAllPublic", label: "To all public" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(messageReceiver, messageSender, sentAt, messageContent);

    try {
      const sendMessageUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/send-notification`;

      // Get the token from localStorage (or wherever you store the JWT token)
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        sendMessageUrl,
        {
          messageReceiverType: messageReceiver,
          messageSender: messageSender,
          messageContent: messageContent,
          sentAt: sentAt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        setMessage(`Message sent successfully!`);
        setMessageType("success");
      }
    } catch (error) {
      setMessage(`${error.response ? error.response.data : error.message}`);
      setMessageType("error");
      console.error(
        "Sending failed:",
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
          {/* Optional Icon based on message type */}
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

      <div className="container d-flex justify-content-center align-items-center mt-2">
        <div className="p-4" style={{ maxWidth: "600px", width: "100%" }}>
          <h3 className="text-start mb-4">Send Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3 text-start position-relative">
              <select
                className="form-control fs-6 pe-5"
                id="messageReceiver"
                value={messageReceiver}
                onChange={(e) => setMessageReceiver(e.target.value)}
                required
                style={{ appearance: "none", color: "#555" }}
              >
                {messageReceivers.map((messageReceiver) => (
                  <option
                    key={messageReceiver.value}
                    value={messageReceiver.value}
                  >
                    {messageReceiver.label}
                  </option>
                ))}
              </select>
              <FaChevronDown
                className="position-absolute"
                style={{
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#555",
                }}
              />
            </div>

            <div className="form-group mb-3 text-start">
              <textarea
                className="form-control fs-6"
                id="messageContent"
                name="messageContent"
                required
                placeholder="Message Content"
                rows="6"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="messageSender"
                value={messageSender}
                onChange={(e) => setMessageSender(e.target.value)}
                required
                placeholder="Message Sender"
                readOnly
                disabled
              />
            </div>
            <div className="form-group mb-3 text-start">
              <input
                type="text"
                className="form-control fs-6"
                id="sentAt"
                value={sentAt}
                onChange={(e) => setSentAt(e.target.value)}
                required
                placeholder="Sent At"
                readOnly
                disabled
              />
            </div>

            <div className="form-group mb-3">
              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: "#55798f",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IoSend style={{ marginRight: "8px", fontSize: "20px" }} /> SEND
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SendNotification;
