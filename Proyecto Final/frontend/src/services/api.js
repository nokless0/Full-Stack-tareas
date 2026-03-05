// ==================== CONFIGURACIÓN DE API ====================
// Este archivo configura axios para comunicarse con el backend

import axios from 'axios';

const API = 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({ baseURL: API });

// Interceptor para agregar token JWT a cada petición
// Se ejecuta automáticamente antes de cada solicitud
api.interceptors.request.use((config) => {
  // Obtener token del localStorage
  const token = localStorage.getItem('token');
  
  // Si existe token, agregarlo al header de autorización
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para manejar errores de respuesta
// Se ejecuta cuando el servidor responde con error
api.interceptors.response.use(
  (response) => response,  // Si todo bien, devolver respuesta
  (error) => {
    // Si el servidor responde con 401 (no autorizado)
    if (error.response?.status === 401) {
      // Cerrar sesión automáticamente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
