# 🛒 Sistema de Carrito de Cotizaciones

## 📋 Funcionalidades Principales

### 1. **Búsqueda y Agregar al Carrito**
- Busca materiales usando SerpApi
- Haz clic en "🛒 Carrito" para agregar productos
- Copia información con "📋 Copiar"
- Ve detalles con "🔗 Ver"

### 2. **Gestión del Carrito**
- **Botón flotante**: Aparece cuando hay productos en el carrito
- **Contador**: Muestra la cantidad total de productos
- **Persistencia**: Se guarda en localStorage

### 3. **Carrito de Cotizaciones**
- **Información del proyecto**: Nombre y cliente
- **Edición de productos**:
  - Cambiar cantidad
  - Asignar categoría
  - Agregar notas
- **Acciones por producto**:
  - Copiar información
  - Ver enlace original
  - Eliminar del carrito

### 4. **Exportación a Excel**
Genera un archivo `.xlsx` con **3 hojas**:

#### 🟢 **Hoja 1: Cotización**
- Lista completa de productos
- Precios unitarios y totales
- Categorías y notas
- Enlaces a proveedores
- Fechas de agregado

#### 🟡 **Hoja 2: Resumen**
- Información del proyecto
- Estadísticas generales
- Resumen por categorías
- Instrucciones de uso

#### 🔵 **Hoja 3: APU Base**
- Análisis de Precios Unitarios
- Secciones: Materiales, Mano de Obra, Equipos
- Fórmulas automáticas
- Estructura lista para completar

## 🎯 Flujo de Trabajo Recomendado

### Para Constructores:

1. **Buscar materiales** en la sección "Buscador"
2. **Agregar al carrito** productos relevantes
3. **Organizar por categorías** (Estructura, Albañilería, etc.)
4. **Agregar notas** con especificaciones
5. **Ajustar cantidades** según necesidades
6. **Exportar a Excel** para trabajar offline
7. **Usar APU Base** para análisis detallado

### Para Proveedores:

1. **Verificar precios** desde los enlaces
2. **Actualizar información** en el Excel
3. **Agregar cotizaciones** adicionales
4. **Usar como base** para propuestas

## 📊 Categorías Disponibles

- **General**: Materiales sin categoría específica
- **Estructura**: Acero, concreto, pilares
- **Albañilería**: Ladrillos, cemento, mortero
- **Instalaciones**: Tuberías, cables, accesorios
- **Terminaciones**: Pintura, pisos, revestimientos
- **Herramientas**: Equipos y herramientas
- **Otros**: Elementos especiales

## 🔧 Funcionalidades Técnicas

### Almacenamiento Local
- Los productos se guardan en `localStorage`
- Persisten entre sesiones
- No se pierden al cerrar el navegador

### Exportación Excel
- Formato `.xlsx` compatible
- Fórmulas automáticas en APU
- Columnas ajustables
- Datos estructurados

### Notificaciones
- Confirmación al agregar productos
- Feedback visual al copiar
- Estados de carga durante exportación

## 💡 Consejos de Uso

### Para Mejores Resultados:
1. **Usa términos específicos** al buscar
2. **Verifica precios** con proveedores
3. **Agrega notas detalladas** sobre especificaciones
4. **Organiza por categorías** para mejor gestión
5. **Mantén el carrito actualizado** regularmente

### Para APU Efectivos:
1. **Completa la información** del proyecto
2. **Revisa las cantidades** cuidadosamente
3. **Actualiza precios** según mercado actual
4. **Agrega mano de obra** y equipos
5. **Calcula gastos generales** y utilidad

## 🚀 Integración con el Sistema

### Conexión con Módulos:
- **Proyectos**: Vincula cotizaciones a proyectos específicos
- **Insumos**: Compara con base de datos interna
- **Proveedores**: Identifica fuentes de materiales
- **Reportes**: Genera informes de costos

### Futuras Mejoras:
- Integración directa con proveedores
- Actualización automática de precios
- Comparación de cotizaciones
- Alertas de cambios de precios

## 📱 Disponibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Offline**: Funciona sin internet (productos guardados)
- **Compartir**: Archivos Excel portables

## 🛠️ Soporte

Si encuentras problemas:
1. Verifica que SerpApi esté configurado
2. Revisa la conexión a internet
3. Actualiza el navegador
4. Limpia el cache si es necesario

---

**¡El sistema está listo para mejorar tu flujo de trabajo de cotizaciones!** 🎉
