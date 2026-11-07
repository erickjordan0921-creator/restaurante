const EXACT_TRANSLATIONS = new Map([
  ['Shorter than minimum length 6.', 'Debe tener al menos 6 caracteres.'],
  ['Missing data for required field.', 'Este campo es obligatorio.'],
  ['Not a valid email address.', 'Ingresa un correo electrónico válido.'],
  ['Field may not be null.', 'Este campo no puede estar vacío.'],
  ['Not a valid integer.', 'Debe ser un número entero válido.'],
  ['Not a valid number.', 'Debe ser un número válido.'],
  ['Unknown field.', 'Este campo no es válido.'],
  ['Invalid input type.', 'El tipo de dato no es válido.'],
  ['Unauthorized', 'No autorizado.'],
  ['Unauthorized.', 'No autorizado.'],
  ['Forbidden', 'No tienes permisos para realizar esta acción.'],
  ['Forbidden.', 'No tienes permisos para realizar esta acción.'],
  ['Not found', 'No encontrado.'],
  ['Not found.', 'No encontrado.'],
  ['Invalid credentials', 'Credenciales inválidas.'],
  ['Invalid credentials.', 'Credenciales inválidas.'],
  ['Something went wrong', 'Ocurrió un error.'],
  ['Something went wrong.', 'Ocurrió un error.'],
  ['Failed to fetch', 'No fue posible conectar con el servidor.'],
  ['NetworkError when attempting to fetch resource.', 'No fue posible conectar con el servidor.'],
  ['Load failed', 'No fue posible conectar con el servidor.'],
]);

const PREFIX_TRANSLATIONS = [
  ['Length must be between', 'La longitud debe estar dentro del rango permitido.'],
  ['Shorter than minimum length', 'No cumple la longitud mínima requerida.'],
  ['Longer than maximum length', 'Supera la longitud máxima permitida.'],
];

const ENGLISH_HINTS = [
  'invalid',
  'missing',
  'required',
  'field',
  'length',
  'value',
  'email',
  'credentials',
  'password',
  'unauthorized',
  'forbidden',
  'not found',
  'failed',
  'error',
  'session',
  'token',
];

export function translateApiMessage(message, fallbackMessage = 'Revisa los datos enviados.') {
  if (typeof message !== 'string') {
    return fallbackMessage;
  }

  const normalized = message.trim();
  if (!normalized) {
    return fallbackMessage;
  }

  const exactTranslation = EXACT_TRANSLATIONS.get(normalized);
  if (exactTranslation) {
    return exactTranslation;
  }

  for (const [prefix, translation] of PREFIX_TRANSLATIONS) {
    if (normalized.startsWith(prefix)) {
      return translation;
    }
  }

  const lowerMessage = normalized.toLowerCase();
  if (ENGLISH_HINTS.some((hint) => lowerMessage.includes(hint))) {
    return fallbackMessage;
  }

  return normalized;
}

function translateValue(value, fallbackMessage) {
  if (typeof value === 'string') {
    return translateApiMessage(value, fallbackMessage);
  }

  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, fallbackMessage));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateValue(item, fallbackMessage)]),
    );
  }

  return value;
}

export function formatApiError(error, fallbackMessage = 'Revisa los datos enviados.') {
  return {
    status: error?.status ?? 0,
    message: translateApiMessage(error?.message, fallbackMessage),
    details: translateValue(error?.details, fallbackMessage),
    data: error?.data ?? null,
  };
}
