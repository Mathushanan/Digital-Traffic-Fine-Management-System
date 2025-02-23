// Modal.js
import React from "react";
import { FaTimesCircle } from "react-icons/fa";

const Modal = ({ show, onClose, station, onSave }) => {
  if (!show) return null;

  const handleSave = () => {
    onSave(station);
    onClose();
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block" }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalLabel">
              Edit Station
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="stationName" className="form-label">
                Station Name
              </label>
              <input
                type="text"
                id="stationName"
                className="form-control"
                value={station.StationName || ""}
                onChange={(e) => (station.StationName = e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stationCode" className="form-label">
                Station Code
              </label>
              <input
                type="text"
                id="stationCode"
                className="form-control"
                value={station.StationCode || ""}
                onChange={(e) => (station.StationCode = e.target.value)}
              />
            </div>
            {/* Add other fields as required */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
