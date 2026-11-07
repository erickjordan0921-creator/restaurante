import { getUsuarios } from '../api/admin.api.js';
import { clearSession } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('es-CO');
}

function renderUsuariosTable(usuarios) {
  return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Correo</th>
            <th scope="col">Rol</th>
            <th scope="col">Creación</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios
            .map(
              (usuario) => `
                <tr>
                  <td>${usuario.id ?? '—'}</td>
                  <td>${usuario.correo ?? '—'}</td>
                  <td>${usuario.rol ?? 'usuario'}</td>
                  <td>${formatDate(usuario.fecha_creacion)}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStateMessage(type, message) {
  return `
    <div class="alert alert-${type} mb-0" role="alert">
      ${message}
    </div>
  `;
}

export function AdminUsuariosPage() {
  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Usuarios</h1>
          <p class="text-muted mb-0">
            Consulta el listado de usuarios registrados en la plataforma.
          </p>
        </div>
      </div>

      <div id="adminUsuariosState" class="text-muted">Cargando usuarios...</div>
    </section>
  `;
}

export function mountAdminUsuariosPage({ navigate } = {}) {
  const state = document.querySelector('#adminUsuariosState');

  if (!state) {
    return;
  }

  async function cargarUsuarios() {
    try {
      state.innerHTML = renderStateMessage('secondary', 'Cargando usuarios...');
      const response = await getUsuarios();
      const usuarios = Array.isArray(response?.data) ? response.data : [];

      if (!usuarios.length) {
        state.innerHTML = renderStateMessage('info', 'No hay usuarios para mostrar.');
        return;
      }

      state.innerHTML = renderUsuariosTable(usuarios);
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar los usuarios.');

      if (apiError.status === 401) {
        clearSession();
        state.innerHTML = renderStateMessage('warning', 'Tu sesión expiró. Inicia sesión nuevamente.');
        navigate?.('login');
        return;
      }

      if (apiError.status === 403) {
        state.innerHTML = renderStateMessage('danger', 'No tienes permisos para ver esta sección.');
        return;
      }

      state.innerHTML = renderStateMessage(
        'danger',
        apiError.message,
      );
    }
  }

  cargarUsuarios();
}
