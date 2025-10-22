# 🎯 Guía Rápida: Aprobación de Materiales en Proyectos

## 🚀 Inicio Rápido

### 1️⃣ Acceder a la Página de Proyectos
```
URL: http://localhost:3000/projects
```

### 2️⃣ Seleccionar un Proyecto
- Busca el proyecto en la tabla
- Verifica que tenga materiales cotizados
- Haz clic en el botón **"Materiales"** en la columna Acciones

### 3️⃣ Aprobar/Rechazar Materiales
```
┌─────────────────────────────────────────────────┐
│ Materiales Cotizados - [Nombre Proyecto]        │
│  Selecciona los materiales para aprobar o ...    │
├─────────────────────────────────────────────────┤
│ ☐ Material 1   (En Proceso)                     │
│ ☐ Material 2   (En Proceso)                     │
│ ☑ Material 3   (Aprobado) [Deshabilitado]       │
│ ☐ Material 4   (Rechazado) [Deshabilitado]      │
├─────────────────────────────────────────────────┤
│           [✓ Aprobar] [✕ Rechazar]              │
└─────────────────────────────────────────────────┘
```

---

## 📋 Procedimiento Completo

### Paso 1: Abre el Modal de Materiales
```
Proyectos → Tabla de Proyectos → Botón "Materiales" → Modal
```

### Paso 2: Revisa los Materiales
| Campo | Descripción |
|-------|-------------|
| **Proveedor** | Quién suministra el material |
| **Material** | Nombre del insumo |
| **Cantidad** | Unidad solicitada |
| **Precio** | Costo unitario |
| **Total** | Cantidad × Precio |
| **Estado** | En Proceso, Aprobado o Rechazado |

### Paso 3: Selecciona Materiales
- ☑️ Marca los checkboxes de los materiales a aprobar/rechazar
- 📊 El contador en el resumen se actualiza
- ✅ Los botones de acción se habilitan automáticamente

### Paso 4: Acciona
- **✓ Aprobar**: Marca como listo para compra
- **✕ Rechazar**: Marca como no aceptado

### Paso 5: Confirma
- 🎯 Se actualiza el estado en tiempo real
- 📝 Ver "Operación completada" en la consola
- 🔄 La lista se recarga automáticamente

---

## ⚙️ Estados de Materiales

### 🟨 En Proceso
```
Estado: pendiente
- ✅ Se puede aprobar
- ✅ Se puede rechazar
- ✅ Se puede seleccionar
```

### 🟢 Aprobado
```
Estado: aprobado
- ❌ No se puede desaprobar
- ✅ Listo para orden de compra
- ❌ No se puede seleccionar
```

### 🔴 Rechazado
```
Estado: rechazado
- ❌ No se puede cambiar
- ❌ No se puede seleccionar
- ℹ️ Requiere nueva cotización
```

---

## 💡 Consejos Prácticos

✅ **Selecciona materiales relacionados juntos** para agilizar aprobaciones  
✅ **Revisa el total estimado** antes de aprobar lotes grandes  
✅ **Usa "Detalles"** para ver información completa de cada cotización  
✅ **Ten cuidado al rechazar** - requiere nueva cotización  
✅ **Aprueba de una sola vez** para múltiples materiales similares  

---

## 🔍 Verificación de Cambios

Después de aprobar/rechazar, verifica:

1. **Estado actualizado**
   - El badge cambió de color
   - Muestra el nuevo estado

2. **Checkboxes limpios**
   - La selección se limpió
   - Puedes hacer nuevas selecciones

3. **Botones deshabilitados**
   - Se deshabilitan si no hay seleccionados
   - Se vuelven a habilitar al seleccionar

4. **Materiales protegidos**
   - Materiales aprobados no se pueden desmarcar
   - Protege cambios accidentales

---

## ❌ Solución de Problemas

### Problema: Los checkboxes están deshabilitados

**Causa**: El material ya fue aprobado o rechazado  
**Solución**: Solo los materiales "En Proceso" se pueden modificar

### Problema: No puedo hacer clic en "Aprobar"

**Causa**: No hay materiales seleccionados  
**Solución**: Marca al menos un checkbox antes de hacer clic

### Problema: El modal no abre

**Causa**: El proyecto no tiene cotizaciones  
**Solución**: Primero crea cotizaciones en el proyecto

### Problema: El servidor responde con error

**Causa**: Backend no está ejecutándose  
**Solución**: 
```bash
# En terminal backend
npm start
# Verifica: http://localhost:5000/api/cotizaciones
```

---

## 📊 Casos de Uso

### Caso 1: Aprobar Lote de Materiales de Construcción
```
1. Proyecto: "Casa Centro Sur"
2. Abrir Materiales
3. Seleccionar: Hormigón, Acero, Cementos
4. Clic "Aprobar" → 3 materiales aprobados ✓
5. Listo para crear órdenes de compra
```

### Caso 2: Rechazar Material por Precio Alto
```
1. Proyecto: "Remodelación Oficina"
2. Abrir Materiales
3. Ver precio del material "Vidrio templado"
4. Rechazar porque está fuera de presupuesto
5. Solicitar nueva cotización a otro proveedor
```

### Caso 3: Aprobación Parcial
```
1. Proyecto: "Ampliación Warehouse"
2. Abrir Materiales
3. Aprobar materiales urgentes (5)
4. Rechazar materiales opcionales (2)
5. Discutir rechazados con cliente
```

---

## 🔗 Links Relacionados

- 📄 Documentación completa: `MEJORA_GESTION_MATERIALES.md`
- 📊 Estado del proyecto: `RESUMEN_ETAPAS_COMPLETO.md`
- 🎯 Módulos funcionales: `readme/MODULOS_FUNCIONALES.md`

---

**Versión**: 1.0  
**Última actualización**: Octubre 21, 2025  
**Compatible con**: Arquitectura Tarapacá v2.0+
