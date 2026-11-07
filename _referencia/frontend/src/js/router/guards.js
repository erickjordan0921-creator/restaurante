import { isAdmin, isAuthenticated } from '../auth/permissions.js';

export function requireAuth(onDenied) {
  if (!isAuthenticated()) {
    onDenied?.('login');
    return false;
  }

  return true;
}

export function requireAdmin(onDenied) {
  if (!isAuthenticated()) {
    onDenied?.('login');
    return false;
  }

  if (!isAdmin()) {
    onDenied?.('forbidden');
    return false;
  }

  return true;
}
