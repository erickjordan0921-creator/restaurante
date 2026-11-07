import { createAlojamiento } from '../api/alojamientos.api.js';
import { AlojamientoForm } from '../components/alojamientos/AlojamientoForm.js';
import { clearSession } from '../auth/session.service.js';
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

function setMessage(text, tone = 'muted') {
  const message = document.querySelector('#alojamientoMensaje');
  if (!message) {
    return;
  }

  message.className = `mt-3 mb-0 text-${tone}`;
  message.textContent = text;
}

export function CrearAlojamientoPage() {
  return `
    <section class="container py-5" style="max-width: 860px;">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Nuevo alojamiento</h1>
          <p class="text-muted mb-0">
            Completa los datos básicos para crear un alojamiento nuevo.
          </p>
        </div>
        <a class="btn btn-outline-secondary" href="#" data-view="alojamientos">
          Volver
        </a>
      </div>
      ${AlojamientoForm({ submitLabel: 'Crear' })}
    </section>
  `;
}

export function mountCrearAlojamientoPage({ navigate } = {}) {
  const form = document.querySelector('#alojamientoForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.querySelector('#titulo').value.trim();
    const descripcion = document.querySelector('#descripcion').value.trim();
    const precio_noche = Number(document.querySelector('#precio_noche').value);
    const ciudad = document.querySelector('#ciudad').value.trim();

    try {
      setMessage('Creando alojamiento...', 'muted');
      const response = await createAlojamiento({
        titulo,
        descripcion,
        precio_noche,
        ciudad,
      });

      const alojamientoId = response?.data?.id;
      if (alojamientoId) {
        navigate?.(`alojamientos/${alojamientoId}`);
        return;
      }

      navigate?.('alojamientos');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible crear el alojamiento.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('login');
        return;
      }

      if (apiError.status === 400) {
        setMessage(
          getDetailsMessage(apiError.details) || 'Revisa los campos enviados.',
          'danger',
        );
        return;
      }

      if (apiError.status === 403) {
        setMessage('No tienes permisos para crear un alojamiento.', 'danger');
        return;
      }

      setMessage(apiError.message, 'danger');
    }
  });
}
