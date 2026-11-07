import { request, send } from './http.js';

export function login(payload) {
  return send('/usuarios/login', 'POST', payload);
}

export function getCurrentUserProfile() {
  return request('/usuarios/yo');
}
