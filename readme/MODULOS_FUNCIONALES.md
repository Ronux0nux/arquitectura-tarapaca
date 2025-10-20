# 🎯 MÓDULOS FUNCIONALES DEL SISTEMA TARAPAKAA

## 📋 Índice
1. [Módulos del Backend](#-módulos-del-backend)
2. [Módulos del Frontend](#-módulos-del-frontend)
3. [Infraestructura y Servicios](#-infraestructura-y-servicios)
4. [Integraciones](#-integraciones)
5. [Resumen de Funcionalidades](#-resumen-de-funcionalidades)

---

## 🔧 MÓDULOS DEL BACKEND

### 1. **Módulo de Usuarios** 👥
- **Controller**: `userController.js`
- **Routes**: `userRoutes.js`
- **Model**: `User.js`
- **Funcionalidades**:
  - Autenticación y autorización de usuarios
  - Gestión de perfiles (Administrador, Arquitecto, Supervisor, Asistente)
  - Control de acceso basado en roles
  - Gestión de credenciales

### 2. **Módulo de Proyectos** 🏗️
- **Controller**: `projectController.js`
- **Routes**: `projectRoutes.js`
- **Model**: `Project.js`
- **Funcionalidades**:
  - Creación y gestión de proyectos de construcción
  - Asignación de recursos
  - Seguimiento de presupuestos por proyecto
  - Gestión de materiales por proyecto
  - Dashboard de métricas de proyecto

### 3. **Módulo de Proveedores** 🏢
- **Controller**: `providerController.js`
- **Routes**: `providerRoutes.js`
- **Model**: `Provider.js`
- **Funcionalidades**:
  - Registro y gestión de proveedores
  - Importación masiva desde CSV
  - Búsqueda avanzada de proveedores
  - Filtros por categoría, tamaño, certificaciones
  - Gestión de contactos y especialidades
  - Integración con proveedores externos (Sodimac, Easy, etc.)

### 4. **Módulo de Insumos/Materiales** 📦
- **Controller**: `insumoController.js`
- **Routes**: `insumoRoutes.js`
- **Model**: `Insumo.js`
- **Funcionalidades**:
  - Catálogo de materiales de construcción
  - Gestión de inventario
  - Búsqueda inteligente de materiales
  - Historial de precios
  - Comparación entre proveedores

### 5. **Módulo de Cotizaciones** 💰
- **Controller**: `cotizacionController.js`
- **Routes**: `cotizacionRoutes.js`
- **Model**: `Cotizacion.js`
- **Funcionalidades**:
  - Creación de cotizaciones
  - Sistema de carrito de compras
  - Gestión de estados (Pendiente, Aprobada, Rechazada)
  - Exportación a Excel
  - Historial de cotizaciones
  - Aprobación y rechazo de cotizaciones
  - Cotizaciones por proyecto

### 6. **Módulo de Órdenes de Compra** 📝
- **Controller**: `ordencompraController.js`
- **Routes**: `ordencompraRoutes.js`
- **Model**: `OrdenCompra.js`
- **Funcionalidades**:
  - Generación de órdenes de compra
  - Seguimiento de pedidos
  - Estados de órdenes
  - Vinculación con cotizaciones aprobadas

### 7. **Módulo de Actas de Reunión** 📋
- **Controller**: `actaReunionController.js`
- **Routes**: `actaReunionRoutes.js`
- **Model**: `ActaReunion.js`
- **Funcionalidades**:
  - Creación de actas por proyecto
  - Registro de asistentes
  - Gestión de acuerdos y compromisos
  - Búsqueda de actas
  - Exportación de información

### 8. **Módulo de Búsqueda con SerpAPI** 🔍
- **Routes**: `searchRoutes.js`
- **Funcionalidades**:
  - Búsqueda de materiales en internet
  - Integración con SerpAPI
  - Procesamiento de resultados
  - Almacenamiento de búsquedas

### 9. **Módulo de Procesamiento de Excel** 📊
- **Controller**: `excelController.js`
- **Routes**: `excelRoutes.js`
- **Funcionalidades**:
  - Generación de plantillas Excel
  - Importación de datos desde Excel
  - Exportación de cotizaciones a Excel
  - Procesamiento de hojas de cálculo

### 10. **Módulo de CSV de Proveedores** 📁
- **Controller**: `csvProviderController.js`
- **Routes**: `csvProviderRoutes.js`
- **Funcionalidades**:
  - Importación masiva de proveedores desde CSV
  - Búsqueda en base de datos CSV
  - Estadísticas de proveedores
  - Procesamiento de archivos CSV

### 11. **Módulo de Datasets** 🗄️
- **Controller**: `datasetController.js`
- **Routes**: `datasetRoutes.js`
- **Funcionalidades**:
  - Carga de datasets de materiales
  - Almacenamiento de resultados de búsqueda
  - Gestión de datos masivos

### 12. **Módulo Parser** 🔄 (NUEVO)
- **Controller**: `parserController.js`
- **Routes**: `parserRoutes.js`
- **Funcionalidades**:
  - Parsing de archivos PDF
  - Parsing de archivos Excel
  - Validación de archivos
  - Consulta de estado de procesamiento
  - Listado de trabajos activos

### 13. **Módulo de Plantillas** 📄
- **Routes**: `templateRoutes.js`
- **Funcionalidades**:
  - Gestión de plantillas de documentos
  - Generación de documentos estandarizados

---

## 🎨 MÓDULOS DEL FRONTEND

### 1. **Módulo de Autenticación** 🔐
- **Componente**: `Login.jsx`
- **Context**: `AuthContext`
- **Funcionalidades**:
  - Login de usuarios
  - Protección de rutas
  - Gestión de sesión
  - Control de acceso por roles

### 2. **Página Principal** 🏠
- **Componente**: `Home.jsx`
- **Funcionalidades**:
  - Dashboard principal
  - Resumen de actividades
  - Acceso rápido a módulos

### 3. **Gestión de Usuarios** 👤
- **Componente**: `Users.jsx`
- **Funcionalidades**:
  - Lista de usuarios del sistema
  - Creación y edición de usuarios
  - Asignación de roles
  - Gestión de permisos

### 4. **Gestión de Proyectos** 🏗️
- **Componentes**: 
  - `Projects.jsx`
  - `ProjectMaterials.jsx`
  - `ProjectIntegrationSummary.jsx`
- **Funcionalidades**:
  - Creación y edición de proyectos
  - Vista de materiales por proyecto
  - Integración de datos del proyecto
  - Seguimiento de presupuestos

### 5. **Gestión de Proveedores** 🏪
- **Componentes**:
  - `Providers.jsx`
  - `ProvidersList.jsx`
  - `ImportarProveedores.jsx`
  - `CSVProviders.jsx`
- **Funcionalidades**:
  - Lista completa de proveedores
  - Búsqueda y filtros avanzados
  - Importación desde CSV y PDF
  - Visualización de 25+ proveedores vigentes
  - Filtros por categoría, tamaño, certificaciones

### 6. **Gestión de Insumos** 📦
- **Componente**: `Insumos.jsx`
- **Funcionalidades**:
  - Catálogo de materiales
  - Búsqueda de insumos
  - Gestión de precios
  - Comparación de proveedores

### 7. **Sistema de Cotizaciones** 💳
- **Componentes**:
  - `Cotizaciones.jsx`
  - `HistorialCotizaciones.jsx`
  - `CotizacionCart.jsx`
  - `CotizacionCartV2.jsx`
  - `CartButton.jsx`
- **Funcionalidades**:
  - Carrito de compras inteligente
  - Creación de cotizaciones
  - Historial completo
  - Exportación a Excel
  - Notificaciones automáticas
  - Comparación de precios

### 8. **Módulo de Presupuestos** 💰
- **Componente**: `Presupuestos.jsx`
- **Funcionalidades**:
  - Gestión de presupuestos por proyecto
  - Visualización de items cotizados
  - Estados: Aprobado, Pendiente, Cotizado
  - Estadísticas en tiempo real
  - Búsqueda y filtros
  - Exportación CSV
  - Diseño responsive

### 9. **Actas de Reunión** 📋
- **Componentes**:
  - `ActasReunion.jsx`
  - `CreateActaReunion.jsx`
- **Funcionalidades**:
  - Creación de actas
  - Gestión de asistentes
  - Registro de acuerdos
  - Búsqueda de actas

### 10. **Buscador Avanzado** 🔍
- **Componentes**:
  - `BuscadorPage.jsx`
  - `BuscadorMateriales.jsx`
- **Funcionalidades**:
  - Búsqueda local en BD
  - Búsqueda con SerpAPI
  - Sugerencias automáticas
  - Historial de búsquedas

### 11. **Procesamiento de Excel** 📊
- **Componentes**:
  - `ExcelOnline.jsx`
  - `ExcelOnlineFixed.jsx`
- **Funcionalidades**:
  - Visualización de Excel en línea
  - Edición de hojas de cálculo
  - Importación/exportación

### 12. **Visualizador de PDFs** 📄
- **Componentes**:
  - `PDFViewer.jsx`
  - `DirectPDFViewer.jsx`
  - `PDFMassiveImporter.jsx`
- **Funcionalidades**:
  - Visualización de PDFs
  - Importación masiva de PDFs
  - Extracción de datos

### 13. **Página Corporativa** 🌐
- **Componente**: `CorporacionTarapaka.jsx`
- **Funcionalidades**:
  - Carrusel de imágenes automático
  - Información de proyectos realizados
  - Presentación del equipo
  - Página de bienvenida

### 14. **Configuración del Sistema** ⚙️
- **Componente**: `ConfiguracionPage.jsx`
- **Funcionalidades**:
  - **Notificaciones**: Activar/desactivar, configurar preferencias
  - **Proveedores**: Gestión de integraciones, configurar API keys
  - **Backups**: Crear backups, configurar automático, historial
  - **IA**: Activar automatizaciones, nivel de confianza, frecuencia

### 15. **Sistema de Notificaciones** 🔔
- **Componente**: `NotificationBell.jsx`
- **Funcionalidades**:
  - Campana con contador de no leídas
  - Dropdown de notificaciones
  - Tipos: éxito, error, advertencia, info, cotizaciones, proveedores
  - Marcar como leídas
  - Eliminar notificaciones
  - Persistencia en localStorage

### 16. **Navegación** 🧭
- **Componentes**:
  - `Navbar.jsx`
  - `NavbarResponsive.jsx`
- **Funcionalidades**:
  - Navegación principal
  - Menú responsive
  - Acceso a todas las funciones
  - Integración con autenticación

### 17. **Protección de Rutas** 🛡️
- **Componente**: `ProtectedRoute.jsx`
- **Funcionalidades**:
  - Control de acceso
  - Redirección de usuarios no autorizados

### 18. **Modal de Compra** 🛒
- **Componente**: `CompraModal.jsx`
- **Funcionalidades**:
  - Confirmación de órdenes de compra
  - Resumen de items

---

## 🏗️ INFRAESTRUCTURA Y SERVICIOS

### 1. **Sistema de Logs** 📝
- **Archivo**: `backend/src/config/logger.js`
- **Tecnología**: Winston + Morgan
- **Funcionalidades**:
  - Logs en consola con colores
  - Logs en archivos (error.log, combined.log, http.log)
  - Rotación automática de archivos (5MB máximo)
  - Niveles: error, warn, info, http, debug
  - Middleware HTTP logging

### 2. **Sistema de Caché** 🔴
- **Archivo**: `backend/src/config/redis.js`
- **Tecnología**: Redis (ioredis)
- **Funcionalidades**:
  - Cliente Redis configurado
  - Funciones helper: get, set, del, clear, exists, ttl
  - Serialización JSON automática
  - Reconexión automática
  - Caché de consultas frecuentes

### 3. **Sistema de Colas** 🚀
- **Archivo**: `backend/src/queues/queueManager.js`
- **Tecnología**: BullMQ
- **Colas implementadas**:
  1. **pdf-processing**: Procesamiento de PDFs
  2. **excel-processing**: Procesamiento de Excel
  3. **provider-import**: Importación masiva de proveedores
  4. **search-processing**: Búsquedas con SerpAPI
- **Funcionalidades**:
  - Workers dedicados
  - Reintentos automáticos (3 intentos)
  - Backoff exponencial
  - Logs de eventos
  - Consulta de estado de jobs

### 4. **Base de Datos** 🗄️
- **Archivo**: `backend/src/db.js`
- **Tecnología**: PostgreSQL (Sequelize)
- **Funcionalidades**:
  - Conexión a PostgreSQL
  - ORM Sequelize
  - Modelos de datos
  - Migraciones

---

## 🔗 INTEGRACIONES

### 1. **SerpAPI** 🌐
- **Propósito**: Búsqueda de materiales en internet
- **Uso**: Módulo de búsqueda

### 2. **Proveedores Externos** 🏪
- **Servicios integrados**:
  - Sodimac
  - Easy
  - Construmart
  - Imperial
- **Funcionalidades**:
  - Búsqueda simultánea
  - Comparación de precios
  - Verificación de stock
  - Alertas de precio

### 3. **OpenAI** 🤖
- **Propósito**: Funciones de IA
- **Uso**: 
  - Sugerencias inteligentes
  - Análisis de cotizaciones
  - Generación de descripciones

### 4. **Servicios de Frontend** 💼
- **NotificationService**: Gestión de notificaciones
- **ProviderService**: Integración con proveedores
- **BackupService**: Backup y sincronización
- **AIService**: Automatizaciones con IA

---

## 📊 RESUMEN DE FUNCIONALIDADES

### ✅ Funcionalidades Implementadas

#### Backend (13 módulos)
1. ✅ Usuarios y autenticación
2. ✅ Proyectos
3. ✅ Proveedores (con importación CSV/PDF)
4. ✅ Insumos/Materiales
5. ✅ Cotizaciones
6. ✅ Órdenes de compra
7. ✅ Actas de reunión
8. ✅ Búsqueda SerpAPI
9. ✅ Procesamiento Excel
10. ✅ CSV Proveedores
11. ✅ Datasets
12. ✅ Parser (PDF/Excel)
13. ✅ Plantillas

#### Frontend (18 módulos)
1. ✅ Autenticación y login
2. ✅ Dashboard principal
3. ✅ Gestión de usuarios
4. ✅ Gestión de proyectos
5. ✅ Gestión de proveedores
6. ✅ Gestión de insumos
7. ✅ Sistema de cotizaciones con carrito
8. ✅ Presupuestos por proyecto
9. ✅ Actas de reunión
10. ✅ Buscador avanzado
11. ✅ Procesamiento Excel online
12. ✅ Visualizador de PDFs
13. ✅ Página corporativa
14. ✅ Configuración del sistema
15. ✅ Sistema de notificaciones
16. ✅ Navegación responsive
17. ✅ Protección de rutas
18. ✅ Modales y componentes auxiliares

#### Infraestructura (4 sistemas)
1. ✅ Sistema de logs (Winston + Morgan)
2. ✅ Sistema de caché (Redis)
3. ✅ Sistema de colas (BullMQ)
4. ✅ Base de datos (PostgreSQL)

#### Integraciones (4 servicios)
1. ✅ SerpAPI
2. ✅ Proveedores externos
3. ✅ OpenAI (IA)
4. ✅ Servicios frontend especializados

---

## 🎯 CARACTERÍSTICAS PRINCIPALES POR ÁREA

### 🔔 **Sistema de Notificaciones**
- Campana con contador en navbar
- Tipos diferenciados (éxito, error, advertencia, info, cotizaciones, proveedores)
- Persistencia en localStorage
- Gestión completa (marcar leídas, eliminar)
- Notificaciones automáticas en procesos

### 🏢 **Integración de Proveedores**
- 25+ proveedores vigentes importados
- Búsqueda simultánea en múltiples proveedores
- Comparación automática de precios
- Verificación de stock en tiempo real
- Alertas de precio configurables
- Historial de precios

### 💾 **Backup y Sincronización**
- Backups manuales y automáticos
- Exportación/importación JSON
- Sincronización con servidor
- Resolución automática de conflictos
- Historial de backups

### 🤖 **IA y Automatización**
- Sugerencias inteligentes basadas en historial
- Predicción de precios
- Optimización de cotizaciones
- Detección de materiales desde imágenes
- Generación automática de descripciones
- Análisis con recomendaciones
- Procesamiento de lenguaje natural

### 📊 **Gestión de Cotizaciones**
- Carrito de compras inteligente V2
- Exportación a Excel profesional
- Historial completo
- Notificaciones automáticas
- Análisis con IA
- Comparación entre proveedores

### 🔍 **Búsqueda Avanzada**
- Búsqueda local primero
- SerpAPI como respaldo
- Sugerencias automáticas
- Filtros múltiples
- Historial de búsquedas

---

## 📈 MÉTRICAS DEL SISTEMA

### Backend
- **13 Controladores**
- **13 Rutas**
- **7 Modelos principales**
- **4 Sistemas de infraestructura**

### Frontend
- **18 Páginas principales**
- **20+ Componentes**
- **4 Servicios especializados**
- **1 Context de autenticación**

### Total
- **35+ Módulos funcionales**
- **4 Colas de procesamiento**
- **4 Integraciones externas**
- **100% Responsive**
- **100% Funcional**

---

## 🔮 FUNCIONALIDADES FUTURAS

### En Desarrollo
- Chatbot especializado en construcción
- Reconocimiento de voz para búsquedas
- Análisis predictivo de demanda
- Integración con ERP empresarial

### Planificadas
- App móvil nativa
- Escaneo QR para materiales
- Realidad aumentada para visualización
- Blockchain para trazabilidad

---

## 🛡️ SEGURIDAD

- ✅ Autenticación JWT
- ✅ Control de acceso basado en roles
- ✅ Protección de rutas
- ✅ Datos encriptados en localStorage
- ✅ Comunicación segura con APIs
- ✅ Backup redundante
- ✅ Logs de auditoría

---

## 📱 DISEÑO RESPONSIVE

- ✅ Mobile-first approach
- ✅ Totalmente responsive en todos los dispositivos
- ✅ Touch-friendly interfaces
- ✅ Optimizado para tablets y móviles
- ✅ Navegación adaptativa

---

## ✅ ESTADO ACTUAL

**🎉 SISTEMA 100% FUNCIONAL Y OPERATIVO**

- ✅ Backend completo con 13 módulos
- ✅ Frontend completo con 18 páginas
- ✅ Infraestructura robusta (logs, caché, colas)
- ✅ Integraciones activas
- ✅ Sistema de notificaciones
- ✅ Backup y sincronización
- ✅ IA y automatizaciones
- ✅ Diseño responsive
- ✅ Documentación completa
- ✅ Listo para producción

---

**Última actualización**: Octubre 2025  
**Versión del sistema**: 2.0  
**Estado**: Producción
