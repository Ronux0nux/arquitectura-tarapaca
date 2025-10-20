# 🧪 Validación Rápida - Links de SerpAPI

## ✅ Checklist de Verificación

Sigue estos pasos para confirmar que todo funciona:

### 1️⃣ Backend Iniciado
- [ ] Backend está corriendo en `http://localhost:5000`
- [ ] Sin errores en la consola
- [ ] SERPAPI_KEY está configurada en `.env`

```bash
# Comando para verificar
npm start
```

### 2️⃣ Frontend Iniciado
- [ ] Frontend está corriendo en `http://localhost:3000`
- [ ] Página carga sin errores
- [ ] Puedes navegar sin problemas

### 3️⃣ Primera Búsqueda

1. Ve a la página **Buscador** del menú
2. En el campo de búsqueda escribe: **`cemento`**
3. Haz clic en **"Buscar"** o presiona **Enter**

**Resultado esperado:**
```
🌐 Resultados de búsqueda en internet (10)
  💾 Guardado automáticamente en dataset

[Tarjetas de productos con imagen]
- Título del producto
- Precio (ej: $8.500)
- Proveedor (ej: www.sodimac.cl)
- Botones: 🛒 Carrito | 📋 Copiar | 🔗 Ver
```

### 4️⃣ Verificar Links

**Prueba 1: Link Disponible**
1. Encuentra un resultado con un precio visible
2. Haz clic en el botón **🔗 Ver**
3. Debería abrirse una **nueva pestaña** con el producto

**Resultado esperado:** 
- Se abre una página de un proveedor (Sodimac, Easy, etc.)

**Prueba 2: Link No Disponible**
1. Si ves un botón que dice **🔍 Buscar**
2. Haz clic en él
3. Debería abrirse **Google** buscando el producto

**Resultado esperado:**
- Se abre Google con "cemento" en la búsqueda

### 5️⃣ Revisar Logs del Backend

Abre la **consola del backend** y busca mensajes como:

```
🛍️ SERPAPI shopping result: {
  title: 'Cemento Portland 50 kg',
  price: '$8.500',
  source: 'www.sodimac.cl',
  link: 'https://www.sodimac.cl/sodimac/product/...',
  hasImage: true,
  allKeys: ['title', 'price', 'source', 'link', ...]
}
```

**✅ Si ves esto:** Los links se están extrayendo correctamente

### 6️⃣ Revisar Consola del Navegador

Abre **F12** → **Console** y verifica:

```javascript
🔗 Abriendo link: https://www.sodimac.cl/...
```

**✅ Si ves esto:** El link se está abriendo correctamente

---

## 🔍 Búsquedas Recomendadas para Probar

Usa estos términos que tienen buenos resultados en SerpAPI:

| Búsqueda | Resultado esperado |
|----------|-------------------|
| **cemento** | 8-10 resultados con precios |
| **ladrillo** | 8-10 resultados con imágenes |
| **acero estructural** | 6-8 resultados con links |
| **pintura** | 10 resultados con precios |
| **tubo pvc** | 8-10 resultados |

---

## 🧹 Si No Ves Links

### Paso 1: Verifica Backend
```bash
# Revisa que SERPAPI_KEY esté configurada
echo $env:SERPAPI_KEY  # Windows PowerShell

# O revisa el archivo .env
cat .env | grep SERPAPI
```

### Paso 2: Reinicia Backend
```bash
# Detén el backend (Ctrl+C)
# Luego reinicia
npm start
```

### Paso 3: Limpia Caché
```bash
# En el navegador: Ctrl+Shift+Delete
# Selecciona "Todos los tiempos"
# Marca: Cookies y datos del sitio
# Haz clic en "Borrar datos"
```

### Paso 4: Intenta Nuevamente
Prueba una búsqueda diferente, ej: `ladrillo 14x19`

### Paso 5: Revisa Consola del Servidor
Copia el error exacto que ves en los logs y verifica:
- ¿La API key es válida?
- ¿Hay cuota disponible?
- ¿SerpAPI está respondiendo?

---

## 📊 Estructura de Respuesta Esperada

La API debería devolver algo como esto:

```json
{
  "results": [
    {
      "title": "Cemento Portland 50 kg",
      "price": "$8.500",
      "source": "www.sodimac.cl",
      "link": "https://www.sodimac.cl/sodimac/product/123456",
      "product_link": "https://www.sodimac.cl/...",
      "thumbnail": "https://images.sodimac.cl/...",
      "rating": 4.5,
      "reviews": 128,
      "type": "shopping"
    }
  ],
  "searchTerm": "cemento",
  "searchType": "shopping"
}
```

**Verificación:**
- ✅ `link` presente y válido (comienza con http/https)
- ✅ `thumbnail` tiene URL válida (o es null)
- ✅ `price` tiene formato de precio
- ✅ `source` tiene nombre del proveedor

---

## 🎯 Resumen Rápido

| Verificar | Cómo | Resultado |
|-----------|------|----------|
| **Links** | Haz clic en 🔗 Ver | Se abre proveedor |
| **Fallback** | Haz clic en 🔍 Buscar | Se abre Google |
| **Logs** | Revisa consola backend | Ves estructura de datos |
| **BD** | Consulta MongoDB | Tiene metadata con links |
| **Frontend** | Abre F12 → Console | Sin errores |

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué a veces no aparecen imágenes?**  
R: SerpAPI a veces no devuelve `thumbnail`. El botón funcionará de todas formas.

**P: ¿Qué pasa si no tengo cuota en SerpAPI?**  
R: Verás un error. Compra créditos o crea una nueva cuenta gratuita.

**P: ¿Por qué algunos links no funcionan?**  
R: SerpAPI devuelve links que pueden expirar o cambiar. Usa 🔍 Buscar como alternativa.

**P: ¿Se guardan los links en la BD?**  
R: Sí, en el campo `metadata.link` de cada insumo.

**P: ¿Puedo usar los links después?**  
R: Sí, son parte del registro del producto y se pueden reutilizar.

---

## 📞 Si Nada Funciona

1. Verifica `SERPAPI_KEY` en `.env`
2. Verifica cuota en https://serpapi.com/manage/account
3. Reinicia backend: `npm start`
4. Limpia caché del navegador: Ctrl+Shift+Delete
5. Prueba con búsqueda específica: "cemento portland precio"
6. Abre la consola (F12) y copia el error exacto

---

**Última actualización:** Octubre 19, 2025  
**Estado:** ✅ Funcional
