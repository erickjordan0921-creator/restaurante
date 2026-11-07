import { request, send } from './http.js';

/** Menú con disponibilidad: [{ plato, posibles, disponible, limitante }] */
export function getPlatos() {
  return request('/platos');
}

export function createPlato(payload) {
  return send('/platos', 'POST', payload);
}

export function updatePlato(id, payload) {
  return send(`/platos/${id}`, 'PUT', payload);
}

export function deletePlato(id) {
  return send(`/platos/${id}`, 'DELETE');
}
