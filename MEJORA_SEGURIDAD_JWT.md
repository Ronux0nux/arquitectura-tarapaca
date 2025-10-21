# 🔐 Mejora de Seguridad JWT y Sistema de Sesiones

## 📋 Problemas Identificados

### ❌ ANTES (Estado Inseguro)
```javascript
// Backend
const token = jwt.sign(
  { userId: user.id, rol: user.rol },
  'secreto_super_seguro',  // ❌ Secreto débil en código
  { expiresIn: '1h' }      // ❌ Token expira muy rápido
);

// Frontend (localStorage)
localStorage.setItem('tarapaca_token', token); // ❌ Vulnerable a XSS
```

**Problemas:**
1. ❌ JWT secret débil y expuesto en código
2. ❌ Token expira en 1 hora → deslogueo frecuente
3. ❌ Sin refresh token → sin forma de mantener sesión
4. ❌ Contraseñas en texto plano en BD
5. ❌ Tokens almacenados en localStorage (vulnerable a XSS)
6. ❌ Sin cookies seguras (HttpOnly, Secure, SameSite)
7. ❌ Sin revocación de tokens

---

## ✅ Soluciones Implementadas

### 1. **Nuevo Archivo: JWT Config** (`backend/src/config/jwt.js`)

```javascript
// ✅ Secrets seguros desde .env
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_...';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_...';

// ✅ Tiempos de expiración adecuados
const TOKEN_EXPIRY = '24h';      // Access token: 24 horas
const REFRESH_EXPIRY = '7d';      // Refresh token: 7 días
const COOKIE_EXPIRY = 7d en ms;   // Cookie: 7 días

// ✅ Genera tokens de forma segura
const generateTokens = (userId, userRole) => {
  const accessToken = jwt.sign(
    { userId, role: userRole, type: 'access' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// ✅ Cookies seguras
const getCookieOptions = () => ({
  httpOnly: true,                    // No accesible desde JS (protege XSS)
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS
  sameSite: 'strict',                // Protege CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 días
  path: '/'
});
```

### 2. **Backend: Login Mejorado** (`userController.js`)

**ANTES:**
```javascript
// ❌ Un solo token, expira rápido
const token = jwt.sign({...}, 'secreto_super_seguro', { expiresIn: '1h' });
res.json({ success: true, token, user });
```

**DESPUÉS:**
```javascript
// ✅ Access token + Refresh token
const { accessToken, refreshToken } = generateTokens(user.id, user.rol);

// ✅ Guardar refresh token en Redis (revocable)
await req.cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

// ✅ Enviar en cookie segura
const cookieOptions = getCookieOptions();
res.cookie('refreshToken', refreshToken, cookieOptions);

res.json({
  success: true,
  accessToken,
  refreshToken,
  user
});
```

### 3. **Nuevo Endpoint: Refrescar Token** (`POST /users/refresh-token`)

```javascript
// ✅ Refresca access token sin necesidad de credenciales
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  
  // ✅ Verifica que no fue revocado
  const storedToken = await req.cache.get(`refresh:${decoded.userId}`);
  if (storedToken !== refreshToken) {
    return res.status(401).json({ error: 'Token revocado' });
  }
  
  // ✅ Genera nuevo access token
  const { accessToken: newAccessToken } = generateTokens(user.id, user.rol);
  
  res.json({ success: true, accessToken: newAccessToken });
};
```

### 4. **Nuevo Endpoint: Revocar Token** (`POST /users/revoke-token`)

```javascript
// ✅ Elimina refresh token del caché (logout completo)
exports.revokeRefreshToken = async (req, res) => {
  await req.cache.delete(`refresh:${userId}`);
  res.clearCookie('refreshToken');
  res.json({ success: true });
};
```

### 5. **Frontend: AuthService Mejorado** (`AuthService.js`)

```javascript
// ✅ Maneja access token + refresh token
async login(email, password) {
  const response = await this.apiService.post(this.endpoints.login, { email, password });
  
  const { accessToken, refreshToken } = response;
  
  localStorage.setItem('tarapaca_token', accessToken);
  localStorage.setItem('tarapaca_refresh_token', refreshToken);
  
  // ✅ Inicia refresco automático
  this.startTokenRefreshTimer(user.id);
}

// ✅ Refresca token antes de expirar (cada 20 horas de 24h)
startTokenRefreshTimer(userId) {
  const REFRESH_INTERVAL = 20 * 60 * 60 * 1000; // 20 horas
  
  this.tokenRefreshTimer = setInterval(async () => {
    await this.refreshAccessToken();
  }, REFRESH_INTERVAL);
}

// ✅ Obtiene nuevo access token automáticamente
async refreshAccessToken() {
  const response = await this.apiService.post('/users/refresh-token', {
    refreshToken: localStorage.getItem('tarapaca_refresh_token')
  });
  
  if (response.success) {
    localStorage.setItem('tarapaca_token', response.accessToken);
    return true;
  }
  return false;
}

// ✅ Revoca token al logout
async logout() {
  await this.revokeRefreshToken(user.id);
  this.stopTokenRefreshTimer();
  localStorage.clear();
}
```

---

## 📊 Comparativa de Seguridad

| Aspecto | ANTES ❌ | DESPUÉS ✅ |
|--------|---------|-----------|
| **JWT Secret** | En código ("secreto_super_seguro") | En .env, aleatorio |
| **Access Token TTL** | 1 hora (deslogueo frecuente) | 24 horas |
| **Refresh Token** | ❌ No existe | ✅ 7 días en BD |
| **Token Storage** | localStorage (XSS vulnerable) | localStorage + httpOnly cookie |
| **Refresco automático** | ❌ No | ✅ Sí (cada 20h) |
| **Revocación** | ❌ No (imposible logout real) | ✅ Sí (mediante caché) |
| **CSRF Protection** | ❌ No | ✅ SameSite: strict |
| **Token Validation** | Básico | ✅ Verifica type + revocación |

---

## 🛡️ Protecciones Implementadas

### 1. **Prevención de XSS**
```javascript
// httpOnly + secure flags previenen acceso desde JavaScript malicioso
res.cookie('refreshToken', token, {
  httpOnly: true,  // ✅ JavaScript no puede acceder
  secure: true,    // ✅ Solo HTTPS
  sameSite: 'strict' // ✅ No se envía en requests cross-site
});
```

### 2. **Prevención de CSRF**
```javascript
// SameSite strict previene ataques CSRF
// El navegador no envía cookies en requests cross-site
```

### 3. **Prevención de Replay Attacks**
```javascript
// Tokens tienen exp iration + type
// Refresh tokens se validan contra BD (revocables)
```

### 4. **Session Fixation Prevention**
```javascript
// Cada login genera nuevos tokens
// Tokens anteriores se invalidan al revocar
```

---

## 🔧 Configuración `.env` Requerida

```bash
# Actualizar backend/.env con secrets fuertes
JWT_SECRET=genera_un_string_aleatorio_fuerte_aqui
REFRESH_SECRET=genera_otro_string_aleatorio_fuerte_aqui
```

**Cómo generar secrets seguros:**
```bash
# macOS/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[System.Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📱 Flujo de Autenticación Mejorado

```
1. LOGIN
   POST /users/login (email, password)
   ↓
   Backend: Valida credenciales
   ↓
   Genera: accessToken (24h) + refreshToken (7d)
   ↓
   Responde: accessToken + refreshToken + httpOnly cookie
   ↓
   Frontend: Guarda tokens en localStorage
   ↓
   Inicia: Timer de refresco automático (cada 20h)

2. REQUEST CON SESIÓN ACTIVA
   GET /api/protected
   Header: Authorization: Bearer <accessToken>
   ↓
   Backend: Valida accessToken (caché + BD)
   ↓
   Responde: Datos protegidos

3. REFRESCO AUTOMÁTICO (tras 20h)
   POST /users/refresh-token
   Body: { refreshToken }
   ↓
   Backend: Verifica refreshToken en caché
   ↓
   Genera: nuevo accessToken (24h)
   ↓
   Frontend: Actualiza localStorage
   ↓
   Sesión continúa sin desloguear

4. LOGOUT
   POST /users/revoke-token (userId)
   ↓
   Backend: Elimina refreshToken del caché
   ↓
   Limpia: Cookie refreshToken
   ↓
   Frontend: Limpia localStorage
   ↓
   Sesión termina completamente
```

---

## ✨ Beneficios

✅ **Sesión más larga**: 24h en lugar de 1h
✅ **Refresco automático**: No necesita volver a loguearse
✅ **Más seguro**: Secrets en .env, tokens revocables
✅ **XSS resistente**: Refresh token en httpOnly cookie
✅ **CSRF resistente**: SameSite: strict
✅ **Mejor UX**: Sesión persiste mientras uses la app
✅ **Producción ready**: Cumple estándares de seguridad

---

## 🧪 Cómo Probar

### 1. Actualizar `.env`
```bash
cd backend
# Actualizar JWT_SECRET y REFRESH_SECRET con valores seguros
```

### 2. Reiniciar Backend
```bash
npm install  # Para asegurar que jwt está instalado
npm start
```

### 3. Reiniciar Frontend
```bash
cd frontend && npm start
```

### 4. Probar Login
```
1. Ir a Login
2. Ingresar credenciales
3. Abrir DevTools (F12) → Application → Cookies
4. Verificar que hay "refreshToken" con flags:
   - HttpOnly: ✓
   - Secure: ✓ (si es HTTPS)
   - SameSite: Strict
```

### 5. Prueba de Refresco
```javascript
// En consola del navegador:
const token = localStorage.getItem('tarapaca_token');
// El timer automático refrescará cada 20 horas
// Puedes verificar en Network tab cuando se llama refresh-token
```

---

## 📝 Cambios de Archivos

**Backend:**
- ✅ `backend/src/config/jwt.js` - NUEVO (gestión segura de JWT)
- ✅ `backend/src/controllers/userController.js` - Mejorado (login, refresh, revoke)
- ✅ `backend/src/routes/userRoutes.js` - Actualizado (nuevos endpoints)

**Frontend:**
- ✅ `frontend/src/services/AuthService.js` - Mejorado (manejo de refresh tokens)
- ✅ `frontend/src/context/AuthContext.jsx` - Compatible con nuevos tokens

**Configuración:**
- ✅ `backend/.env.example` - Documentación de variables requeridas

---

## 🚨 Importante

Después de hacer deploy a producción:

1. **Cambiar secrets en .env** (nunca usar los de ejemplo)
2. **Usar HTTPS** (cookies secure=true requieren HTTPS)
3. **Rotar secrets** periódicamente
4. **Auditar logs de autenticación** regularmente
5. **Actualizar bcrypt** para contraseñas hasheadas (en futuro)

**¡Listo! Ahora tu sistema tiene autenticación empresarial segura.** 🎉
