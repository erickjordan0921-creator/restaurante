import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';
import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { AlojamientosPage, mountAlojamientosPage } from '../pages/AlojamientosPage.js';
import { AlojamientoDetallePage, mountAlojamientoDetallePage } from '../pages/AlojamientoDetallePage.js';
import { CrearAlojamientoPage, mountCrearAlojamientoPage } from '../pages/CrearAlojamientoPage.js';
import { EditarAlojamientoPage, mountEditarAlojamientoPage } from '../pages/EditarAlojamientoPage.js';
import { AdminCrearComodidadPage, mountAdminCrearComodidadPage } from '../pages/AdminCrearComodidadPage.js';
import { ComodidadDetallePage, mountComodidadDetallePage } from '../pages/ComodidadDetallePage.js';
import { ComodidadesPage, mountComodidadesPage } from '../pages/ComodidadesPage.js';

function escapeRouteSegment(segment) {
  return String(segment).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRouteMatcher(pattern) {
  const source = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        return `(?<${paramName}>[^/]+)`;
      }

      return escapeRouteSegment(segment);
    })
    .join('/');

  return new RegExp(`^${source}$`);
}

const routeList = [
  {
    path: 'home',
    aliases: [''],
    public: true,
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
  },
  {
    path: 'alojamientos',
    public: true,
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
  },
  {
    path: 'alojamientos/nuevo',
    requiresAuth: true,
    page: CrearAlojamientoPage,
    mount: mountCrearAlojamientoPage,
  },
  {
    path: 'alojamientos/:id/editar',
    requiresAuth: true,
    page: EditarAlojamientoPage,
    mount: mountEditarAlojamientoPage,
  },
  {
    path: 'alojamientos/:id',
    public: true,
    page: AlojamientoDetallePage,
    mount: mountAlojamientoDetallePage,
  },
  {
    path: 'registro',
    public: true,
    page: RegistroPage,
    mount: mountRegistroPage,
  },
  {
    path: 'login',
    public: true,
    page: LoginPage,
    mount: mountLoginPage,
  },
  {
    path: 'perfil',
    requiresAuth: true,
    page: PerfilPage,
    mount: mountPerfilPage,
  },
  {
    path: 'comodidades',
    public: true,
    page: ComodidadesPage,
    mount: mountComodidadesPage,
  },
  {
    path: 'comodidades/:id',
    public: true,
    page: ComodidadDetallePage,
    mount: mountComodidadDetallePage,
  },
  {
    path: 'admin/comodidades/nueva',
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminCrearComodidadPage,
    mount: mountAdminCrearComodidadPage,
  },
  {
    path: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
  },
  {
    path: 'admin-usuarios',
    aliases: ['admin/usuarios'],
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
  },
];

export function normalizeRouteView(view) {
  const normalized = String(view ?? 'home')
    .trim()
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'home';
}

function matchRoute(route, normalizedView) {
  if (route.path === normalizedView || route.aliases?.includes(normalizedView)) {
    return {};
  }

  if (!route.path.includes(':')) {
    return null;
  }

  const matcher = buildRouteMatcher(route.path);
  const match = normalizedView.match(matcher);

  if (!match) {
    return null;
  }

  return match.groups ?? {};
}

export function getRoute(view) {
  const normalizedView = normalizeRouteView(view);

  for (const route of routeList) {
    const params = matchRoute(route, normalizedView);

    if (params === null) {
      continue;
    }

    return {
      ...route,
      path: normalizedView,
      pattern: route.path,
      params,
    };
  }

  return null;
}

export function getRouteList() {
  return routeList.map(({ aliases, ...route }) => route);
}
