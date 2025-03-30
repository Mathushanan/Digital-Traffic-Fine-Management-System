import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

import { MdOutlineUpdate } from "react-icons/md";

const EditTrafficPoliceModal = ({ show, onClose, trafficPolice, onSave }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");

  useEffect(() => {
    if (trafficPolice) {
      setFirstName(trafficPolice.firstName);
      setLastName(trafficPolice.lastName);
      setGender(trafficPolice.gender);
      setDateOfBirth(trafficPolice.dateOfBirth);
      setAddress(trafficPolice.address);
      setContactNumber(trafficPolice.contactNumber);
      setEmail(trafficPolice.email);
      setNicNumber(trafficPolice.nicNumber);
      setLicenseNumber(trafficPolice.licenseNumber);
      setBadgeNumber(trafficPolice.badgeNumber);
    }
  }, [trafficPolice]);

  if (!show) return null;

  const handleSave = () => {
    const updatedTrafficPolice = {
      ...trafficPolice,
      FirstName: firstName,
      LastName: lastName,
      Gender: gender,
      DateOfBirth: dateOfBirth,
      Address: address,
      ContactNumber: contactNumber,
      Email: email,
      NicNumber: nicNumber,
      LicenseNumber: licenseNumber,
      BadgeNumber: badgeNumber,
    };
    onSave(updatedTrafficPolice);
    onClose();
    console.log(updatedTrafficPolice);
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
        aria-hidden={!show}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ maxWidth: "60%", width: "100%" }} // Increase modal width here
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalLabel">
                Edit Traffic Police Officer
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
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="firstName" className="form-label">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="First Name"
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="lastName" className="form-label">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          placeholder="Last Name"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="nicNumber" className="form-label">
                          NIC Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="nicNumber"
                          value={nicNumber}
                          onChange={(e) => setNicNumber(e.target.value)}
                          required
                          placeholder="Nic Number"
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="badgeNumber" className="form-label">
                          Badge Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="badgeNumber"
                          value={badgeNumber}
                          onChange={(e) => setBadgeNumber(e.target.value)}
                          required
                          placeholder="Badge Number"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="licenseNumber" className="form-label">
                        License Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                        placeholder="License Number"
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="dateOfBirth" className="form-label">
                          Date Of Birth
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="dateOfBirth"
                          value={
                            dateOfBirth
                              ? new Date(dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                          placeholder="Date Of Birth"
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="gender" className="form-label">
                          Gender
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                          placeholder="Gender"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    {/* Contact Number & Email */}
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="contactNumber" className="form-label">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="contactNumber"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          required
                          placeholder="Contact Number"
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    {/* Address */}
                    <div className="form-group">
                      <label htmlFor="address" className="form-label">
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="Address"
                      />
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

export default EditTrafficPoliceModal;
