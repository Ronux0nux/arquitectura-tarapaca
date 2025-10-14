# 🐳 GUÍA PASO A PASO: CONFIGURAR DOCKER + REDIS

## ✅ PASO 1: VERIFICAR DOCKER DESKTOP

### 1. Abrir Docker Desktop
- Buscar "Docker Desktop" en el menú de Windows
- Hacer clic para abrir la aplicación
- **Esperar** a que el icono de Docker en la bandeja del sistema (abajo a la derecha) se ponga **verde** 🟢
- Esto puede tardar 1-2 minutos la primera vez

### 2. Verificar que Docker esté corriendo

Una vez que Docker Desktop esté abierto y el ícono esté verde:

**Abrir PowerShell NUEVO** (importante: abrir uno nuevo) y ejecutar:

```powershell
docker --version
```

**Deberías ver algo como:**
```
Docker version 24.0.7, build afdd53b
```

Si ves un error, **cierra PowerShell y ábrelo de nuevo** (Docker necesita reiniciar el shell).

---

## 🔴 PASO 2: INSTALAR REDIS EN DOCKER

### Opción A: Con PowerShell (Recomendado)

```powershell
# 1. Descargar imagen de Redis
docker pull redis:latest

# 2. Crear y ejecutar contenedor Redis
docker run --name redis-tarapaca -p 6379:6379 -d redis:latest

# 3. Verificar que esté corriendo
docker ps
```

**Deberías ver:**
```
CONTAINER ID   IMAGE          STATUS        PORTS                    NAMES
abc123...      redis:latest   Up 5 seconds  0.0.0.0:6379->6379/tcp   redis-tarapaca
```

### Opción B: Si la Opción A da error, usar comando más simple

```powershell
docker run -d -p 6379:6379 --name redis-tarapaca redis
```

---

## ✅ PASO 3: PROBAR QUE REDIS FUNCIONE

### 1. Verificar contenedor
```powershell
docker ps
```

### 2. Probar conexión a Redis
```powershell
docker exec -it redis-tarapaca redis-cli ping
```

**Respuesta esperada:** `PONG` ✅

### 3. Probar comandos Redis
```powershell
# Entrar al CLI de Redis
docker exec -it redis-tarapaca redis-cli

# Dentro del CLI, ejecutar:
# SET test "hola"
# GET test
# EXIT
```

---

## 🚀 PASO 4: CONFIGURAR TU PROYECTO

### 1. Verificar que Redis esté en .env

Abrir `backend/.env` y verificar que tenga:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Iniciar tu servidor

```powershell
cd backend
npm start
```

**✅ Si todo está bien, verás:**
```
✅ Redis conectado exitosamente
✅ Redis listo para usar
🚀 Servidor corriendo en http://localhost:5000
🔴 Redis: ready
```

---

## 🔧 COMANDOS ÚTILES DE DOCKER + REDIS

### Gestión del Contenedor

```powershell
# Ver contenedores corriendo
docker ps

# Ver TODOS los contenedores (incluso detenidos)
docker ps -a

# Iniciar Redis
docker start redis-tarapaca

# Detener Redis
docker stop redis-tarapaca

# Reiniciar Redis
docker restart redis-tarapaca

# Ver logs de Redis
docker logs redis-tarapaca

# Ver logs en tiempo real
docker logs -f redis-tarapaca

# Eliminar contenedor (si quieres empezar de nuevo)
docker rm -f redis-tarapaca
```

### Trabajar con Redis

```powershell
# Conectar a Redis CLI
docker exec -it redis-tarapaca redis-cli

# Ejecutar comando directo
docker exec redis-tarapaca redis-cli SET mikey "valor"
docker exec redis-tarapaca redis-cli GET mikey

# Ver estadísticas de Redis
docker exec redis-tarapaca redis-cli INFO

# Ver todas las claves
docker exec redis-tarapaca redis-cli KEYS *

# Limpiar toda la caché
docker exec redis-tarapaca redis-cli FLUSHALL
```

### Información del Contenedor

```powershell
# Ver estadísticas en tiempo real
docker stats redis-tarapaca

# Inspeccionar configuración
docker inspect redis-tarapaca

# Ver uso de recursos
docker top redis-tarapaca
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### ❌ Error: "docker: command not found"

**Causa:** Docker Desktop no está iniciado o PowerShell no se ha refrescado

**Solución:**
1. Abrir Docker Desktop
2. Esperar a que el ícono se ponga verde 🟢
3. **Cerrar y abrir PowerShell nuevamente**
4. Intentar de nuevo: `docker --version`

### ❌ Error: "port is already allocated"

**Causa:** El puerto 6379 ya está en uso

**Solución:**
```powershell
# Opción 1: Detener el contenedor anterior
docker stop redis-tarapaca
docker rm redis-tarapaca

# Opción 2: Usar otro puerto
docker run --name redis-tarapaca -p 6380:6379 -d redis:latest
# Luego cambiar en .env: REDIS_PORT=6380
```

### ❌ Error: "name is already in use"

**Causa:** Ya existe un contenedor con ese nombre

**Solución:**
```powershell
# Ver contenedores existentes
docker ps -a

# Eliminar el contenedor anterior
docker rm -f redis-tarapaca

# Crear uno nuevo
docker run --name redis-tarapaca -p 6379:6379 -d redis:latest
```

### ❌ Error: "Cannot connect to the Docker daemon"

**Causa:** Docker Desktop no está corriendo

**Solución:**
1. Abrir Docker Desktop desde el menú de Windows
2. Esperar a que inicie completamente
3. Intentar de nuevo

### ❌ Redis no responde PONG

**Causa:** Contenedor detenido o no funcionando

**Solución:**
```powershell
# Verificar estado
docker ps -a

# Si dice "Exited", iniciarlo
docker start redis-tarapaca

# Ver logs para detectar errores
docker logs redis-tarapaca
```

---

## 🎯 FLUJO COMPLETO RECOMENDADO

### Cada vez que enciendas tu computadora:

```powershell
# 1. Abrir Docker Desktop (automático si lo configuraste)
# 2. Esperar que esté listo (ícono verde)

# 3. Verificar que Redis esté corriendo
docker ps

# 4. Si no aparece, iniciarlo
docker start redis-tarapaca

# 5. Iniciar tu servidor
cd "C:\Users\romam\OneDrive - Universidad Arturo Prat\Escritorio\tarapaka\TARAPAKAA\backend"
npm start
```

### Antes de apagar tu computadora:

```powershell
# Opcional: detener Redis para ahorrar recursos
docker stop redis-tarapaca

# O simplemente cerrar Docker Desktop
```

---

## 🔄 CONFIGURAR INICIO AUTOMÁTICO

### Hacer que Redis inicie automáticamente con Docker:

```powershell
# Eliminar contenedor actual
docker rm -f redis-tarapaca

# Crear uno nuevo con restart policy
docker run --name redis-tarapaca -p 6379:6379 --restart unless-stopped -d redis:latest
```

Ahora Redis se iniciará automáticamente cada vez que Docker Desktop se abra.

---

## 📊 MONITOREAR REDIS

### Ver qué hay en Redis:

```powershell
# Conectar al CLI
docker exec -it redis-tarapaca redis-cli

# Dentro del CLI:
KEYS *              # Ver todas las claves
DBSIZE              # Cantidad de claves
INFO memory         # Uso de memoria
INFO stats          # Estadísticas
MONITOR             # Ver comandos en tiempo real (Ctrl+C para salir)
```

### Ver datos de tu aplicación:

```powershell
# Ver proveedores en caché
docker exec redis-tarapaca redis-cli GET providers:all

# Ver todas las claves de tu app
docker exec redis-tarapaca redis-cli KEYS "providers:*"
```

---

## 🎓 EJEMPLO COMPLETO

```powershell
# 1. Abrir PowerShell

# 2. Verificar Docker
PS> docker --version
Docker version 24.0.7, build afdd53b

# 3. Crear Redis
PS> docker run --name redis-tarapaca -p 6379:6379 --restart unless-stopped -d redis:latest
abc123def456...

# 4. Verificar que esté corriendo
PS> docker ps
CONTAINER ID   IMAGE    STATUS        PORTS                    NAMES
abc123...      redis    Up 5 seconds  0.0.0.0:6379->6379/tcp   redis-tarapaca

# 5. Probar conexión
PS> docker exec -it redis-tarapaca redis-cli ping
PONG

# 6. Iniciar servidor
PS> cd "C:\Users\romam\OneDrive - Universidad Arturo Prat\Escritorio\tarapaka\TARAPAKAA\backend"
PS> npm start
✅ Redis conectado exitosamente
✅ Redis listo para usar
🚀 Servidor corriendo en http://localhost:5000

# 7. Probar en navegador
# Abrir: http://localhost:5000/api/health
```

---

## 📝 NOTAS IMPORTANTES

1. **Docker Desktop debe estar corriendo** para que Redis funcione
2. **El contenedor se llama `redis-tarapaca`** - no cambies el nombre sin actualizar los comandos
3. **Puerto 6379** es el puerto por defecto de Redis
4. **Con `--restart unless-stopped`** Redis se inicia automáticamente
5. **Los datos se pierden** si eliminas el contenedor (está bien para desarrollo)

---

## 🆘 SI NADA FUNCIONA

```powershell
# Limpiar todo y empezar de cero
docker stop redis-tarapaca
docker rm redis-tarapaca
docker rmi redis:latest

# Volver a crear
docker pull redis:latest
docker run --name redis-tarapaca -p 6379:6379 --restart unless-stopped -d redis:latest

# Probar
docker exec -it redis-tarapaca redis-cli ping
```

---

**Fecha:** 13 de Octubre, 2025  
**¡Sigue estos pasos y Redis funcionará!** 🚀
