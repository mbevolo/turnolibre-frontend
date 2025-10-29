// ===============================
// Login de Club - TurnoLibre
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login-club');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Completá email y contraseña.');
      return;
    }

    try {
      // Enviamos los datos al backend
      const res = await fetch(`${window.API_BASE_URL}/login-club`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('🔍 Respuesta del backend:', data);

      if (!res.ok) {
        alert(data.error || `Error de login (${res.status})`);
        console.error('❌ Login club falló:', data);
        return;
      }

      // ===========================
      // ✅ Guardar sesión del club
      // ===========================
      if (data.token) {
        localStorage.setItem('clubToken', data.token);
        localStorage.setItem('clubEmail', data.club?.email || email);

        console.log('✅ Club logueado:', data.club?.email || email);
        console.log('📦 Token guardado:', data.token.substring(0, 25) + '...');

        // Redirige al panel una vez guardados los datos
       window.location.href = 'panel-club.html';
      } else {
        alert('Error: no se recibió token del servidor.');
        console.error('Respuesta sin token:', data);
      }
    } catch (err) {
      console.error('❌ Error en login-club:', err);
      alert('No se pudo conectar con el servidor.');
    }
  });
});
