import { request } from './http.js';

export function register(payload) {
  return request('/usuarios/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return request('/usuarios/perfil');
}

export function updateProfile(payload) {
  return request('/usuarios/perfil', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
