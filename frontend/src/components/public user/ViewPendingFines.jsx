import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaQuestionCircle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import {
  MdCheckCircle,
  MdHourglassEmpty,
  MdErrorOutline,
} from "react-icons/md";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import ConfirmationModal from "../common/ConfirmationModal";

const stripePromise = loadStripe(`${import.meta.env.VITE_STRIPE_KEY}`);

const ViewPendingFines = () => {
  const [fines, setFines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fineIdToDispute, setFineIdToDispute] = useState(null); // Add this state

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
        { offenderEmail: email, typeOfFines: "pending" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setFines(response.data);
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
    }
  };

  useEffect(() => {
    fetchFinesByIssuerEmail();
  }, []);

  const handleFinePayment = async (fineId, fineAmount) => {
    try {
      const makePaymentUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/make-payment`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        makePaymentUrl,
        { fineId, amount: fineAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
      } else {
        setMessage("Failed to make payment!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to make payment!" +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
    }
  };

  const handleDisputeFine = (fineId) => {
    setFineIdToDispute(fineId); // Store the fineId to dispute
    setShowModal(true); // Show the confirmation modal
  };

  const confirmDisputeFine = async () => {
    if (!fineIdToDispute) return;
    try {
      const disputeFineUrl = `${import.meta.env.VITE_API_BASE_URL}/add-dispute`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        disputeFineUrl,
        { fineId: fineIdToDispute },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        fetchFinesByIssuerEmail();
        setMessage("Fine disputed successfully!");
        setMessageType("success");
      } else {
        setMessage("Failed to dispute the fine!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to dispute the fine!" +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
    }
    setShowModal(false); // Close the modal after confirmation
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal when canceled
  };

  return (
    <>
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
            onClick={() => {
              setMessage(null);
              setMessageType(null);
            }}
          ></button>
        </div>
      )}

      <div className="container">
        <div className="d-flex flex-column gap-3">
          {fines.length > 0 ? (
            fines.map((fine) => (
              <div
                className="card shadow-lg rounded-3 p-1"
                style={{ borderLeft: "5px solid #55798f" }}
                key={fine.fineId}
              >
                <div className="card-body">
                  <div className="row justify-content-between align-items-center w-100">
                    <div className="col-9">
                      <h5 className="card-title fs-6 text-muted text-start mb-1">
                        {fine.provision + " "}({fine.sectionOfAct})
                      </h5>
                    </div>
                    <div className="col-3">
                      {fine.status === "paid" ? (
                        <div className="paid-fine-details-btn px-2">
                          <MdCheckCircle /> Paid
                        </div>
                      ) : fine.status === "disputed" ? (
                        <div className="disputed-fine-details-btn px-2">
                          <MdErrorOutline /> Disputed
                        </div>
                      ) : (
                        <div className="pending-fine-details-btn px-2">
                          <MdHourglassEmpty /> Pending
                        </div>
                      )}
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
                    className="text-start row"
                    style={{ color: "#555", fontSize: "14px" }}
                  >
                    <div className="col-6">
                      <p className="text-start mb-0">
                        <span className="fw-bold">Offender:</span>{" "}
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
                        <span className="fw-bold">Vehicle Number:</span>{" "}
                        {fine.vehicleNumber}
                      </p>
                      <p className="text-start mb-0">
                        <span className="fw-bold">Station:</span>{" "}
                        {fine.stationName}
                      </p>
                      <p className="mb-0">
                        <span className="fw-bold">Court:</span> {fine.courtName}
                      </p>
                      <p className="mb-0">
                        <span className="fw-bold">Deducted Points:</span>{" "}
                        {fine.deductedPoints}
                      </p>
                    </div>
                  </div>
                  <div className="text-start row mt-3">
                    <div className="col-6">
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
                        onClick={() =>
                          handleFinePayment(fine.fineId, fine.amount)
                        }
                      >
                        <FaCreditCard
                          style={{ marginRight: "8px", fontSize: "20px" }}
                        />{" "}
                        Pay Fine
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="submit"
                        className="btn btn-warning w-100"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onClick={() => handleDisputeFine(fine.fineId)} // Trigger modal
                      >
                        <FaQuestionCircle
                          style={{ marginRight: "8px", fontSize: "20px" }}
                        />{" "}
                        Dispute Fine
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No fines found</p>
          )}
        </div>
      </div>

      <ConfirmationModal
        show={showModal}
        onConfirm={confirmDisputeFine} // Confirm dispute
        onClose={closeModal}
        message="Are you sure you want to dispute this fine?"
      />
    </>
  );
};

export default ViewPendingFines;
