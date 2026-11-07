import { request } from './http.js';

export function getResumenTablero() {
  return request('/tablero/resumen');
}
