// config.js
window.API_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL)
    ? process.env.API_BASE_URL
    : (window.API_BASE_URL || 'http://localhost:3000');
