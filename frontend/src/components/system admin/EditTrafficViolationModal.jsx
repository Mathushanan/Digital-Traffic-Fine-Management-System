import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

import { MdOutlineUpdate } from "react-icons/md";

const EditTrafficViolationModal = ({
  show,
  onClose,
  trafficViolation,
  onSave,
}) => {
  const [violationType, setViolationType] = useState("");
  const [provision, setProvision] = useState("");
  const [sectionOfAct, setSectionOfAct] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [points, setPoints] = useState("");
  const [dueDays, setDueDays] = useState("");

  const violationTypes = [
    { value: "", label: "Select a Violation Category" },
    { value: "court&fine", label: "Handled in Court & Requires Fine Payment" },
    { value: "fine", label: "Requires only a Fine Payment" },
  ];

  useEffect(() => {
    if (trafficViolation) {
      console.log(trafficViolation);
      setViolationType(trafficViolation.ViolationType);
      setProvision(trafficViolation.Provision);
      setSectionOfAct(trafficViolation.SectionOfAct);
      setFineAmount(trafficViolation.FineAmount);
      setPoints(trafficViolation.Points);
      setDueDays(trafficViolation.DueDays);
    }
  }, [trafficViolation]);

  if (!show) return null;

  const handleSave = () => {
    const updatedTrafficViolation = {
      ...trafficViolation,
      ViolationType: violationType,
      Provision: provision,
      SectionOfAct: sectionOfAct,
      FineAmount: fineAmount,
      Points: points,
      DueDays: dueDays,
    };
    onSave(updatedTrafficViolation);
    onClose();
    console.log(updatedTrafficViolation);
  };

  return (
    <>
      {/* Dark background overlay */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background
          zIndex: "1040",
        }}
      ></div>

      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="modalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ maxWidth: "60%", width: "100%" }} // Increase modal width here
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalLabel">
                Edit Traffic Violation
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="container text-start">
                <div
                  className="p-4"
                  style={{ maxWidth: "100%", width: "100%" }}
                >
                  <form>
                    <div className="form-group mb-3 text-start position-relative">
                      <label htmlFor="violationType" className="form-label">
                        Violation Type
                      </label>
                      <select
                        className="form-control fs-6 pe-5"
                        id="violationType"
                        value={violationType}
                        onChange={(e) => setViolationType(e.target.value)}
                        required
                        style={{ appearance: "none", color: "#555" }}
                      >
                        {violationTypes.map((trafficViolation) => (
                          <option
                            key={trafficViolation.value}
                            value={trafficViolation.value}
                          >
                            {trafficViolation.label}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown
                        className="position-absolute"
                        style={{
                          right: "10px",
                          top: "75%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "#555",
                        }}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor="provision" className="form-label">
                        Provision
                      </label>
                      <textarea
                        className="form-control fs-6"
                        id="provision"
                        name="provision"
                        required
                        placeholder="Provision"
                        rows="4"
                        value={provision}
                        onChange={(e) => setProvision(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="sectionOfAct" className="form-label">
                          Section Of Act
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="sectionOfAct"
                          value={sectionOfAct}
                          onChange={(e) => setSectionOfAct(e.target.value)}
                          required
                          placeholder="Section Of Act"
                        />
                      </div>
                      <div className="col">
                        <label htmlFor="dueDays" className="form-label">
                          Due Days
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="dueDays"
                          value={dueDays}
                          onChange={(e) => setDueDays(e.target.value)}
                          required
                          placeholder="Due Days"
                        />
                      </div>
                    </div>

                    {/* Contact Number & Email */}
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div class="col">
                        <label htmlFor="points" className="form-label">
                          Points
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="points"
                          value={points}
                          onChange={(e) => setPoints(e.target.value)}
                          required
                          placeholder="Allocated Points"
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="fineAmount" className="form-label">
                          Fine Amount
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="fineAmount"
                          value={fineAmount}
                          onChange={(e) => setFineAmount(e.target.value)}
                          required
                          placeholder="Fine Amount"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn w-100"
                style={{
                  backgroundColor: "#55798f",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={handleSave}
              >
                <MdOutlineUpdate
                  style={{ marginRight: "8px", fontSize: "20px" }}
                />{" "}
                UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTrafficViolationModal;
