import { login } from '../api/auth.api.js';
import { saveSession } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

function getDetailsMessage(details) {
  if (!details) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details.filter(Boolean).join(' ');
  }

  if (typeof details === 'object') {
    return Object.values(details)
      .flat()
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

function setMessage(element, text, tone = 'muted') {
  if (!element) {
    return;
  }

  element.className = `mt-3 mb-0 text-${tone}`;
  element.textContent = text;
}

export function LoginPage() {
  return `
    <section class="container py-5" style="max-width: 520px;">
      <h1 class="mb-4">Iniciar sesión</h1>
      <form id="loginForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="correo">Correo</label>
          <input class="form-control" type="email" id="correo" name="correo" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="contrasena">Contraseña</label>
          <input class="form-control" type="password" id="contrasena" name="contrasena" required />
        </div>
        <button class="btn btn-dark" type="submit">Entrar</button>
        <p class="mt-3 mb-0 text-muted" id="loginMensaje"></p>
        <p class="mt-3 mb-0">
          <a href="#" data-view="registro">Crear una cuenta</a>
        </p>
      </form>
    </section>
  `;
}

export function mountLoginPage({ navigate } = {}) {
  const form = document.querySelector('#loginForm');
  const message = document.querySelector('#loginMensaje');

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const correo = document.querySelector('#correo').value.trim();
    const contrasena = document.querySelector('#contrasena').value.trim();

    try {
      setMessage(message, 'Validando credenciales...', 'muted');
      const response = await login({ correo, contrasena });

      saveSession(response.data.access_token, response.data.usuario);
      setMessage(message, 'Inicio de sesión exitoso.', 'success');
      navigate?.('home');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible iniciar sesión.');
      const detailsMessage = getDetailsMessage(apiError.details);

      if (apiError.status === 401) {
        setMessage(message, apiError.message || 'Credenciales inválidas.', 'danger');
        return;
      }

      if (apiError.status === 400) {
        setMessage(message, detailsMessage || 'Revisa los campos enviados.', 'danger');
        return;
      }

      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });
}
