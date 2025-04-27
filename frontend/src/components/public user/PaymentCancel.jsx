import React from "react";
// You may need to install Font Awesome Icons if not already done
import { FaTimesCircle } from "react-icons/fa";

const PaymentCancel = () => {
  return (
    <div className="container mt-5">
      <div className="card" style={{ margin: "0 auto" }}>
        {/* Card Header */}
        <div className="card-header text-center">
          <h4>Payment Failed</h4>
        </div>

        {/* Card Body */}
        <div className="card-body text-center">
          {/* Icon */}
          <FaTimesCircle size={50} color="red" />
          <h5 className="card-title text-danger mt-3">Payment Canceled</h5>
          <p className="card-text">
            Unfortunately, your traffic fine payment could not be processed.
            Please try again or contact support if the issue persists.
          </p>
        </div>

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

export default PaymentCancel;
