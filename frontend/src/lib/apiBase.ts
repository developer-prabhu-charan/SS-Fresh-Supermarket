// src/lib/apiBase.ts

// Dynamically pick API base URL depending on environment
const API_BASE_URL =
  // 1. Use Vite environment variable if defined
  import.meta.env.VITE_API_URL ||
  // 2. Fallback to localhost during development
  "http://localhost:5000";

export default API_BASE_URL;
