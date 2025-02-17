import React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const verifyJwtToken = (token) => {
  if (token) {
    console.log("executed!");
    try {
      const decodedToken = jwtDecode(token);

      // Check for expiration
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        return { valid: false, userType: null, stateMessage: "JWT Expired!" };
      }
      const issuer = decodedToken.iss;
      const audience = decodedToken.aud;

      if (
        issuer !== `${import.meta.env.VITE_JWT_ISSUER}` ||
        audience !== `${import.meta.env.VITE_JWT_AUDIENCE}`
      ) {
        return {
          valid: false,
          userType: null,
          stateMessage: "You are blocked for this site!",
        };
      } else {
        return {
          valid: true,
          userType: decodedToken.UserType,
          stateMessage: "User successfully verified!",
        };
      }
    } catch (error) {
      console.error(
        "Error validating token:",
        error.response ? error.response.data : error.message
      );
      return {
        valid: false,
        userType: null,
        stateMessage: "Error validating token!",
      };
    }
  } else {
    return {
      valid: false,
      userType: null,
      stateMessage: "Token not found!",
    };
  }
};

export default verifyJwtToken;
