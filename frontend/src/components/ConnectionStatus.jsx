import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';

/**
 * Componente que muestra el estado de conexión con el backend
 * Se refresca cada 10 segundos
 */
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const checkConnection = async () => {
    try {
      const isHealthy = await ApiService.checkBackendHealth();
      setIsOnline(isHealthy);

      if (!isHealthy) {
        setShowWarning(true);
      }
    } catch (error) {
      setIsOnline(false);
      setShowWarning(true);
    }
  };

  const handleOnline = React.useCallback(() => {
    console.log('📡 Conexión de red restaurada');
    setIsOnline(true);
    setShowWarning(false);
    checkConnection();
  }, []);

  const handleOffline = React.useCallback(() => {
    console.log('📡 Sin conexión de red');
    setIsOnline(false);
    setShowWarning(true);
  }, []);

  useEffect(() => {
    // Verificar conexión inmediatamente
    checkConnection();

    // Verificar conexión cada 10 segundos
    const interval = setInterval(checkConnection, 10000);

    // Escuchar eventos de conexión del navegador
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  if (!showWarning) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 text-white font-medium flex items-center justify-between ${
        isOnline
          ? 'bg-yellow-500 border-t-2 border-yellow-600'
          : 'bg-red-600 border-t-2 border-red-700'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <span className="animate-spin">⚡</span>
            <span>Reconectando con el servidor...</span>
          </>
        ) : (
          <>
            <span>❌</span>
            <span>Sin conexión con el servidor</span>
          </>
        )}
      </div>
      <button
        onClick={() => checkConnection()}
        className="px-3 py-1 bg-white text-gray-800 rounded hover:bg-gray-100 text-sm font-bold"
      >
        Reintentar
      </button>
    </div>
  );
};

export default ConnectionStatus;
