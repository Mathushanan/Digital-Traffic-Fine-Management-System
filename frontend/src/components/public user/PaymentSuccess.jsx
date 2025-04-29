import { FaCheckCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";
import dmt_logo from "../../assets/logo-header.png";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [paymentSuccess, setPaymentSuccess] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [fineId, setFineId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [fine, setFine] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionIdFromUrl = query.get("session_id");
    const fineIdFromUrl = query.get("fine_id");
    const amountFromUrl = query.get("amount");

    setSessionId(sessionIdFromUrl);
    setFineId(fineIdFromUrl);
    setAmount(amountFromUrl);

    if (sessionIdFromUrl) {
      insertPaymentRecord(sessionIdFromUrl, fineIdFromUrl, amountFromUrl);
    }
  }, []);

  const insertPaymentRecord = async (sessionId, fineId, amount) => {
    console.log("insert record called");
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
        getFineDetails(fineId);
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
  const getFineDetails = async (fineId) => {
    try {
      const getFineDetailsUrl = `${import.meta.env.VITE_API_BASE_URL}/get-fine`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        getFineDetailsUrl,
        { fineId: fineId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setFine(response.data);
      } else {
        setMessage("Failed to fetch fine details!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch fine details! " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
      console.error(
        "Failed to fetch fine details:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add logo at the top of the receipt with full width
    const logoUrl = dmt_logo; // Replace with your logo's image path or URL
    doc.addImage(logoUrl, "PNG", 20, 10, 170, 30); // Logo takes full width with height proportional

    // Title Section
    doc.setFontSize(20);
    const title = "Traffic Fine Payment Receipt";
    const titleWidth = doc.getTextWidth(title); // Get the width of the title text
    const pageWidth = doc.internal.pageSize.width; // Get the width of the document
    const xPosition = (pageWidth - titleWidth) / 2; // Calculate the X position to center the text
    doc.setTextColor(0, 0, 0); // Black title text
    doc.text(title, xPosition, 50); // Centered title

    // Adding line separator (blue)
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);

    // Fine Details Section (standard black text)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset text color to black
    doc.text(`Fine ID: ${fineId}`, 20, 70);
    doc.text(`Section Of Act: ${fine.sectionOfAct}`, 110, 70);
    doc.text(`Provision: ${fine.provision}`, 20, 80);
    doc.setFontSize(10);
    doc.text(`Session ID: ${sessionId}`, 20, 90);
    doc.setFontSize(12);
    doc.text(`Offender Name: ${fine.offenderName}`, 20, 100);
    doc.text(`Issuer Name: ${fine.issuerName}`, 110, 100);

    // Violation and Due Date Section (gray color for date section)
    doc.setTextColor(128, 128, 128); // Gray color for date info
    doc.text(
      `Violation Date: "${fine.violationDate.split("T")[0]} - ${
        fine.violationDate.split("T")[1].split(".")[0]
      }"`,
      20,
      110
    );
    doc.text(
      `Due Date: "${fine.dueDate.split("T")[0]} - ${
        fine.dueDate.split("T")[1].split(".")[0]
      }"`,
      110,
      110
    );

    doc.setTextColor(0, 0, 0); // Black text for location info
    doc.text(`District: ${fine.district}`, 20, 120);
    doc.text(`Location: ${fine.longitude}, ${fine.latitude}`, 110, 120);
    doc.text(`Station: ${fine.stationName}`, 20, 130);
    doc.text(`Court: ${fine.courtName}`, 110, 130);

    // Payment Details Section (orange color for payment title)
    doc.setFontSize(14);
    doc.setTextColor(255, 69, 0); // Orange color for Payment section title
    doc.text("Payment Details", 20, 145);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text for payment details
    doc.text(`Amount Paid: $${amount}`, 20, 155);
    doc.text(
      `Payment Status: ${paymentSuccess ? "Successful" : "Failed"}`,
      110,
      155
    );

    // Adding a line separator after the payment section (blue)
    doc.setLineWidth(0.5);
    doc.line(20, 170, 190, 170);

    // Footer Section (contact info with gray color)
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray footer text
    doc.text(
      "For any inquiries, please contact: support@departmentofmotortraffic.lk",
      20,
      175
    );

    // Adding a border around the receipt (black color)
    doc.setDrawColor(0, 0, 0); // Border color (black)
    doc.setLineWidth(1);
    doc.rect(15, 8, 180, 180); // Border around the entire content

    // Save the PDF
    doc.save("fine_payment_receipt.pdf");
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
          <button
            type="button"
            className="btn w-100"
            style={{
              backgroundColor: "#55798f",
              color: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => generatePDF()}
          >
            <FaDownload style={{ marginRight: "8px", fontSize: "20px" }} />{" "}
            Download Receipt
          </button>
          <br />
          <a href="/public-user/manage-fines" className="mt-2 d-block">
            <i className="bi bi-house-door"></i> Return to Fines
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
