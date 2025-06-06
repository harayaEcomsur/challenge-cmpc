import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );

  // Limpiar el mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email inválido')
      .required('El email es requerido'),
    password_clear: Yup.string()
      .required('La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password_clear: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/auth/login', values);
        if (response.data.data?.access_token) {
          login(response.data.data.access_token);
          navigate('/books');
        } else {
          setError('Error al iniciar sesión: Token no recibido');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al iniciar sesión');
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
        Iniciar Sesión
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
            {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
          <Link
            to="/register"
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
            Registrarse
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

export default LoginPage;