import { request } from './http.js';

export function getUsuarios() {
  return request('/admin/usuarios');
}
