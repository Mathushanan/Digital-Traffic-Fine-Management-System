// jest.setup.js
global.importMeta = {
  env: {
    VITE_API_BASE_URL: "http://localhost:7225/api",
  },
};

// Alternative way to define import.meta.env in Jest
Object.defineProperty(global, "import.meta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:7225/api",
    },
  },
});
