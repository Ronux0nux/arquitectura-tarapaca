import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import providerService from '../services/ProviderService';
import backupService from '../services/BackupService';
import aiService from '../services/AIService';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('notificaciones');
  const [backupList, setBackupList] = useState([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    loadBackupList();
    checkAutoBackupStatus();
    updateStorageSize();
  }, []);

  const loadBackupList = async () => {
    const result = await backupService.getBackupList();
    if (result.success) {
      setBackupList(result.backups);
    }
  };

  const checkAutoBackupStatus = () => {
    const config = localStorage.getItem('autoBackupConfig');
    setAutoBackupEnabled(!!config);
  };

  const updateStorageSize = () => {
    const size = backupService.getStorageSize();
    setStorageSize(size);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    const result = await backupService.createBackup();
    if (result.success) {
      notifySuccess('Backup creado exitosamente');
      loadBackupList();
    } else {
      notifyError(`Error al crear backup: ${result.error}`);
    }
    setLoading(false);
  };

  const handleRestoreBackup = async (backupId) => {
    setLoading(true);
    const result = await backupService.restoreBackup(backupId);
    if (result.success) {
      notifySuccess('Backup restaurado exitosamente');
      window.location.reload(); // Recargar para mostrar datos restaurados
    } else {
      notifyError(`Error al restaurar backup: ${result.error}`);
    }
    setLoading(false);
  };

  const handleToggleAutoBackup = async () => {
    if (autoBackupEnabled) {
      backupService.disableAutoBackup();
      setAutoBackupEnabled(false);
      notifyInfo('Backup automático desactivado');
    } else {
      const result = await backupService.setupAutoBackup(24);
      if (result.success) {
        setAutoBackupEnabled(true);
        notifySuccess('Backup automático activado (cada 24 horas)');
      } else {
        notifyError('Error al activar backup automático');
      }
    }
  };

  const handleExportData = () => {
    backupService.exportData();
    notifySuccess('Datos exportados exitosamente');
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const result = await backupService.importData(file);
        if (result.success) {
          notifySuccess('Datos importados exitosamente');
          window.location.reload();
        } else {
          notifyError(`Error al importar datos: ${result.error}`);
        }
      } catch (error) {
        notifyError(`Error al importar datos: ${error.message}`);
      }
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setLoading(true);
    const result = await backupService.syncData();
    if (result.success) {
      notifySuccess('Datos sincronizados exitosamente');
      if (result.conflicts.length > 0) {
        notifyInfo(`Se encontraron ${result.conflicts.length} conflictos`);
      }
    } else {
      notifyError(`Error al sincronizar datos: ${result.error}`);
    }
    setLoading(false);
  };

  const handleSetupAIAutomation = async (type) => {
    setLoading(true);
    const result = await aiService.setupAutomation(type, {});
    if (result.success) {
      notifySuccess(`Automatización ${type} configurada exitosamente`);
    } else {
      notifyError(`Error al configurar automatización: ${result.error}`);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'notificaciones', label: '🔔 Notificaciones', icon: '🔔' },
    { id: 'proveedores', label: '🏢 Proveedores', icon: '🏢' },
    { id: 'backup', label: '💾 Backup & Sync', icon: '💾' },
    { id: 'ai', label: '🤖 IA & Automatización', icon: '🤖' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Configuración del Sistema</h1>
        <p className="text-gray-600">Gestiona notificaciones, proveedores, backups y automatizaciones</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Notificaciones */}
        {activeTab === 'notificaciones' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">🔔 Configuración de Notificaciones</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Tipos de Notificaciones</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Cotizaciones nuevas</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Cambios de precio</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Backups automáticos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Errores del sistema</span>
                  </label>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Pruebas de Notificaciones</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => notifySuccess('Esta es una notificación de éxito')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Probar Éxito
                  </button>
                  <button
                    onClick={() => notifyError('Esta es una notificación de error')}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                  >
                    Probar Error
                  </button>
                  <button
                    onClick={() => notifyInfo('Esta es una notificación informativa')}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Probar Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proveedores */}
        {activeTab === 'proveedores' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">🏢 Integración con Proveedores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providerService.getAvailableProviders().map(provider => (
                <div key={provider.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{provider.icon} {provider.name}</h3>
                    <span className="text-sm text-green-600">Activo</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Integración automática de precios y disponibilidad
                  </p>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600">
                      Configurar
                    </button>
                    <button className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm hover:bg-gray-600">
                      Probar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ Configuración Pendiente</h3>
              <p className="text-yellow-700 text-sm">
                Las integraciones con proveedores requieren configuración de API keys y endpoints. 
                Contacta al administrador para completar la configuración.
              </p>
            </div>
          </div>
        )}

        {/* Backup & Sync */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">💾 Backup y Sincronización</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Backup Manual</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleCreateBackup}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Creando...' : 'Crear Backup'}
                    </button>
                    <button
                      onClick={handleExportData}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                      Exportar Datos
                    </button>
                    <label className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 cursor-pointer block text-center">
                      Importar Datos
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Backup Automático</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`text-sm font-medium ${autoBackupEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {autoBackupEnabled ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleAutoBackup}
                    className={`w-full py-2 px-4 rounded ${
                      autoBackupEnabled
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {autoBackupEnabled ? 'Desactivar' : 'Activar'} Backup Automático
                  </button>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Sincronización</h3>
                  <button
                    onClick={handleSyncData}
                    disabled={loading}
                    className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {loading ? 'Sincronizando...' : 'Sincronizar Datos'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Tamaño actual: {backupService.formatStorageSize(storageSize)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Historial de Backups</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {backupList.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay backups disponibles</p>
                    ) : (
                      backupList.map((backup) => (
                        <div key={backup.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{backup.timestamp}</p>
                            <p className="text-xs text-gray-500">{backup.size}</p>
                          </div>
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            className="bg-blue-500 text-white py-1 px-2 rounded text-xs hover:bg-blue-600"
                          >
                            Restaurar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IA y Automatización */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">🤖 IA y Automatización</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Automatizaciones Disponibles</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSetupAIAutomation('price_alerts')}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-left"
                    >
                      💰 Alertas de Precios
                      <p className="text-xs opacity-80">Notifica cambios de precios automáticamente</p>
                    </button>
                    <button
                      onClick={() => handleSetupAIAutomation('material_suggestions')}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-left"
                    >
                      🔍 Sugerencias de Materiales
                      <p className="text-xs opacity-80">Sugiere materiales basado en tu historial</p>
                    </button>
                    <button
                      onClick={() => handleSetupAIAutomation('cotizacion_followup')}
                      className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-left"
                    >
                      📋 Seguimiento de Cotizaciones
                      <p className="text-xs opacity-80">Seguimiento automático de cotizaciones pendientes</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Funciones de IA</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Detección de materiales por imagen</span>
                      <span className="text-xs text-green-600">Disponible</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Predicción de precios</span>
                      <span className="text-xs text-green-600">Disponible</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Optimización de cotizaciones</span>
                      <span className="text-xs text-green-600">Disponible</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Asistente de chat</span>
                      <span className="text-xs text-yellow-600">En desarrollo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Configuración de IA</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel de Confianza Mínimo
                      </label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="0.6">60% - Recomendado</option>
                        <option value="0.7">70% - Conservador</option>
                        <option value="0.8">80% - Estricto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frecuencia de Sugerencias
                      </label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Permitir aprendizaje automático</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">💡 Próximas Funciones</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Reconocimiento de voz para búsquedas</li>
                    <li>• Análisis predictivo de demanda</li>
                    <li>• Integración con sistemas ERP</li>
                    <li>• Chatbot especializado en construcción</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
