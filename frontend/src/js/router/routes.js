import { AlertasPage, mountAlertasPage } from '../pages/AlertasPage.js';
import { CocinaPage, mountCocinaPage } from '../pages/CocinaPage.js';
import { InventarioPage, mountInventarioPage } from '../pages/InventarioPage.js';
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { LotesPage, mountLotesPage } from '../pages/LotesPage.js';
import { MesasPage, mountMesasPage } from '../pages/MesasPage.js';
import { PlatosPage, mountPlatosPage } from '../pages/PlatosPage.js';
import { TableroPage, mountTableroPage } from '../pages/TableroPage.js';

/*
 * Cada ruta: path, page (HTML inicial), mount (eventos y carga de datos).
 * `public` = sin sesión. El resto se valida con ROLES[rol].vistas (ver permissions.js).
 * mount puede devolver una función de limpieza (p. ej. detener cronómetros).
 */
const routeList = [
  { path: 'login', aliases: [''], public: true, page: LoginPage, mount: mountLoginPage },
  { path: 'tablero', page: TableroPage, mount: mountTableroPage },
  { path: 'mesas', page: MesasPage, mount: mountMesasPage },
  { path: 'cocina', page: CocinaPage, mount: mountCocinaPage },
  { path: 'platos', page: PlatosPage, mount: mountPlatosPage },
  { path: 'inventario', page: InventarioPage, mount: mountInventarioPage },
  { path: 'lotes', page: LotesPage, mount: mountLotesPage },
  { path: 'alertas', page: AlertasPage, mount: mountAlertasPage },
];

export function normalizeRouteView(view) {
  const normalized = String(view ?? 'login')
    .trim()
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'login';
}

export function getRoute(view) {
  const normalizedView = normalizeRouteView(view);
  const route = routeList.find(
    (item) => item.path === normalizedView || item.aliases?.includes(normalizedView),
  );

  return route ? { ...route } : null;
}
