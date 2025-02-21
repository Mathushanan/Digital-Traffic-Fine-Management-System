import "@testing-library/jest-dom";
require("@testing-library/jest-dom");

// Polyfill TextEncoder and TextDecoder for Jest
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta.env for Jest
global.importMeta = {
  env: {
    VITE_API_BASE_URL: "http://localhost:3000", // Replace with your actual API base URL
  },
};
