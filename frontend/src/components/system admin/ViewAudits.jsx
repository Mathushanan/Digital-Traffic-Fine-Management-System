import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

const ViewAudits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const fetchAudits = async () => {
    try {
      const fetchAuditsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-audits`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchAuditsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const fetchedAudits = response.data;
        setAudits(fetchedAudits);
        setFilteredAudits(fetchedAudits);
      } else {
        setMessage("Failed to fetch audits!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch audits: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error("Fetch audits error:", error);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    if (audits.length > 0 && searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = audits.filter((audit) =>
        JSON.stringify(audit).toLowerCase().includes(lowerSearch)
      );
      setFilteredAudits(filtered);
    } else {
      setFilteredAudits(audits);
    }
  }, [searchTerm, audits]);

  return (
    <>
      {message && (
        <div
          className={`alert ${messageClass} alert-dismissible fade show w-100 shadow-lg rounded start-50 translate-middle-x mt-4`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {messageType === "success" && <FaCheckCircle className="me-2" />}
            {messageType === "error" && <FaTimesCircle className="me-2" />}
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
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search Audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-3">
          {filteredAudits.length > 0 ? (
            filteredAudits.map((audit) => (
              <div
                className="card shadow-lg rounded-3 p-1"
                style={{ borderLeft: "5px solid #55798f" }}
                key={audit.auditId || `${audit.userId}-${audit.timestamp}`}
              >
                <div className="card-body">
                  <p
                    className="text-start"
                    style={{ color: "#555", fontSize: "14px" }}
                  >
                    <strong>Endpoint:</strong> {audit.apiEndPoint} <br />
                    <strong>User ID:</strong> {audit.userId} <br />
                    <strong>IP Address:</strong> {audit.ipAddress} <br />
                    <strong>Method:</strong> {audit.requestType} <br />
                    <strong>Time:</strong>{" "}
                    {new Date(audit.timeStamp).toLocaleString()} <br />
                    <strong>User-Agent:</strong> {audit.userAgent} <br />
                    <strong>Request-Body:</strong>{" "}
                    {truncateText(audit.requestBody)} <br />
                    <strong>Request-Header:</strong>{" "}
                    {truncateText(audit.requestHeader)} <br />
                    <strong>Query-Parameters:</strong>{" "}
                    {truncateText(audit.queryParams)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No audits found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewAudits;
