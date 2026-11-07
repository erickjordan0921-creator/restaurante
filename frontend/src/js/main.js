import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { getAlertas, getContadorAlertas } from './api/alertas.api.js';
import { homeView, isAdmin, isAuthenticated } from './auth/permissions.js';
import { clearSession } from './auth/session.service.js';
import { Leyenda, Navbar } from './components/layout/Navbar.js';
import { requireView } from './router/guards.js';
import { getRoute, normalizeRouteView } from './router/routes.js';
import { escapeHtml } from './utils/formatters.js';
import { closeModal, empty, showInfoModal } from './utils/ui.js';

const app = document.querySelector('#app');
let currentView = 'login';
let cleanup = null;

function renderForbiddenPage() {
  return `
    <section class="contenedor">
      <div class="alerta danger">
        <div class="ico">⛔</div>
        <div class="cuerpo">
          <h2 class="h4">No tiene permisos para ver esta sección</h2>
          <p>Su sesión sigue activa, pero esta vista no corresponde a su rol.</p>
          <button class="btn btn-sinu" type="button" data-view="${homeView()}">Volver</button>
        </div>
      </div>
    </section>
  `;
}

function renderShell(pageHtml) {
  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${pageHtml}</main>
    ${Leyenda()}
  `;
}

/** Actualiza todos los contadores de alertas visibles (botón y menú de usuario). */
export async function refreshAlertCount() {
  if (!isAuthenticated()) {
    return;
  }

  try {
    const response = await getContadorAlertas();
    const count = response.data.activas;
    document.querySelectorAll('[data-contador-alertas]').forEach((element) => {
      element.textContent = count;
      element.classList.toggle('cero', count === 0);
    });
  } catch {
    // El contador es informativo: si falla, la vista sigue funcionando
  }
}

function accessDenied(reason) {
  if (reason === 'login') {
    navigate('login');
    return;
  }

  currentView = 'forbidden';
  renderShell(renderForbiddenPage());
}

function render(view = currentView) {
  cleanup?.();
  cleanup = null;
  closeModal();

  let route = getRoute(view);
  const normalized = normalizeRouteView(view);

  // Con sesión abierta, el login redirige a la vista inicial del rol
  if (route?.public && isAuthenticated()) {
    route = getRoute(homeView());
  }

  if (!route) {
    currentView = 'not-found';
    renderShell(`<section class="contenedor">${empty('Página no encontrada.')}</section>`);
    return;
  }

  if (!route.public && !requireView(route.path, accessDenied)) {
    return;
  }

  currentView = route.path;
  if (normalizeRouteView(window.location.hash) !== currentView) {
    history.replaceState(null, '', `#${currentView}`);
  }

  const pageHtml = route.page() ?? '';
  if (route.public) {
    app.innerHTML = pageHtml;
  } else {
    renderShell(pageHtml);
    refreshAlertCount();
  }

  const result = route.mount?.({ navigate, render, view: normalized, refreshAlertCount });
  cleanup = typeof result === 'function' ? result : null;
  window.scrollTo({ top: 0 });
}

export function navigate(view = 'login') {
  render(normalizeRouteView(view));
}

/** Alertas en solo lectura para el Mesero (el Administrador tiene su centro de alertas). */
async function showAlertasModal() {
  try {
    const response = await getAlertas('activa');
    const alertas = response.data;
    showInfoModal(
      `
      <h2>🔔 Alertas activas (${alertas.length})</h2>
      ${
        alertas.length
          ? alertas
              .map(
                (a) => `
            <div class="alerta ${a.severidad}">
              <div class="ico">${a.icono}</div>
              <div class="cuerpo"><b>${escapeHtml(a.titulo)}</b><br />${escapeHtml(a.mensaje)}</div>
            </div>`,
              )
              .join('')
          : empty('✅ No hay alertas activas.')
      }
      <p class="muted">Informe al administrador para que las atienda.</p>
    `,
      { wide: true },
    );
  } catch {
    showInfoModal('<h2>🔔 Alertas</h2><p>No fue posible cargar las alertas.</p>');
  }
}

app.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    navigate(viewLink.dataset.view);
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) {
    return;
  }

  if (actionButton.dataset.action === 'logout') {
    clearSession();
    navigate('login');
  } else if (actionButton.dataset.action === 'alertas') {
    if (isAdmin()) {
      navigate('alertas');
    } else {
      showAlertasModal();
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.querySelector('#modalRaiz [data-cerrable]')) {
    closeModal();
  }
});

window.addEventListener('sesion-expirada', () => navigate('login'));
window.addEventListener('hashchange', () => {
  const view = normalizeRouteView(window.location.hash);
  if (view !== currentView) {
    navigate(view);
  }
});

navigate(window.location.hash || 'login');
