# 💰 Sistema de Presupuestos por Proyecto

## ✨ Nueva Funcionalidad Implementada

### 🎯 **Funcionalidad Principal**

Se ha implementado un **sistema completo de presupuestos por proyecto** que permite:

#### 📋 **Selección de Proyectos**
- **Vista de tarjetas**: Lista visual de todos los proyectos disponibles
- **Información detallada**: Nombre, descripción, presupuesto asignado, estado
- **Selección intuitiva**: Click para seleccionar proyecto y ver su presupuesto
- **Indicadores visuales**: Código de colores según estado del proyecto

#### 💰 **Gestión de Presupuestos de Materiales**
- **Carga automática**: Al seleccionar proyecto se carga su presupuesto de materiales
- **Datos reales**: Integración con cotizaciones existentes del proyecto
- **Datos de ejemplo**: Fallback a presupuesto de demostración si no hay datos
- **Información completa**: Código, descripción, categoría, cantidad, precios, proveedor

#### 📊 **Estadísticas en Tiempo Real**
- **Total presupuesto**: Suma total de todos los items
- **Cantidad de items**: Número total de materiales/servicios
- **Categorías**: Número de categorías diferentes
- **Proveedores**: Número de proveedores involucrados
- **Estados**: Conteo por estado (aprobado, pendiente, cotizado)

#### 🔍 **Búsqueda y Filtros Avanzados**
- **Búsqueda de texto**: Por descripción, código, proveedor, categoría
- **Filtro por categoría**: Dropdown con todas las categorías disponibles
- **Ordenamiento**: Por descripción, categoría, precio, proveedor, fecha
- **Resultados en tiempo real**: Filtros aplicados instantáneamente

#### 📤 **Exportación de Datos**
- **Formato CSV**: Exportación completa del presupuesto filtrado
- **Nombre automático**: Archivo con nombre del proyecto y fecha
- **Datos completos**: Todas las columnas de la tabla en el archivo

### 🏗️ **Estructura Técnica**

#### 📁 **Archivos Nuevos**
```
frontend/src/pages/Presupuestos.jsx - Página principal de presupuestos
```

#### 🔗 **Rutas Agregadas**
```
/presupuestos - Acceso a la nueva página de presupuestos
```

#### 🧭 **Navegación Actualizada**
- **Desktop**: Agregado "💰 Presupuestos" en sección Tools del navbar
- **Mobile**: Agregado en dropdown "Herramientas"

#### 🔌 **Integraciones**
- **ApiService**: Para cargar proyectos desde la base de datos
- **ProjectService**: Fallback para datos locales/offline
- **CotizacionService**: Carga cotizaciones reales del proyecto
- **NotificationContext**: Notificaciones de estado y acciones

### 📊 **Datos de Ejemplo Incluidos**

#### 💼 **Presupuesto de Demostración**
```
8 items de ejemplo:
├── Cemento Portland (Materiales Base) - $850,000
├── Fierro Corrugado (Estructura) - $750,000  
├── Ladrillo Fiscal (Albañilería) - $875,000
├── Arena Gruesa (Áridos) - $360,000
├── Gravilla 20mm (Áridos) - $330,000
├── Tubería PVC (Instalaciones) - $312,500
├── Pintura Látex (Terminaciones) - $555,000
└── Cerámica Piso (Terminaciones) - $1,335,000

Total: $5,367,500
```

#### 🏷️ **Categorías Incluidas**
- **Materiales Base** (Cemento, cal, yeso)
- **Estructura** (Fierro, acero, hormigón)
- **Albañilería** (Ladrillos, bloques)
- **Áridos** (Arena, gravilla, ripio)
- **Instalaciones** (Tuberías, cables, fittings)
- **Terminaciones** (Pintura, cerámica, pisos)

#### 🏪 **Proveedores Ejemplo**
- **Cementos Tarapacá** (Materiales base)
- **Aceros del Norte** (Estructura)
- **Ladrillos Atacama** (Albañilería)
- **Áridos Pampa** (Áridos)
- **Instalaciones Norte** (Instalaciones)
- **Pinturas del Desierto** (Terminaciones)
- **Cerámicas Tarapacá** (Terminaciones)

#### 📋 **Estados de Items**
- **✅ Aprobado**: Items confirmados para compra
- **⏳ Pendiente**: Esperando aprobación
- **💰 Cotizado**: Solo cotizado, sin decisión

### 🎯 **Casos de Uso**

#### 👨‍💼 **Jefe de Proyecto**
```
Necesidad: Ver presupuesto completo del proyecto
Acción: Seleccionar proyecto → Ver todas las estadísticas
Resultado: Vista completa con totales y distribución por categorías
```

#### 💼 **Departamento de Compras**
```
Necesidad: Buscar items de una categoría específica
Acción: Filtrar por "Materiales Base" → Exportar CSV
Resultado: Lista de cementos y materiales base para gestionar compras
```

#### 📊 **Controller/Finanzas**
```
Necesidad: Analizar distribución de costos
Acción: Ver estadísticas → Ordenar por precio → Exportar
Resultado: Análisis de items más costosos y distribución presupuestaria
```

#### 🏪 **Gestión de Proveedores**
```
Necesidad: Ver todos los items de un proveedor
Acción: Buscar "Áridos Pampa" → Ver items y contacto
Resultado: Lista de materiales del proveedor con datos de contacto
```

### 🚀 **Cómo Usar el Sistema**

#### 1️⃣ **Acceso**
1. Ve al navbar superior
2. Clic en **"💰 Presupuestos"** (sección Tools)
3. Se abre la página de presupuestos

#### 2️⃣ **Seleccionar Proyecto**
1. Revisa la lista de proyectos disponibles
2. Clic en la tarjeta del proyecto deseado
3. El proyecto se marca como seleccionado (borde azul)
4. Se cargan automáticamente las estadísticas

#### 3️⃣ **Ver Presupuesto**
1. Revisa las estadísticas en la barra superior
2. Observa la tabla con todos los items
3. Cada fila muestra: código, descripción, cantidad, precios, proveedor, estado

#### 4️⃣ **Buscar y Filtrar**
```
🔍 Búsqueda: Escribe "cemento" para encontrar items relacionados
📂 Categoría: Selecciona "Estructura" para ver solo esos items  
🔄 Ordenar: Cambia a "Precio" para ver items más costosos primero
```

#### 5️⃣ **Exportar Datos**
1. Aplica los filtros deseados
2. Clic en **"📊 Exportar CSV"**
3. El archivo se descarga automáticamente
4. Nombre formato: `presupuesto_NombreProyecto_YYYY-MM-DD.csv`

### 📱 **Diseño Responsive**

#### 🖥️ **Desktop (1200px+)**
- 4 columnas de proyectos
- 7 estadísticas en fila
- Tabla completa con todas las columnas
- Filtros en 4 columnas

#### 📱 **Tablet (768px-1199px)**
- 3 columnas de proyectos  
- 4 estadísticas por fila
- Tabla con scroll horizontal
- Filtros en 2-3 columnas

#### 📱 **Mobile (320px-767px)**
- 1 columna de proyectos
- 2 estadísticas por fila
- Tabla optimizada con scroll
- Filtros en stack vertical

### 🔧 **Funcionalidades Técnicas**

#### 💾 **Persistencia de Datos**
- **Estado del proyecto seleccionado**: Se mantiene durante la sesión
- **Filtros aplicados**: Persisten hasta limpiar manualmente
- **Datos de ejemplo**: Generados dinámicamente si no hay datos reales

#### 🔄 **Actualización de Datos**
- **Automática**: Al seleccionar un proyecto
- **Manual**: Botón "🔄 Recargar Proyectos" si hay problemas de conexión
- **Fallback**: Modo offline con datos locales

#### ⚡ **Performance**
- **Carga asíncrona**: Los datos se cargan de forma no bloqueante
- **Filtros optimizados**: Búsqueda y filtros aplicados en memoria
- **Render condicional**: Solo se renderizan los elementos visibles

### 📊 **Ejemplo de Datos Exportados**

```csv
Código,Descripción,Categoría,Cantidad,Unidad,Precio Unitario,Precio Total,Proveedor,Estado,Fecha
CEM-001,"Cemento Portland Tipo I - 42.5kg",Materiales Base,100,sacos,8500,850000,"Cementos Tarapacá",aprobado,2024-12-15
FIE-012,"Fierro Corrugado 12mm x 12m",Estructura,50,barras,15000,750000,"Aceros del Norte",aprobado,2024-12-14
LAD-006,"Ladrillo Fiscal 29x14x7cm",Albañilería,2500,unidades,350,875000,"Ladrillos Atacama",pendiente,2024-12-13
```

### 🔮 **Próximas Mejoras Planificadas**

#### 📈 **Funcionalidades Futuras**
- **📊 Gráficos**: Visualización de distribución de costos por categoría
- **📅 Cronograma**: Integración con fechas de compra y entrega
- **🔔 Alertas**: Notificaciones por vencimiento de cotizaciones
- **💱 Monedas**: Soporte para múltiples monedas
- **📋 Historial**: Versiones anteriores del presupuesto

#### 🔗 **Integraciones Futuras**
- **📱 App móvil**: Versión nativa para gestión en terreno
- **📧 Email**: Envío automático de presupuestos
- **🌐 API externa**: Sincronización con sistemas ERP
- **📸 Evidencia**: Fotos de materiales recibidos
- **💳 Pagos**: Integración con sistemas de pago

### ✅ **Estado Actual**

**🎉 SISTEMA 100% FUNCIONAL**

✅ **Completado**:
- ✅ Página de presupuestos completa
- ✅ Selección de proyectos visual
- ✅ Carga de presupuestos reales/ejemplo  
- ✅ Estadísticas en tiempo real
- ✅ Búsqueda y filtros avanzados
- ✅ Exportación CSV
- ✅ Diseño responsive
- ✅ Integración con servicios existentes
- ✅ Navegación agregada al navbar
- ✅ Manejo de errores y modo offline

✅ **Compilación exitosa**
✅ **Sin errores críticos**  
✅ **Listo para producción**

### 📞 **Casos de Prueba**

#### 🧪 **Para Probar el Sistema**

1. **Selección de Proyectos**:
   - Ve a `/presupuestos`
   - Observa la lista de proyectos
   - Clic en cualquier proyecto
   - Verifica que se cargan estadísticas

2. **Búsqueda de Items**:
   - Busca "cemento" → debe encontrar Cemento Portland
   - Busca "fierro" → debe encontrar Fierro Corrugado
   - Busca "pintura" → debe encontrar Pintura Látex

3. **Filtros por Categoría**:
   - Selecciona "Áridos" → debe mostrar Arena y Gravilla
   - Selecciona "Terminaciones" → debe mostrar Pintura y Cerámica

4. **Ordenamiento**:
   - Ordena por "Precio" → debe mostrar items más caros primero
   - Ordena por "Categoría" → debe agrupar por tipo

5. **Exportación**:
   - Clic en "📊 Exportar CSV"
   - Verifica que se descarga archivo CSV
   - Abre el archivo y verifica formato correcto

**¡El sistema de presupuestos está completamente operativo!** 🚀
