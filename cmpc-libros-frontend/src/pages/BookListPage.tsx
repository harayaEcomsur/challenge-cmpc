import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, getBookExportUrl } from '../api/bookService';
import type { BookFilters } from '../api/bookService';
import type { Book } from '../types/book';
import useDebounce from '../hooks/useDebounce';
import axiosInstance from '../api/axiosInstance';

const INITIAL_LOAD_KEY = 'books_initial_load';

const BookListPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [editorialFilter, setEditorialFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<number | undefined>(undefined);

  // Estado para ordenamiento
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: BookFilters = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        genre: genreFilter,
        author: authorFilter,
        editorial: editorialFilter,
        availability: availabilityFilter,
        sortBy: sortField,
        sortOrder: sortOrder
      };

      const response = await getBooks(filters);
      setBooks(response.data.items);
      setTotalBooks(response.data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    genreFilter,
    authorFilter,
    editorialFilter,
    availabilityFilter,
    sortField,
    sortOrder
  ]);

  // Efecto para manejar cambios en los filtros
  useEffect(() => {
    const shouldResetPage = debouncedSearchTerm !== '' || 
      genreFilter !== '' || 
      authorFilter !== '' || 
      editorialFilter !== '' || 
      availabilityFilter !== undefined || 
      sortField !== 'id' || 
      sortOrder !== 'asc' || 
      itemsPerPage !== 10;

    if (shouldResetPage) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearchTerm,
    genreFilter,
    authorFilter,
    editorialFilter,
    availabilityFilter,
    sortField,
    sortOrder,
    itemsPerPage
  ]);

  // Efecto para la carga inicial y cambios de página
  useEffect(() => {
    const hasInitialLoad = localStorage.getItem(INITIAL_LOAD_KEY);
    
    if (!hasInitialLoad) {
      localStorage.setItem(INITIAL_LOAD_KEY, 'true');
      fetchBooks();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      localStorage.removeItem(INITIAL_LOAD_KEY);
    };
  }, [
    currentPage,
    debouncedSearchTerm,
    genreFilter,
    authorFilter,
    editorialFilter,
    availabilityFilter,
    sortField,
    sortOrder,
    itemsPerPage
  ]);

  const totalPages = Math.ceil(totalBooks / itemsPerPage);

  const handleExport = async () => {
    try {
      const filters: BookFilters = {
        search: debouncedSearchTerm,
        genre: genreFilter,
        author: authorFilter,
        editorial: editorialFilter,
        availability: availabilityFilter,
        sortBy: `${sortField}:${sortOrder}`,
      };
      const url = getBookExportUrl(filters);
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv'
        }
      });
      
      // Crear un blob con la respuesta y el tipo MIME correcto
      const blob = new Blob([response.data], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // Crear un enlace temporal y hacer clic en él
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `libros_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al exportar:', error);
      setError('Error al exportar los libros');
    }
  };

  return (
    <div className="container">
      <h1>Catálogo de Libros</h1>
      
      {/* Contenedor de filtros y selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '2rem',
        background: '#f8f9fa',
        borderRadius: '8px',
      }}>
        {/* Filtros */}
        <div className="filters" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          flex: 1
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Buscar por título, autor, editorial, género..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Filtrar por Género"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Filtrar por Autor"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Filtrar por Editorial"
              value={editorialFilter}
              onChange={(e) => setEditorialFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <select
              value={availabilityFilter === undefined ? '' : availabilityFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setAvailabilityFilter(value === '' ? undefined : Number(value));
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Disponibilidad (Todos)</option>
              <option value="1">Disponible</option>
              <option value="0">No Disponible</option>
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <select
              value={`${sortField}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(':');
                setSortField(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="id:asc">Ordenar por ID (Ascendente)</option>
              <option value="id:desc">Ordenar por ID (Descendente)</option>
              <option value="title:asc">Ordenar por Título (A-Z)</option>
              <option value="title:desc">Ordenar por Título (Z-A)</option>
              <option value="author:asc">Ordenar por Autor (A-Z)</option>
              <option value="author:desc">Ordenar por Autor (Z-A)</option>
              <option value="price:asc">Ordenar por Precio (Menor a Mayor)</option>
              <option value="price:desc">Ordenar por Precio (Mayor a Menor)</option>
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <button 
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Exportar a CSV
            </button>
          </div>
        </div>

        {/* Selector de registros por página */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          width: 'fit-content',
          minWidth: '200px'
        }}>
          <span style={{ color: '#666' }}>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: 'white',
              width: '100%'
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span style={{ color: '#666' }}>registros</span>
        </div>
      </div>

      {/* Mensajes de estado */}
      {loading && <p>Cargando libros...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Lista de libros */}
      {!loading && !error && books && books.length > 0 && (
        <div className="books-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          padding: '1rem 0'
        }}>
          {books.map((book) => (
            <div key={book.id} className="book-card" style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{
                height: '200px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div style="
                          width: 100%;
                          height: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          background: #e9ecef;
                          color: #6c757d;
                          font-size: 0.9em;
                          text-align: center;
                          padding: 1rem;
                        ">
                          <span>Sin imagen disponible</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e9ecef',
                    color: '#6c757d',
                    fontSize: '0.9em',
                    textAlign: 'center',
                    padding: '1rem'
                  }}>
                    <span>Sin imagen disponible</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.2rem',
                  color: '#333',
                  fontWeight: '600'
                }}>
                  {book.title}
                </h3>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  <strong>Autor:</strong> {book.author}
                </p>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  <strong>Editorial:</strong> {book.editorial || 'N/A'}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem'
                }}>
                  <span style={{
                    background: book.availability ? '#e6f4ea' : '#fce8e6',
                    color: book.availability ? '#1e7e34' : '#d32f2f',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {book.availability ? 'Disponible' : 'No disponible'}
                  </span>
                  <span style={{
                    color: '#333',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    ${typeof book.price === 'number' ? book.price.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #eee'
                }}>
                  <Link 
                    to={`/books/details/${book.id}`}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.5rem',
                      background: '#f8f9fa',
                      color: '#333',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                  >
                    Ver detalles
                  </Link>
                  <Link 
                    to={`/books/update/${book.id}`}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.5rem',
                      background: '#007bff',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && !error && totalBooks > 0 && (
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8f9fa',
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === 1 ? '#e9ecef' : '#007bff',
                  color: currentPage === 1 ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Anterior
              </button>
              <span style={{ color: '#666' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage === totalPages ? '#e9ecef' : '#007bff',
                  color: currentPage === totalPages ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay libros */}
      {!loading && !error && (!books || books.length === 0) && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, color: '#666' }}>No se encontraron libros.</p>
        </div>
      )}

      {/* Estilos CSS */}
      <style>
        {`
          .book-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          .btn-secondary:hover {
            background: #e9ecef !important;
          }
          .btn-primary:hover {
            background: #0056b3 !important;
          }
        `}
      </style>
    </div>
  );
};

export default BookListPage;