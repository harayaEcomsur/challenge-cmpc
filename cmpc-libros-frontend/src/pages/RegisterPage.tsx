import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email inválido')
      .required('El email es requerido'),
    password_clear: Yup.string()
      .required('La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password_clear')], 'Las contraseñas deben coincidir')
      .required('Confirma tu contraseña'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password_clear: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/auth/register', {
          email: values.email,
          password_clear: values.password_clear,
        });
        
        if (response.data) {
          setSuccessMessage('¡Registro exitoso! Redirigiendo al login...');
          setTimeout(() => {
            navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
          }, 2000);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ 
        marginBottom: '2rem',
        fontSize: '2rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        Registro
      </h1>

      {successMessage && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          border: '1px solid #c3e6cb',
          textAlign: 'center'
        }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps('email')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
            {formik.touched.email && formik.errors.email ? (
              <div style={{ color: '#dc3545', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {formik.errors.email}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="password_clear" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Contraseña
            </label>
            <input
              id="password_clear"
              type="password"
              {...formik.getFieldProps('password_clear')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
            {formik.touched.password_clear && formik.errors.password_clear ? (
              <div style={{ color: '#dc3545', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {formik.errors.password_clear}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...formik.getFieldProps('confirmPassword')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div style={{ color: '#dc3545', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {formik.errors.confirmPassword}
              </div>
            ) : null}
          </div>
        </div>

        {error && (
          <div style={{
            color: '#dc3545',
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f8d7da',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            style={{
              padding: '0.75rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              opacity: formik.isSubmitting ? 0.7 : 1
            }}
          >
            {formik.isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
          <Link
            to="/login"
            style={{
              padding: '0.75rem',
              background: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            Volver al Login
          </Link>
        </div>
      </form>

      {/* Estilos CSS */}
      <style>
        {`
          button:hover {
            opacity: 0.9;
          }
          a:hover {
            opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
};

export default RegisterPage; 