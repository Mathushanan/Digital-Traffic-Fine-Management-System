import React from "react";
import PropTypes from "prop-types";

const ConfirmationModal = ({ show, onConfirm, onClose, message }) => {
  if (!show) return null;
  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: show ? "rgba(0, 0, 0, 0.2)" : "0" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content bg-light shadow-sm border">
          {/*modal header*/}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">Confirmation</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          {/*modal body*/}
          <div className="modal-body">
            <p className="m-auto">{message}</p>
          </div>
          {/*modal footer*/}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired, // must be a boolean and required
  onConfirm: PropTypes.func.isRequired, // must be a function and required
  onClose: PropTypes.func.isRequired, // must be a function and required
  message: PropTypes.string.isRequired, // must be a string and required
};

export default ConfirmationModal;
