import { AxiosError } from 'axios';

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export class ErrorService {
  private static readonly ERROR_MESSAGES = {
    NETWORK: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
    AUTH: {
      EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
      INVALID_CREDENTIALS: 'Credenciales inválidas. Por favor, verifique sus datos.',
    },
    VALIDATION: 'Los datos proporcionados no son válidos. Por favor, revise los campos.',
    NOT_FOUND: 'El recurso solicitado no existe.',
    CONFLICT: 'Ya existe un registro con estos datos.',
    SERVER: 'Error interno del servidor. Por favor, intente más tarde.',
    UNKNOWN: 'Ha ocurrido un error inesperado.',
  };

  static handleError(error: unknown): string {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      
      if (apiError) {
        return apiError.message;
      }

      const status = error.response?.status;

      if (this.isNetworkError(error)) {
        return this.ERROR_MESSAGES.NETWORK;
      }

      if (this.isAuthError(error)) {
        if (status === 401) {
          return this.ERROR_MESSAGES.AUTH.EXPIRED;
        }
        if (status === 403) {
          return this.ERROR_MESSAGES.AUTH.UNAUTHORIZED;
        }
        return this.ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      }

      if (this.isValidationError(error)) {
        return this.ERROR_MESSAGES.VALIDATION;
      }

      if (this.isNotFoundError(error)) {
        return this.ERROR_MESSAGES.NOT_FOUND;
      }

      if (this.isConflictError(error)) {
        return this.ERROR_MESSAGES.CONFLICT;
      }

      if (this.isServerError(error)) {
        return this.ERROR_MESSAGES.SERVER;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return this.ERROR_MESSAGES.UNKNOWN;
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof AxiosError && !error.response;
  }

  static isAuthError(error: unknown): boolean {
    return error instanceof AxiosError && 
      (error.response?.status === 401 || error.response?.status === 403);
  }

  static isValidationError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 422;
  }

  static isConflictError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 409;
  }

  static isNotFoundError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 404;
  }

  static isServerError(error: unknown): boolean {
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    return status !== undefined && status >= 500;
  }
} 