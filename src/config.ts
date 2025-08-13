const isDevelopment = import.meta.env.DEV ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:8080/api'
  : 'https://believable-alignment-production.up.railway.app/api';

export const SOCKET_URL = isDevelopment
  ? 'http://localhost:5002'
  : 'https://believable-alignment-production.up.railway.app';

export { isDevelopment };
