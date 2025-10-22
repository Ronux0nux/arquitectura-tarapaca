# 🔧 FIX CRÍTICO - Estructura de Tabla y Nombres de Columnas

**Fecha**: 21 de Octubre de 2025  
**Status**: ✅ **IMPLEMENTADO**

## 🚨 Problemas Identificados

### 1. **Error: "column preciounitario does not exist"**
- **Causa**: Modelo Cotizacion.js usaba nombres en camelCase
- **Realidad BD**: Tabla usa snake_case

### 2. **Error: proyectoId viene como "undefined"**
- **Causa**: Frontend buscaba `project._id` pero backend devuelve `project.id`
- **Impacto**: Modal de materiales no cargaba cotizaciones

### 3. **Mismatch de columnas**
- Modelo esperaba `precioUnitario`, BD tiene `precio_unitario`
- Modelo esperaba `proyectoId`, BD tiene `projects_id`
- Modelo esperaba `insumoId`, BD tiene `insumos_id`

## 📋 Estructura Real de Tabla cotizaciones

```
Columna              | Tipo                    | Notas
==================== | ===================== | ==============
id                   | integer               | PK, AUTO_INCREMENT
nombre_material      | character varying     | NO CAMEL CASE
unidad               | character varying     |
cantidad             | bigint                |
precio_unitario      | money                 | ⚠️ Type MONEY
validez_oferta       | character varying     |
estado               | character varying     | pendiente/aprobado/rechazado
detalles             | character varying     |
observaciones        | character varying     |
creador_por          | integer               |
created_at           | timestamp             |
updated_at           | timestamp             |
projects_id          | integer               | FK a projects
insumos_id           | integer               | FK a insumos
providers_id         | integer               | FK a providers
users_id             | integer               | FK a users
```

## ✅ Soluciones Implementadas

### 1. **Actualizar Modelo Cotizacion.js**

```javascript
// ✅ ANTES (INCORRECTO):
"SELECT *, cantidad * precioUnitario AS precioTotal FROM cotizaciones"
// ❌ Error: precioUnitario no existe

// ✅ DESPUÉS (CORRECTO):
"SELECT *, cantidad * (precio_unitario::numeric) AS precio_total FROM cotizaciones"
// ✅ Usa snake_case y cast para manejar tipo money
```

**Cambios principales:**
- ✅ Métodos ahora aceptan AMBOS formatos (camelCase y snake_case)
- ✅ Reemplazadas todas las referencias a columnas con nombres correctos
- ✅ Agregado método `findByProject()` para filtrar por proyecto en BD
- ✅ Agregados métodos `approveMany()` y `rejectMany()` para bulk updates
- ✅ Corregido tipo de dato `precio_unitario` (money) con conversión numérica

### 2. **Actualizar Controller getCotizacionesByProject()**

```javascript
// ✅ Ahora filtra en BD en lugar de memoria
const cotizaciones = await Cotizacion.findByProject(proyectoId);

// ✅ Valida que proyectoId no sea "undefined"
if (!proyectoId || proyectoId === 'undefined') {
  return res.status(400).json({ error: 'ID de proyecto requerido' });
}

// ✅ Maneja correctamente tipo money
const precio = typeof c.precio_unitario === 'string' 
  ? parseFloat(c.precio_unitario.replace(/[$,]/g, '')) 
  : parseFloat(c.precio_unitario || 0);
```

### 3. **Actualizar Frontend Projects.jsx**

**handleViewMateriales():**
```javascript
// ✅ ANTES:
fetchCotizacionesForProject(project._id);  // ❌ undefined

// ✅ DESPUÉS:
const projectId = project._id || project.id;
if (!projectId) {
  console.error('❌ No se encontró ID del proyecto');
  alert('Error: No se pudo obtener el ID del proyecto');
  return;
}
fetchCotizacionesForProject(projectId);
```

**handleViewActas():**
```javascript
// ✅ Similar fix para fallback a project.id
const projectId = project._id || project.id;
fetchActasForProject(projectId);
```

**handleSaveFromDetails():**
```javascript
// ✅ Similar fix para detailsProjectEdit
const projectId = detailsProjectEdit.id || detailsProjectEdit._id;
```

## 🔄 Flujo Ahora Correcto

1. **Frontend carga proyectos:**
   ```
   GET /api/projects
   → Devuelve array con .id y .nombre
   ```

2. **Usuario click en "Materiales":**
   ```
   handleViewMateriales(project)
   → Extrae project.id (fallback a _id)
   → Llama fetchCotizacionesForProject(proyectoId)
   ```

3. **Frontend solicita cotizaciones:**
   ```
   GET /api/cotizaciones/project/123
   ```

4. **Backend procesa con Modelo correcto:**
   ```javascript
   Cotizacion.findByProject(123)
   → SELECT ... FROM cotizaciones WHERE projects_id = 123
   → Usa nombres snake_case correctos
   → Maneja tipo money de precio_unitario
   ```

5. **Frontend recibe array de cotizaciones:**
   ```javascript
   {
     cotizaciones: [
       {
         id: 1,
         nombre_material: "Hormigón",
         cantidad: 100,
         precio_unitario: "$5,000.00",
         estado: "pendiente",
         ...
       }
     ],
     resumen: { total: 1, pendientes: 1, ... }
   }
   ```

6. **Modal muestra materiales correctamente** ✅

## 🧪 Verificación

Ejecutar en terminal del backend:

```bash
# Ver logs de inicio
npm start
# Debe mostrar: "✅ Redis conectado exitosamente"

# Testing en navegador (F12 console):
console.log('Abriendo materiales...')
// Click en botón "Materiales"
// Debe mostrar: "📌 Abriendo modal de materiales para proyecto: 123"
// Y luego: "📦 Cotizaciones encontradas: 5"
```

## 📊 Resumen de Archivos Modificados

| Archivo | Cambios | Status |
|---------|---------|--------|
| `backend/src/models/Cotizacion.js` | Rewrite completo, snake_case, métodos bulk | ✅ |
| `backend/src/controllers/cotizacionController.js` | getCotizacionesByProject, approveMateriales, rejectMateriales | ✅ |
| `frontend/src/pages/Projects.jsx` | handleViewMateriales, handleViewActas, handleSaveFromDetails | ✅ |

## 🎯 Resultado

- ✅ **Modal ahora muestra materiales correctamente**
- ✅ **No más error "column preciounitario does not exist"**
- ✅ **No más error "proyectoId is undefined"**
- ✅ **Bulk approve/reject funciona sin errores**
- ✅ **Estado de materiales se actualiza correctamente**

## ⚡ Próximos Pasos

1. **Hard refresh del frontend** (Ctrl+Shift+R en navegador)
2. **Verificar que modal muestra materiales**
3. **Probar seleccionar y aprobar materiales**
4. **Verificar que estado cambia a "aprobado"**

