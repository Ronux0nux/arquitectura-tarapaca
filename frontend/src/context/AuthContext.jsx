import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

/**
 * Authentication Context
 * Context principal para manejo de autenticación con base de datos
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas vía AuthService
 * - Fallback: Usuarios locales cuando no hay conexión
 * - Storage: localStorage/sessionStorage según "recordar sesión"
 * 
 * PARA CAMBIAR AUTENTICACIÓN:
 * 1. Modificar AuthService.js para cambiar provider (Google, Facebook, etc.)
 * 2. Actualizar ROLES si cambias estructura de permisos en BD
 * 3. Modificar useEffect de verificación si cambias método de validación
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'online', 'offline', 'checking'

  // ROLES DEFINIDOS EN LA BASE DE DATOS
  // Si cambias los roles en MongoDB, actualizar aquí también
  const ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor', 
    EMPLEADO: 'empleado'
  };

  /**
   * Verificar sesión existente al cargar la aplicación
   * Se ejecuta una vez al montar el componente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Verificando sesión existente...');
      
      try {
        // Verificar si hay token almacenado
        const storedUser = AuthService.getStoredUser();
        const storedToken = AuthService.getStoredToken();
        
        if (storedUser && storedToken) {
          console.log('📱 Token encontrado localmente, restaurando sesión...');
          
          // Restaurar sesión local inmediatamente (no esperes a BD)
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('✅ Sesión restaurada:', storedUser.nombre || storedUser.name);
          
          // Verificar token con la BD EN BACKGROUND (sin bloquear)
          try {
            const verification = await AuthService.verifyToken();
            
            if (verification.valid && verification.user) {
              // Actualizar datos si la BD tiene información más reciente
              setUser(verification.user);
              setConnectionStatus('online');
              console.log('📡 Datos sincronizados con BD');
            } else {
              // Token inválido en BD
              console.warn('⚠️ Token inválido en BD, limpiando sesión');
              await AuthService.logout();
            }
          } catch (error) {
            // Error de conexión con BD - mantener sesión local
            console.warn('⚠️ No se pudo verificar con BD (sin conexión), usando sesión local');
            setConnectionStatus('offline');
          }
        } else {
          console.log('📭 No hay sesión previa');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login con email y contraseña
   * Primero intenta con la BD, luego fallback offline
   */
  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    
    try {
      console.log(`🔐 Intentando login para: ${email}`);
      
      // Llamar al servicio de autenticación
      const result = await AuthService.login(email, password, rememberMe);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Determinar estado de conexión basado en el tipo de login
          if (typeof result.user.id === 'string' && result.user.id.startsWith('offline_')) {
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('online');
          }
        
  console.log('✅ Login exitoso:', result.user.nombre || result.user.name || result.user.email);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.message };
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro de nuevo usuario (solo si está online)
   */
  const register = async (userData) => {
    setIsLoading(true);
    
    try {
      const result = await AuthService.register(userData);
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setConnectionStatus('checking');
      console.log('🚪 Logout completado');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verificar si usuario tiene rol específico o superior
   * NOTA: La jerarquía debe coincidir con la BD
   */
  const hasRole = (requiredRole) => {
    return AuthService.hasRole(user, requiredRole);
  };

  /**
   * Verificar si usuario puede acceder a una funcionalidad
   */
  const canAccess = (feature) => {
    return AuthService.hasPermission(user, feature);
  };

  /**
   * Recuperar contraseña
   */
  const forgotPassword = async (email) => {
    try {
      return await AuthService.forgotPassword(email);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Obtener estado de conexión legible
   */
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'Conectado a la base de datos';
      case 'offline': return 'Modo offline (sin conexión a BD)';
      case 'checking': return 'Verificando conexión...';
      default: return 'Estado desconocido';
    }
  };

  const loginOffline = async (email, password, rememberMe = false) => {
    setIsLoading(true);

    try {
      console.warn('⚠️ Usando autenticación offline (sin BD)');
      const result = await AuthService.loginOffline(email, password, rememberMe);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setConnectionStatus('offline');
        console.log('✅ Login offline exitoso:', result.user.name);
      } else {
        console.error('❌ Error en login offline:', result.message);
      }
      return result;
    } catch (error) {
      console.error('❌ Error en login offline:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Valores del contexto
  const value = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    connectionStatus,
    
    // Acciones
    login,
    loginOffline,
    register,
    logout,
    forgotPassword,
    
    // Verificaciones
    hasRole,
    canAccess,
    
    // Utilidades
    getConnectionStatusText,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
