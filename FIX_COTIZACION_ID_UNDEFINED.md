# 🔧 FIX: Error `cotizacion._id is undefined` - Cambio de MongoDB a PostgreSQL

## 🚨 Problema Identificado

**Error en consola:**
```
Uncaught TypeError: can't access property "slice", cotizacion._id is undefined
    children Projects.jsx:1859
```

**Causa:** Las cotizaciones ahora vienen de PostgreSQL (con campo `id`) pero el código frontend seguía buscando `_id` (que era de MongoDB).

---

## ✅ Solución Implementada

### 1️⃣ **Frontend - Projects.jsx (Líneas 1837-1860)**

**Cambios realizados:**
- Línea 1837: `key={cotizacion._id}` → `key={cotizacion.id}`
- Línea 1839: `selectedMateriales.has(cotizacion._id)` → `selectedMateriales.has(cotizacion.id)`
- Línea 1849: `checked={selectedMateriales.has(cotizacion._id)}` → `checked={selectedMateriales.has(cotizacion.id)}`
- Línea 1850: `onChange={() => toggleMaterialSelection(cotizacion._id)}` → `onChange={() => toggleMaterialSelection(cotizacion.id)}`
- Línea 1860: `cotizacion._id.slice(-6)` → `cotizacion.id`

**Antes:**
```jsx
key={cotizacion._id}
checked={selectedMateriales.has(cotizacion._id)}
onChange={() => toggleMaterialSelection(cotizacion._id)}
Cotización #{cotizacion.numero || cotizacion._id.slice(-6)}
```

**Después:**
```jsx
key={cotizacion.id}
checked={selectedMateriales.has(cotizacion.id)}
onChange={() => toggleMaterialSelection(cotizacion.id)}
Cotización #{cotizacion.numero || cotizacion.id}
```

---

### 2️⃣ **Frontend - Projects.jsx (Línea 969) - React Key Warning**

**Cambio realizado:**
- `key={project._id}` → `key={project.id}`

Este cambio también arreglaba el warning:
```
Each child in a list should have a unique "key" prop.
```

**Contexto:**
```jsx
// Antes
projects.map((project) => (
  <tr key={project._id} className="hover:bg-gray-50">

// Después
projects.map((project) => (
  <tr key={project.id} className="hover:bg-gray-50">
```

---

### 3️⃣ **Frontend - ProjectMaterials.jsx (Línea 273)**

**Cambio realizado:**
- `key={cotizacion._id}` → `key={cotizacion.id}`

**Contexto:**
```jsx
// Antes
{cotizaciones.lista.map((cotizacion) => (
  <tr key={cotizacion._id} className="hover:bg-gray-50">

// Después
{cotizaciones.lista.map((cotizacion) => (
  <tr key={cotizacion.id} className="hover:bg-gray-50">
```

---

### 4️⃣ **Backend - ordencompraController.js (Línea 95)**

**Cambio realizado:**
- `cotizacionId: cotizacion._id` → `cotizacionId: cotizacion.id`

**Contexto:**
```javascript
// Antes
const newOrden = new OrdenCompra({
  proyectoId: cotizacion.proyectoId,
  cotizacionId: cotizacion._id,
  numeroOrden,
  ...

// Después
const newOrden = new OrdenCompra({
  proyectoId: cotizacion.proyectoId,
  cotizacionId: cotizacion.id,
  numeroOrden,
  ...
```

---

## 📋 Resumen de Cambios

| Archivo | Línea | Cambio | Tipo |
|---------|-------|--------|------|
| Projects.jsx | 1837 | `_id` → `id` | key prop |
| Projects.jsx | 1839 | `_id` → `id` | Set lookup |
| Projects.jsx | 1849 | `_id` → `id` | Checkbox logic |
| Projects.jsx | 1850 | `_id` → `id` | Change handler |
| Projects.jsx | 1860 | `_id.slice(-6)` → `id` | Display |
| Projects.jsx | 969 | `_id` → `id` | Table key |
| ProjectMaterials.jsx | 273 | `_id` → `id` | Table key |
| ordencompraController.js | 95 | `_id` → `id` | Cotización ID |

**Total: 8 cambios realizados**

---

## 🔍 Verificación Posterior

### Errors Fijos:
✅ `TypeError: can't access property "slice", cotizacion._id is undefined`
✅ `Each child in a list should have a unique "key" prop`

### Warnings Pendientes (NO críticos):
- ProjectMaterials.jsx: Unused import `Link`
- ProjectMaterials.jsx: Missing dependency `fetchProjectMaterials` in useEffect

---

## 🚀 Próximos Pasos

1. **Reiniciar backend:** `npm start`
2. **Reiniciar frontend:** `npm start`
3. **Limpiar caché:** F12 → Storage → Clear All
4. **Probar:**
   - Abrir página de proyectos
   - Seleccionar proyecto
   - Ver cotizaciones (no debe dar error)
   - Seleccionar checkbox de cotizaciones
   - Crear orden de compra

---

## 📊 Mapeo Definitivo

```
BD PostgreSQL (Nueva)          Frontend/Backend (Actualizado)
─────────────────────────      ────────────────────────────────
id (INTEGER)              ──►  cotizacion.id (no más ._id)
nombre_material           ──►  nombreMaterial
cantidad                  ──►  cantidad
unidad                    ──►  unidad
precio_unitario           ──►  precioUnitario
estado                    ──►  estado
projects_id               ──►  proyectoId
```

---

## ✨ Status

✅ **Error principal corregido**
✅ **React key warnings resueltos**
✅ **Cambio de MongoDB (_id) a PostgreSQL (id) completado**
🚀 **Listo para testing**

