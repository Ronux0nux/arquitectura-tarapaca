import axios from 'axios';

class BackupService {
  constructor() {
    this.backupEndpoint = 'http://localhost:3001/api/backup';
    this.syncEndpoint = 'http://localhost:3001/api/sync';
    this.storageKeys = [
      'arquitectura_cotizaciones',
      'arquitectura_products_database',
      'arquitectura_notifications',
      'arquitectura_cart',
      'arquitectura_settings'
    ];
  }

  // Crear backup completo
  async createBackup(userId = 'default') {
    try {
      const backupData = {
        userId,
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
      };

      // Recopilar todos los datos del localStorage
      this.storageKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            backupData.data[key] = JSON.parse(data);
          } catch (error) {
            backupData.data[key] = data; // Si no es JSON, guardarlo como string
          }
        }
      });

      // Enviar backup al servidor
      const response = await axios.post(`${this.backupEndpoint}/create`, backupData);

      return {
        success: true,
        backupId: response.data.backupId,
        timestamp: backupData.timestamp
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Restaurar backup
  async restoreBackup(backupId, userId = 'default') {
    try {
      const response = await axios.get(`${this.backupEndpoint}/restore/${backupId}`, {
        params: { userId }
      });

      const backupData = response.data;

      // Restaurar datos al localStorage
      if (backupData.data) {
        Object.entries(backupData.data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        });
      }

      return {
        success: true,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener lista de backups
  async getBackupList(userId = 'default') {
    try {
      const response = await axios.get(`${this.backupEndpoint}/list`, {
        params: { userId }
      });

      return {
        success: true,
        backups: response.data.backups
      };
    } catch (error) {
      console.error('Error getting backup list:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar backup
  async deleteBackup(backupId, userId = 'default') {
    try {
      await axios.delete(`${this.backupEndpoint}/delete/${backupId}`, {
        params: { userId }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sincronizar datos con el servidor
  async syncData(userId = 'default') {
    try {
      const localData = {};
      
      // Obtener datos locales
      this.storageKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            localData[key] = {
              data: JSON.parse(data),
              lastModified: this.getLastModified(key)
            };
          } catch (error) {
            localData[key] = {
              data: data,
              lastModified: this.getLastModified(key)
            };
          }
        }
      });

      // Enviar datos al servidor para sincronización
      const response = await axios.post(`${this.syncEndpoint}/sync`, {
        userId,
        localData,
        timestamp: new Date().toISOString()
      });

      const syncResult = response.data;

      // Actualizar datos locales con los datos sincronizados
      if (syncResult.updatedData) {
        Object.entries(syncResult.updatedData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            this.setLastModified(key, new Date().toISOString());
          }
        });
      }

      return {
        success: true,
        conflicts: syncResult.conflicts || [],
        updated: syncResult.updated || [],
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error syncing data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Resolver conflictos de sincronización
  async resolveConflicts(conflicts, resolutions, userId = 'default') {
    try {
      const response = await axios.post(`${this.syncEndpoint}/resolve-conflicts`, {
        userId,
        conflicts,
        resolutions
      });

      const resolvedData = response.data.resolvedData;

      // Actualizar datos locales con las resoluciones
      if (resolvedData) {
        Object.entries(resolvedData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          this.setLastModified(key, new Date().toISOString());
        });
      }

      return {
        success: true,
        resolvedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Backup automático
  async setupAutoBackup(intervalHours = 24, userId = 'default') {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    // Verificar si ya hay un backup automático configurado
    const existingInterval = localStorage.getItem('autoBackupInterval');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
    }

    // Configurar nuevo intervalo
    const intervalId = setInterval(async () => {
      const result = await this.createBackup(userId);
      if (result.success) {
        console.log(`Auto backup created: ${result.backupId}`);
        
        // Notificar sobre el backup exitoso
        if (window.notificationService) {
          window.notificationService.notifySuccess(
            `Backup automático creado exitosamente`,
            'Backup Automático'
          );
        }
      } else {
        console.error('Auto backup failed:', result.error);
        
        // Notificar sobre el error
        if (window.notificationService) {
          window.notificationService.notifyError(
            `Error en backup automático: ${result.error}`,
            'Error de Backup'
          );
        }
      }
    }, intervalMs);

    // Guardar ID del intervalo
    localStorage.setItem('autoBackupInterval', intervalId.toString());
    localStorage.setItem('autoBackupConfig', JSON.stringify({
      intervalHours,
      userId,
      setupAt: new Date().toISOString()
    }));

    return {
      success: true,
      intervalId,
      nextBackup: new Date(Date.now() + intervalMs).toISOString()
    };
  }

  // Desactivar backup automático
  disableAutoBackup() {
    const intervalId = localStorage.getItem('autoBackupInterval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem('autoBackupInterval');
      localStorage.removeItem('autoBackupConfig');
    }
  }

  // Exportar datos como archivo
  exportData(filename = 'arquitectura_backup.json') {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    // Recopilar todos los datos del localStorage
    this.storageKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          exportData.data[key] = JSON.parse(data);
        } catch (error) {
          exportData.data[key] = data;
        }
      }
    });

    // Crear y descargar archivo
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Importar datos desde archivo
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.data) {
            Object.entries(importData.data).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
              }
            });
          }
          
          resolve({
            success: true,
            importedAt: new Date().toISOString()
          });
        } catch (error) {
          reject({
            success: false,
            error: error.message
          });
        }
      };
      
      reader.onerror = () => {
        reject({
          success: false,
          error: 'Error reading file'
        });
      };
      
      reader.readAsText(file);
    });
  }

  // Utilities
  getLastModified(key) {
    return localStorage.getItem(`${key}_lastModified`) || new Date().toISOString();
  }

  setLastModified(key, timestamp) {
    localStorage.setItem(`${key}_lastModified`, timestamp);
  }

  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  formatStorageSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Instancia singleton del servicio
const backupService = new BackupService();

export default backupService;
