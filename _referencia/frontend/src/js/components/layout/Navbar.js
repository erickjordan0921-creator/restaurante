import { getCurrentUser, isAdmin, isAuthenticated } from '../../auth/permissions.js';

function isAdminRoute(currentView) {
  return currentView === 'admin' || currentView === 'admin-usuarios' || currentView.startsWith('admin/');
}

function isViewActive(view, currentView) {
  if (view === 'admin') {
    return isAdminRoute(currentView);
  }

  if (view === 'alojamientos') {
    return currentView === 'alojamientos' || currentView.startsWith('alojamientos/');
  }

  if (view === 'comodidades') {
    return currentView === 'comodidades' || currentView.startsWith('comodidades/');
  }

  return currentView === view;
}

function navLink(view, label, currentView) {
  const activeClass = isViewActive(view, currentView) ? 'active fw-semibold' : '';

  return `
    <li class="nav-item">
      <a class="nav-link ${activeClass}" href="#" data-view="${view}">${label}</a>
    </li>
  `;
}

function navDropdown(user, currentView) {
  const toggleClass = isViewActive('perfil', currentView) ? 'active fw-semibold' : '';
  const label = user?.correo?.trim() || 'Mi cuenta';

  return `
    <li class="nav-item dropdown">
      <button
        class="btn btn-outline-light dropdown-toggle ${toggleClass}"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ${label}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <a class="dropdown-item ${isViewActive('perfil', currentView) ? 'active' : ''}" href="#" data-view="perfil">
            Perfil
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item" type="button" data-action="logout">
            Cerrar sesión
          </button>
        </li>
      </ul>
    </li>
  `;
}

export function Navbar(currentView = 'home') {
  const user = getCurrentUser();
  const loggedIn = isAuthenticated();

  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-semibold" href="#" data-view="home">Alojamientos</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            ${navLink('home', 'Inicio', currentView)}
            ${navLink('comodidades', 'Comodidades', currentView)}
            ${
              loggedIn
                ? `
                  ${isAdmin() ? navLink('admin', 'Usuarios', currentView) : ''}
                  ${navDropdown(user, currentView)}
                `
                : `
                  ${navLink('login', 'Login', currentView)}
                  ${navLink('registro', 'Registro', currentView)}
                `
            }
          </ul>
        </div>
      </div>
    </nav>
  `;
}
