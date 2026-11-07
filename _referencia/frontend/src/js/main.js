import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { clearSession } from './auth/session.service.js';
import { Navbar } from './components/layout/Navbar.js';
import { requireAdmin, requireAuth } from './router/guards.js';
import { getRoute, normalizeRouteView } from './router/routes.js';

const app = document.querySelector('#app');
let currentView = 'home';

function renderForbiddenPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="alert alert-danger shadow-sm border-0" role="alert">
            <div class="d-flex align-items-start gap-3">
              <i class="bi bi-shield-exclamation fs-1"></i>
              <div>
                <h1 class="h4 mb-2">No tienes permisos para ver esta sección</h1>
                <p class="mb-3">
                  Tu sesión sigue activa, pero esta vista requiere permisos de administrador.
                </p>
                <a class="btn btn-outline-light" href="#" data-view="home">
                  Volver
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotFoundPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h1 class="h3 mb-3">Página no encontrada</h1>
              <p class="text-muted mb-4">
                La ruta solicitada no está disponible en esta SPA.
              </p>
              <a class="btn btn-primary" href="#" data-view="home">Ir al inicio</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAccessDenied(reason) {
  if (reason === 'login') {
    navigate('login');
    return;
  }

  currentView = 'forbidden';
  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${renderForbiddenPage()}</main>
  `;
}

function render(view = currentView) {
  const route = getRoute(view);

  if (!route) {
    currentView = 'not-found';
    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">${renderNotFoundPage()}</main>
    `;
    return;
  }

  if (route.requiresAdmin) {
    if (!requireAdmin(renderAccessDenied)) {
      return;
    }
  } else if (route.requiresAuth) {
    if (!requireAuth(renderAccessDenied)) {
      return;
    }
  }

  currentView = route.path;

  const pageHtml = route.page(route.params) ?? '';

  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${pageHtml}</main>
  `;

  route.mount?.({ navigate, render, params: route.params, view: currentView });
}

function navigate(view = 'home') {
  render(normalizeRouteView(view));
}

app.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    navigate(viewLink.dataset.view);
    return;
  }

  const logoutButton = event.target.closest('[data-action="logout"]');
  if (logoutButton) {
    clearSession();
    navigate('home');
  }
});

navigate(currentView);
