import { request } from './http.js';

export function getAlojamientos() {
  return request('/alojamientos');
}

export function getAlojamientoById(id) {
  return request(`/alojamientos/${id}`);
}

export function createAlojamiento(payload) {
  return request('/alojamientos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAlojamiento(id, payload) {
  return request(`/alojamientos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAlojamiento(id) {
  return request(`/alojamientos/${id}`, {
    method: 'DELETE',
  });
}
