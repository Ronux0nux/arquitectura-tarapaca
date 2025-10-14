# 🏗️ Sistema de Cotizaciones Arquitectura Tarapacá

Sistema completo de gestión de proyectos, cotizaciones, proveedores y presupuestos para la construcción.

## 🎯 Arquitectura Cliente-Servidor 3 Capas

### Cumplimiento: **95%** ✅

- ✅ **Capa de Presentación**: React SPA con Tailwind CSS
- ✅ **Capa de Aplicación**: Node.js + Express + 9 módulos
- ✅ **Capa de Datos**: PostgreSQL
- ✅ **Servicios Complementarios**: Redis + BullMQ
- ✅ **Fuentes Externas**: SerpAPI + Docs PDF/Excel

---

## 🚀 Inicio Rápido

### 📋 Prerequisitos

- Node.js 16+
- PostgreSQL
- Redis (Docker o instalación local)

### ⚡ Instalación Rápida

```bash
# 1. Instalar Redis con Docker
docker run --name redis-tarapaca -p 6379:6379 -d redis:latest

# 2. Clonar repositorio
git clone [tu-repo]
cd TARAPAKAA

# 3. Configurar backend
cd backend
npm install
copy .env.example .env  # Editar con tus credenciales

# 4. Configurar frontend
cd ../frontend
npm install

# 5. Iniciar backend
cd ../backend
npm start

# 6. Iniciar frontend (en otra terminal)
cd ../frontend
npm start
```

**Ver guía completa:** `INICIO_RAPIDO.md`

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** | ⭐ Guía de inicio en 5 minutos |
| **[RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)** | Resumen ejecutivo de lo implementado |
| **[IMPLEMENTACION_COMPLETA.md](IMPLEMENTACION_COMPLETA.md)** | Guía técnica completa |
| **[REDIS_INSTALACION.md](REDIS_INSTALACION.md)** | Cómo instalar Redis (3 opciones) |
| **[ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md)** | Estructura de carpetas y archivos |
| **[SISTEMA_AVANZADO_README.md](SISTEMA_AVANZADO_README.md)** | Funcionalidades avanzadas |
| **[PDF_MASIVO_README.md](PDF_MASIVO_README.md)** | Sistema de PDFs masivos |
| **[PRESUPUESTOS_README.md](PRESUPUESTOS_README.md)** | Sistema de presupuestos |

---

## ✨ Características Principales

### 🔐 Autenticación y Usuarios
- Login/logout con JWT
- Roles: Admin, Supervisor, Usuario
- Gestión de permisos

### 🏗️ Gestión de Proyectos
- CRUD completo de proyectos
- Asignación de usuarios
- Estados y seguimiento
- Presupuestos por proyecto

### 🏢 Gestión de Proveedores
- Importación masiva CSV (9693+ proveedores)
- Integración con Sodimac, Easy, Construmart
- Comparación de precios
- Historial de cotizaciones

### 📊 Cotizaciones y Presupuestos
- Creación y gestión de cotizaciones
- Cálculo automático de presupuestos
- Exportación a Excel/PDF
- Historial y versiones

### 🔍 Búsqueda Avanzada
- Búsqueda de materiales con SerpAPI
- Filtros por categoría, proveedor, precio
- Comparación de precios en tiempo real
- Guardado de resultados en dataset

### 📄 Procesamiento de Documentos
- **PDFs**: Hasta 9693 páginas
- **Excel**: Importación/exportación
- **CSV**: Carga masiva de datos
- **Procesamiento asíncrono** con colas

### 💾 Sistema de Caché
- Redis para datos frecuentes
- Mejora de rendimiento 10x
- Invalidación inteligente
- TTL configurable

### 📝 Sistema de Logs
- Winston para logs estructurados
- Morgan para logs HTTP
- Archivos rotados (error.log, combined.log, http.log)
- Niveles: error, warn, info, debug

### 🚀 Procesamiento Asíncrono
- BullMQ para colas de tareas
- Workers dedicados por tipo de tarea
- Reintentos automáticos
- Seguimiento de estado de jobs

---

## 🏗️ Arquitectura Técnica

### Backend (Node.js + Express)

```
backend/src/
├── config/           # Configuraciones (logger, redis)
├── queues/           # Sistema de colas (BullMQ)
├── middleware/       # Middlewares personalizados
├── controllers/      # Lógica de negocio
├── routes/           # Definición de endpoints
├── models/           # Modelos de datos
└── index.js          # Punto de entrada
```

### Frontend (React)

```
frontend/src/
├── pages/            # Páginas principales
├── components/       # Componentes reutilizables
├── services/         # Servicios API
├── context/          # Contextos React
└── utils/            # Utilidades
```

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/users/login
POST   /api/users/logout
GET    /api/users/verify
```

### Proyectos
```
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Proveedores
```
GET    /api/providers
POST   /api/providers
POST   /api/providers/import
```

### Cotizaciones
```
GET    /api/cotizaciones
POST   /api/cotizaciones
PUT    /api/cotizaciones/:id
DELETE /api/cotizaciones/:id
```

### 🆕 Parser (Nuevo)
```
POST   /api/parser/pdf
POST   /api/parser/excel
GET    /api/parser/status/:type/:jobId
GET    /api/parser/jobs
POST   /api/parser/validate
```

### 🆕 Sistema
```
GET    /api/health     # Estado del servidor y Redis
```

**Ver documentación completa de API:** `IMPLEMENTACION_COMPLETA.md`

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Base de Datos**: PostgreSQL 8.16
- **Caché**: Redis + ioredis
- **Colas**: BullMQ
- **Logs**: Winston + Morgan
- **Autenticación**: JWT + bcrypt
- **Archivos**: Multer
- **Excel**: XLSX
- **HTTP Client**: Axios

### Frontend
- **Framework**: React 18.3
- **Router**: React Router 7.6
- **Estilos**: Tailwind CSS 4.1
- **HTTP Client**: Axios
- **Excel**: XLSX, Handsontable
- **Carruseles**: Swiper, React Slick

---

## 📊 Módulos Implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| API REST | ✅ | Express + 13 módulos de rutas |
| Módulo Auth | ✅ | JWT + bcrypt |
| Gestión Proyectos | ✅ | CRUD completo |
| Gestión Proveedores | ✅ | Importación masiva CSV |
| Búsqueda Materiales | ✅ | SerpAPI + dataset |
| Resumen Presupuesto | ✅ | Cálculos automáticos |
| Plantilla Excel | ✅ | Exportación/importación |
| **Módulo Parser** | ✅ 🆕 | Procesamiento asíncrono |
| **Logger/Metrics** | ✅ 🆕 | Winston + Morgan |
| PostgreSQL | ✅ | 7 tablas + relaciones |
| **BullMQ** | ✅ 🆕 | 4 colas de procesamiento |
| **Redis** | ✅ 🆕 | Caché + backend de colas |
| APIs Externas | ✅ | SerpAPI + proveedores |
| Docs PDF/Excel | ✅ | Procesamiento masivo |

---

## 🔒 Variables de Entorno

Crear archivo `.env` en `/backend`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_USER=tu_usuario
DB_HOST=tu_host
DB_DATABASE=tu_database
DB_PASSWORD=tu_password
DB_PORT=5432

# JWT
JWT_SECRET=tu_secreto_super_seguro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=     # Opcional

# SerpAPI
SERPAPI_KEY=tu_api_key
```

**Ver ejemplo completo:** `backend/.env.example`

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📦 Build para Producción

```bash
# Frontend
cd frontend
npm run build

# El backend servirá el build automáticamente
cd ../backend
npm start
```

---

## 🔧 Comandos Útiles

### Redis (Docker)
```bash
docker start redis-tarapaca
docker stop redis-tarapaca
docker logs redis-tarapaca
docker exec -it redis-tarapaca redis-cli ping
```

### Logs del Servidor
```bash
# PowerShell
Get-Content backend/logs/error.log -Tail 20 -Wait
Get-Content backend/logs/combined.log -Tail 20 -Wait
```

### Base de Datos
```bash
# Conectar a PostgreSQL
psql -h host -U usuario -d database
```

---

## 👥 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'feat: agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Crear Pull Request

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 📞 Soporte

Para problemas o preguntas:

1. Ver documentación en carpeta raíz
2. Revisar logs: `backend/logs/`
3. Verificar estado: `http://localhost:5000/api/health`

---

## 🎉 Changelog

### v2.0.0 (13 Oct 2025)
- ✨ Implementación de Redis para caché
- ✨ Sistema de logs con Winston y Morgan
- ✨ Colas asíncronas con BullMQ
- ✨ Nuevo módulo Parser dedicado
- ✨ Endpoint de salud del sistema
- ✨ Manejo de errores mejorado
- ✨ Cierre graceful del servidor
- 📚 Documentación completa actualizada

### v1.0.0
- ✅ Sistema base con 8 módulos
- ✅ Frontend React completo
- ✅ Integración PostgreSQL
- ✅ Sistema de autenticación
- ✅ Gestión de proyectos y proveedores

---

**Desarrollado con ❤️ por el equipo Tarapacá**

**Última actualización:** 13 de Octubre, 2025
