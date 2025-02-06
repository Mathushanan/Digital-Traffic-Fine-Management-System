import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";

const LoginPage = () => {
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

export default LoginPage;
