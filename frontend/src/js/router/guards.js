import { canAccessView, isAuthenticated } from '../auth/permissions.js';

export function requireAuth(onDenied) {
  if (!isAuthenticated()) {
    onDenied?.('login');
    return false;
  }

  return true;
}

/** Exige sesión y que el rol tenga permitida la vista (ROLES[rol].vistas). */
export function requireView(view, onDenied) {
  if (!requireAuth(onDenied)) {
    return false;
  }

  if (!canAccessView(view)) {
    onDenied?.('forbidden');
    return false;
  }

  return true;
}
