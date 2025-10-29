/* turnolibre-web/config.js */
(function () {
  // Detecta si corre en localhost; si no, usa el dominio que definas
  const isLocal = /^(localhost|127\.0\.0\.1)/.test(location.hostname);

  // ⚠️ Cambiá SOLO esta línea cuando subas a producción:
  const PROD_API = 'https://TU-BACKEND.onrender.com';

  window.API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : PROD_API;

  // Atajo opcional (para escribir menos en tus JS)
  window.API = window.API_BASE_URL;
})();
