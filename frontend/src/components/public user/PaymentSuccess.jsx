import { FaCheckCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [isPaymentRecorded, setIsPaymentRecorded] = useState(false);

  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";
  const [sessionId, setSessionId] = useState(null);
  const [fineId, setFineId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionIdFromUrl = query.get("session_id");
    const fineIdFromUrl = query.get("fine_id");
    const amountFromUrl = query.get("amount");

    setSessionId(sessionIdFromUrl);
    setFineId(fineIdFromUrl);
    setAmount(amountFromUrl);

    if (sessionIdFromUrl && !isPaymentRecorded) {
      insertPaymentRecord(sessionIdFromUrl, fineIdFromUrl, amountFromUrl);
      setIsPaymentRecorded(true);
    }
  }, [location.search, isPaymentRecorded]);

  const insertPaymentRecord = async (sessionId, fineId, amount) => {
    try {
      const insertPaymentUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/add-payment`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        insertPaymentUrl,
        { sessionId: sessionId, fineId: fineId, amount: amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPaymentSuccess(true);
      } else {
        setPaymentSuccess(false);
        setMessage("Failed to add payments!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to add payments " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to add payments:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="card" style={{ margin: "0 auto" }}>
        {/* Card Header */}
        <div className="card-header text-center">
          <h4>Thank You!</h4>
        </div>

        {/* Card Body */}
        {paymentSuccess == true ? (
          <div className="card-body text-center">
            {/* Icon */}
            <FaCheckCircle size={50} color="green" />
            <h5 className="card-title text-success mt-3">Payment Successful</h5>
            <p className="card-text">
              Your traffic fine payment has been successfully processed. Thank
              you for taking care of the fine promptly!
            </p>
          </div>
        ) : (
          <div className="card-body text-center">
            {/* Icon */}
            <FaTimesCircle size={50} color="red" />
            <h5 className="card-title text-danger mt-3">Payment Failed</h5>
            <p className="card-text">
              Unfortunately, your traffic fine payment could not be processed.
              Please try again or contact support if the issue persists.
            </p>
          </div>
        )}

        {/* Card Footer */}
        <div className="card-footer text-center">
          <a href="/public-user/manage-fines" className="">
            <i className="bi bi-house-door"></i> Return to Fines
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
