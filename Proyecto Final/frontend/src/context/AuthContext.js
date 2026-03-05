// ==================== CONTEXTO DE AUTENTICACIÓN ====================
// Maneja el estado global del usuario (login, logout, registro)

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';

// Crear contexto vacío
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto en cualquier componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// ==================== CONSTANTES ====================

// Tiempo de inactividad antes de cerrar sesión (5 minutos)
const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos en ms

// ==================== COMPONENTE PROVEEDOR ====================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Usuario actual
  const [loading, setLoading] = useState(true); // Estado de carga
  const [inactivityWarning, setInactivityWarning] = useState(false); // Advertencia
  
  // Referencias para los temporizadores
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // ==================== FUNCIONES DE AUTENTICACIÓN ====================

  // Función para iniciar sesión
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    setUser(res.data.user);
    return res.data;
  };

  // Función para registrar nuevo usuario
  const register = async (nombre, email, password) => {
    const res = await api.post('/auth/register', { nombre, email, password });
    
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    setUser(res.data.user);
    return res.data;
  };

  // Función para cerrar sesión manualmente
  const logout = () => {
    // Limpiar temporizadores
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Eliminar datos de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setInactivityWarning(false);
  };

  // ==================== SISTEMA DE INACTIVIDAD ====================

  // Función para cerrar sesión por inactividad
  const handleInactivityLogout = () => {
    logout();
    // Redirigir usando window.location para evitar problemas con React Router
    window.location.href = '/login';
  };

  // Función para reiniciar el temporizador de inactividad
  const resetInactivityTimer = () => {
    // Limpiar temporizadores anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    setInactivityWarning(false);

    // Mostrar advertencia a los 4 minutos (1 minuto antes de cerrar)
    warningTimeoutRef.current = setTimeout(() => {
      setInactivityWarning(true);
    }, INACTIVITY_TIME - 60000);

    // Cerrar sesión después de 5 minutos de inactividad
    timeoutRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, INACTIVITY_TIME);
  };

  // ==================== EFECTO DE INACTIVIDAD ====================

  // Detectar actividad del usuario y reiniciar temporizador
  useEffect(() => {
    // Si no hay usuario, no hacer nada
    if (!user) return;

    // Eventos que cuentan como actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    // Agregar event listeners
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Iniciar temporizador
    resetInactivityTimer();

    // Limpiar al desmontar o cuando cambie el usuario
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user]);

  // ==================== CARGAR USUARIO AL INICIAR ====================

  // Verificar si hay usuario guardado al cargar la app
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ==================== VALORES DEL CONTEXTO ====================

  const value = {
    user,           // Datos del usuario
    login,          // Función para iniciar sesión
    register,       // Función para registrarse
    logout,         // Función para cerrar sesión
    loading,        // Si está cargando
    inactivityWarning,  // Si mostrar advertencia
    resetInactivityTimer // Reiniciar timer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
