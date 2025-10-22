# ✅ Mejora: Sistema de Aprobación de Materiales en Proyectos

**Fecha**: Octubre 2025  
**Versión**: 1.0  
**Estado**: Implementado

---

## 📋 Descripción

Se ha mejorado significativamente la funcionalidad de gestión de materiales cotizados en la página de Proyectos. Ahora, al hacer clic en el botón "Materiales", se abre un modal mejorado que permite:

✅ **Ver todos los materiales cotizados** de un proyecto de forma clara y detallada  
✅ **Seleccionar múltiples materiales** mediante checkboxes  
✅ **Aprobar o rechazar materiales** de forma individual o en lotes  
✅ **Visualizar estados** de aprobación en tiempo real  
✅ **Interface intuitiva** con indicadores visuales  

---

## 🎯 Cambios Realizados

### 1. **Frontend - Página de Proyectos** (`Projects.jsx`)

#### Estados Agregados:
```javascript
// Nuevos estados para gestión de materiales
const [selectedMateriales, setSelectedMateriales] = useState(new Set());
const [approvingMateriales, setApprovingMateriales] = useState(false);
const [materialesAprobados, setMaterialesAprobados] = useState({});
```

#### Funciones Nuevas:

**`toggleMaterialSelection(materialId)`**  
Alterna la selección de un material (agregar/remover del conjunto)

**`handleApproveMateriales()`**  
Aprueba todos los materiales seleccionados
- Envía solicitud POST a `/api/cotizaciones/approve`
- Recibe confirmación del backend
- Actualiza estado local
- Recarga lista de cotizaciones

**`handleRejectMateriales()`**  
Rechaza todos los materiales seleccionados
- Envía solicitud POST a `/api/cotizaciones/reject`
- Recibe confirmación del backend
- Actualiza estado local
- Recarga lista de cotizaciones

#### Modal Mejorado:

**Características visuales:**
- ✓ Resumen superior con contador de seleccionados
- ✓ Checkboxes para selección múltiple
- ✓ Indicadores de estado (En Proceso, Aprobado, Rechazado)
- ✓ Información detallada por material:
  - Proveedor
  - Nombre del material
  - Cantidad y unidad
  - Precio unitario
  - Total estimado
  - Observaciones
- ✓ Botones de acción contextual (solo aparecen si hay seleccionados)
- ✓ Loader visual durante operación

**Diseño responsive:**
- Adaptado a dispositivos móviles
- Grid flexible para diferentes tamaños de pantalla
- Scroll interno para listas largas

---

### 2. **Backend - Controlador de Cotizaciones** (`cotizacionController.js`)

#### Funciones Implementadas:

**`aprobarCotizacion(req, res)`**  
Aprueba una cotización individual
```javascript
PATCH /api/cotizaciones/:id/aprobar
Response: { message, cotizacion }
```

**`rechazarCotizacion(req, res)`**  
Rechaza una cotización individual
```javascript
PATCH /api/cotizaciones/:id/rechazar
Response: { message, cotizacion }
```

**`approveMateriales(req, res)` (NUEVO)**  
Aprueba múltiples cotizaciones
```javascript
POST /api/cotizaciones/approve
Body: {
  projectId: string,
  cotizacionIds: string[],
  estado: "aprobado"
}
Response: { message, count, cotizaciones }
```

**`rejectMateriales(req, res)` (NUEVO)**  
Rechaza múltiples cotizaciones
```javascript
POST /api/cotizaciones/reject
Body: {
  projectId: string,
  cotizacionIds: string[],
  estado: "rechazado"
}
Response: { message, count, cotizaciones }
```

**Validaciones:**
- Verifica que `cotizacionIds` sea un array no vacío
- Retorna error 400 si faltan parámetros
- Manejo de excepciones con try-catch

---

### 3. **Backend - Rutas de Cotizaciones** (`cotizacionRoutes.js`)

#### Rutas Nuevas:

```javascript
// Aprobación/Rechazo múltiple
POST  /api/cotizaciones/approve   // Aprobar lotes
POST  /api/cotizaciones/reject    // Rechazar lotes

// Aprobación/Rechazo individual (existentes)
PATCH /api/cotizaciones/:id/aprobar
PATCH /api/cotizaciones/:id/rechazar
```

---

## 🔄 Flujo de Trabajo

### Paso 1: Abrir Modal de Materiales
```
Usuario hace clic en "Materiales" 
    ↓
Se llama handleViewMateriales(project)
    ↓
Se carga lista de cotizaciones desde backend
    ↓
Se abre modal mejorado
```

### Paso 2: Seleccionar Materiales
```
Usuario hace clic en checkboxes
    ↓
toggleMaterialSelection() actualiza Set
    ↓
Interfaz muestra cantidad seleccionada
    ↓
Botones de acción se habilitan
```

### Paso 3: Aprobar/Rechazar
```
Usuario hace clic en "Aprobar" o "Rechazar"
    ↓
handleApproveMateriales() / handleRejectMateriales()
    ↓
Envía POST a backend con IDs seleccionados
    ↓
Backend actualiza estado en BD
    ↓
Frontend recibe confirmación
    ↓
Modal se recarga con nuevos estados
    ↓
Checkboxes se limpian
```

---

## 💾 Almacenamiento de Datos

La tabla `cotizaciones` en PostgreSQL contiene:

```sql
CREATE TABLE cotizaciones (
  id SERIAL PRIMARY KEY,
  proyectoId INTEGER,
  insumoId INTEGER,
  proveedorId INTEGER,
  nombreMaterial VARCHAR,
  unidad VARCHAR,
  cantidad DECIMAL,
  precioUnitario DECIMAL,
  estado VARCHAR DEFAULT 'pendiente',  -- ← Se actualiza aquí
  observaciones TEXT,
  creadoPor INTEGER,
  creadoEn TIMESTAMP DEFAULT NOW(),
  actualizadoEn TIMESTAMP DEFAULT NOW()
);
```

**Estados permitidos:**
- `pendiente` - Sin revisar (mostrado como "En Proceso")
- `aprobado` - Listo para compra
- `rechazado` - No cumple requisitos

---

## 🧪 Pruebas Sugeridas

### 1. Crear Cotizaciones de Prueba
```bash
# Crear proyecto
POST /api/projects
{ nombre: "Proyecto Test", ... }

# Crear cotizaciones
POST /api/cotizaciones
{ 
  proyectoId: 1, 
  nombreMaterial: "Hormigón", 
  cantidad: 10,
  precioUnitario: 50000,
  ...
}
```

### 2. Abrir Modal
- Ir a Proyectos
- Seleccionar un proyecto
- Hacer clic en "Materiales"

### 3. Seleccionar Materiales
- Marcar checkboxes de algunos materiales
- Verificar que el contador se actualiza
- Verificar que los botones se habilitan

### 4. Aprobar Materiales
- Seleccionar 2-3 materiales
- Hacer clic en "Aprobar"
- Verificar mensaje de éxito
- Verificar que los materiales muestren estado "Aprobado"
- Verificar que los checkboxes se limpian

### 5. Rechazar Materiales
- Seleccionar materiales con estado "En Proceso"
- Hacer clic en "Rechazar"
- Verificar mensaje de confirmación
- Verificar que los materiales muestren estado "Rechazado"

### 6. Validaciones
- Intentar aprobar sin seleccionar materiales (debe mostrar alerta)
- Intentar rechazar sin seleccionar materiales (debe mostrar alerta)
- Seleccionar materiales ya aprobados (checkboxes deben estar deshabilitados)

---

## 📊 Indicadores Visuales

### Badges de Estado:
```
⏱ En Proceso  → bg-yellow-100, texto amarillo
✓ Aprobado    → bg-green-100, texto verde
✕ Rechazado   → bg-red-100, texto rojo
```

### Checkboxes:
```
Habilitado   → Materiales en estado "pendiente"
Deshabilitado → Materiales ya aprobados/rechazados
Checked      → Cuando se selecciona
```

### Resumen Superior:
```
- Mostrar total de cotizaciones
- Mostrar cantidad seleccionada
- Botones de acción solo si hay seleccionados
```

---

## 🔐 Seguridad

✅ **Validación de input** en backend  
✅ **Autenticación** requerida en rutas (headers con token)  
✅ **Autorización** por roles (solo supervisores/admins)  
✅ **Manejo de errores** con try-catch  
✅ **Respuestas sanitizadas** sin información sensible  

---

## 📈 Mejoras Futuras

### Fase 2:
- [ ] Agregar campo de "Razón de rechazo"
- [ ] Historial de aprobaciones/rechazos
- [ ] Notificaciones automáticas a proveedores
- [ ] Exportar reporte de materiales aprobados
- [ ] Integración con órdenes de compra

### Fase 3:
- [ ] Aprobación multi-nivel (revisor, supervisor, admin)
- [ ] Workflow automático con reglas de negocio
- [ ] Análisis de precios y presupuestos
- [ ] Dashboard de KPIs de aprobación

---

## 🚀 Deployment

### Backend:
1. Actualizar `cotizacionController.js` ✅
2. Actualizar `cotizacionRoutes.js` ✅
3. Reiniciar servidor backend
4. Verificar que los endpoints responden

### Frontend:
1. Actualizar `Projects.jsx` ✅
2. Recargar navegador (Hard refresh: Ctrl+Shift+R)
3. Probar funcionalidad completa

---

## 📞 Soporte

Si encuentras problemas:

1. **Modal no abre**: Verifica que el proyecto tenga cotizaciones
2. **Checkboxes deshabilitados**: Solo se pueden seleccionar materiales "En Proceso"
3. **Error al aprobar**: Verifica conexión a servidor backend
4. **Estados no se actualizan**: Limpia cache de navegador

---

**Última actualización**: Octubre 21, 2025  
**Desarrollador**: GitHub Copilot  
**Estado**: Listo para producción ✅
