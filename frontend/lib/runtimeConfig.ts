const LOCAL_API_URL = 'http://localhost:5000/api/v1';
const LOCAL_SOCKET_URL = 'http://localhost:5000';
const DEPLOYED_API_URL = 'https://safereach-backend-olac.onrender.com/api/v1';
const DEPLOYED_SOCKET_URL = 'https://safereach-backend-olac.onrender.com';

function isLocalBrowser() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

// Vite replaces VITE_* values during deployment. This fallback also keeps a
// deployed build connected when a host has not supplied those variables.
export const apiBaseUrl = import.meta.env.VITE_SAFEREACH_API_URL
  ?? (isLocalBrowser() ? LOCAL_API_URL : DEPLOYED_API_URL);

export const socketBaseUrl = import.meta.env.VITE_SAFEREACH_WS_URL
  ?? (isLocalBrowser() ? LOCAL_SOCKET_URL : DEPLOYED_SOCKET_URL);
