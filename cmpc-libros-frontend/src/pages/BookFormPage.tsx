import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createBook, updateBook, getBookById, deleteBook } from '../api/bookService';
import { toast } from 'react-toastify';

interface FormValues {
  title: string;
  author: string;
  editorial: string;
  genre: string;
  price: string;
  availability: number;
  imageUrl: string;
  imageFile: File | undefined;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required('El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no debe exceder los 100 caracteres'),
  author: Yup.string()
    .required('El autor es requerido')
    .min(3, 'El autor debe tener al menos 3 caracteres')
    .max(100, 'El autor no debe exceder los 100 caracteres'),
  editorial: Yup.string()
    .required('La editorial es requerida')
    .min(3, 'La editorial debe tener al menos 3 caracteres')
    .max(100, 'La editorial no debe exceder los 100 caracteres'),
  genre: Yup.string()
    .required('El género es requerido')
    .min(3, 'El género debe tener al menos 3 caracteres')
    .max(50, 'El género no debe exceder los 50 caracteres'),
  price: Yup.number()
    .required('El precio es requerido')
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(1000000, 'El precio no debe exceder 1,000,000'),
  availability: Yup.number()
    .required('La disponibilidad es requerida')
    .oneOf([0, 1], 'La disponibilidad debe ser 0 o 1'),
  imageUrl: Yup.string()
    .matches(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$|^http:\/\/localhost:\d+\/uploads\/books\/[\w.-]+$|^\/uploads\/books\/[\w.-]+$/,
      'Debe ser una URL válida'
    )
    .nullable(),
  imageFile: Yup.mixed()
    .nullable()
    .test('fileSize', 'El archivo es demasiado grande', (value) => {
      if (!value) return true;
      const file = value as File;
      return file.size <= 5242880; // 5MB
    })
    .test('fileType', 'Formato de archivo no soportado', (value) => {
      if (!value) return true;
      const file = value as File;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    })
});

const BookFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fetchRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    title: '',
    author: '',
    editorial: '',
    genre: '',
    price: '',
    availability: 1,
    imageUrl: '',
    imageFile: undefined as File | undefined
  });

  useEffect(() => {
    const fetchBook = async () => {
      if (id && !fetchRef.current) {
        fetchRef.current = true;
        setLoading(true);
        try {
          const response = await getBookById(Number(id));
          setInitialValues({
            title: response.title,
            author: response.author,
            editorial: response.editorial,
            genre: response.genre,
            price: response.price.toString(),
            availability: response.availability,
            imageUrl: response.imageUrl || '',
            imageFile: undefined
          });
        } catch (error) {
          console.error('Error fetching book:', error);
          toast.error('Error al cargar el libro');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBook();
  }, [id]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const bookData = {
          ...values,
          price: parseFloat(values.price),
          availability: Number(values.availability)
        };

        if (id) {
          await updateBook(parseInt(id), bookData, values.imageFile);
          setSuccessMessage('Libro actualizado exitosamente');
        } else {
          await createBook(bookData, values.imageFile);
          setSuccessMessage('Libro creado exitosamente');
        }

        setTimeout(() => {
          navigate('/books');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al guardar el libro');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteBook(parseInt(id!));
        setSuccessMessage('Libro eliminado exitosamente');
        setTimeout(() => {
          navigate('/books');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar el libro');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('imageFile', file);
      formik.setFieldValue('imageUrl', ''); // Limpiar URL si se sube un archivo
    }
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    formik.setFieldValue('imageUrl', url);
    formik.setFieldValue('imageFile', undefined); // Limpiar archivo si se ingresa URL
  };

  return (
    <div className="container">
      <h1>{id ? 'Editar Libro' : 'Crear Nuevo Libro'}</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      <form onSubmit={formik.handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.title && formik.errors.title ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.title && formik.errors.title && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.title}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="author" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Autor
          </label>
          <input
            id="author"
            name="author"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.author}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.author && formik.errors.author ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.author && formik.errors.author && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.author}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="editorial" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Editorial
          </label>
          <input
            id="editorial"
            name="editorial"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.editorial}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.editorial && formik.errors.editorial ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.editorial && formik.errors.editorial && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.editorial}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="genre" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Género
          </label>
          <input
            id="genre"
            name="genre"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.genre}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.genre && formik.errors.genre ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.genre && formik.errors.genre && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.genre}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.price && formik.errors.price ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.price && formik.errors.price && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.price}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="availability" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Disponibilidad
          </label>
          <select
            id="availability"
            name="availability"
            onChange={(e) => {
              formik.setFieldValue('availability', Number(e.target.value));
            }}
            onBlur={formik.handleBlur}
            value={formik.values.availability}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.availability && formik.errors.availability ? '1px solid red' : '1px solid #ddd'
            }}
          >
            <option value={1}>Disponible</option>
            <option value={0}>No Disponible</option>
          </select>
          {formik.touched.availability && formik.errors.availability && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.availability}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="imageFile" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Imagen del Libro
          </label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.imageFile && formik.errors.imageFile ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.imageFile && formik.errors.imageFile && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.imageFile}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="imageUrl" style={{ display: 'block', marginBottom: '0.5rem' }}>
            URL de la Imagen (alternativa)
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            onChange={handleImageUrlChange}
            onBlur={formik.handleBlur}
            value={formik.values.imageUrl}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: formik.touched.imageUrl && formik.errors.imageUrl ? '1px solid red' : '1px solid #ddd'
            }}
          />
          {formik.touched.imageUrl && formik.errors.imageUrl && (
            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formik.errors.imageUrl}
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/books')}
              style={{
                padding: '0.5rem 1rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
          {id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookFormPage;