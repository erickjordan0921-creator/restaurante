import { register } from '../api/auth.api.js';
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

export function RegistroPage() {
  return `
    <section class="container py-5" style="max-width: 520px;">
      <h1 class="mb-4">Crear cuenta</h1>
      <form id="registroForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="correo">Correo</label>
          <input class="form-control" type="email" id="correo" name="correo" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="contrasena">Contraseña</label>
          <input class="form-control" type="password" id="contrasena" name="contrasena" required />
        </div>
        <button class="btn btn-primary" type="submit">Registrarme</button>
        <p class="mt-3 mb-0 text-muted" id="registroMensaje"></p>
        <p class="mt-3 mb-0">
          <a href="#" data-view="login">Ya tengo una cuenta</a>
        </p>
      </form>
    </section>
  `;
}

export function mountRegistroPage({ navigate } = {}) {
  const form = document.querySelector('#registroForm');
  const message = document.querySelector('#registroMensaje');
  let redirectTimer = null;

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }

    const correo = document.querySelector('#correo').value.trim();
    const contrasena = document.querySelector('#contrasena').value.trim();

    try {
      setMessage(message, 'Registrando usuario...', 'muted');
      await register({ correo, contrasena });
      setMessage(message, 'Usuario registrado correctamente. Ahora inicia sesión.', 'success');
      form.reset();
      redirectTimer = window.setTimeout(() => {
        navigate?.('login');
      }, 1200);
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible registrar el usuario.');
      const detailsMessage = getDetailsMessage(apiError.details);
      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });
}
