/**
 * API Service Base
 * Servicio central para todas las llamadas HTTP al backend
 * 
 * CONFIGURACIÓN DE BASE DE DATOS:
 * - Backend: Express.js + MongoDB Atlas
 * - Base URL: http://localhost:5000/api (desarrollo) / /api (producción)
 * - Autenticación: JWT tokens en localStorage
 * 
 * PARA CAMBIAR LA BASE DE DATOS EN EL FUTURO:
 * 1. Cambiar BACKEND_URL si se cambia el servidor
 * 2. Modificar getAuthHeaders() si se cambia el método de autenticación
 * 3. Actualizar handleResponse() si cambia el formato de respuestas
 */

class ApiService {
  constructor() {
    // CONFIGURACIÓN DE URL DEL BACKEND
    // En desarrollo usa localhost:5000, en producción usa la URL relativa
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    this.BACKEND_URL = isDevelopment ? 'http://localhost:5000/api' : '/api';
    
    console.log(`🔗 API Service configurado para: ${this.BACKEND_URL}`);
  }

  /**
   * Obtiene headers de autenticación desde localStorage
   * NOTA: Si cambias la autenticación (ej: cookies, session), modificar aquí
   */
  getAuthHeaders() {
    const token = localStorage.getItem('tarapaca_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Maneja las respuestas HTTP y errores
   * NOTA: Personalizar según formato de respuesta del backend
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error HTTP: ${response.status}`);
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response;
    }
  }

  /**
   * Método GET genérico
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error en GET ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método POST genérico
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error en POST ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método PUT genérico
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error en PUT ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método DELETE genérico
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`❌ Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si el backend está disponible
   * Útil para manejar fallbacks cuando no hay conexión
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Backend no disponible, usando modo offline');
      return false;
    }
  }
}

// Exportar instancia singleton
export default new ApiService();
