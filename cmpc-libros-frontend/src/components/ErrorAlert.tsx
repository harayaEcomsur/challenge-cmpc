import React, { memo } from 'react';
import { Alert, AlertTitle, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ErrorAlertProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = memo(({
  message,
  isOpen,
  onClose,
}) => {
  const handleClose = React.useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  }, [onClose]);

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>Error</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
});

ErrorAlert.displayName = 'ErrorAlert'; 