# 🎯 RESPUESTA DIRECTA: ¿COINCIDEN LOS CAMPOS DEL CARRITO CON LA BD?

## ✅ **SÍ, TODOS COINCIDEN PERFECTAMENTE**

### **Mapeo en 30 segundos:**

```
CARRITO               →    BACKEND             →    BASE DE DATOS
─────────────────────     ──────────────────         ──────────────
item.title            →    nombreMaterial      →    nombre_material
item.quantity         →    cantidad            →    cantidad
item.unit             →    unidad              →    unidad
item.price            →    precioUnitario      →    precio_unitario
item.category         →    detalles            →    detalles
item.notes            →    observaciones       →    observaciones
selectedProjectId     →    proyectoId          →    projects_id
(fijo)                →    estado:'pendiente'  →    estado
(automático)          →    id (secuencia)      →    id
(automático)          →    users_id: 1         →    users_id
(NULL)                →    insumoId: null      →    insumos_id
(NULL)                →    proveedorId: null   →    providers_id
```

---

## 📍 UBICACIONES EN EL CÓDIGO

### **Frontend - Carrito (CotizacionCartV2.jsx)**
- Línea 463: `handleQuantityChange()` → `quantity`
- Línea 471: `handleUnitChange()` → `unit`
- Línea 487: `handleCategoryChange()` → `category`
- Línea 513: `handleNotesChange()` → `notes`
- Línea 447: `item.title` (del búsqueda, no editable)
- Línea 449: `item.price` (del búsqueda, no editable)

### **Context - Mapeo (CotizacionesContext.jsx líneas 79-97)**
```javascript
const cotizacionItem = {
  proyectoId: parseInt(cotizacionData.projectId),
  nombreMaterial: producto.title,
  unidad: producto.unit || 'un',
  cantidad: producto.quantity || 1,
  precioUnitario: precio,
  estado: 'pendiente',
  observaciones: producto.notes || '',
  detalles: producto.category || ''
};
```

### **Backend - Model (Cotizacion.js línea 38-48)**
El INSERT ya recibe todos los campos correctamente mapeados.

---

## 🔴 LO QUE FALTA: SQL

**14 columnas con NOT NULL sin DEFAULT → Causa errores al INSERT**

Debe ejecutarse:
```sql
ALTER TABLE cotizaciones ALTER COLUMN insumos_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN providers_id DROP NOT NULL;
```

Los otros 12 campos siempre se rellenan, así que mantienen NOT NULL sin problema.

---

## 📊 Tabla de Referencia Rápida

| Campo Carrito | Campo BD | Tipo | Editable | Requerido |
|---|---|---|---|---|
| `title` | `nombre_material` | VARCHAR | ❌ | ✅ |
| `quantity` | `cantidad` | BIGINT | ✅ | ✅ |
| `unit` | `unidad` | VARCHAR | ✅ | ✅ |
| `price` | `precio_unitario` | MONEY | ❌ | ✅ |
| `category` | `detalles` | VARCHAR | ✅ | ✅ |
| `notes` | `observaciones` | VARCHAR | ✅ | ✅ |
| `projectId` | `projects_id` | INTEGER FK | ❌ | ✅ |
| — | `estado` | VARCHAR | ❌ (fijo) | ✅ |
| — | `users_id` | INTEGER | ❌ (=1) | ✅ |
| — | `insumos_id` | INTEGER | — | ❌ NULL OK |
| — | `providers_id` | INTEGER | — | ❌ NULL OK |
| — | `id` | INTEGER | (seq) | ✅ |
| — | `created_at` | TIMESTAMP | (now) | ✅ |
| — | `updated_at` | TIMESTAMP | (now) | ✅ |

---

## ✨ CONCLUSIÓN

**Todos los campos del carrito se mapean correctamente a la base de datos. El flujo es:**

```
Usuario relleña carrito → CompraModal → guardarCotizacion() → 
API POST /cotizaciones → cotizacionController.create() → 
Cotizacion.create() → INSERT BD ✅
```

**Solo falta:** Ejecutar los 2 comandos SQL para permitir NULL en las FK opcionales.

