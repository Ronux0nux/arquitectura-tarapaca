# 🗂️ ESTRUCTURA COMPLETA DEL PROYECTO

## 📁 Vista General

```
TARAPAKAA/
│
├── 📄 IMPLEMENTACION_COMPLETA.md      ⭐ GUÍA PRINCIPAL
├── 📄 REDIS_INSTALACION.md            ⭐ CÓMO INSTALAR REDIS
├── 📄 RESUMEN_IMPLEMENTACION.md       ⭐ RESUMEN EJECUTIVO
├── 📄 ESTRUCTURA_PROYECTO.md          ⭐ ESTE ARCHIVO
│
├── 📂 backend/                         ⭐ SERVIDOR NODE.JS
│   ├── 📄 .env                        (crear desde .env.example)
│   ├── 📄 .env.example                ⭐ Plantilla de configuración
│   ├── 📄 .gitignore                  ⭐ Archivos ignorados por Git
│   ├── 📄 package.json
│   │
│   ├── 📂 logs/                       🆕 CARPETA DE LOGS
│   │   ├── error.log                  (logs de errores)
│   │   ├── combined.log               (todos los logs)
│   │   └── http.log                   (logs de peticiones HTTP)
│   │
│   ├── 📂 uploads/                    (archivos subidos)
│   │
│   └── 📂 src/
│       ├── 📄 index.js                ✏️ MODIFICADO - Integración completa
│       ├── 📄 db.js                   (conexión PostgreSQL)
│       │
│       ├── 📂 config/                 🆕 CONFIGURACIONES
│       │   ├── 📄 logger.js           🆕 Winston + Morgan
│       │   └── 📄 redis.js            🆕 Redis + Caché
│       │
│       ├── 📂 queues/                 🆕 SISTEMA DE COLAS
│       │   └── 📄 queueManager.js     🆕 BullMQ (4 colas)
│       │
│       ├── 📂 middleware/             🆕 MIDDLEWARES
│       │   └── (vacío por ahora)
│       │
│       ├── 📂 controllers/
│       │   ├── 📄 userController.js
│       │   ├── 📄 projectController.js
│       │   ├── 📄 providerController.js
│       │   ├── 📄 cotizacionController.js
│       │   ├── 📄 insumoController.js
│       │   ├── 📄 datasetController.js
│       │   ├── 📄 actaReunionController.js
│       │   ├── 📄 ordencompraController.js
│       │   ├── 📄 excelController.js
│       │   ├── 📄 csvProviderController.js
│       │   └── 📄 parserController.js 🆕 MÓDULO PARSER
│       │
│       ├── 📂 routes/
│       │   ├── 📄 userRoutes.js
│       │   ├── 📄 projectRoutes.js
│       │   ├── 📄 providerRoutes.js
│       │   ├── 📄 cotizacionRoutes.js
│       │   ├── 📄 insumoRoutes.js
│       │   ├── 📄 datasetRoutes.js
│       │   ├── 📄 actaReunionRoutes.js
│       │   ├── 📄 ordencompraRoutes.js
│       │   ├── 📄 excelRoutes.js
│       │   ├── 📄 csvProviderRoutes.js
│       │   ├── 📄 searchRoutes.js
│       │   ├── 📄 templateRoutes.js
│       │   └── 📄 parserRoutes.js     🆕 RUTAS PARSER
│       │
│       └── 📂 models/
│           ├── 📄 User.js
│           ├── 📄 Project.js
│           ├── 📄 Provider.js
│           ├── 📄 Cotizacion.js
│           ├── 📄 Insumo.js
│           ├── 📄 OrdenCompra.js
│           └── 📄 ActaReunion.js
│
└── 📂 frontend/                        (React SPA)
    ├── 📄 package.json
    ├── 📄 tailwind.config.js
    ├── 📂 public/
    ├── 📂 build/
    └── 📂 src/
        ├── 📄 App.jsx
        ├── 📄 index.js
        ├── 📂 pages/
        ├── 📂 components/
        ├── 📂 services/
        ├── 📂 context/
        └── 📂 utils/
```

---

## 🆕 ARCHIVOS NUEVOS IMPLEMENTADOS

### Config (Configuraciones)
```
📁 backend/src/config/
  ├── 📄 logger.js          Sistema de logs con Winston
  └── 📄 redis.js           Cliente Redis + funciones caché
```

**¿Qué hacen?**
- `logger.js`: Maneja todos los logs del sistema (info, error, warn, debug)
- `redis.js`: Conexión a Redis + funciones helper para caché

### Queues (Colas Asíncronas)
```
📁 backend/src/queues/
  └── 📄 queueManager.js    Gestión de colas con BullMQ
```

**¿Qué hace?**
- Define 4 colas: pdf-processing, excel-processing, provider-import, search-processing
- Crea workers para procesar jobs en background
- Funciones para agregar jobs y consultar estado

### Parser (Módulo Nuevo)
```
📁 backend/src/controllers/
  └── 📄 parserController.js   Lógica de parsing

📁 backend/src/routes/
  └── 📄 parserRoutes.js       Rutas del módulo parser
```

**¿Qué hace?**
- Procesa archivos PDF y Excel de forma asíncrona
- Valida formatos de archivo
- Consulta estado de procesamiento

### Documentación
```
📁 TARAPAKAA/ (raíz)
  ├── 📄 IMPLEMENTACION_COMPLETA.md    Guía completa de uso
  ├── 📄 REDIS_INSTALACION.md          Cómo instalar Redis
  ├── 📄 RESUMEN_IMPLEMENTACION.md     Resumen ejecutivo
  └── 📄 ESTRUCTURA_PROYECTO.md        Este archivo
```

### Otros
```
📁 backend/
  ├── 📄 .env.example        Plantilla de variables de entorno
  ├── 📄 .gitignore          Protege archivos sensibles
  └── 📁 logs/               Carpeta para archivos de logs
```

---

## 🔄 ARCHIVOS MODIFICADOS

### index.js (Principal)
```javascript
// ANTES: 
console.log('Servidor corriendo...');

// AHORA:
const logger = require('./config/logger');
const { redisClient, cache } = require('./config/redis');
const morgan = require('morgan');

// Middleware de logs HTTP
app.use(morgan('combined', { stream: logger.stream }));

// Logger y cache en req
app.use((req, res, next) => {
  req.logger = logger;
  req.cache = cache;
  next();
});

// Nueva ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    redis: redisClient.status 
  });
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Error interno' });
});

// Cierre graceful
process.on('SIGTERM', async () => {
  await redisClient.quit();
  process.exit(0);
});
```

---

## 📊 FLUJO DE DATOS

### 1. Request HTTP → Logs
```
Cliente → Express → Morgan Middleware → Winston → Archivos de logs
```

### 2. Request → Caché → Base de Datos
```
Cliente → Controller → Redis (cache.get)
                         ↓ MISS
                      PostgreSQL → cache.set → Response
```

### 3. Upload de Archivo → Cola → Procesamiento
```
Cliente → Upload → parserController → BullMQ Queue
                                         ↓
                                      Worker → Process
                                         ↓
                                      Complete → Response
```

---

## 🔌 SERVICIOS EXTERNOS NECESARIOS

### 1. PostgreSQL (Ya lo tienes)
```
Host: magallanes.icci-unap.cl
Port: 5432
Database: rmarcoleta
```

### 2. Redis (NUEVO - Necesitas instalarlo)
```
Opción 1: Docker
docker run --name redis-tarapaca -p 6379:6379 -d redis

Opción 2: Redis Cloud (gratis)
https://redis.com/try-free/
```

### 3. SerpAPI (Ya lo tienes)
```
https://serpapi.com/
```

---

## 🌐 ENDPOINTS DISPONIBLES

### Módulos Existentes
```
POST   /api/users/login
GET    /api/projects
GET    /api/providers
POST   /api/cotizaciones
GET    /api/insumos
POST   /api/search/search
POST   /api/excel/export
...
```

### Módulos Nuevos 🆕
```
POST   /api/parser/pdf              Procesar PDF
POST   /api/parser/excel            Procesar Excel
GET    /api/parser/status/:type/:id Estado del job
GET    /api/parser/jobs             Listar jobs
POST   /api/parser/validate         Validar archivo
GET    /api/health                  Estado del servidor
```

---

## 🎯 CÓMO USAR CADA COMPONENTE

### Logger (Logs)
```javascript
const logger = require('./config/logger');

logger.info('Usuario creado exitosamente');
logger.error(`Error en BD: ${error.message}`);
logger.warn('Caché expirado, renovando...');
logger.debug('Valor de variable X:', variable);
```

### Cache (Redis)
```javascript
const { cache } = require('./config/redis');

// Guardar (TTL: 1 hora = 3600 segundos)
await cache.set('providers:all', data, 3600);

// Obtener
const data = await cache.get('providers:all');

// Eliminar
await cache.del('providers:all');

// Limpiar por patrón
await cache.clear('providers:*');
```

### Queues (Colas)
```javascript
const { addPdfJob, getJobStatus, pdfQueue } = require('./queues/queueManager');

// Agregar job
const job = await addPdfJob({
  filePath: '/path/to/file.pdf',
  projectId: 123
});

// Consultar estado
const status = await getJobStatus(pdfQueue, job.id);
```

---

## 📈 ANTES vs DESPUÉS

### ANTES (70% del diagrama)
```
❌ console.log() sin estructura
❌ Sin caché, consultas lentas
❌ Sin procesamiento asíncrono
❌ Sin logs persistentes
❌ Sin módulo Parser dedicado
```

### DESPUÉS (95% del diagrama)
```
✅ Sistema de logs profesional
✅ Caché con Redis
✅ Colas asíncronas con BullMQ
✅ Logs en archivos rotados
✅ Módulo Parser dedicado
✅ Observabilidad completa
```

---

## 🚀 PRÓXIMOS PASOS

1. **Instalar Redis** (ver REDIS_INSTALACION.md)
2. **Configurar .env** (copiar .env.example)
3. **Iniciar servidor** (`npm start`)
4. **Verificar logs** (ver carpeta logs/)
5. **Probar endpoints nuevos** (/api/health, /api/parser/*)

---

**Fecha:** 13 de Octubre, 2025  
**Versión:** 2.0  
**Estado:** ✅ Completado
