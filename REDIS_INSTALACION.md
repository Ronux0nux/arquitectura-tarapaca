# 🔴 GUÍA DE INSTALACIÓN DE REDIS

Redis es necesario para el sistema de caché y colas (BullMQ). Aquí tienes 3 opciones para instalarlo:

---

## 🐳 OPCIÓN 1: Docker (Recomendada) ⭐

### Requisitos previos:
- Docker Desktop instalado: https://www.docker.com/products/docker-desktop/

### Instalación:

**1. Abrir PowerShell o CMD**

**2. Ejecutar Redis en Docker:**
```bash
docker run --name redis-tarapaca -p 6379:6379 -d redis:latest
```

**3. Verificar que esté corriendo:**
```bash
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE    COMMAND                  STATUS
abc123def456   redis    "docker-entrypoint.s…"   Up 2 minutes
```

**4. Probar conexión:**
```bash
docker exec -it redis-tarapaca redis-cli ping
```

Respuesta esperada: `PONG`

### Comandos útiles:

```bash
# Detener Redis
docker stop redis-tarapaca

# Iniciar Redis
docker start redis-tarapaca

# Ver logs
docker logs redis-tarapaca

# Eliminar contenedor
docker rm -f redis-tarapaca
```

---

## 💻 OPCIÓN 2: Windows (Instalación Local)

### Método A: WSL2 (Windows Subsystem for Linux) - Recomendado

**1. Habilitar WSL2:**
```powershell
# En PowerShell como Administrador
wsl --install
```

**2. Reiniciar Windows**

**3. Instalar Ubuntu desde Microsoft Store**

**4. Abrir Ubuntu y ejecutar:**
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**5. Verificar:**
```bash
redis-cli ping
```

### Método B: Redis para Windows (Obsoleto pero funcional)

**1. Descargar Redis para Windows:**
- https://github.com/microsoftarchive/redis/releases
- Descargar: `Redis-x64-3.2.100.msi`

**2. Instalar siguiendo el wizard**

**3. Redis se instalará como servicio de Windows**

**4. Verificar en CMD:**
```cmd
redis-cli ping
```

---

## ☁️ OPCIÓN 3: Redis en la Nube (Sin instalación local)

### A) Redis Cloud (Gratuito) ⭐

**1. Ir a:** https://redis.com/try-free/

**2. Crear cuenta gratuita**

**3. Crear nueva base de datos:**
   - Plan: Free (30MB)
   - Región: Elegir la más cercana

**4. Obtener credenciales:**
   - Host: `redis-xxxxx.c123.cloud.redislabs.com`
   - Port: `12345`
   - Password: `tu_password_generado`

**5. Configurar en `.env`:**
```env
REDIS_HOST=redis-xxxxx.c123.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=tu_password_generado
```

### B) Upstash (Gratuito)

**1. Ir a:** https://upstash.com/

**2. Crear cuenta con GitHub**

**3. Create Database:**
   - Type: Regional
   - Region: Elegir la más cercana

**4. Copiar credenciales REST API**

**5. Configurar en `.env`:**
```env
REDIS_HOST=us1-flowing-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_upstash
```

### C) Railway (Gratuito con límites)

**1. Ir a:** https://railway.app/

**2. Sign up con GitHub**

**3. New Project → Add Redis**

**4. Obtener variables de entorno**

---

## ✅ VERIFICAR INSTALACIÓN

### Desde Node.js:

**Crear archivo de prueba:** `test-redis.js`

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost', // O tu host de la nube
  port: 6379,
  // password: 'tu_password', // Si es necesario
});

redis.on('connect', () => {
  console.log('✅ Redis conectado exitosamente');
});

redis.on('ready', async () => {
  console.log('✅ Redis listo para usar');
  
  // Probar set/get
  await redis.set('test', 'hello');
  const value = await redis.get('test');
  console.log('Valor obtenido:', value);
  
  await redis.quit();
  console.log('✅ Prueba completada');
  process.exit(0);
});

redis.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
```

**Ejecutar:**
```bash
node test-redis.js
```

Salida esperada:
```
✅ Redis conectado exitosamente
✅ Redis listo para usar
Valor obtenido: hello
✅ Prueba completada
```

---

## 🔧 CONFIGURACIÓN DEL PROYECTO

### 1. Actualizar `.env`:

```env
# ==================== REDIS ====================
# Opción 1: Local (Docker o instalación local)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=    # Dejar vacío si no tiene password

# Opción 2: Redis Cloud
# REDIS_HOST=redis-xxxxx.c123.cloud.redislabs.com
# REDIS_PORT=12345
# REDIS_PASSWORD=tu_password_aqui

# Opción 3: Upstash
# REDIS_HOST=us1-flowing-xxx.upstash.io
# REDIS_PORT=6379
# REDIS_PASSWORD=tu_password_upstash
```

### 2. Iniciar servidor:

```bash
cd backend
npm start
```

### 3. Verificar en los logs:

Deberías ver:
```
✅ Redis conectado exitosamente
✅ Redis listo para usar
🚀 Servidor corriendo en http://localhost:5000
🔴 Redis: ready
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Error: "ECONNREFUSED"

**Causa:** Redis no está corriendo

**Solución:**
```bash
# Docker
docker start redis-tarapaca

# WSL2
sudo service redis-server start

# Windows Service
net start Redis
```

### Error: "NOAUTH Authentication required"

**Causa:** Redis requiere password pero no lo proporcionaste

**Solución:** Agregar password en `.env`:
```env
REDIS_PASSWORD=tu_password
```

### Error: "Connection timeout"

**Causa:** Host o puerto incorrectos

**Solución:** Verificar credenciales en `.env`:
```bash
# Probar conexión directa
redis-cli -h tu_host -p tu_port -a tu_password ping
```

---

## 🎯 RECOMENDACIÓN FINAL

**Para desarrollo:** Docker (Opción 1)
- ✅ Fácil de instalar y usar
- ✅ No afecta tu sistema
- ✅ Fácil de limpiar

**Para producción:** Redis Cloud o Upstash (Opción 3)
- ✅ Sin mantenimiento
- ✅ Backups automáticos
- ✅ Alta disponibilidad
- ✅ Escalable

---

## 📞 AYUDA ADICIONAL

Si tienes problemas, puedes:

1. **Verificar logs del proyecto:**
   ```bash
   tail -f backend/logs/error.log
   ```

2. **Ver estado de Redis:**
   ```bash
   redis-cli info
   ```

3. **Limpiar caché de Redis:**
   ```bash
   redis-cli FLUSHALL
   ```

**Fecha:** Octubre 13, 2025
