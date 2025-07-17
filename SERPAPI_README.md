# Configuración del Buscador de Materiales con SerpApi

## 🔍 Sobre el Buscador

El buscador de materiales integra **SerpApi** para buscar información y precios de materiales de construcción directamente desde Google. Permite:

- ✅ Buscar productos con precios
- ✅ Buscar información general sobre materiales
- ✅ Resultados localizados para Chile
- ✅ Comparar precios entre proveedores
- ✅ Ver imágenes de productos

## 📋 Configuración

### 1. Crear cuenta en SerpApi

1. Ve a [serpapi.com](https://serpapi.com)
2. Regístrate para obtener una cuenta gratuita
3. Confirma tu email
4. Obtén tu API key desde el dashboard

### 2. Configurar la variable de entorno

En el archivo `frontend/.env`, agrega tu API key:

```env
REACT_APP_SERPAPI_KEY=tu_api_key_aqui
```

### 3. Límites de la cuenta gratuita

- **100 búsquedas gratuitas por mes**
- Después de eso, necesitarás un plan de pago
- Puedes monitorear tu uso en el dashboard de SerpApi

## 🚀 Uso

### Tipos de búsqueda disponibles:

1. **Productos**: Muestra resultados de Google Shopping con precios
2. **Información**: Muestra resultados web generales

### Consejos para mejores resultados:

- Usa términos específicos: "cemento portland", "acero estructural"
- Los resultados están optimizados para Chile
- Combina nombres de materiales con "precio", "costo", "comprar"

## 🔧 Funcionalidades técnicas

### Parámetros de búsqueda:
- `engine`: google
- `location`: Chile
- `hl`: es (español)
- `gl`: cl (Chile)
- `num`: 10 resultados por búsqueda

### Manejo de errores:
- Valida la presencia de API key
- Maneja errores de red
- Muestra mensajes informativos al usuario

## 📊 Integración con el sistema

El buscador está integrado en la página `/buscador` y puede complementar:
- La gestión de insumos
- La cotización de proyectos
- La comparación de precios de proveedores

## 🛠️ Desarrollo

Para modificar el buscador, edita:
- `frontend/src/components/BuscadorMateriales.jsx`
- `frontend/src/pages/BuscadorPage.jsx`

## 📝 Notas importantes

- Las búsquedas consumen créditos de tu cuenta SerpApi
- Los resultados pueden variar según disponibilidad de Google
- Se recomienda cachear resultados para optimizar uso
- Los precios mostrados son referenciales y pueden no estar actualizados
