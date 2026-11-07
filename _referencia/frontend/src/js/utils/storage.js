export function saveItem(key, value) {
  if (value === undefined) {
    removeItem(key);
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key) {
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return storedValue;
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}
