import { useState, useCallback, useRef } from 'react';
import { ErrorService } from '../services/error.service';

interface ErrorState {
  message: string;
  isError: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    message: '',
    isError: false,
  });
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleError = useCallback((error: unknown) => {
    const message = ErrorService.handleError(error);
    
    // Limpiar el timer anterior si existe
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setError({
      message,
      isError: true,
    });

    // Establecer nuevo timer
    timerRef.current = setTimeout(() => {
      setError(prev => ({
        ...prev,
        isError: false,
      }));
    }, 5000);
  }, []);

  const clearError = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setError({
      message: '',
      isError: false,
    });
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}; 