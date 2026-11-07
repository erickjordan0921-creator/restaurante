import logoUrl from '../../../assets/logo-sinu.jpg';
import { getCurrentUser, isAdmin, NOMBRES_VISTA, ROLES } from '../../auth/permissions.js';
import { escapeHtml } from '../../utils/formatters.js';

const PROXIMAMENTE = 'Función próximamente disponible';

function tabButton(view, currentView, enabledViews) {
  const label = NOMBRES_VISTA[view];

  if (!enabledViews.includes(view)) {
    return `<button type="button" disabled title="${PROXIMAMENTE}">${label}</button>`;
  }

  const active = view === currentView ? 'activa' : '';
  return `<button type="button" class="${active}" data-view="${view}">${label}</button>`;
}

function menuItem({ action, ico, text, badge = false, soon = false }) {
  if (soon) {
    return `
      <li><span class="dropdown-item disabled" aria-disabled="true" title="${PROXIMAMENTE}">
        <span aria-hidden="true">${ico}</span>${text}<span class="prox">Próximamente</span>
      </span></li>`;
  }

  return `
    <li><button class="dropdown-item" type="button" data-action="${action}">
      <span aria-hidden="true">${ico}</span>${text}
      ${badge ? '<span class="badge-alertas cero" data-contador-alertas>0</span>' : ''}
    </button></li>`;
}

/** Encabezado SINU: logo, marca, menú de usuario con alertas y pestañas del rol. */
export function Navbar(currentView) {
  const user = getCurrentUser();
  const role = ROLES[user?.rol];

  if (!user || !role) {
    return '';
  }

  const items = [
    { action: 'alertas', ico: '🔔', text: 'Alertas', badge: true },
    ...(isAdmin() ? [{ ico: '💾', text: 'Respaldo y datos', soon: true }] : []),
    { ico: '👤', text: 'Mi perfil', soon: true },
    { ico: '🔑', text: 'Cambiar contraseña', soon: true },
  ];

  return `
    <header class="barra">
      <div class="barra-sup">
        <img src="${logoUrl}" alt="Logo Gastrobar Sinu" />
        <div class="marca">Sinu Control<small>Gastrobar · Bello</small></div>
        <div class="flex-grow-1"></div>
        <div class="dropdown">
          <button class="btn btn-sinu btn-usuario dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" title="Menú de usuario">
            <span aria-hidden="true">${role.ico}</span>${escapeHtml(role.nombre)}
            <span class="badge-alertas cero" data-contador-alertas aria-label="alertas activas">0</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end menu-usuario">
            <li class="menu-cab"><b>${escapeHtml(user.nombre)}</b><br /><small>Usuario: ${escapeHtml(user.usuario)}</small></li>
            ${items.map(menuItem).join('')}
            <li><hr class="dropdown-divider" /></li>
            <li><button class="dropdown-item salir" type="button" data-action="logout">
              <span aria-hidden="true">⎋</span>Cerrar sesión
            </button></li>
          </ul>
        </div>
      </div>
      ${
        role.pestanas.length
          ? `<nav class="tabs" aria-label="Secciones">${role.pestanas
              .map((view) => tabButton(view, currentView, role.vistas))
              .join('')}</nav>`
          : ''
      }
    </header>
  `;
}

export function Leyenda() {
  return `
    <footer class="leyenda-botones" aria-label="Leyenda de botones">
      <span><span class="muestra muestra-on"></span>Dorado: acción disponible</span>
      <span><span class="muestra muestra-off"></span>Gris: no disponible o próximamente (pase el cursor para ver el motivo)</span>
      <span><span class="muestra muestra-peligro"></span>Rojo: acción destructiva (pide confirmación)</span>
    </footer>
  `;
}
