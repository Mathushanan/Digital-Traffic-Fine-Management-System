import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Statistics = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [statistics, setStatistics] = useState([]);

  const fetchStatistics = async () => {
    try {
      const fetchStatisticsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-traffic-police-statistics`;
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      const issuerEmail = decodedToken.Email;

      const response = await axios.post(
        fetchStatisticsUrl,
        { issuerEmail: issuerEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const fetchedStatistics = response.data;
        console.log(fetchedStatistics);
        setStatistics(fetchedStatistics);
      } else {
        setMessage("Failed to fetch statistics!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch statistics: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch statistics:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

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

      <div className="container py-4">
        <div className="row g-4">
          {/* Row 1 */}

          {/* Row 2 */}

          {/* Row 3 */}
          <div className="col-md-3">
            <div
              className="card shadow-sm h-100"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <h6 className="card-title text-muted">
                  Total Revenue Generated
                </h6>
                <h2 className="card-text text-soft-purple fw-bold">
                  {statistics.totalRevenueGenarated} LKR
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div
              className="card shadow-sm h-100"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body d-flex flex-column">
                <h6 className="card-title text-center text-muted">
                  Total Fines Issued
                </h6>
                <h2 className="card-text text-center text-soft-teal fw-bold">
                  {statistics.totalFinesIssued}
                </h2>

                <div className="row mt-4 g-3 mt-auto">
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Paid Fines</h6>
                        <h5 className="text-success fw-bold">
                          {statistics.paidFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Pending Fines</h6>
                        <h5 className="text-warning fw-bold">
                          {statistics.pendingFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Disputed Fines</h6>
                        <h5 className="text-danger fw-bold">
                          {statistics.disputedFines}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
