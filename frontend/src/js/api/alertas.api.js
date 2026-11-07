import { request, send } from './http.js';

export function getAlertas(estado = 'activa') {
  return request(`/alertas?estado=${encodeURIComponent(estado)}`);
}

export function getContadorAlertas() {
  return request('/alertas/contador');
}

export function atenderAlerta(id) {
  return send(`/alertas/${id}/atender`, 'PATCH');
}

export function reactivarAlerta(id) {
  return send(`/alertas/${id}/reactivar`, 'PATCH');
}
