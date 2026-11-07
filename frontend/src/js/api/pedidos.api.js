import { request, send } from './http.js';

export function validarExistencias(items) {
  return send('/pedidos/validar', 'POST', { items });
}

export function createPedido(mesa, items) {
  return send('/pedidos', 'POST', { mesa, items });
}

export function getColaCocina() {
  return request('/pedidos/cocina');
}

export function avanzarPedido(id) {
  return send(`/pedidos/${id}/avanzar`, 'PATCH');
}

export function cancelarPedido(id) {
  return send(`/pedidos/${id}/cancelar`, 'PATCH');
}

export function getMesas() {
  return request('/mesas');
}

export function liberarMesa(numero) {
  return send(`/mesas/${numero}/liberar`, 'POST');
}
