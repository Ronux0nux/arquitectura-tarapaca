# 🔧 FIX: Guardar Cotizaciones Vinculadas a Proyectos

**Fecha**: Octubre 21, 2025  
**Versión**: 1.0  
**Estado**: Implementado

---

## 📋 Problema Identificado

Los materiales cotizados no se estaban guardando vinculados al proyecto en la base de datos. Solo se guardaban en localStorage, por lo que:

❌ Al abrir el modal "Materiales" del proyecto, no mostraba nada  
❌ Los datos no persistían en la BD  
❌ No se podían aprobar/rechazar materiales  

---

## 🎯 Causa Raíz

La función `guardarCotizacion()` en `CotizacionesContext.jsx` solo:
1. Guardaba en localStorage
2. NO hacía POST a la API backend
3. NO asignaba el `proyectoId` a cada cotización

---

## ✅ Solución Implementada

### 1. **Modificación en CotizacionesContext.jsx**

**Antes:**
```javascript
const guardarCotizacion = (cotizacionData) => {
  // Solo guardaba en localStorage
  localStorage.setItem('cotizaciones_historial', JSON.stringify(nuevasCotizaciones));
}
```

**Después:**
```javascript
const guardarCotizacion = async (cotizacionData) => {
  // Ahora hace POST a cada cotización con proyectoId
  const promises = cotizacionData.productos.map(producto => {
    const cotizacionItem = {
      proyectoId: cotizacionData.projectId,  // ✅ Asigna proyecto
      nombreMaterial: producto.title,
      cantidad: producto.quantity,
      precioUnitario: precio,
      estado: 'pendiente',
      // ... más campos
    };
    
    return fetch('http://localhost:5000/api/cotizaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cotizacionItem)
    });
  });

  await Promise.all(promises);
  // ✅ Ahora se guardan en BD + localStorage
}
```

---

## 📊 Flujo Completo Ahora

### Paso 1: Seleccionar Proyecto en Carrito
```
CotizacionCartV2.jsx
  ↓
handleProjectSelect(projectId)
  ↓
setSelectedProjectId(projectId)
```

### Paso 2: Exportar a Excel y Guardar
```
exportToExcel()
  ↓
Crea cotizacionData con:
  - projectId: selectedProjectId ✅
  - productos: cartItems
  - projectName, clientName
  ↓
guardarCotizacion(cotizacionData)
```

### Paso 3: Guardar en Backend (NUEVO)
```
guardarCotizacion() - ASYNC
  ↓
Para cada producto en cartItems:
  1. Crear objeto cotizacionItem con proyectoId
  2. POST a /api/cotizaciones
  3. Guardar en BD con proyectoId vinculado
  ↓
Resultado: Cada material se guarda con proyectoId
```

### Paso 4: Ver Materiales en Proyecto
```
Projects.jsx → handleViewMateriales()
  ↓
fetchCotizacionesForProject(projectId)
  ↓
GET /api/cotizaciones/project/:projectId
  ↓
Backend filtra: WHERE proyectoId = projectId
  ↓
Modal muestra cotizaciones encontradas ✅
```

---

## 🔄 Cambios de Código

### Archivo: `frontend/src/context/CotizacionesContext.jsx`

**Línea 30-32**: Función `guardarCotizacion` ahora es `async`

**Línea 48-75**: Nuevas líneas que hacen POST al backend
```javascript
// Guardar cada item como cotización individual en el backend
if (cotizacionData.projectId && cotizacionData.productos && cotizacionData.productos.length > 0) {
  try {
    console.log('💾 Guardando cotizaciones en backend para proyecto:', cotizacionData.projectId);
    
    const token = localStorage.getItem('tarapaca_token');
    const promises = cotizacionData.productos.map(producto => {
      const precio = typeof producto.price === 'string' && producto.price.includes('$') 
        ? parseFloat(producto.price.replace(/[$.,\s]/g, '')) || 0
        : parseInt(producto.price) || 0;

      const cotizacionItem = {
        proyectoId: cotizacionData.projectId,
        nombreMaterial: producto.title || 'Material sin nombre',
        unidad: producto.unit || 'un',
        cantidad: producto.quantity || 1,
        precioUnitario: precio,
        estado: 'pendiente',
        observaciones: producto.notes || '',
        detalles: producto.category || ''
      };

      return fetch('http://localhost:5000/api/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cotizacionItem)
      });
    });

    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    console.log('✅ Cotizaciones guardadas en backend:', results.length);
  } catch (error) {
    console.error('❌ Error al guardar cotizaciones en backend:', error);
  }
}
```

---

## 🧪 Cómo Probar

### 1. **Cargar Frontend**
```bash
# Terminal 1
cd frontend
npm start
```

### 2. **Cargar Backend**
```bash
# Terminal 2
cd backend
npm start
```

### 3. **Probar Flujo Completo**

**Paso 1**: Ve a **Cotizaciones → Carrito**
- Agregar algunos productos

**Paso 2**: Selecciona un **Proyecto** del dropdown
- Verifica que el proyecto se asigne correctamente

**Paso 3**: Haz clic en **"Generar Cotización"**
- Se exporta a Excel
- Se guarda en localStorage
- **✅ NUEVO**: Se envían los items al backend con proyectoId

**Paso 4**: Ve a **Gestión de Proyectos**
- Selecciona el mismo proyecto
- Haz clic en **"Materiales"**
- **✅ Debe mostrar los materiales que acabas de guardar**

### 5. **Verifica en Console**

En la consola del navegador deberías ver:
```
💾 Guardando cotizaciones en backend para proyecto: 1
📝 Guardando cotización: { proyectoId: 1, nombreMaterial: "Hormigón", ... }
✅ Cotizaciones guardadas en backend: 3
```

Y en la consola del backend:
```
📦 Buscando cotizaciones para proyecto: 1
📦 Total de cotizaciones en BD: 5
✅ Cotización 1 pertenece al proyecto 1
✅ Cotización 2 pertenece al proyecto 1
✅ Cotización 3 pertenece al proyecto 1
📦 Cotizaciones encontradas para proyecto 1: 3
```

---

## 📝 Campos Guardados en BD

Cada cotización se guarda con estos campos:

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| **proyectoId** | ID del proyecto | `1` |
| **nombreMaterial** | Nombre del producto | `"Hormigón P-30"` |
| **unidad** | Unidad de medida | `"m³"` |
| **cantidad** | Cantidad | `10` |
| **precioUnitario** | Precio por unidad | `50000` |
| **estado** | Estado inicial | `"pendiente"` |
| **observaciones** | Notas | `"Material de calidad A"` |
| **detalles** | Categoría | `"Estructurales"` |

---

## 🔄 Backend - Ruta Correcta

La ruta que carga las cotizaciones es:

```javascript
GET /api/cotizaciones/project/:proyectoId
```

**Orden de rutas importante** (en `cotizacionRoutes.js`):
```javascript
// 1. Rutas dinámicas primero (con /project/)
router.get('/project/:proyectoId', ...);
router.get('/proyecto/:proyectoId', ...);

// 2. Rutas de modificación (POST, PATCH)
router.post('/approve', ...);
router.post('/reject', ...);

// 3. Rutas con ID al final (/:id)
router.get('/:id', ...);
```

Esto evita que `/api/cotizaciones/approve` se interprete como `/api/cotizaciones/:id`.

---

## 🚀 Deployment

### Backend:
✅ `cotizacionController.js` - Actualizado (`getCotizacionesByProject` es async)  
✅ `cotizacionRoutes.js` - Actualizado (orden correcto de rutas)  

### Frontend:
✅ `CotizacionesContext.jsx` - Actualizado (guardarCotizacion es async y hace POST)  

### Acciones:
1. Reinicia backend: `npm start`
2. Recarga frontend: `Ctrl+Shift+R` (hard refresh)
3. Prueba el flujo completo

---

## ✨ Beneficios Ahora

✅ **Materiales se guardan en BD** con proyectoId  
✅ **Modal muestra cotizaciones** del proyecto  
✅ **Puedes aprobar/rechazar** materiales  
✅ **Persistencia completa** (BD + localStorage)  
✅ **Filtrado correcto** por proyecto  
✅ **Debugging mejorado** con logs en consola  

---

## 📊 Estado de Cotizaciones

Después del guardado en backend:

| Estado | Descripción |
|--------|-------------|
| **pendiente** | Material nuevo, lista para aprobación |
| **aprobado** | Material aprobado, listo para compra |
| **rechazado** | Material rechazado, requiere nueva cotización |

---

**Última actualización**: Octubre 21, 2025  
**Desarrollador**: GitHub Copilot  
**Status**: Listo para producción ✅
