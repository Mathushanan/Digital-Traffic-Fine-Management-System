import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

import { MdOutlineUpdate } from "react-icons/md";

const EditStationModal = ({ show, onClose, station, onSave }) => {
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [stationCode, setStationCode] = useState("");
  const [stationAdminBadgeNumber, setStationAdminBadgeNumber] = useState("");

  const districts = [
    { value: "", label: "Select District" },
    { value: "Colombo", label: "Colombo" },
    { value: "Gampaha", label: "Gampaha" },
    { value: "Kalutara", label: "Kalutara" },
    { value: "Kandy", label: "Kandy" },
    { value: "Matale", label: "Matale" },
    { value: "Nuwara_eliya", label: "Nuwara Eliya" },
    { value: "Galle", label: "Galle" },
    { value: "Hambantota", label: "Hambantota" },
    { value: "Matara", label: "Matara" },
    { value: "Jaffna", label: "Jaffna" },
    { value: "Killinochchi", label: "Killinochchi" },
    { value: "Mannar", label: "Mannar" },
    { value: "Mullaitivu", label: "Mullaitivu" },
    { value: "Vavuniya", label: "Vavuniya" },
    { value: "Badulla", label: "Badulla" },
    { value: "Moneragala", label: "Moneragala" },
    { value: "Ratnapura", label: "Ratnapura" },
    { value: "Kegalle", label: "Kegalle" },
    { value: "Puttalam", label: "Puttalam" },
    { value: "Kurunegala", label: "Kurunegala" },
    { value: "Trincomalee", label: "Trincomalee" },
    { value: "Batticaloa", label: "Batticaloa" },
    { value: "Ampara", label: "Ampara" },
    { value: "Polonnaruwa", label: "Polonnaruwa" },
    { value: "Anuradhapura", label: "Anuradhapura" },
  ];

  useEffect(() => {
    if (station) {
      console.log(station);
      setStationName(station.stationName);
      setAddress(station.address);
      setDistrict(station.district);
      setContactNumber(station.contactNumber);
      setEmail(station.email);
      setStationCode(station.stationCode);

      if (station.adminId) {
        setStationAdminBadgeNumber(station.badgeNumber);
      } else {
        setStationAdminBadgeNumber("");
      }
    }
  }, [station]);

  if (!show) return null;

  const handleSave = () => {
    const updatedStation = {
      ...station,
      StationName: stationName,
      Address: address,
      District: district,
      ContactNumber: contactNumber,
      Email: email,
      StationCode: stationCode,
      StationAdminBadgeNumber: stationAdminBadgeNumber,
    };
    onSave(updatedStation);
    onClose();
    console.log(updatedStation);
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
              <div className="container text-start">
                <div
                  className="p-4"
                  style={{ maxWidth: "100%", width: "100%" }}
                >
                  <form>
                    <div className="form-group mb-3 row row-cols-1 row-cols-md-2 g-3">
                      <div className="col">
                        <label htmlFor="stationCode" className="form-label">
                          Station Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="stationCode"
                          value={stationCode}
                          onChange={(e) => setStationCode(e.target.value)}
                          required
                          placeholder="Station Code"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="col">
                        <label htmlFor="stationName" className="form-label">
                          Station Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="stationName"
                          value={stationName}
                          onChange={(e) => setStationName(e.target.value)}
                          required
                          placeholder="Station Name"
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
                    <div className="form-group mb-3">
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

                    {/* District */}
                    <div className="form-group mb-3 text-start position-relative">
                      <label htmlFor="district" className="form-label">
                        District
                      </label>
                      <select
                        className="form-control fs-6 pe-5"
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                        style={{ appearance: "none", color: "#555" }}
                      >
                        {districts.map((district) => (
                          <option key={district.value} value={district.value}>
                            {district.label}
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

                    {/* Station Admin Badge Number */}
                    <div className="form-group mb-3 text-start">
                      <label
                        htmlFor="stationAdminBadgeNumber"
                        className="form-label"
                      >
                        Station Admin Badge Number
                      </label>
                      <input
                        type="number"
                        className="form-control fs-6"
                        id="stationAdminBadgeNumber"
                        value={stationAdminBadgeNumber}
                        onChange={(e) =>
                          setStationAdminBadgeNumber(e.target.value)
                        }
                        required
                        placeholder="Admin Badge Number"
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

export default EditStationModal;
