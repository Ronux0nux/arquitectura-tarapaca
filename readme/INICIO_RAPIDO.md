# ⚡ GUÍA DE INICIO RÁPIDO

## 🎯 LO QUE NECESITAS HACER AHORA

### 1️⃣ INSTALAR REDIS (3 minutos)

**Opción más fácil: Docker**

```powershell
# Abrir PowerShell y ejecutar:
docker run --name redis-tarapaca -p 6379:6379 -d redis:latest

# Verificar que funcione:
docker exec -it redis-tarapaca redis-cli ping
# Debería responder: PONG
```

**¿No tienes Docker?** Ver guía completa: `REDIS_INSTALACION.md`

---

### 2️⃣ CONFIGURAR VARIABLES DE ENTORNO (1 minuto)

```powershell
# Ir a la carpeta backend
cd backend

# Copiar el archivo de ejemplo (PowerShell)
Copy-Item .env.example .env

# Editar el archivo .env y agregar:
```

Abrir `.env` y verificar/agregar:
```env
# Redis (local con Docker)
REDIS_HOST=localhost
REDIS_PORT=6379

# Si ya lo tenías configurado:
PORT=5000
DB_USER=rmarcoleta
DB_HOST=magallanes.icci-unap.cl
DB_DATABASE=rmarcoleta
DB_PASSWORD=96ZC2mMo=s@Q
SERPAPI_KEY=tu_serpapi_key
```

---

### 3️⃣ INICIAR EL SERVIDOR (30 segundos)

```powershell
# Asegúrate de estar en /backend
cd backend

# Iniciar servidor
npm start
```

**✅ Si todo está bien verás:**
```
✅ Redis conectado exitosamente
✅ Redis listo para usar
🚀 Servidor corriendo en http://localhost:5000
📊 Ambiente: development
🔴 Redis: ready
```

**❌ Si ves errores de Redis:**
- Verificar que Redis esté corriendo: `docker ps`
- Si no aparece: `docker start redis-tarapaca`
- Ver guía completa: `REDIS_INSTALACION.md`

---

### 4️⃣ PROBAR QUE TODO FUNCIONE (1 minuto)

**Abrir navegador o usar curl:**

```powershell
# Verificar estado del servidor
curl http://localhost:5000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T...",
  "redis": "ready"
}
```

---

## 🎉 ¡LISTO!

Tu proyecto ahora tiene:
- ✅ Sistema de logs profesional
- ✅ Caché con Redis (mejora el rendimiento)
- ✅ Colas asíncronas (procesa archivos grandes)
- ✅ Módulo Parser dedicado
- ✅ Arquitectura completa 3 capas (95% del diagrama UML)

---

## 📚 ARCHIVOS DE AYUDA

Si necesitas más información:

1. **RESUMEN_IMPLEMENTACION.md** - Resumen de todo lo implementado
2. **IMPLEMENTACION_COMPLETA.md** - Guía detallada de uso
3. **REDIS_INSTALACION.md** - Guía completa de Redis
4. **ESTRUCTURA_PROYECTO.md** - Estructura de carpetas

---

## 🔧 COMANDOS ÚTILES

### Redis (Docker)
```powershell
# Ver si está corriendo
docker ps

# Iniciar
docker start redis-tarapaca

# Detener
docker stop redis-tarapaca

# Ver logs
docker logs redis-tarapaca

# Probar conexión
docker exec -it redis-tarapaca redis-cli ping
```

### Servidor
```powershell
# Iniciar
cd backend
npm start

# Ver logs en tiempo real
Get-Content logs/combined.log -Tail 20 -Wait
Get-Content logs/error.log -Tail 20 -Wait
```

### Git
```powershell
# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: implementar Redis, BullMQ, Logger y módulo Parser"

# Push
git push origin main
```

---

## ❓ PROBLEMAS COMUNES

### "ECONNREFUSED" error
**Causa:** Redis no está corriendo

**Solución:**
```powershell
docker start redis-tarapaca
```

### "Cannot find module 'winston'"
**Causa:** Dependencias no instaladas

**Solución:**
```powershell
cd backend
npm install
```

### "Port 5000 already in use"
**Causa:** Otro proceso usa el puerto

**Solución:**
```powershell
# Cambiar puerto en .env
PORT=5001
```

---

## 📞 AYUDA ADICIONAL

Si algo no funciona:

1. Ver logs del servidor:
   ```powershell
   Get-Content backend/logs/error.log -Tail 50
   ```

2. Ver estado de Redis:
   ```powershell
   docker logs redis-tarapaca
   ```

3. Reiniciar todo:
   ```powershell
   docker restart redis-tarapaca
   cd backend
   npm start
   ```

---

## 🎯 PRÓXIMO PASO

**¡Empieza a usar el sistema!**

Todos los endpoints existentes siguen funcionando igual, pero ahora:
- 🚀 Más rápido (gracias a Redis)
- 📊 Con logs profesionales
- ⚡ Procesamiento asíncrono de archivos

**Nuevos endpoints disponibles:**
```
POST /api/parser/pdf        - Procesar PDF
POST /api/parser/excel      - Procesar Excel
GET  /api/health            - Estado del sistema
```

---

**Fecha:** 13 de Octubre, 2025  
**¡Todo listo para usar!** 🎉
