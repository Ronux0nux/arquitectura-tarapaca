import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { isAuthenticated, user, hasRole, canAccess, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Verificar rol si es requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol: <span className="font-medium capitalize">{user?.role}</span>
          </p>
          <p className="text-sm text-gray-500">
            Rol requerido: <span className="font-medium capitalize">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  // Verificar permiso específico si es requerido
  if (requiredPermission && !canAccess(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Función No Disponible</h2>
          <p className="text-gray-600 mb-4">
            Tu rol actual no tiene acceso a esta funcionalidad.
          </p>
          <p className="text-sm text-gray-500">
            Contacta a tu administrador para solicitar acceso.
          </p>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return children;
};

export default ProtectedRoute;
