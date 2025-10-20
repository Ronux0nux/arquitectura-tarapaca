# 🤖 CHATBOT CON IA - DOCUMENTACIÓN COMPLETA

## 📋 ESTADO: ✅ IMPLEMENTADO Y FUNCIONANDO

Tu sistema ahora tiene un **Chatbot con Inteligencia Artificial** powered by OpenAI GPT-3.5-turbo.

---

## 🎯 ¿QUÉ HACE EL CHATBOT?

### **Funcionalidades Principales:**

1. **Asistencia Inteligente**
   - Responde preguntas sobre cómo usar el sistema
   - Guía paso a paso en procesos
   - Explica funcionalidades

2. **Búsqueda de Materiales**
   - Recomienda materiales según necesidad
   - Calcula cantidades aproximadas
   - Sugiere proveedores

3. **Análisis y Recomendaciones**
   - Analiza cotizaciones
   - Sugiere optimizaciones
   - Compara alternativas

4. **Navegación Guiada**
   - Te indica dónde encontrar funciones
   - Te guía por el sistema
   - Responde "¿Cómo hago X?"

---

## 🚀 CÓMO USAR EL CHATBOT

### **Abrir el Chatbot:**
1. Busca el **botón azul flotante** 💬 en la esquina inferior derecha
2. Haz clic para abrir la ventana del chat
3. ¡Escribe tu pregunta y presiona Enter!

### **Ejemplos de Preguntas:**

**Preguntas sobre el Sistema:**
```
- "¿Cómo crear una cotización?"
- "¿Dónde veo los proveedores?"
- "¿Cómo exportar a Excel?"
- "Explícame el sistema de presupuestos"
```

**Búsqueda de Materiales:**
```
- "Necesito cemento para una casa de 150m²"
- "¿Qué fierros recomiendas para vigas?"
- "Buscar ladrillos fiscales"
- "¿Cuánta arena necesito para 100m²?"
```

**Comparación y Análisis:**
```
- "¿Qué proveedor tiene mejores precios en cemento?"
- "Compara Sodimac vs Easy"
- "¿Cuál es la mejor opción para mi proyecto?"
```

**Cálculos de Construcción:**
```
- "¿Cuánto cemento necesito para una casa?"
- "Cantidad de fierros para una losa"
- "Calcular ladrillos para un muro"
```

---

## 🧠 ¿CÓMO FUNCIONA EL "ENTRENAMIENTO"?

### **Importante: NO es entrenamiento tradicional**

Con OpenAI GPT no entrenamos el modelo desde cero (eso costaría millones). 
En su lugar, usamos **"Prompting"** y **"Context"**:

### **1. System Prompt (Instrucciones)**
```
Le decimos al chatbot:
- Quién es (asistente experto en construcción)
- Qué sabe hacer (búsqueda, cotizaciones, análisis)
- Cómo debe responder (tono amigable, respuestas claras)
```

### **2. Knowledge Base (Base de Conocimientos)**
```
Le pasamos información sobre tu sistema:
- Módulos disponibles (Proyectos, Cotizaciones, etc.)
- Funciones principales
- Proveedores registrados
- Materiales comunes
- Proceso de creación de cotizaciones
```

### **3. Context (Contexto del Usuario)**
```
Le damos información de la sesión actual:
- Usuario logueado
- Página actual donde está
- Proyecto seleccionado (si aplica)
```

### **Flujo Visual:**
```
┌─────────────────────────────────────┐
│  System Prompt                      │
│  "Eres un asistente experto..."    │
├─────────────────────────────────────┤
│  Knowledge Base                     │
│  - Sistema tiene: Proyectos,        │
│    Cotizaciones, Proveedores        │
│  - Proveedores: Sodimac, Easy       │
│  - Función: Exportar a Excel        │
├─────────────────────────────────────┤
│  Context (Usuario Actual)           │
│  - Usuario: Juan (Admin)            │
│  - Página: /presupuestos            │
├─────────────────────────────────────┤
│  Conversación                       │
│  Usuario: "¿Cómo exportar Excel?"  │
│  Bot: "Para exportar... [pasos]"   │
└─────────────────────────────────────┘
```

---

## 🔧 CONFIGURACIÓN TÉCNICA

### **Backend:**

**Archivos creados:**
```
backend/
├── src/
│   ├── config/
│   │   └── openai.js           # Servicio de OpenAI + Knowledge Base
│   ├── controllers/
│   │   └── chatbotController.js  # Lógica del chatbot
│   └── routes/
│       └── chatbotRoutes.js     # Endpoints API
```

**Variables de entorno (`.env`):**
```env
OPENAI_API_KEY=sk-proj-YQNg27P1OQ4U2bK5oSIL...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=800
OPENAI_TEMPERATURE=0.7
```

### **Frontend:**

**Archivos creados:**
```
frontend/
└── src/
    ├── components/
    │   └── Chatbot.jsx          # Componente UI del chat
    └── services/
        └── chatbotService.js    # API calls
```

---

## 📊 ENDPOINTS API

### **POST /api/chatbot/message**
Enviar mensaje y obtener respuesta

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "¿Cómo crear una cotización?" }
  ],
  "context": {
    "user": { "name": "Juan", "role": "admin" },
    "currentPage": "/presupuestos"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Para crear una cotización:\n1. Ve al Buscador...",
  "usage": {
    "totalTokens": 250,
    "estimatedCost": "0.000500"
  }
}
```

### **GET /api/chatbot/suggestions**
Obtener preguntas sugeridas

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "¿Cómo crear una cotización?",
    "¿Cómo buscar materiales?",
    "¿Cómo exportar a Excel?"
  ]
}
```

### **GET /api/chatbot/test**
Probar conexión con OpenAI

**Response:**
```json
{
  "success": true,
  "message": "Conexión con OpenAI exitosa"
}
```

### **GET /api/chatbot/stats**
Obtener estadísticas de uso

**Response:**
```json
{
  "success": true,
  "stats": {
    "model": "gpt-3.5-turbo",
    "maxTokens": 800,
    "estimatedCostPerMessage": "~$0.001 - $0.003"
  }
}
```

---

## 💰 COSTOS Y CONSUMO

### **Modelo: GPT-3.5-turbo**

**Precios:**
- Input: $0.0015 / 1K tokens
- Output: $0.002 / 1K tokens

**Consumo Promedio por Conversación:**
- Pregunta simple: ~100-200 tokens = $0.0002 - $0.0004
- Pregunta compleja: ~300-500 tokens = $0.0006 - $0.001
- Conversación larga (10 mensajes): ~1000-2000 tokens = $0.002 - $0.004

**Estimación Mensual:**
```
Uso moderado (50 conversaciones/día):
50 conversaciones x $0.001 x 30 días = ~$1.50/mes

Uso intenso (200 conversaciones/día):
200 conversaciones x $0.001 x 30 días = ~$6/mes
```

**Muy económico para el valor que aporta! 🎉**

---

## 🔒 SEGURIDAD

### **API Key Protegida:**
- ✅ Guardada en `.env` (no se sube a Git)
- ✅ Solo accesible desde el backend
- ✅ Frontend nunca ve la API key

### **Límites Configurables:**
```env
OPENAI_MAX_TOKENS=800      # Limita respuesta máxima
OPENAI_TEMPERATURE=0.7     # Control de creatividad
```

### **Manejo de Errores:**
- Respuestas de fallback si falla OpenAI
- Logs de todos los errores
- Mensajes amigables al usuario

---

## 📈 MONITOREO

### **Logs del Sistema:**
```powershell
# Ver logs en tiempo real
Get-Content backend/logs/combined.log -Tail 20 -Wait

# Ver solo logs del chatbot
Get-Content backend/logs/combined.log | Select-String "chatbot"
```

### **Información de Uso:**
Cada respuesta incluye:
```json
{
  "usage": {
    "promptTokens": 150,
    "completionTokens": 100,
    "totalTokens": 250,
    "estimatedCost": "0.000500"
  }
}
```

---

## 🎨 PERSONALIZACIÓN

### **Agregar Más Conocimientos:**

Edita `backend/src/config/openai.js` en la sección `SYSTEM_KNOWLEDGE`:

```javascript
const SYSTEM_KNOWLEDGE = `
# Tu conocimiento actual...

# Agregar nueva información:
### Nuevos Materiales:
- Material X: Descripción, uso, proveedores
- Material Y: Características especiales

### Nuevos Proveedores:
- Proveedor Z: Ubicación, especialidad

### Nuevos Procesos:
- Cómo hacer X
- Pasos para Y
`;
```

### **Ajustar el Tono:**

Modifica la sección de "Tono y Estilo":
```javascript
## Tono y Estilo:
- [Tu preferencia: formal, casual, técnico, etc.]
- Usa emojis: sí/no
- Longitud de respuestas: cortas/detalladas
```

### **Cambiar Modelo:**

En `.env`:
```env
# Más económico (recomendado):
OPENAI_MODEL=gpt-3.5-turbo

# Más inteligente (más caro):
OPENAI_MODEL=gpt-4-turbo

# Balance:
OPENAI_MODEL=gpt-4o-mini
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **❌ "Error de conexión con OpenAI"**

**Causa:** API key inválida o sin crédito

**Solución:**
1. Verificar API key en `.env`
2. Revisar saldo en https://platform.openai.com/usage
3. Verificar que la key tenga permisos

### **❌ "El chatbot no responde"**

**Causa:** Backend no está corriendo

**Solución:**
```powershell
cd backend
npm start
```

### **❌ "Respuestas muy lentas"**

**Causa:** Muchos tokens en el historial

**Solución:**
- Limitar historial a últimos 10 mensajes
- Reducir `OPENAI_MAX_TOKENS`
- Usar `gpt-3.5-turbo` en vez de `gpt-4`

### **❌ "Respuestas incorrectas"**

**Causa:** Knowledge Base desactualizada

**Solución:**
- Actualizar información en `openai.js`
- Agregar más ejemplos específicos
- Ajustar `OPENAI_TEMPERATURE` (más bajo = más preciso)

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

### **Fase 2: Function Calling**
```
Permitir al chatbot ejecutar acciones:
- Buscar materiales automáticamente
- Crear cotizaciones
- Exportar documentos
```

### **Fase 3: Memoria Persistente**
```
Recordar conversaciones anteriores:
- Preferencias del usuario
- Proyectos recientes
- Materiales favoritos
```

### **Fase 4: Análisis Avanzado**
```
Capacidades analíticas:
- Analizar presupuestos
- Detectar sobrecostos
- Sugerir alternativas más económicas
```

### **Fase 5: Integración de Voz**
```
Interfaz de voz:
- Comandos por voz
- Respuestas en audio
- Dictado de cotizaciones
```

---

## 📝 EJEMPLOS DE USO REAL

### **Ejemplo 1: Usuario Nuevo**
```
👤: "No sé cómo empezar"
🤖: "¡Bienvenido! Te explico rápidamente:

1. **Crear Proyecto**: Ve a 'Proyectos' → 'Nuevo Proyecto'
2. **Buscar Materiales**: Usa el 'Buscador' para encontrar lo que necesitas
3. **Crear Cotización**: Agrega materiales al carrito y exporta a Excel

¿Con cuál quieres empezar?"
```

### **Ejemplo 2: Búsqueda de Material**
```
👤: "Necesito cemento para construir una casa de 120m²"
🤖: "Para 120m² de construcción necesitarás aproximadamente:

📦 **36 sacos de cemento** (30 sacos por cada 100m²)

Te recomiendo:
- **Cemento Portland tipo I**: Uso general ($7,500/saco)
- **Cemento Ultra Resistente**: Estructuras ($8,900/saco)

¿Quieres que te guíe al Buscador para ver precios actuales?"
```

### **Ejemplo 3: Proceso Técnico**
```
👤: "¿Cómo exporto mis cotizaciones a Excel?"
🤖: "Te guío paso a paso:

1. 🛒 Abre el **Carrito de Cotizaciones** (botón flotante azul)
2. Revisa los materiales agregados
3. Completa:
   - Nombre del proyecto
   - Nombre del cliente
4. 📄 Haz clic en **Exportar a Excel**

Se generará un archivo con 2 hojas:
- **PPTO**: Presupuesto resumen
- **APU**: Análisis de precios unitarios

¿Necesitas ayuda con algún paso?"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] OpenAI API key configurada
- [x] Paquete `openai` instalado
- [x] Servicio OpenAI creado con Knowledge Base
- [x] Controller y Routes del chatbot
- [x] Endpoints integrados en `index.js`
- [x] Componente UI del chatbot (React)
- [x] Servicio frontend para API calls
- [x] Chatbot integrado en `App.jsx`
- [x] Documentación completa
- [x] Sistema listo para usar

---

## 🎉 ¡FELICIDADES!

Tu sistema ahora tiene un **Chatbot con IA** completamente funcional.

### **Para probarlo:**
1. Inicia el backend: `npm start` (en `backend/`)
2. Inicia el frontend: `npm start` (en `frontend/`)
3. Busca el botón 💬 en la esquina inferior derecha
4. ¡Haz tu primera pregunta!

---

**Desarrollado con ❤️ por el equipo Tarapacá**

**Fecha de implementación:** 18 de Octubre, 2025

**Modelo IA:** OpenAI GPT-3.5-turbo

**Estado:** ✅ FUNCIONANDO
