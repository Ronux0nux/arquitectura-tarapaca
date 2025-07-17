import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Cargar notificaciones desde localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('arquitectura_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('arquitectura_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Tipos de notificaciones predefinidos
  const notifySuccess = (message, title = 'Éxito') => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: '✅'
    });
  };

  const notifyError = (message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: '❌'
    });
  };

  const notifyWarning = (message, title = 'Advertencia') => {
    addNotification({
      type: 'warning',
      title,
      message,
      icon: '⚠️'
    });
  };

  const notifyInfo = (message, title = 'Información') => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: '📢'
    });
  };

  const notifyCotizacion = (message, title = 'Cotización') => {
    addNotification({
      type: 'cotizacion',
      title,
      message,
      icon: '💰'
    });
  };

  const notifyProvider = (message, title = 'Proveedor') => {
    addNotification({
      type: 'provider',
      title,
      message,
      icon: '🏢'
    });
  };

  const value = useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    // Métodos de conveniencia
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyCotizacion,
    notifyProvider
  }), [
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyCotizacion,
    notifyProvider
  ]);

  // Hacer el servicio disponible globalmente
  useEffect(() => {
    window.notificationService = value;
    return () => {
      window.notificationService = null;
    };
  }, [value]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
