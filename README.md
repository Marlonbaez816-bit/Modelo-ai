Quiero que me crees los archivos BASE de la interfaz de chat para mi proyecto "Athena Core".

CONTEXTO IMPORTANTE:
- Estoy construyendo esto por partes (máximo 5-6 archivos por prompt)
- Necesito que los archivos sean FUNCIONALES y conecten a MI sistema real
- NADA de demos, NADA de simulaciones, NADA de datos inventados
- Mi sistema se llama "Athena Core" y tiene un motor semántico propio
- Las respuestas vendrán de MI sistema real, no de la interfaz

ARCHIVOS QUE NECESITO AHORA (PARTE 1/6):

1. main.jsx (punto de entrada)
2. App.jsx (componente principal con layout)
3. services/systemApi.js (conexión REAL a mi sistema)
4. hooks/useSystemConnection.js (manejo de estado de conexión)
5. components/chat/ChatInterface.jsx (el chat principal)
6. components/chat/MessageBubble.jsx (burbujas de mensajes)

REQUISITOS ESPECÍFICOS:

1. main.jsx
   - Renderiza App.jsx
   - Configura React StrictMode
   - Punto de entrada limpio y simple

2. App.jsx
   - Layout de 2 columnas: barra lateral (proyectos) + chat
   - Estado global de la aplicación (contexto o store)
   - Tema oscuro por defecto (púrpura/violeta para Athena)
   - Barra lateral con: lista de proyectos, botón "Nuevo Proyecto", configuración de conexión

3. services/systemApi.js (¡ESTO ES CRÍTICO!)
   - sendMessage(message, context) → envía a MI sistema real
   - testConnection() → verifica que MI sistema responde
   - NO SIMULA NADA. LLAMA A MI SISTEMA.
   - Maneja errores reales (timeout, conexión rechazada, etc.)
   - Usa variable de entorno: VITE_SYSTEM_API_URL
   - Si no hay conexión, lanza error real

4. hooks/useSystemConnection.js
   - Estado: isConnected, isLoading, error, systemUrl
   - Función: connect() → prueba conexión real
   - Función: sendMessage(message) → envía y maneja respuesta
   - Función: setSystemUrl(url) → cambia URL de mi sistema
   - Guarda la URL en localStorage para persistencia

5. components/chat/ChatInterface.jsx
   - Área de mensajes con scroll
   - Input de texto (multilínea con Shift+Enter)
   - Botón enviar (con animación al enviar)
   - Indicador "Escribiendo..." cuando mi sistema procesa
   - Muestra mensajes del usuario (derecha) y de Athena (izquierda)
   - Timestamp en cada mensaje
   - Cuando recibe respuesta de mi sistema, la muestra en tiempo real

6. components/chat/MessageBubble.jsx
   - Burbuja para mensaje de usuario (derecha, color púrpura)
   - Burbuja para mensaje de Athena (izquierda, color gris)
   - Muestra el texto, timestamp, y avatar
   - Soporte para diferentes tipos de mensajes (texto, código, imagen, etc.)
   - Diseño limpio y moderno

ESTILOS Y DISEÑO:
- Tema claro y oscuro estilo iphone y moderno con desenfoque incluido 
- Color principal: púrpura/violeta (#7C3AED o similar)
- Fuente: Inter (desde Google Fonts)
- Burbujas redondeadas con sombras suaves
- Iconos: usar Lucide React o Heroicons

VARIABLES DE ENTORNO (en .env.example):
VITE_SYSTEM_API_URL=http://localhost:3000
VITE_APP_NAME=Athena Core

ESTRUCTURA DE CARPETAS (crear estas):
/src
  /services
    systemApi.js
  /hooks
    useSystemConnection.js
  /components
    /chat
      ChatInterface.jsx
      MessageBubble.jsx
  App.jsx
  main.jsx
  index.css

EJEMPLO DE RESPUESTA DE MI SISTEMA (formato real):
{
  type: "text", // o "code", "image", "web"
  content: "Texto de respuesta de Athena Core",
  timestamp: "2026-06-30T12:00:00Z"
}

INSTRUCCIONES FINALES:
1. Cada archivo DEBE ser funcional y completo
2. Comentarios en ESPAÑOL explicando cada parte
3. NADA de código de demo o simulación
4. Las funciones de API DEBEN llamar a mi sistema real
5. Manejar errores reales (fetch, timeout, etc.)
6. Diseño profesional y moderno

ENTREGAME SOLO ESTOS 6 ARCHIVOS.