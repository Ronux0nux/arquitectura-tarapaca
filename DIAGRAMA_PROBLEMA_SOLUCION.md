# 🎯 DIAGRAMA DEL PROBLEMA Y SOLUCIÓN

## 📌 FLUJO DEL ERROR

```
┌─────────────────────────────────────┐
│   FRONTEND - Carrito de Cotizaciones │
│   - Producto: Cemento               │
│   - Cantidad: 2                      │
│   - Precio: $7.690                  │
└────────────────┬────────────────────┘
                 │
                 │ POST /api/cotizaciones
                 │
┌────────────────▼────────────────────┐
│   BACKEND - cotizacionController     │
│   ✅ Recibe datos correctamente     │
└────────────────┬────────────────────┘
                 │
                 │ Cotizacion.create()
                 │
┌────────────────▼────────────────────┐
│   MODELO - Cotizacion.js             │
│                                      │
│  const validezOferta = null  ❌     │  ← PROBLEMA!
│  const estado = "pendiente"  ✅     │
│  const users_id = null       ❌     │  ← POSIBLE PROBLEMA!
│                                      │
│  INSERT INTO cotizaciones (          │
│    ..., validez_oferta, ...         │
│  ) VALUES (..., null, ...)          │
└────────────────┬────────────────────┘
                 │
                 │ Intento de inserción
                 │
┌────────────────▼────────────────────┐
│   POSTGRESQL - Tabla cotizaciones    │
│                                      │
│  validez_oferta VARCHAR NOT NULL ❌ │
│     ↓                                │
│  ¿Es null? → SÍ                      │
│  ¿Tiene DEFAULT? → NO                │
│     ↓                                │
│  RECHAZA: "null violates NOT NULL"  │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ FLUJO DESPUÉS DE LA SOLUCIÓN

```
┌─────────────────────────────────────┐
│   FRONTEND - Carrito de Cotizaciones │
│   - Producto: Cemento               │
│   - Cantidad: 2                      │
│   - Precio: $7.690                  │
└────────────────┬────────────────────┘
                 │
                 │ POST /api/cotizaciones
                 │
┌────────────────▼────────────────────┐
│   BACKEND - cotizacionController     │
│   ✅ Recibe datos correctamente     │
└────────────────┬────────────────────┘
                 │
                 │ Cotizacion.create()
                 │
┌────────────────▼────────────────────┐
│   MODELO - Cotizacion.js             │
│                                      │
│  const validezOferta = "30 días" ✅ │  ← ARREGLADO!
│  const estado = "pendiente"     ✅  │
│  const users_id = 1             ✅  │  ← ARREGLADO!
│                                      │
│  INSERT INTO cotizaciones (          │
│    ..., validez_oferta, ...         │
│  ) VALUES (..., "30 días", ...)     │
└────────────────┬────────────────────┘
                 │
                 │ Intento de inserción
                 │
┌────────────────▼────────────────────┐
│   POSTGRESQL - Tabla cotizaciones    │
│                                      │
│  validez_oferta VARCHAR DEFAULT ..  │ ✅
│     ↓                                │
│  ¿Es null? → NO                      │
│  ¿Tiene valor válido? → SÍ           │
│     ↓                                │
│  ACEPTA: Row inserted successfully  │
│                                      │
└──────────────────────────────────────┘
```

---

## 📊 TABLA DE CAMBIOS

| Componente | Antes | Después | Estado |
|-----------|--------|---------|--------|
| **Modelo JS** | `\|\| null` | `\|\| '30 días'` | ✅ HECHO |
| **Tabla SQL** | SIN DEFAULT | `SET DEFAULT '30 días'` | 🔄 PENDIENTE |
| **users_id JS** | `\|\| null` | `\|\| 1` | ✅ HECHO |
| **users_id SQL** | SIN DEFAULT | `SET DEFAULT 1` | 🔄 PENDIENTE |

---

## 🔧 CAMBIOS REQUERIDOS

### PASO 1: Ejecutar en PostgreSQL

```sql
-- Ver problema
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND is_nullable = 'NO' AND column_default IS NULL;

-- Resultado esperado: Columnas que tienen NOT NULL pero sin DEFAULT
-- - validez_oferta
-- - users_id (posiblemente)
-- - detalles (posiblemente)
-- - observaciones (posiblemente)
```

### PASO 2: Aplicar fixes

```sql
ALTER TABLE cotizaciones ALTER COLUMN validez_oferta SET DEFAULT '30 días';
ALTER TABLE cotizaciones ALTER COLUMN users_id SET DEFAULT 1;
ALTER TABLE cotizaciones ALTER COLUMN detalles SET DEFAULT '';
ALTER TABLE cotizaciones ALTER COLUMN observaciones SET DEFAULT '';
```

### PASO 3: Reiniciar Backend

```bash
cd backend
npm start
```

### PASO 4: Probar en Frontend

Ir a: Buscador → Agregar → Carrito → Compra
Debería funcionar sin errores HTTP 400.

---

## 🎯 CHECKLIST

- [ ] Ejecuté el diagnóstico SQL
- [ ] Identifiqué columnas con NOT NULL sin DEFAULT
- [ ] Ejecuté los ALTER TABLE para agregar DEFAULTs
- [ ] Verifiqué con SELECT que se aplicaron
- [ ] Reinicié el backend (npm start)
- [ ] Probé el flujo completo en el frontend
- [ ] Las cotizaciones se guardaron en la BD ✅

Si todo está verde → ✅ PROBLEMA RESUELTO
