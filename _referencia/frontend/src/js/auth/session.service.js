import { getItem, removeItem, saveItem } from '../utils/storage.js';

const TOKEN_KEY = 'frontend_alojamientos_access_token';
const USER_KEY = 'frontend_alojamientos_user';

export function saveToken(token) {
  saveItem(TOKEN_KEY, token);
}

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function saveUser(user) {
  saveItem(USER_KEY, user);
}

export function getUser() {
  return getItem(USER_KEY);
}

export function saveSession(token, user) {
  saveToken(token);
  saveUser(user);
}

export function clearSession() {
  removeItem(TOKEN_KEY);
  removeItem(USER_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}
