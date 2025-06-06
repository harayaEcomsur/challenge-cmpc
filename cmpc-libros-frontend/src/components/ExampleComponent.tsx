import React from 'react';
import { Button } from '@mui/material';
import { ErrorAlert } from './ErrorAlert';
import { useErrorHandler } from '../hooks/useErrorHandler';
import axios from 'axios';

export const ExampleComponent: React.FC = () => {
  const { error, handleError, clearError } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      // Simular una llamada a la API que falla
      await axios.get('/api/non-existent-endpoint');
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleApiCall}
      >
        Probar Manejo de Error
      </Button>

      <ErrorAlert
        message={error.message}
        isOpen={error.isError}
        onClose={clearError}
      />
    </div>
  );
}; 