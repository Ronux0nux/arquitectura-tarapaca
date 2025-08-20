import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout, canAccess } = useAuth();
  const { notifySuccess } = useNotifications();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    cotizaciones: { total: 0, recientes: 0, pendientes: 0 },
    proveedores: { total: 0, activos: 0, nuevos: 0 },
    proyectos: { total: 0, activos: 0, completados: 0 },
    materiales: { total: 0, stock: 0, agotados: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos del dashboard
    setTimeout(() => {
      setDashboardData({
        cotizaciones: { total: 156, recientes: 12, pendientes: 8 },
        proveedores: { total: 89, activos: 76, nuevos: 5 },
        proyectos: { total: 24, activos: 7, completados: 17 },
        materiales: { total: 342, stock: 298, agotados: 12 }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    logout();
    notifySuccess('Sesión cerrada correctamente', 'Hasta luego');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const quickActions = [
    {
      title: 'Nueva Cotización',
      description: 'Crear una cotización para un cliente',
      icon: '📋',
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/cotizaciones',
      permission: 'cotizaciones'
    },
    {
      title: 'Buscar Proveedor',
      description: 'Encontrar proveedores y contactos',
      icon: '🏢',
      color: 'bg-green-500 hover:bg-green-600',
      path: '/providers',
      permission: 'proveedores'
    },
    {
      title: 'Gestión de Proyectos',
      description: 'Ver y administrar proyectos',
      icon: '🏗️',
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/projects',
      permission: 'proyectos'
    },
    {
      title: 'Reportes',
      description: 'Generar informes y estadísticas',
      icon: '📊',
      color: 'bg-orange-500 hover:bg-orange-600',
      path: '/reports',
      permission: 'reportes'
    }
  ];

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-6 rounded-xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full ${disabled ? 'bg-gray-400' : color} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-gray-400">
          →
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🏗️</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg">{user?.avatar}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar Sesión"
              >
                �
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu sistema de gestión de construcción
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Cotizaciones"
                value={dashboardData.cotizaciones.total}
                subtitle={`${dashboardData.cotizaciones.recientes} nuevas esta semana`}
                icon="📋"
                color="bg-blue-500"
              />
              <StatCard
                title="Proveedores"
                value={dashboardData.proveedores.total}
                subtitle={`${dashboardData.proveedores.activos} activos`}
                icon="🏢"
                color="bg-green-500"
              />
              <StatCard
                title="Proyectos"
                value={dashboardData.proyectos.total}
                subtitle={`${dashboardData.proyectos.activos} en curso`}
                icon="🏗️"
                color="bg-purple-500"
              />
              <StatCard
                title="Materiales"
                value={dashboardData.materiales.total}
                subtitle={`${dashboardData.materiales.stock} en stock`}
                icon="📦"
                color="bg-orange-500"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">⚡ Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                disabled={!canAccess(action.permission)}
                onClick={() => handleNavigate(action.path)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { time: 'Hace 2 horas', action: 'Nueva cotización creada', details: 'Proyecto Villa Los Aromos', icon: '📋', color: 'text-blue-600' },
              { time: 'Hace 5 horas', action: 'Proveedor actualizado', details: 'Constructora del Norte SPA', icon: '🏢', color: 'text-green-600' },
              { time: 'Ayer', action: 'Proyecto completado', details: 'Casa Familiar Iquique', icon: '🏗️', color: 'text-purple-600' },
              { time: 'Hace 2 días', action: 'Material agregado', details: 'Cemento Portland 42.5kg', icon: '📦', color: 'text-orange-600' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`text-xl ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="inline-flex items-center space-x-6">
            <span>📍 Iquique, Chile</span>
            <span>📞 +56 9 1234 5678</span>
            <span>📧 info@tarapaca.cl</span>
          </div>
        </div>
      </main>
    </div>
  );
}
