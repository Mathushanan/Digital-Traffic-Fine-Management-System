import React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const verifyJwtToken = async () => {
  const token = localStorage.getItem("authToken");
  try {
    const decodedToken = jwtDecode(token);

    // Check for expiration
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      return null;
    }
    const issuer = decodedToken.iss;
    const audience = decodedToken.aud;

    if (
      issuer !== `${import.meta.env.VITE_JWT_ISSUER}` ||
      audience !== `${import.meta.env.VITE_JWT_AUDIENCE}`
    ) {
      return null;
    } else {
      const verificationUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/validate-jwt-token`;
      const response = await axios.post(
        verificationUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        return null;
      } else {
        return response.data.userType;
      }
    }
  } catch (error) {
    console.error(
      "Error validating token:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

export default verifyJwtToken;
