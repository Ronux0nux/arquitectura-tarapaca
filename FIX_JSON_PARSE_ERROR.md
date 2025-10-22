# 🔧 FIX: Error JSON.parse - Problemas con `_id` en cotizaciones

## 🚨 Error Reportado

```
Error al cargar cotizaciones: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
```

## 🔍 Causas Identificadas

1. **Principales:** Se pasaba `selectedProject._id` (undefined) en lugar de `selectedProject.id`
2. **Secundaria:** Sin validación del status HTTP antes de parsear JSON
3. **Resultado:** Error 500 del servidor retornaba HTML en lugar de JSON, causando error en `response.json()`

---

## ✅ Soluciones Implementadas

### 1️⃣ Frontend - Projects.jsx (Cambios de `_id` a `id`)

**Línea 675 - Función aprobarMateriales:**
```javascript
// Antes
await fetchCotizacionesForProject(selectedProject._id);

// Después
await fetchCotizacionesForProject(selectedProject.id);
```

**Línea 721 - Función rechazarMateriales:**
```javascript
// Antes
await fetchCotizacionesForProject(selectedProject._id);

// Después
await fetchCotizacionesForProject(selectedProject.id);
```

### 2️⃣ Frontend - Mejora en manejo de errores HTTP

**Función fetchCotizacionesForProject (líneas 393-419):**
```javascript
// Antes
const response = await fetch(...);
const data = await response.json();  // ❌ Falla si response es HTML

// Después
const response = await fetch(...);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const data = await response.json();  // ✅ Solo si es 2xx
```

---

## 📋 Cambios Realizados

| Archivo | Línea | Cambio | Tipo |
|---------|-------|--------|------|
| Projects.jsx | 675 | `_id` → `id` | FetchCotizaciones |
| Projects.jsx | 721 | `_id` → `id` | FetchCotizaciones |
| Projects.jsx | 395-401 | Agregar validación HTTP | Error Handling |

**Total: 2 cambios críticos + 1 mejora**

---

## 🔴 Por Qué Pasaba el Error

```
1. Usuario hace click en "Aprobar" o "Rechazar"
   ↓
2. selectedProject._id era undefined (Project usa .id de PostgreSQL)
   ↓
3. URL de fetch se armaba mal: /api/cotizaciones/project/undefined
   ↓
4. Backend retornaba error 400/500 con HTML de error
   ↓
5. Frontend intentaba: response.json() en HTML
   ↓
6. JSON.parse fallaba en HTML → "unexpected character"
```

---

## 🚀 Verificación

Después de los cambios:

1. ✅ `projectId` ahora es válido (`.id` en lugar de `._id`)
2. ✅ Validación HTTP previene parseo de HTML
3. ✅ Logs mejorados muestran el HTTP status real
4. ✅ Error handling evita crash de la app

---

## 📊 Testing

Para verificar que funciona:

1. Abrir consola (F12)
2. Seleccionar un proyecto
3. Ver logs:
   ```
   🔍 Buscando cotizaciones para proyecto: 3
   📡 Respuesta del servidor: 200
   📦 Datos recibidos: { cotizaciones: [...], resumen: {...} }
   📊 Cantidad de cotizaciones: 4
   ```

Si ves HTTP: 400/500, significa que el `projectId` sigue siendo inválido.

---

## ⚠️ Si Persiste el Error

Agrega logging adicional al backend en `cotizacionController.js`:

```javascript
exports.getCotizacionesByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    console.log('🔍 Parámetro recibido:', proyectoId, 'tipo:', typeof proyectoId);
    
    if (!proyectoId || proyectoId === 'undefined') {
      console.error('❌ ID inválido');
      return res.status(400).json({ error: 'ID de proyecto requerido' });
    }
    
    const cotizaciones = await Cotizacion.findByProject(proyectoId);
    console.log('✅ Cotizaciones encontradas:', cotizaciones.length);
    
    res.json({ 
      cotizaciones: cotizaciones || [],
      resumen: {...}
    });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: err.message });
  }
};
```

---

## ✨ Status

✅ **Cambios `_id` → `id` completados**
✅ **Validación HTTP mejorada**
✅ **Error handling más robusto**
🚀 **Listo para testing**

