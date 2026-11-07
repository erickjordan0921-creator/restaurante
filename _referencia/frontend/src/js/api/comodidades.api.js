import { request } from './http.js';

export function getComodidades() {
  return request('/comodidades');
}

export function getComodidadById(id) {
  return request(`/comodidades/${id}`);
}

export function createComodidad(payload) {
  return request('/comodidades', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAlojamientoComodidades(alojamientoId, comodidadesIds) {
  return request(`/alojamientos/${alojamientoId}/comodidades`, {
    method: 'PATCH',
    body: JSON.stringify({
      comodidades_ids: comodidadesIds,
    }),
  });
}
