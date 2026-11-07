import logoUrl from '../../assets/logo-sinu.jpg';
import { login } from '../api/auth.api.js';
import { saveSession } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

export function LoginPage() {
  return `
    <section class="pantalla-login">
      <div class="login-caja">
        <img class="login-logo" src="${logoUrl}" alt="Logo Gastrobar Sinu" />
        <div class="login-titulo">SINU CONTROL</div>
        <div class="login-sub">Pedidos, cocina e inventario por lotes · Gastrobar Sinu, Bello</div>
        <div class="roles" role="group" aria-label="Seleccione su rol">
          <button type="button" class="rol-card" data-usuario="admin" aria-pressed="false">
            <span class="ico">⚙️</span><span class="nom">Administrador</span><small>Gestión completa</small>
          </button>
          <button type="button" class="rol-card" data-usuario="mesero" aria-pressed="false">
            <span class="ico">🧾</span><span class="nom">Mesero</span><small>Toma de pedidos</small>
          </button>
        </div>
        <form class="login-form" id="loginForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="loginUsuario">Usuario</label>
            <input class="form-control" id="loginUsuario" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" />
          </div>
          <div class="mb-2">
            <label class="form-label" for="loginClave">Contraseña</label>
            <input class="form-control" id="loginClave" type="password" autocomplete="current-password" />
          </div>
          <div class="msg-error text-center mb-2" id="loginError" role="alert"></div>
          <button class="btn btn-sinu xl w-100" type="submit" id="btnIngresar">Ingresar</button>
        </form>
        <p class="muted small mt-3">Los datos se guardan en el servidor de Sinu Control (API).</p>
      </div>
    </section>
  `;
}

export function mountLoginPage({ navigate } = {}) {
  const form = document.querySelector('#loginForm');
  const usuario = document.querySelector('#loginUsuario');
  const clave = document.querySelector('#loginClave');
  const error = document.querySelector('#loginError');
  const boton = document.querySelector('#btnIngresar');
  const tarjetas = document.querySelectorAll('.rol-card');

  // Selección rápida de rol: rellena el usuario y pasa el foco a la contraseña
  tarjetas.forEach((card) => {
    card.addEventListener('click', () => {
      tarjetas.forEach((other) => {
        const selected = other === card;
        other.classList.toggle('sel', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      usuario.value = card.dataset.usuario;
      error.textContent = '';
      clave.focus();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!usuario.value.trim() || !clave.value) {
      error.textContent = 'Escriba usuario y contraseña.';
      return;
    }

    boton.disabled = true;
    try {
      const response = await login({
        usuario: usuario.value.trim().toLowerCase(),
        contrasena: clave.value,
      });
      saveSession(response.data.access_token, response.data.usuario);
      navigate?.('login'); // el router redirige a la vista inicial del rol
    } catch (apiError) {
      const formatted = formatApiError(apiError, 'No fue posible iniciar sesión.');
      error.textContent =
        formatted.status === 401 ? 'Usuario o contraseña incorrectos.' : formatted.message;
      clave.value = '';
      clave.focus();
    } finally {
      boton.disabled = false;
    }
  });

  setTimeout(() => usuario.focus(), 50);
}
