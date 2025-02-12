import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";

const ManageStations = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here (e.g., send data to API)
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="p-4" style={{ maxWidth: "600px", width: "100%" }}>
        <h3 className="text-start mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3 text-start">
            <input
              type="email"
              className="form-control fs-6 h-80"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="password"
              className="form-control fs-6 h100z"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          {/* Additional fields from Station model */}
          <div className="form-group mb-3 text-start">
            <input
              type="text"
              className="form-control fs-6"
              id="stationCode"
              value={password}
              onChange={(e) => setStationCode(e.target.value)}
              required
              placeholder="Station Code"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="text"
              className="form-control fs-6"
              id="stationName"
              value={password}
              onChange={(e) => setStationName(e.target.value)}
              required
              placeholder="Station Name"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="text"
              className="form-control fs-6"
              id="address"
              value={password}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Address"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="text"
              className="form-control fs-6"
              id="district"
              value={password}
              onChange={(e) => setDistrict(e.target.value)}
              required
              placeholder="District"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="text"
              className="form-control fs-6"
              id="contactNumber"
              value={password}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              placeholder="Contact Number"
            />
          </div>
          <div className="form-group mb-3 text-start">
            <input
              type="number"
              className="form-control fs-6"
              id="stationAdminId"
              value={password}
              onChange={(e) => setStationAdminId(e.target.value)}
              required
              placeholder="Station Admin ID"
            />
          </div>
          <div className="form-group mb-3">
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
            >
              <FaSignInAlt style={{ marginRight: "8px" }} /> Log In
            </button>
          </div>
          <div className="text-center">
            <a href="#" className="text-muted">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageStations;
