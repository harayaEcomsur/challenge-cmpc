import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookById, deleteBook } from '../api/bookService';
import type { Book } from '../types/book';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const bookId = parseInt(id, 10);
      setLoading(true);
      setError(null);
      getBookById(bookId)
        .then(data => {
          setBook(data);
        })
        .catch(err => {
          console.error("Error al cargar el libro:", err);
          setError(err.response?.data?.message || 'Libro no encontrado o error al cargar.');
        })
        .finally(() => setLoading(false));
    } else {
        setError("ID de libro no proporcionado.");
        setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (book && window.confirm(`¿Estás seguro de que quieres eliminar "${book.title}"?`)) {
      try {
        await deleteBook(book.id);
        alert('Libro eliminado exitosamente.');
        navigate('/books');
      } catch (err: any) {
        console.error("Error al eliminar el libro:", err);
        setError(err.response?.data?.message || 'Error al eliminar el libro.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: '#495057', fontSize: '1.1rem' }}>Cargando detalles del libro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '12px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
        <button
          onClick={() => navigate('/books')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Volver al Listado
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '12px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          Libro no encontrado
        </div>
        <button
          onClick={() => navigate('/books')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Volver al Listado
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Detalles del Libro
        </h1>
        <button
          onClick={() => navigate('/books')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Volver al Listado
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '2rem',
          padding: '2rem'
        }}>
          {/* Imagen del libro */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: '2/3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            {book.imageUrl ? (
              <img 
                src={book.imageUrl} 
                alt={`Portada de ${book.title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                color: '#6c757d',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Sin portada
              </div>
            )}
          </div>

          {/* Detalles del libro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                color: '#333',
                fontWeight: '600'
              }}>
                {book.title}
              </h2>
              <p style={{
                margin: '0',
                color: '#6c757d',
                fontSize: '1.25rem'
              }}>
                por {book.author}
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Editorial
                </h3>
                <p style={{
                  margin: '0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>
                  {book.editorial || 'No especificada'}
                </p>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Género
                </h3>
                <p style={{
                  margin: '0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>
                  {book.genre || 'No especificado'}
                </p>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Precio
                </h3>
                <p style={{
                  margin: '0',
                  color: '#28a745',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}>
                  ${book.price.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Estado
                </h3>
                <span style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  background: book.availability ? '#d4edda' : '#f8d7da',
                  color: book.availability ? '#155724' : '#721c24',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {book.availability ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Añadido
                </h3>
                <p style={{
                  margin: '0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>
                  {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Última actualización
                </h3>
                <p style={{
                  margin: '0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>
                  {book.updatedAt ? new Date(book.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: 'auto'
            }}>
              <Link
                to={`/books/update/${book.id}`}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Editar Libro
              </Link>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Eliminar Libro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS */}
      <style>
        {`
          button:hover, a:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `}
      </style>
    </div>
  );
};

export default BookDetailPage;