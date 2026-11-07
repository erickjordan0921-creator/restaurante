import { clearSession, getToken } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

const API_URL = import.meta.env.VITE_API_URL;

function parseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    throw formatApiError(
      {
        status: 0,
        message: cause instanceof Error ? cause.message : 'No fue posible conectar con el servidor.',
        details: null,
        data: null,
      },
      'No fue posible conectar con el servidor.',
    );
  }

  if (response.status === 204) {
    return null;
  }

  const bodyText = await response.text();
  const data = parseBody(bodyText);

  // Token vencido o inválido con sesión abierta: se cierra y main.js vuelve al login
  if (response.status === 401 && token) {
    clearSession();
    window.dispatchEvent(new CustomEvent('sesion-expirada'));
  }

  if (!response.ok) {
    throw formatApiError(
      {
        status: response.status,
        message:
          data?.error?.message ??
          data?.message ??
          data?.detail ??
          data ??
          'Ocurrió un error inesperado.',
        details: data?.error?.details ?? data?.details ?? data?.errors ?? {},
        data,
      },
      'Revisa los datos enviados.',
    );
  }

  return data;
}

/** Atajo para enviar JSON con un método dado. */
export function send(path, method, payload) {
  return request(path, {
    method,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}
