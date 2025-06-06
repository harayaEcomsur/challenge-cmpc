import axios from 'axios';
import { ErrorService } from '../services/error.service';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Crear una copia del error para evitar mutaciones
    const errorResponse = { ...error };

    // Manejar errores de autenticación
    if (ErrorService.isAuthError(error)) {
      // Limpiar el token pero no redirigir inmediatamente
      localStorage.removeItem('authToken');
      // Devolver el error para que el componente pueda manejarlo
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar errores de red
    if (ErrorService.isNetworkError(error)) {
      console.error('Error de conexión:', error);
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar errores de validación
    if (ErrorService.isValidationError(error)) {
      const validationErrors = error.response?.data?.message;
      if (Array.isArray(validationErrors)) {
        return Promise.reject(new Error(validationErrors.join('\n')));
      }
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar errores de conflicto
    if (ErrorService.isConflictError(error)) {
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar errores de recurso no encontrado
    if (ErrorService.isNotFoundError(error)) {
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar errores del servidor
    if (ErrorService.isServerError(error)) {
      console.error('Error del servidor:', error);
      return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
    }

    // Manejar otros errores
    return Promise.reject(new Error(ErrorService.handleError(errorResponse)));
  }
);

export default axiosInstance;