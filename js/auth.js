// ============================
//  BASE de API (evita duplicados)
// ============================
if (!window.__AUTH_BASE__) {
  // 1) Si config.js definió API_BASE_URL (Vercel), usala
  // 2) Si no hay, en local usar localhost:3000. En prod, usar Render.
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const fallback = isLocal ? 'http://localhost:3000' : 'https://turnolibre.onrender.com';

  window.__AUTH_BASE__ = (window.API_BASE_URL && String(window.API_BASE_URL)) || fallback;
}

function apiUrl(path) {
  const base = window.__AUTH_BASE__.replace(/\/+$/, '');
  const p = String(path || '').startsWith('/') ? path : `/${path || ''}`;
  return base + p;
}


// ============================
//  Helpers front
// ============================
function normalizarTelefonoFront(tel) {
  let t = String(tel || '').replace(/\D/g, '');
  if (!t) return '';
  if (!t.startsWith('549')) t = '549' + t;
  return t;
}

async function postJSON(path, body) {
  const url = apiUrl(path);
  // Log para verificar destino
  console.log('POST =>', url);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data = null;
  try { data = await r.json(); } catch (_) { data = {}; }
  return { ok: r.ok, status: r.status, data };
}

// ============================
//  Registro
// ============================
const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre')?.value?.trim() || '';
    const apellido = document.getElementById('apellido')?.value?.trim() || '';
    const telefono = normalizarTelefonoFront(document.getElementById('telefono')?.value || '');
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';

    try {
      const { ok, data } = await postJSON('/registrar', { nombre, apellido, telefono, email, password });
      if (!ok) {
        alert(data?.error || 'No se pudo registrar el usuario.');
        return;
      }
      alert('Registro exitoso. Revisá tu email para verificar la cuenta.');
      window.location.href = 'login.html';
    } catch (err) {
      console.error('❌ Error de red en registro:', err);
      alert('Error de red. Intentá nuevamente.');
    }
  });
}

// ============================
//  Login
// ============================
const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';

    // Ocultar bloque de reenvío en cada intento de login
    const resendBlock = document.getElementById('resend-block');
    const resendMsg = document.getElementById('resend-msg');
    if (resendBlock) resendBlock.style.display = 'none';
    if (resendMsg) resendMsg.textContent = '';

    try {
      const { ok, status, data } = await postJSON('/login', { email, password });

      if (ok) {
        localStorage.setItem('usuarioLogueado', email);
        localStorage.setItem('emailUsuario', email);
        alert('Login exitoso');
        window.location.href = 'index.html';
        return;
      }

      if (status === 403) {
        // Mostrar mensaje de alerta y habilitar el bloque de reenvío
        alert(data?.error || 'Debes verificar tu email antes de iniciar sesión');

        const resendEmail = document.getElementById('resend-email');
        if (resendEmail) resendEmail.value = email;

        if (resendBlock) resendBlock.style.display = 'block';
        return;
      }

      alert(data?.error || 'No se pudo iniciar sesión.');
    } catch (err) {
      console.error('❌ Error de red en login:', err);
      alert('Error de red. Intentá nuevamente.');
    }
  });
}


// ============================
//  Reenviar verificación (solo visible si falta verificar)
// ============================
const btnResend = document.getElementById('btn-resend');
if (btnResend) {
  btnResend.addEventListener('click', async () => {
    const resendEmail = document.getElementById('resend-email');
    const resendMsg = document.getElementById('resend-msg');
    const email = resendEmail?.value?.trim() || '';

    if (!email) {
      if (resendMsg) resendMsg.textContent = 'Ingresá tu email.';
      else alert('Ingresá tu email.');
      return;
    }

    try {
      const { ok, data } = await postJSON('/reenviar-verificacion', { email });
      if (ok) {
        if (resendMsg) resendMsg.textContent = 'Te enviamos un nuevo email de verificación.';
        else alert('Te enviamos un nuevo email de verificación.');
      } else {
        if (resendMsg) resendMsg.textContent = data?.error || 'No se pudo reenviar la verificación.';
        else alert(data?.error || 'No se pudo reenviar la verificación.');
      }
    } catch (err) {
      console.error('❌ Error reenviando verificación:', err);
      if (resendMsg) resendMsg.textContent = 'Error de red. Intentá nuevamente.';
      else alert('Error de red. Intentá nuevamente.');
    }
  });
}
