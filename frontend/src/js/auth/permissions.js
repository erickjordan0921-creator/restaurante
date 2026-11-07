import { getUser, hasSession } from './session.service.js';

/*
 * Solo dos roles, como en SINU:
 *  · vistas  = a qué puede entrar el rol
 *  · pestanas = qué aparece en la barra (las de "proximamente" se muestran en gris)
 */
export const ROLES = {
  admin: {
    nombre: 'Administrador',
    ico: '⚙️',
    vistas: ['tablero', 'mesas', 'cocina', 'platos', 'inventario', 'lotes', 'alertas'],
    pestanas: ['tablero', 'mesas', 'cocina', 'platos', 'inventario', 'lotes', 'mermas', 'reportes', 'caja'],
  },
  // El mesero entra directo al mapa de mesas
  mesero: { nombre: 'Mesero', ico: '🧾', vistas: ['mesas'], pestanas: [] },
};

export const NOMBRES_VISTA = {
  tablero: 'Tablero',
  mesas: 'Mesas',
  cocina: 'Cocina',
  platos: 'Platos y recetas',
  inventario: 'Inventario',
  lotes: 'Lotes',
  mermas: 'Mermas',
  reportes: 'Reportes',
  caja: 'Cierre de caja',
  alertas: 'Alertas',
};

export function getCurrentUser() {
  return getUser();
}

export function getCurrentRole() {
  return getCurrentUser()?.rol ?? null;
}

export function isAuthenticated() {
  return hasSession() && Boolean(getCurrentUser());
}

export function isAdmin() {
  return getCurrentRole() === 'admin';
}

export function canAccessView(view) {
  return Boolean(ROLES[getCurrentRole()]?.vistas.includes(view));
}

/** Vista inicial de cada rol (la primera de su lista). */
export function homeView() {
  return ROLES[getCurrentRole()]?.vistas[0] ?? 'login';
}
