// config.js
(function () {
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  // Local => tu API local | Producción => Render
  window.API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://turnolibre.onrender.com';
  console.log('API BASE (config.js) =>', window.API_BASE_URL);
})();
