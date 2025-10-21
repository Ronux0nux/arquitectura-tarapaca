/**
 * Authentication Service
 * Maneja toda la autenticación con la base de datos MongoDB Atlas
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas (tarapaka1.xcghcmw.mongodb.net)
 * - Modelo: User.js en backend
 * - Autenticación: JWT tokens
 * - Almacenamiento: localStorage (token + user data)
 * 
 * PARA CAMBIAR AUTENTICACIÓN EN EL FUTURO:
 * 1. Para OAuth/Google: Modificar login() y agregar loginWithGoogle()
 * 2. Para session cookies: Cambiar almacenamiento de localStorage a cookies
 * 3. Para auth providers externos: Agregar nuevos métodos de login
 * 4. Para cambiar JWT: Modificar endpoints en backend y updateTokenHandling()
 */

import ApiService from './ApiService';

class AuthService {
  constructor() {
    this.apiService = ApiService;
    
    // CONFIGURACIÓN DE ENDPOINTS
    // Si cambias las rutas del backend, modificar estos endpoints
    this.endpoints = {
  login: '/users/login',
      register: '/auth/register', 
  verify: '/api/users/verify',
      refresh: '/auth/refresh',
  logout: '/api/users/logout',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      updateProfile: '/auth/profile'
    };

    console.log('🔐 AuthService inicializado con endpoints:', this.endpoints);
  }

  /**
   * Login con email y contraseña contra MongoDB
   * RETORNA: { success, user, accessToken, refreshToken, message }
   */
  async login(email, password, rememberMe = false) {
    try {
      console.log('🔑 Intentando login para:', email);
      
      // Llamada a la API del backend
      const response = await this.apiService.post(this.endpoints.login, {
        email,
        password
      });

      if (response.success && (response.accessToken || response.token)) {
        const { user, accessToken, token, refreshToken } = response;
        
        // Usar accessToken del nuevo sistema o token del antiguo
        const finalToken = accessToken || token;
        
        // ALMACENAMIENTO DEL TOKEN Y USUARIO
        localStorage.setItem('tarapaca_token', finalToken);
        localStorage.setItem('tarapaca_user', JSON.stringify(user));
        
        // Guardar refresh token si está disponible
        if (refreshToken) {
          localStorage.setItem('tarapaca_refresh_token', refreshToken);
          // Iniciar timer de refresco automático
          this.startTokenRefreshTimer(user.id);
        }
        
        console.log('✅ Login exitoso:', user.nombre || user.name);
        
        return {
          success: true,
          user: user,
          accessToken: finalToken,
          refreshToken: refreshToken,
          message: `Bienvenido ${user.nombre || user.name}`
        };
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      
      // FALLBACK: Si no hay conexión, usar autenticación local
      return await this.loginOffline(email, password, rememberMe);
    }
  }

  /**
   * FALLBACK: Autenticación offline con usuarios hardcodeados
   * Se usa cuando no hay conexión a la base de datos
   * PARA REMOVER EN PRODUCCIÓN: Eliminar este método cuando no necesites fallback
   */
  async loginOffline(email, password, rememberMe = false) {
    console.warn('⚠️ Usando autenticación offline (sin BD)');
    
    // Usuarios de respaldo (igual a los anteriores)
    const mockUsers = [
      {
        id: 'offline_1',
        email: 'admin@aceleratarapaka.cl',
        password: 'admin123',
        name: 'Administrator (Offline)',
        role: 'admin',
        avatar: '👨‍💼'
      },
      {
        id: 'offline_2', 
        email: 'supervisor@aceleratarapaka.cl',
        password: 'super123',
        name: 'Carlos Supervisor (Offline)',
        role: 'supervisor',
        avatar: '👨‍🔧'
      },
      {
        id: 'offline_3',
        email: 'empleado@aceleratarapaka.cl', 
        password: 'emp123',
        name: 'María Empleada (Offline)',
        role: 'empleado',
        avatar: '👩‍💻'
      }
    ];

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    const token = `offline_token_${foundUser.id}_${Date.now()}`;
    
    // Almacenar en el storage apropiado
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.setItem('tarapaca_token', token);
    storage.setItem('tarapaca_user', JSON.stringify(userWithoutPassword));
    
    return {
      success: true,
      user: userWithoutPassword,
      token: token,
      message: `Bienvenido ${userWithoutPassword.name} (Modo Offline)`
    };
  }

  /**
   * Registro de nuevo usuario en la base de datos
   */
  async register(userData) {
    try {
      const response = await this.apiService.post(this.endpoints.register, userData);
      
      if (response.success) {
        console.log('✅ Usuario registrado en BD:', userData.email);
        return response;
      } else {
        throw new Error(response.message || 'Error en registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error.message);
      throw error;
    }
  }

  /**
   * Verificar token actual con la base de datos
   */
  async verifyToken() {
    try {
      const token = this.getStoredToken();
      if (!token) return { valid: false };

  const response = await this.apiService.get(this.endpoints.verify);
      
      if (response.success && response.user) {
        // Actualizar datos del usuario en storage
        const storage = localStorage.getItem('tarapaca_user') ? localStorage : sessionStorage;
        storage.setItem('tarapaca_user', JSON.stringify(response.user));
        
        return {
          valid: true,
          user: response.user
        };
      } else {
        this.logout();
        return { valid: false };
      }
    } catch (error) {
      console.warn('⚠️ Error verificando token, manteniendo sesión offline');
      // En caso de error de red, mantener sesión local
      const storedUser = this.getStoredUser();
      return storedUser ? { valid: true, user: storedUser } : { valid: false };
    }
  }

  /**
   * Cerrar sesión y limpiar datos
   */
  async logout() {
    try {
      // Intentar notificar al backend
      await this.apiService.post(this.endpoints.logout, {});
    } catch (error) {
      console.warn('⚠️ No se pudo notificar logout al backend');
    }

    // Limpiar almacenamiento local
    localStorage.removeItem('tarapaca_token');
    localStorage.removeItem('tarapaca_user');
    sessionStorage.removeItem('tarapaca_token');
    sessionStorage.removeItem('tarapaca_user');
    
    console.log('🚪 Sesión cerrada y datos limpiados');
  }

  /**
   * Recuperación de contraseña
   */
  async forgotPassword(email) {
    try {
      const response = await this.apiService.post(this.endpoints.forgotPassword, { email });
      return response;
    } catch (error) {
      console.error('❌ Error en recuperación de contraseña:', error);
      throw error;
    }
  }

  /**
   * Helpers para manejar datos almacenados
   */
  getStoredToken() {
    return localStorage.getItem('tarapaca_token') || sessionStorage.getItem('tarapaca_token');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('tarapaca_user') || sessionStorage.getItem('tarapaca_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Verificar permisos de usuario
   * NOTA: La lógica de permisos debe coincidir con el backend
   */
  hasPermission(user, permission) {
    if (!user) return false;
    
    // Mapeo de roles a permisos (debe coincidir con backend)
    const rolePermissions = {
      admin: ['all'], // Admin tiene acceso a todo
      supervisor: ['cotizaciones', 'proveedores', 'proyectos', 'reportes'],
      empleado: ['cotizaciones', 'proveedores', 'proyectos']
    };
    
    // Usar rol o role (por compatibilidad)
    const userRole = user.role || user.rol;
    const userPermissions = rolePermissions[userRole] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }

  /**
   * Verificar si usuario tiene rol específico o superior
   */
  hasRole(user, requiredRole) {
    if (!user) return false;
    
    const roleHierarchy = {
      admin: 3,
      supervisor: 2,
      empleado: 1
    };
    
    // Usar rol o role (por compatibilidad)
    const userRole = user.role || user.rol;
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  /**
   * Refrescar access token usando el refresh token
   */
  async refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('tarapaca_refresh_token');
      
      if (!refreshToken) {
        console.warn('⚠️ No hay refresh token disponible');
        return false;
      }

      const response = await this.apiService.post('/users/refresh-token', {
        refreshToken
      });

      if (response.success && response.accessToken) {
        localStorage.setItem('tarapaca_token', response.accessToken);
        console.log('✅ Access token refrescado exitosamente');
        return true;
      } else {
        console.warn('⚠️ Fallo al refrescar token');
        return false;
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return false;
    }
  }

  /**
   * Iniciar timer para refrescar token automáticamente
   * Se ejecuta 5 minutos antes de que expire el access token (24h - 5m = 1435m)
   */
  startTokenRefreshTimer(userId) {
    // Limpiar timer anterior si existe
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }

    // Refrescar token cada 20 horas (token dura 24h, se refresca a las 20h)
    const REFRESH_INTERVAL = 20 * 60 * 60 * 1000; // 20 horas en milisegundos

    this.tokenRefreshTimer = setInterval(async () => {
      console.log('🔄 Refrescando token automáticamente...');
      const success = await this.refreshAccessToken();
      
      if (!success) {
        // Si falla el refresco, limpiar datos de sesión
        console.warn('⚠️ Fallo al refrescar token automáticamente, requiere nuevo login');
        this.logout();
      }
    }, REFRESH_INTERVAL);

    console.log(`⏰ Timer de refresco de token configurado (cada ${REFRESH_INTERVAL / 3600000}h)`);
  }

  /**
   * Detener timer de refresco
   */
  stopTokenRefreshTimer() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
      console.log('⏱️  Timer de refresco detenido');
    }
  }

  /**
   * Revocar refresh token (logout completo)
   */
  async revokeRefreshToken(userId) {
    try {
      const refreshToken = localStorage.getItem('tarapaca_refresh_token');
      
      if (refreshToken) {
        await this.apiService.post('/users/revoke-token', { userId });
        console.log('✅ Refresh token revocado');
      }
    } catch (error) {
      console.warn('⚠️ Error revocando refresh token:', error);
    } finally {
      this.stopTokenRefreshTimer();
      localStorage.removeItem('tarapaca_refresh_token');
    }
  }
}

// Exportar instancia singleton
const authService = new AuthService();
export default authService;
