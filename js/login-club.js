document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login-club');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('http://localhost:3000/login-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    // Guarda en localStorage correctamente
                    localStorage.setItem('clubNombre', data.nombre);
                    localStorage.setItem('clubEmail', email);

                    // Redirige al panel
                    window.location.href = 'panel-club.html';
                } else {
                    alert(data.error || 'Error al iniciar sesión');
                }
            } catch (error) {
                console.error('Error al enviar la solicitud:', error);
                alert('Error de red o servidor.');
            }
        });
    }
});
