/* turnolibre-web/config.js */
(function () {
  // Detecta entorno
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  // ✅ URL del backend en producción (Render)
  const PROD_API = 'https://turnolibre-backend.onrender.com'; // <-- reemplazá con tu dominio real

  // Selecciona el backend correcto
  window.API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : PROD_API;

  // Atajo opcional
  window.API = window.API_BASE_URL;

  console.log('🌍 API_BASE_URL:', window.API_BASE_URL);
})();
