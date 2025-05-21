import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TrafficViolations = () => {
  const [trafficViolations, setTrafficViolations] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const fetchTrafficViolations = async () => {
    try {
      const fetchTrafficViolationsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-traffic-violations-to-homepage`;

      const response = await axios.get(fetchTrafficViolationsUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setTrafficViolations(data);
      } else {
        setMessage("Failed to fetch traffic violations!");
        setMessageType("danger");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch traffic violations: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("danger");
    }
  };

  useEffect(() => {
    fetchTrafficViolations();
  }, []);
  return (
    <div className="container my-5">
      {message && <div className={`alert alert-${messageType}`}>{message}</div>}
      <h2 className="text-center text-secondary mb-5">
        Registered Traffic Violations
      </h2>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 text-start">
        {trafficViolations.map((violation, index) => (
          <div className="col " key={violation.id}>
            <div className="card h-100 shadow-lg">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold  border border-light p-2 rounded mb-3 text-center">
                  🚨 Violation #{index + 1}
                </h5>

                <div className="mb-1">
                  <span className="fw-semibold">📘 Section:</span>{" "}
                  {violation.sectionOfAct}
                </div>

                <div className="mb-1">
                  <span className="fw-semibold">💸 Fine Amount:</span>{" "}
                  <span className="text-danger fw-bold">
                    LKR {violation.fineAmount.toFixed(2)}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="fw-semibold">⚠️ Demerit Points:</span>{" "}
                  <span className="badge bg-warning text-dark">
                    {violation.points}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="fw-semibold">📅 Due Days:</span>{" "}
                  <span className="badge bg-info text-dark">
                    {violation.dueDays}
                  </span>
                </div>

                <p className="card-text mt-auto">
                  <span className="fw-semibold">📝 Provision:</span>
                  <br />
                  <em>{violation.provision}</em>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficViolations;
