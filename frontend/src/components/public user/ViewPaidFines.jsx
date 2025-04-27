import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const ViewPaidFines = () => {
  const [fines, setFines] = useState([]);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const fetchFinesByIssuerEmail = async () => {
    try {
      const fetchFinesUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-fine-details`;
      const token = localStorage.getItem("authToken");

      const decodedToken = jwtDecode(token);

      const email = decodedToken.Email;

      const response = await axios.post(
        fetchFinesUrl,
        { offenderEmail: email, typeOfFines: "paid" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const fetchedFines = response.data;
        setFines(fetchedFines);
      } else {
        setMessage("Failed to fetch fines!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch fines " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch fines:",
        error.response ? error.response.data : error.message
      );
    }
  };
  useEffect(() => {
    fetchFinesByIssuerEmail();
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

      <div className="container ">
        {/* Search Bar */}
        <div className="mb-4 w-full flex items-center p-2 gap-2"></div>

        <div className="d-flex flex-column gap-3">
          {fines.length > 0 ? (
            fines.map((fine) => {
              return (
                <div
                  className="card shadow-lg rounded-3 p-1"
                  style={{ borderLeft: "5px solid #55798f" }}
                  key={fine.fineId}
                >
                  <div className="card-body">
                    <div className="row justify-content-between align-items-center w-100 ">
                      <div className="col-9 ">
                        <h5 className="card-title fs-6 text-muted text-start mb-1 ">
                          {fine.provision + " "}({fine.sectionOfAct})
                        </h5>
                      </div>

                      {/* Button Section */}
                      <div className="col-3 d-flex gap-2 ">
                        {fine.status === "paid" ? (
                          <div className=" paid-fine-details-btn px-3 border border-success">
                            <span
                              className="status-text paid-fine-details-btn-span text-success"
                              style={{
                                alignItems: "center",
                                fontSize: "14px",
                              }}
                            >
                              Paid
                            </span>
                          </div>
                        ) : fine.status === "disputed" ? (
                          <div className=" pending-fine-details-btn px-2 border border-warning">
                            <span
                              className="status-text fine-details-btn-span"
                              style={{
                                color: " #b8860b",
                                alignItems: "center",
                                fontSize: "14px",
                              }}
                            >
                              Pending
                            </span>
                          </div>
                        ) : (
                          <div className=" pending-fine-details-btn px-2 border border-warning">
                            <span
                              className="status-text fine-details-btn-span"
                              style={{
                                color: " #b8860b",
                                alignItems: "center",
                                fontSize: "14px",
                              }}
                            >
                              Pending
                            </span>
                          </div>
                        )}

                        <div className=" fine-details-btn  px-2 border border-warning">
                          <span
                            className="status-text fine-details-btn-span"
                            style={{
                              color: " #b8860b",
                              alignItems: "center",
                              fontSize: "14px",
                            }}
                          >
                            {fine.deductedPoints} Points
                          </span>
                        </div>
                      </div>
                    </div>

                    <h6
                      className="card-subtitle mb-3 text-muted text-start"
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      Fine Amount:{" "}
                      <span className="text-danger">{fine.amount} LKR</span>
                    </h6>

                    <div
                      className="text-start row "
                      style={{ color: "#555", fontSize: "14px" }}
                    >
                      <div className="col-6">
                        <p className="text-start mb-0">
                          <span className="fw-bold"> Offender:</span>
                          {fine.offenderName}
                        </p>
                        <p className="text-start mb-0">
                          <span className="fw-bold">Issuer:</span>{" "}
                          {fine.issuerName} ({fine.badgeNumber})
                        </p>
                        <p className="mb-0">
                          <span className="fw-bold">Violation Date:</span>{" "}
                          {
                            new Date(fine.violationDate)
                              .toISOString()
                              .split("T")[0]
                          }
                        </p>
                        <p className="mb-0">
                          <span className="fw-bold">Due Date:</span>{" "}
                          {new Date(fine.dueDate).toISOString().split("T")[0]}
                        </p>
                      </div>
                      <div className="col-6">
                        <p className="text-start mb-0">
                          <span className="fw-bold"> Vehicle Number:</span>{" "}
                          {fine.vehicleNumber}
                        </p>
                        <p className="text-start mb-0">
                          <span className="fw-bold">Station:</span>{" "}
                          {fine.stationName}
                        </p>
                        <p className="mb-0">
                          <span className="fw-bold">Court:</span>{" "}
                          {fine.courtName}
                        </p>
                        <p className="mb-0">
                          <span className="fw-bold">Status:</span> {fine.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No fines found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewPaidFines;
