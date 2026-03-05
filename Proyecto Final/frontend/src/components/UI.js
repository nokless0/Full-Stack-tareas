// ==================== COMPONENTES DE UI ====================
// Componentes reutilizables de la interfaz

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ==================== ADVERTENCIA DE INACTIVIDAD ====================
// Muestra un mensaje cuando la sesión está por expirar

export function InactivityWarning() {
  const { resetInactivityTimer } = useAuth();
  
  return (
    <div className="inactivity-warning">
      <span>⚠️ Tu sesión expirará en 1 minuto por inactividad.</span>
      <button onClick={resetInactivityTimer}>Seguir activo</button>
    </div>
  );
}

// ==================== RUTA PROTEGIDA ====================
// Redirige a login si el usuario no está autenticado

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Mientras carga, mostrar mensaje
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay usuario, mostrar contenido
  return children;
}

// ==================== RUTA DE ADMIN ====================
// Solo permite acceso a administradores

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/citas" replace />;
  }
  
  return children;
}
