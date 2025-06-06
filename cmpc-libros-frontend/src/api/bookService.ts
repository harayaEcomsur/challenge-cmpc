import axiosInstance from './axiosInstance';
import type { Book } from '../types/book';

export interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  author?: string;
  editorial?: string;
  availability?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Función auxiliar para transformar los datos del libro
const transformBookData = (book: any): Book => ({
  id: book.id,
  title: book.title,
  author: book.author || '',
  editorial: book.editorial || '',
  genre: book.genre || '',
  price: parseFloat(book.price) || 0,
  availability: book.availability === true ? 1 : book.availability === false ? 0 : Number(book.availability),
  imageUrl: book.imageUrl || '',
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  deletedAt: book.deletedAt
});

// Función auxiliar para crear FormData
const createBookFormData = (book: Partial<Book>, imageFile?: File): FormData => {
  const formData = new FormData();
  
  // Agregar campos del libro
  Object.entries(book).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'image' && key !== 'imageFile' && key !== 'imageUrl') {
      formData.append(key, value.toString());
    }
  });

  // Agregar archivo de imagen si existe
  if (imageFile) {
    formData.append('image', imageFile);
  }

  // Agregar URL de imagen si existe y no hay archivo
  if (book.imageUrl) {
    formData.append('imageUrl', book.imageUrl);
  }

  return formData;
};

export const getBookById = async (id: number): Promise<Book> => {
  const response = await axiosInstance.get(`/books/details/${id}`);
  return transformBookData(response.data.data);
};

export const createBook = async (book: Omit<Book, 'id'>, imageFile?: File): Promise<Book> => {
  const formData = createBookFormData(book, imageFile);
  const response = await axiosInstance.post('/books/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return transformBookData(response.data.data);
};

export const updateBook = async (id: number, book: Partial<Book>, imageFile?: File): Promise<Book> => {
  const formData = createBookFormData(book, imageFile);
  const response = await axiosInstance.patch(`/books/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Asegurarse de que la respuesta incluya la URL de la imagen actualizada
  const updatedBook = transformBookData(response.data.data);
  if (response.data.data.imageUrl) {
    updatedBook.imageUrl = response.data.data.imageUrl;
  }
  
  return updatedBook;
};

export const deleteBook = async (id: number): Promise<void> => {
  const response = await axiosInstance.delete(`/books/remove/${id}`);
  return response.data.data;
};

export const getBooks = async (params: BookFilters): Promise<{ data: { items: Book[]; total: number; page: number; limit: number } }> => {
  // Limpiar parámetros vacíos y transformar el ordenamiento
  const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') {
      if (key === 'sortBy' && params.sortOrder) {
        acc[key] = `${value}:${params.sortOrder}`;
      } else if (key !== 'sortOrder') {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Record<string, any>);

  const response = await axiosInstance.get('/books/list', { params: queryParams });
  
  // Transformar los datos para asegurar tipos correctos y mapear las relaciones
  const books = (response.data.data.items || []).map(transformBookData);

  return {
    data: {
      items: books,
      total: response.data.data.total || 0,
      page: response.data.data.page || 1,
      limit: response.data.data.limit || 10
    }
  };
};

export const getBookExportUrl = (filters: BookFilters): string => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      if (key === 'sortBy' && filters.sortOrder) {
        queryParams.append(key, `${value}:${filters.sortOrder}`);
      } else if (key !== 'sortOrder') {
      queryParams.append(key, value.toString());
      }
    }
  });
  return `/books/export/csv?${queryParams.toString()}`;
}; 