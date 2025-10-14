# 📊 DIAGRAMAS DEL SISTEMA TARAPACÁ

Este directorio contiene todos los diagramas de arquitectura del sistema en formato PlantUML.

## 📁 Archivos disponibles

### 1. **componentes-completo.puml** ⭐
Diagrama de componentes detallado del sistema completo.

**Incluye:**
- ✅ Capa de Presentación (React)
- ✅ Capa de Aplicación (13 módulos)
- ✅ Capa de Datos (PostgreSQL + Redis)
- ✅ Servicios Complementarios (BullMQ, Caché)
- ✅ Fuentes Externas (SerpAPI, proveedores)
- ✅ Todas las relaciones y flujos

**Elementos nuevos marcados en amarillo:** 🆕
- Módulo Parser
- Sistema de Logs (Winston)
- Sistema de Caché (Redis)
- Sistema de Colas (BullMQ)

---

### 2. **arquitectura-sistema.puml**
Diagrama de arquitectura de 3 capas del sistema.

**Muestra:**
- 📱 Capa de Presentación (Frontend React)
- 🖥️ Capa de Aplicación (Backend Node.js)
- 💾 Capa de Datos (PostgreSQL + Redis + Archivos)
- ☁️ Servicios Externos

**Con notas de:**
- Puertos utilizados
- Funcionalidades de cada capa
- Nuevas características implementadas

---

### 3. **flujo-procesamiento.puml**
Diagrama de secuencia de flujos principales.

**Flujos documentados:**
1. **Consulta con Caché**
   - Cache Hit (rápido)
   - Cache Miss (consulta BD)
   
2. **Procesamiento Asíncrono**
   - Upload de archivos grandes
   - Encolar job
   - Procesamiento en background
   - Consulta de estado

3. **Manejo de Errores**
   - Captura de excepciones
   - Logging estructurado
   - Respuesta al usuario

---

### 4. **despliegue-infraestructura.puml**
Diagrama de despliegue e infraestructura.

**Muestra:**
- 🌐 Cliente (Navegador)
- 🖥️ Servidor de Aplicación (Node.js)
- 🔴 Servidor Redis
- 🗄️ Servidor PostgreSQL
- ⚙️ Workers en Background
- ☁️ Servicios Externos
- 🐳 Docker (desarrollo)

**Con notas de configuración para:**
- Desarrollo local
- Producción

---

## 🎨 Cómo visualizar los diagramas

### Opción 1: PlantUML Online
1. Ir a: http://www.plantuml.com/plantuml/uml/
2. Copiar el contenido de cualquier archivo `.puml`
3. Pegar y visualizar

### Opción 2: VS Code + Extensión
1. Instalar extensión: "PlantUML" (jebbs)
2. Abrir cualquier archivo `.puml`
3. Presionar `Alt + D` para vista previa

### Opción 3: IntelliJ/WebStorm
1. Plugin PlantUML viene integrado
2. Abrir archivo `.puml`
3. Vista previa automática

### Opción 4: Generar imágenes PNG
```bash
# Instalar plantuml
npm install -g node-plantuml

# Generar imagen
puml generate diagrams/componentes-completo.puml
```

---

## 📖 Convenciones usadas

### Colores:
- 🔵 **LightBlue** - Frontend / Presentación
- 🟢 **LightGreen** - Backend / Aplicación
- 🟡 **LightYellow** - Base de Datos
- 🟠 **Orange** - Caché (Redis)
- 🔴 **LightCoral** - Colas (BullMQ)
- ⚪ **LightGray** - Servicios Externos
- 🟨 **Yellow** - Componentes nuevos

### Símbolos:
- ✅ Implementado
- 🆕 Nuevo en v2.0
- ⚠️ En desarrollo
- 📦 Módulo
- 🔌 API
- 💾 Datos persistentes
- 🔴 Caché temporal
- ⚡ Procesamiento rápido
- 🐢 Procesamiento lento

---

## 🔄 Actualización de diagramas

Estos diagramas reflejan el estado actual del sistema a **13 de Octubre, 2025**.

**Última actualización:** v2.0
- ✅ Módulo Parser agregado
- ✅ Sistema de Logs (Winston) agregado
- ✅ Sistema de Caché (Redis) agregado
- ✅ Sistema de Colas (BullMQ) agregado

---

## 📚 Más información

Ver documentación completa en:
- `README.md` - Documentación general
- `IMPLEMENTACION_COMPLETA.md` - Guía técnica detallada
- `RESUMEN_IMPLEMENTACION.md` - Resumen ejecutivo
- `ESTRUCTURA_PROYECTO.md` - Estructura de carpetas

---

**Fecha:** 13 de Octubre, 2025  
**Versión:** 2.0  
**Estado:** ✅ Completado
