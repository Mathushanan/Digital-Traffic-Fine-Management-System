import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { IoMdPrint } from "react-icons/io";
import { jsPDF } from "jspdf";
import dmt_logo from "../../assets/logo-header.png"; // Replace this with your logo path

const Analysis = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";
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

      <div class="container py-4">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center">
                <h5 class="card-title text-muted">Total Stations Registered</h5>
                <h2 class="card-text text-primary fw-bold">100</h2>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center">
                <h5 class="card-title text-muted">
                  Total Traffic Violations Registered
                </h5>
                <h2 class="card-text text-danger fw-bold">100</h2>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center">
                <h6 class="card-title text-muted">
                  Total Station Admins Registered
                </h6>
                <h3 class="card-text text-success fw-bold">100</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center">
                <h6 class="card-title text-muted">
                  Total Traffic Police Registered
                </h6>
                <h3 class="card-text text-warning fw-bold">100</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center">
                <h6 class="card-title text-muted">
                  Total Public Users Registered
                </h6>
                <h3 class="card-text text-info fw-bold">100</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analysis;
