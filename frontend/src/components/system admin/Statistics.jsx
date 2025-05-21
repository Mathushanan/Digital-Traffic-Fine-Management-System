import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { IoMdPrint } from "react-icons/io";

import axios from "axios";

const Statistics = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [dataset, setDataset] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [statistics, setStatistics] = useState([]);

  const fetchStatistics = async () => {
    try {
      const fetchStatisticsUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-system-admin-statistics`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchStatisticsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  const fetchDataset = async () => {
    try {
      const fetchDatasetUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-machine-learning-dataset`;
      const token = localStorage.getItem("authToken");
      console.log(token);

      const response = await axios.post(
        fetchDatasetUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const fetchedDataset = response.data;
        console.log(fetchedDataset);
        setDataset(fetchedDataset);
      } else {
        setMessage("Failed to fetch dataset!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch dataset: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch dataset:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchDataset();
  }, []);

  function generateCSV(dataset) {
    if (!dataset || !dataset.length) {
      alert("No data available to export");
      return;
    }

    // Get CSV headers from keys of the first object
    const headers = Object.keys(dataset[0]);

    // Create CSV rows: headers + each row of data
    const csvRows = [
      headers.join(","), // header row
      ...dataset.map((row) =>
        headers
          .map((fieldName) => {
            let value = row[fieldName];
            if (value === null || value === undefined) value = "";
            else value = value.toString().replace(/"/g, '""'); // Escape quotes
            // Wrap in quotes if contains commas or quotes
            return `"${value}"`;
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export.csv"); // You can customize filename here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
        <div className="mb-3 d-flex align-items-center justify-content-end">
          <button
            className="btn custom-print-button d-flex align-items-center"
            onClick={() => generateCSV(dataset)}
          >
            <IoMdPrint className="me-2" style={{ fontSize: "20px" }} />
            <span className="print-text">Genarate Dataset</span>
          </button>
        </div>
        <div className="row g-4">
          {/* Row 1 */}
          <div className="col-md-6">
            <div
              className="card shadow-sm "
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center">
                <h6 className="card-title text-muted text-start">
                  Total Registered Stations
                </h6>
                <h2 className="card-text text-soft-blue fw-bold">
                  {statistics.totalRegisteredStations}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="card shadow-sm "
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center">
                <h6 className="card-title text-muted text-start">
                  Total Registered Traffic Violations
                </h6>
                <h2 className="card-text text-soft-orange fw-bold">
                  {statistics.totalRegisteredTrafficViolations}
                </h2>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="col-md-4">
            <div
              className="card shadow-sm "
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center">
                <h6 className="card-title text-muted">
                  Total Registered Station Admins
                </h6>
                <h3 className="card-text text-soft-green fw-bold">
                  {statistics.totalRegisteredStationAdmins}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm "
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center">
                <h6 className="card-title text-muted">
                  Total Registered Traffic Police Officers
                </h6>
                <h3 className="card-text text-soft-grey fw-bold">
                  {statistics.totalRegisteredTrafficPoliceOfficers}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm "
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <div className="card-body text-center">
                <h6 className="card-title text-muted">
                  Total Registered Public Users
                </h6>
                <h3 className="card-text text-soft-red fw-bold">
                  {statistics.totalRegisteredPublicUsers}
                </h3>
              </div>
            </div>
          </div>

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
