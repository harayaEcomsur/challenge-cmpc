import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookListPage from './pages/BookListPage';
import BookFormPage from './pages/BookFormPage';
import BookDetailPage from './pages/BookDetailPage';
import NotFoundPage from './pages/NotFoundPage'; 
import './styles/main.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
        <Routes>
            {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
            <Route path="/books" element={<BookListPage />} />
            <Route path="/books/new" element={<BookFormPage />} />
              <Route path="/books/update/:id" element={<BookFormPage />} />
              <Route path="/books/details/:id" element={<BookDetailPage />} />
        </Route>

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/books" replace />} />

        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;