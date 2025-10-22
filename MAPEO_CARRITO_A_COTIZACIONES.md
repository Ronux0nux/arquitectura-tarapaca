# 📋 MAPEO COMPLETO: CARRITO DE COMPRAS → TABLA COTIZACIONES

## ✅ ANÁLISIS DE CAMPOS - VERIFICACIÓN COMPLETA

### 1️⃣ CAMPOS DEL CARRITO (CotizacionCartV2.jsx)

Cuando el usuario selecciona un producto y lo agrega al carrito, se rellenan estos campos:

| Campo Carrito | Tipo | Línea | Validación | Editable |
|---------------|------|-------|-----------|----------|
| `item.id` | string/uuid | 435+ | Único del carrito | No |
| `item.title` | string | 447 | Nombre del producto | No (de búsqueda) |
| `item.source` | string | 448 | Fuente del precio | No |
| `item.price` | string/number | 449 | Formato "$X,XXX.XX" | No (de búsqueda) |
| `item.quantity` | number | 463 | Input numérico | ✅ Sí (handleQuantityChange) |
| `item.unit` | string | 471 | Select (un, m, m², m³, kg, saco, gl) | ✅ Sí (handleUnitChange) |
| `item.category` | string | 487 | Select (General, Albañilería, Estructura, etc) | ✅ Sí (handleCategoryChange) |
| `item.notes` | string | 513 | Input texto libre | ✅ Sí (handleNotesChange) |

**Líneas relevantes en CotizacionCartV2.jsx:**
- Línea 435: `{cartItems.map((item, index) => (...`
- Línea 447: `<h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>`
- Línea 463: `<input onChange={(e) => handleQuantityChange(item.id, e.target.value)}`
- Línea 471: `<select onChange={(e) => handleUnitChange(item.id, e.target.value)}`
- Línea 487: `<select onChange={(e) => handleCategoryChange(item.id, e.target.value)}`
- Línea 513: `<input onChange={(e) => handleNotesChange(item.id, e.target.value)}`

---

### 2️⃣ FLUJO DE TRANSFORMACIÓN: CARRITO → BACKEND → BD

#### **PASO 1: Carrito → CompraModal**
Línea 592 en CotizacionCartV2.jsx:
```jsx
onComprar={handleCompra}
```

El CompraModal.jsx (línea 37) envía:
```javascript
{
  projectId: selectedProject,
  productos: [
    {
      id: "...",
      title: "...",
      price: "$X,XXX.XX",
      quantity: 2,
      unit: "m",
      category: "Estructura",
      notes: "Observación..."
    }
  ],
  observaciones: ""
}
```

#### **PASO 2: CompraModal → handleCompra (CotizacionCartV2.jsx, línea 299)**
```javascript
const cotizacionData = {
  projectId: parseInt(selectedProjectId),
  projectName: projectName,
  clientName: clientName,
  productos: compraData.productos,
  observaciones: compraData.observaciones || '',
  estado: 'comprada'
};
```

#### **PASO 3: handleCompra → guardarCotizacion (CotizacionesContext.jsx, línea 31)**

Para cada producto en el array, se mapea así (líneas 79-97):
```javascript
const cotizacionItem = {
  proyectoId: parseInt(cotizacionData.projectId),          // ← projectId (línea 82)
  nombreMaterial: producto.title || 'Material sin nombre', // ← title (línea 83)
  unidad: producto.unit || 'un',                          // ← unit (línea 84)
  cantidad: producto.quantity || 1,                       // ← quantity (línea 85)
  precioUnitario: precio,                                 // ← price parseado (línea 86)
  estado: 'pendiente',                                    // ← Fijo (línea 87)
  observaciones: producto.notes || '',                    // ← notes (línea 88)
  detalles: producto.category || ''                       // ← category (línea 89)
};
```

#### **PASO 4: guardarCotizacion → API POST**
Línea 99 en CotizacionesContext.jsx:
```javascript
fetch('http://localhost:5000/api/cotizaciones', {
  method: 'POST',
  body: JSON.stringify(cotizacionItem)
})
```

#### **PASO 5: API → cotizacionController.js**
Línea 56-80 recibe el `req.body` y valida `proyectoId` y `nombreMaterial`.

#### **PASO 6: Controller → Cotizacion.create() Model**
Línea 81+ en cotizacionController.js llama a:
```javascript
const result = await Cotizacion.create(req.body);
```

#### **PASO 7: Model → INSERT en BD**
Líneas 38-48 en Cotizacion.js generan ID y hacen INSERT:
```javascript
const id = idResult.rows[0].next_id;
const res = await pool.query(
  `INSERT INTO cotizaciones (
    id, 
    projects_id, 
    insumos_id, 
    providers_id, 
    users_id, 
    nombre_material, 
    unidad, 
    cantidad, 
    precio_unitario, 
    estado, 
    detalles, 
    observaciones, 
    created_at, 
    updated_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
  [id, proyectoId, insumoId, proveedorId, userId, nombreMaterial, unidad, cantidad, precioUnitario, estado, detalles, observaciones]
);
```

---

### 3️⃣ MAPEO FINAL: CARRITO → TABLA COTIZACIONES

| Campo Carrito | Lógica Transformación | Campo BD | Tipo BD | Validación |
|---|---|---|---|---|
| `item.title` | Se usa directamente | `nombre_material` (VARCHAR) | VARCHAR | ✅ Requerido |
| `item.quantity` | Se usa directamente | `cantidad` (BIGINT) | BIGINT | ✅ Requerido |
| `item.unit` | Se usa o default "un" | `unidad` (VARCHAR) | VARCHAR | ✅ Requerido |
| `item.price` | Se parsea (remove $,.) | `precio_unitario` (MONEY) | MONEY | ✅ Requerido |
| `item.notes` | Se mapea a observaciones | `observaciones` (VARCHAR) | VARCHAR | ✅ Requerido |
| `item.category` | Se mapea a detalles | `detalles` (VARCHAR) | VARCHAR | ✅ Requerido |
| `selectedProjectId` | Se convierte a number | `projects_id` (INTEGER) | INTEGER FK | ✅ Requerido |
| **(NO MAPEO)** | Fijo: 'pendiente' | `estado` (VARCHAR) | VARCHAR | ✅ Requerido |
| **(NO MAPEO)** | Null/default | `insumos_id` (INTEGER) | INTEGER FK | ❌ NULL OK |
| **(NO MAPEO)** | Null/default | `providers_id` (INTEGER) | INTEGER FK | ❌ NULL OK |
| **(NO MAPEO)** | Default: 1 | `users_id` (INTEGER) | INTEGER FK | ✅ Requerido |
| **(AUTO)** | Sequence nextval() | `id` (INTEGER) | INTEGER PK | ✅ Requerido |
| **(AUTO)** | NOW() | `created_at` (TIMESTAMP) | TIMESTAMP | ✅ Requerido |
| **(AUTO)** | NOW() | `updated_at` (TIMESTAMP) | TIMESTAMP | ✅ Requerido |

---

### 4️⃣ ✅ CONCLUSIÓN: CAMPOS COINCIDEN CORRECTAMENTE

#### **✅ SÍ COINCIDEN (6 campos mapeados del carrito):**
1. ✅ `item.title` → `nombre_material` (Nombre del producto)
2. ✅ `item.quantity` → `cantidad` (Cantidad solicitada)
3. ✅ `item.unit` → `unidad` (Unidad de medida: m, m², kg, etc.)
4. ✅ `item.price` → `precio_unitario` (Precio parseado de string a número)
5. ✅ `item.notes` → `observaciones` (Notas del usuario)
6. ✅ `item.category` → `detalles` (Categoría: Estructura, Albañilería, etc.)

#### **✅ CAMPOS AUTOMÁTICOS (5 campos sin entrada del carrito):**
7. ✅ `projectId` → `projects_id` (Del selector de proyecto)
8. ✅ Estado fijo → `estado` (Siempre 'pendiente')
9. ✅ Sequence → `id` (Generado por BD)
10. ✅ NOW() → `created_at` (Timestamp automático)
11. ✅ NOW() → `updated_at` (Timestamp automático)

#### **❌ CAMPOS VACIOS/NULL (Permitidos como NULL):**
- `insumos_id` - No se rellenan desde carrito (puede ser NULL)
- `providers_id` - No se rellenan desde carrito (puede ser NULL)

#### **⚠️ CAMPO ESPECIAL:**
- `users_id` - Hardcodeado a 1 por defecto en el modelo

---

## 🔧 PRÓXIMOS PASOS

### **1. EJECUTAR SQL PARA ELIMINAR NOT NULL CONSTRAINTS** (CRÍTICO)
Los 14 campos necesitan que se ejecuten estos comandos:

```sql
-- Campos que DEBEN PERMITIR NULL
ALTER TABLE cotizaciones ALTER COLUMN insumos_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN providers_id DROP NOT NULL;

-- Campos que YA TIENEN DATOS VÁLIDOS
-- (Mantienen NOT NULL pero sin problemas porque siempre se rellenan)
-- id, nombre_material, unidad, cantidad, precio_unitario, estado, 
-- detalles, observaciones, created_at, updated_at, projects_id, users_id
```

### **2. VERIFICAR QUE TODOS LOS CAMPOS SE RELLENAN**
- ✅ Carrito: 6 campos editable + selectables
- ✅ Backend: mapea correctamente a BD
- ✅ Falta: ejecutar SQL para eliminar NOT NULL de `insumos_id` y `providers_id`

### **3. DATOS QUE SE ENVÍAN AL GUARDAR**
```json
{
  "proyectoId": 1,
  "nombreMaterial": "Concreto 3000 psi",
  "unidad": "m³",
  "cantidad": 5,
  "precioUnitario": 250000,
  "estado": "pendiente",
  "detalles": "Estructura",
  "observaciones": "Entregar el jueves"
}
```

---

## 📊 RESUMEN VISUAL

```
🛒 CARRITO                    📝 MODELO                    🗄️ BD
┌─────────────────────┐      ┌──────────────────┐         ┌──────────────────────┐
│ item.title          │      │ nombreMaterial   │         │ nombre_material VARCHAR│
│ item.quantity       │  ──► │ cantidad         │    ────► │ cantidad BIGINT       │
│ item.unit           │      │ unidad           │         │ unidad VARCHAR        │
│ item.price          │      │ precioUnitario   │         │ precio_unitario MONEY │
│ item.category       │      │ detalles         │         │ detalles VARCHAR      │
│ item.notes          │      │ observaciones    │         │ observaciones VARCHAR │
│ selectedProjectId   │      │ proyectoId       │         │ projects_id INTEGER FK│
│                     │      │ estado           │         │ estado VARCHAR        │
│                     │      │                  │         │ id INTEGER (SEQ)      │
│                     │      │                  │         │ created_at TIMESTAMP  │
│                     │      │                  │         │ updated_at TIMESTAMP  │
│                     │      │                  │         │ users_id INTEGER (=1) │
│                     │      │                  │         │ insumos_id NULL OK    │
│                     │      │                  │         │ providers_id NULL OK  │
└─────────────────────┘      └──────────────────┘         └──────────────────────┘
```

---

## ✨ ESTADO ACTUAL

✅ **MAPEO:** Todos los campos del carrito coinciden correctamente con la tabla  
⏳ **PENDIENTE:** Ejecutar SQL para DROP NOT NULL en `insumos_id` y `providers_id`  
✅ **CÓDIGO:** Frontend + Backend + Modelo listos  
🚀 **LISTO PARA:** Testing después de ejecutar SQL  

