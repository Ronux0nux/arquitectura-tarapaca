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
      login: '/auth/login',
      register: '/auth/register', 
      verify: '/auth/verify',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      updateProfile: '/auth/profile'
    };

    console.log('🔐 AuthService inicializado con endpoints:', this.endpoints);
  }

  /**
   * Login con email y contraseña contra MongoDB
   * RETORNA: { success, user, token, message }
   */
  async login(email, password, rememberMe = false) {
    try {
      console.log('🔑 Intentando login con BD para:', email);
      
      // Llamada a la API del backend
      const response = await this.apiService.post(this.endpoints.login, {
        email,
        password
      });

      if (response.success && response.token) {
        const { user, token } = response;
        
        // ALMACENAMIENTO DEL TOKEN Y USUARIO
        // Para cambiar a cookies: usar document.cookie en lugar de localStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('tarapaca_token', token);
        storage.setItem('tarapaca_user', JSON.stringify(user));
        
        console.log('✅ Login exitoso desde BD:', user.name);
        
        return {
          success: true,
          user: user,
          token: token,
          message: `Bienvenido ${user.name}`
        };
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
      
    } catch (error) {
      console.error('❌ Error en login con BD:', error.message);
      
      // FALLBACK: Si no hay conexión, usar autenticación local
      // Esto mantiene la funcionalidad aunque la BD esté caída
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
        email: 'admin@tarapaca.cl',
        password: 'admin123',
        name: 'Administrator (Offline)',
        role: 'admin',
        avatar: '👨‍💼'
      },
      {
        id: 'offline_2', 
        email: 'supervisor@tarapaca.cl',
        password: 'super123',
        name: 'Carlos Supervisor (Offline)',
        role: 'supervisor',
        avatar: '👨‍🔧'
      },
      {
        id: 'offline_3',
        email: 'empleado@tarapaca.cl', 
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
    storage.setItem('tarapaca_token', token);
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
    
    const userPermissions = rolePermissions[user.role] || [];
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
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }
}

// Exportar instancia singleton
export default new AuthService();
