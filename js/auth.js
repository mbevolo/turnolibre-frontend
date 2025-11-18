// ============================
//  BASE de API (evita duplicados)
// ============================
if (!window.__AUTH_BASE__) {
  // Cambiá window.APP_BASE_URL en el HTML si tu API no está en 192.168.1.106:3000
  window.__AUTH_BASE__ = (window.APP_BASE_URL && String(window.APP_BASE_URL)) || 'https://turnolibre-backend.onrender.com';
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
        // Validar aceptación de términos
    const checkbox = document.getElementById("aceptoTerminos");
    if (!checkbox || !checkbox.checked) {
        alert("Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte.");
        return;
    }


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
// ============================
//  PANEL DEL USUARIO (datos personales)
// ============================
document.addEventListener('DOMContentLoaded', async () => {
  const emailUsuario = localStorage.getItem('usuarioLogueado');
  if (!emailUsuario) return; // Si no está logueado, no hace nada

  const info = document.getElementById('info-usuario');
  if (info) info.textContent = `Estás logueado como: ${emailUsuario}`;

  const btnCerrarSesion = document.getElementById('cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogueado');
      window.location.href = 'login.html';
    });
  }

  // Cargar datos
  const formUsuario = document.getElementById('form-usuario');
  if (formUsuario) {
    try {
      const res = await fetch(`https://turnolibre-backend.onrender.com/usuario/${emailUsuario}`);
      const usuario = await res.json();
      document.getElementById('nombre').value = usuario.nombre || '';
      document.getElementById('apellido').value = usuario.apellido || '';
      document.getElementById('telefono').value = usuario.telefono || '';
      document.getElementById('email').value = usuario.email || '';
    } catch (err) {
      console.error('❌ Error al cargar datos del usuario:', err);
    }

    // Guardar cambios
    formUsuario.addEventListener('submit', async (e) => {
      e.preventDefault();
      const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
      };
      try {
        const res = await fetch(`https://turnolibre-backend.onrender.com/usuario/${emailUsuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
        const result = await res.json();
        alert(result.mensaje || 'Datos actualizados correctamente.');
      } catch (err) {
        console.error('❌ Error al actualizar usuario:', err);
        alert('Error al actualizar los datos.');
      }
    });
  }
});

// ============================
//  MIS RESERVAS (usuario)
// ============================

document.addEventListener('DOMContentLoaded', async () => {
  // Usamos el contenedor que ya tenías en tu HTML
  const contenedor = document.getElementById('reservas-container');
  if (!contenedor) return;

  const email = localStorage.getItem('usuarioLogueado');
  if (!email) {
    contenedor.innerHTML = '<p>Debes iniciar sesión para ver tus reservas.</p>';
    return;
  }

  try {
    const res = await fetch(`https://turnolibre-backend.onrender.com/reservas-usuario/${email}`);
    let reservas = await res.json();

    // 🔸 Separar pendientes (colección Reserva) de confirmadas (colección Turno)
    const pendientes = reservas.filter(r => r.tipo === 'PENDING');
    reservas = reservas.filter(r => r.tipo !== 'PENDING'); // confirmadas

    // 🔸 Helper para manejar fechas en 'YYYY-MM-DD' o 'DD/MM/YYYY'
    const toDate = (f, h) => {
      if (!f || !h) return null;
      if (f.includes('-')) { // AAAA-MM-DD
        const [Y, M, D] = f.split('-').map(Number);
        const [hh, mm] = h.split(':').map(Number);
        return new Date(Y, M - 1, D, hh, mm);
      } else { // DD/MM/AAAA
        const [D, M, Y] = f.split('/').map(Number);
        const [hh, mm] = h.split(':').map(Number);
        return new Date(Y, M - 1, D, hh, mm);
      }
    };

    const ahora = new Date();

    // 🔸 Confirmadas -> separar futuras/pasadas
    const confirmadasFuturas = [];
    const confirmadasPasadas = [];
    reservas.forEach(r => {
      const dt = toDate(r.fecha, r.hora);
      if (dt && dt >= ahora) confirmadasFuturas.push(r);
      else confirmadasPasadas.push(r);
    });

    // 🔸 Pendientes -> también separar por fecha para mostrarlas en Futuras o Pasadas
    const pendientesFuturas = [];
    const pendientesPasadas = [];
    pendientes.forEach(r => {
      const dt = toDate(r.fecha, r.hora);
      if (dt && dt >= ahora) pendientesFuturas.push(r);
      else pendientesPasadas.push(r);
    });

    // 🔸 Ordenar por fecha/hora
    const sortByDate = (a, b) => toDate(a.fecha, a.hora) - toDate(b.fecha, b.hora);
    confirmadasFuturas.sort(sortByDate);
    confirmadasPasadas.sort(sortByDate);
    pendientesFuturas.sort(sortByDate);
    pendientesPasadas.sort(sortByDate);

    // 🔸 Render: sección FUTURAS (confirmadas + pendientes)
    const futuras = [...pendientesFuturas, ...confirmadasFuturas];
    const pasadas = [...pendientesPasadas, ...confirmadasPasadas];

const cardReserva = (r) => {
  const esPendiente = r.tipo === 'PENDING';
  const estadoHtml = esPendiente
    ? `<div class="p-2 bg-warning-subtle border border-warning rounded text-dark">
         ⚠️ <b>Pendiente de confirmación</b><br>
         <small>Confirmá tu reserva desde el correo o reenviá el mail.</small>
       </div>`
    : (r.pagado
        ? `<span class="badge text-bg-success">Pagado</span>`
        : `<span class="badge text-bg-danger">Pendiente de pago</span>`);

      // Botonera
      let botones = '';
     if (esPendiente) {
  botones = `
    <button class="btn btn-sm btn-outline-primary btn-reenviar" data-id="${r._id}">🔁 Reenviar correo</button>
    <button class="btn btn-sm btn-outline-danger ms-2 btn-cancelar-pendiente" data-id="${r._id}">Cancelar</button>
  `;
} else {
  botones = `
    <button class="btn btn-sm btn-danger btn-cancelar" data-id="${r._id}">Cancelar</button>
    ${!r.pagado ? `<button class="btn btn-sm btn-success ms-2 btn-pagar" data-id="${r._id}">Pagar online</button>` : ''}
  `;
}


      // Nombre club + fecha/hora
      const [anio, mes, dia] = r.fecha.includes('-')
        ? r.fecha.split('-')
        : [r.fecha.split('/')[2], r.fecha.split('/')[1], r.fecha.split('/')[0]];
      const fechaBonita = `${dia}/${mes}/${anio}`;

return `
  <div class="card mb-2 shadow-sm ${esPendiente ? 'border-warning-subtle bg-warning-subtle' : ''}">
    <div class="card-body d-flex justify-content-between align-items-center">
 <div>
              <div class="fw-bold">${r.nombreClub || 'Club'}</div>
              <div>📅 ${fechaBonita} — 🕒 ${r.hora}</div>
              <div class="mt-1">${estadoHtml}</div>
            </div>
            <div>${botones}</div>
          </div>
        </div>
      `;
    };

    // 🔸 Armar el HTML final con Futuras y botón para ver Pasadas (como antes)
    const htmlFuturas = futuras.length
      ? futuras.map(cardReserva).join('')
      : `<div class="alert alert-info">No tenés reservas futuras.</div>`;

    const htmlPasadas = pasadas.length
      ? pasadas.map(cardReserva).join('')
      : `<div class="alert alert-secondary">No tenés reservas pasadas.</div>`;

    contenedor.innerHTML = `
      <div id="reservas-futuras">${htmlFuturas}</div>
      <div class="mt-3">
        <button id="toggle-pasadas" class="btn btn-outline-secondary btn-sm">Ver reservas pasadas</button>
      </div>
      <div id="reservas-pasadas" class="mt-3" style="display:none;">
        ${htmlPasadas}
      </div>
    `;

    // 🔸 Toggle “Ver reservas pasadas”
    document.getElementById('toggle-pasadas')?.addEventListener('click', () => {
      const box = document.getElementById('reservas-pasadas');
      const visible = box.style.display !== 'none';
      box.style.display = visible ? 'none' : 'block';
      document.getElementById('toggle-pasadas').textContent = visible ? 'Ver reservas pasadas' : 'Ocultar reservas pasadas';
    });

  } catch (err) {
    console.error('❌ Error al cargar reservas:', err);
    contenedor.innerHTML = '<div class="alert alert-danger">Error al cargar tus reservas.</div>';
  }
});

// 🎯 Acciones de botones (delegadas)
document.addEventListener('click', async (e) => {
  // Reenviar correo de confirmación
  if (e.target.classList.contains('btn-reenviar')) {
    const id = e.target.dataset.id;
    if (!id) return;
    const btn = e.target;
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const res = await fetch(`https://turnolibre-backend.onrender.com/reservas/${id}/reenviar`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      alert(data.mensaje || data.error || 'Correo reenviado correctamente.');
    } catch {
      alert('❌ Error al reenviar correo.');
    } finally {
      btn.disabled = false; btn.textContent = '🔁 Reenviar correo';
    }
  }
// Cancelar reserva pendiente
if (e.target.classList.contains('btn-cancelar-pendiente')) {
  const id = e.target.dataset.id;
  if (!id) return;

  if (!confirm('¿Seguro querés cancelar esta reserva pendiente?')) return;

  try {
    const res = await fetch(`https://turnolibre-backend.onrender.com/reservas/${id}/cancelar`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.mensaje);
      location.reload();
    } else {
      alert(data.error || 'No se pudo cancelar la reserva.');
    }
  } catch (err) {
    alert('❌ Error al cancelar reserva pendiente.');
    console.error(err);
  }
}

  // Cancelar (solo confirmadas)
  if (e.target.classList.contains('btn-cancelar')) {
    const id = e.target.dataset.id;
    if (!id) return;
    if (!confirm('¿Seguro querés cancelar esta reserva?')) return;
    try {
      const res = await fetch(`https://turnolibre-backend.onrender.com/turnos/${id}/cancelar`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        alert(data?.error || 'No se pudo cancelar.');
        return;
      }
      location.reload();
    } catch {
      alert('❌ Error al cancelar.');
    }
  }

  // Pagar online (solo confirmadas no pagadas)
  if (e.target.classList.contains('btn-pagar')) {
    const id = e.target.dataset.id;
    if (!id) return;
    const btn = e.target;
    btn.disabled = true; btn.textContent = 'Generando...';
    try {
      const r = await fetch(`https://turnolibre-backend.onrender.com/generar-link-pago/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await r.json();
      if (!r.ok || !data.pagoUrl) {
        alert(data.error || 'No se pudo generar el link de pago.');
      } else {
        // Abrimos el link de pago directo
        window.open(data.pagoUrl, '_blank');
      }
    } catch {
      alert('❌ Error generando link de pago.');
    } finally {
      btn.disabled = false; btn.textContent = 'Pagar online';
    }
  }
});
