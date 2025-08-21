# Hubdox Chat SDK

[![Versión](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/hubdox-chat-sdk)
[![Licencia](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

Desarrollado por [Bemtorres](https://github.com/bemtorres)

Un SDK de JavaScript ligero y fácil de usar para integrar un chatbot flotante en cualquier sitio web. El widget de chat es altamente personalizable y se integra a la perfección con las API de chat existentes.

## 🚀 Características

- **Widget flotante**: Un botón flotante que se expande en un panel de chat completo.
- **Diseño adaptable**: Se adapta automáticamente a diferentes tamaños de pantalla.
- **Modo de pantalla completa en móviles**: Expansión automática a pantalla completa en dispositivos móviles.
- **Pantalla de registro separada**: Una pantalla de bienvenida independiente donde el bot saluda y solicita el nombre del usuario antes de iniciar el chat.
- **Altamente personalizable**: Colores, textos, imágenes y estilos configurables.
- **Integración sencilla**: Una sola línea de código para implementarlo.
- **Shadow DOM**: Aislamiento total de CSS para evitar conflictos con frameworks existentes
- **Modales propios**: Sistema de modales independiente sin dependencias externas
- **Bootstrap opcional**: Soporte para Bootstrap 5 con opción de deshabilitar
- **Soporte para avatares**: Imágenes de perfil para el usuario y el bot.
- **Indicador de escritura**: Muestra cuándo el bot está procesando una respuesta.
- **Gestión de estado**: Manejo automático de mensajes y sesiones, con caché opcional.
- **Diseño minimalista**: Interfaz limpia y fácil de usar.
- **Sistema simplificado**: Solo 2 API (registro y mensaje).
- **Configuración automática**: El bot se configura automáticamente desde la API.
- **Actualización dinámica**: La interfaz de usuario se actualiza automáticamente con la configuración del bot.
- **Modo de prueba**: Un modo de prueba para el desarrollo y las pruebas sin una API en vivo.
- **Soporte Markdown**: Renderizado automático de texto Markdown en las respuestas del bot.
- **Streaming simulado**: Efecto de typing carácter por carácter para simular escritura en tiempo real.
- **Modo desarrollo**: Sistema de logging configurable para desarrollo y producción.

## 📦 Instalación

### CDN (Recomendado)

Última versión:
```html
<script src="https://cdn.jsdelivr.net/npm/hubdox-chat-sdk"></script>
```

### NPM

```bash
npm install hubdox-chat-sdk
```

```javascript
import ChatBot from 'hubdox-chat-sdk';
```

## 🛠️ Uso Básico

```javascript
const chat = new ChatBot({
  baseUrl: 'https://tu-api.com',
  apiKey: 'tu-api-key',
  tenant: 'tu-tenant',
  options: {
    register: true, // Opcional: solicita información del usuario al iniciar
  },
  user: {
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    photo: 'https://ejemplo.com/avatar.jpg'
  },
  bot: {
    name: 'Asistente',
    img: 'https://ejemplo.com/bot-avatar.jpg'
  }
});
```

## ⚙️ Configuración

### Opciones Requeridas

| Parámetro | Tipo   | Descripción                            |
|-----------|--------|----------------------------------------|
| `baseUrl` | string | URL base de tu API de chat             |
| `apiKey`  | string | Clave de API para autenticación (token Bearer) |
| `tenant`  | string | Identificador del tenant/organización  |

### Objeto `options` (Opcional)

| Parámetro  | Tipo    | Por defecto | Descripción                                                                 |
|------------|---------|-------------|-----------------------------------------------------------------------------|
| `register` | boolean | `false`     | Si es `true`, muestra una pantalla de registro donde el bot solicita el nombre del usuario antes de iniciar el chat.                  |
| `show`     | boolean | `true`      | Muestra u oculta el widget de chat en la inicialización.                    |
| `cache`    | boolean | `false`     | Habilita o deshabilita el almacenamiento en caché de la sesión de chat y los mensajes. |
| `cacheExpiration` | number | `30`        | Tiempo de expiración del cache en minutos. Por defecto 30 minutos. |
| `testMode` | boolean | `false`     | Habilita o deshabilita el modo de prueba.                                   |
| `stream`   | boolean | `false`     | Si es `true`, simula el efecto de typing mostrando el mensaje carácter por carácter. |
| `devMode`  | boolean | `false`     | Habilita logs de desarrollo. En producción debe ser `false`.               |
| `useShadowDOM` | boolean | `true`     | Si es `true`, usa Shadow DOM para aislamiento de CSS. Si es `false`, usa Bootstrap. |
| `maxQuestionLength` | number | `50`       | Límite máximo de caracteres para las preguntas del usuario. Incluye contador visual y validación en tiempo real. |

### Objeto `user` (Opcional)

| Parámetro | Tipo   | Por defecto                                                                              | Descripción              |
|-----------|--------|------------------------------------------------------------------------------------------|--------------------------|
| `name`    | string | `'Usuario'`                                                                              | Nombre del usuario.      |
| `email`   | string | `'test@mail.com'`                                                                        | Correo electrónico del usuario. |
| `photo`   | string | `'https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/lgvqg0648leq6meeusid.png'` | URL de la foto de perfil del usuario. |

### Objeto `bot` (Opcional)

| Parámetro | Tipo   | Por defecto                                                                              | Descripción           |
|-----------|--------|------------------------------------------------------------------------------------------|-----------------------|
| `name`    | string | `'Bot'`                                                                                  | Nombre del bot.       |
| `img`     | string | `'https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/xevgjbvb1ri3ytpletzk.png'` | URL de la imagen del bot. |

### Objeto `custom` (Opcional)

| Parámetro           | Tipo    | Por defecto        | Descripción                                                              |
|---------------------|---------|--------------------|--------------------------------------------------------------------------|
| `primaryColor`      | string  | `'#0d6efd'`        | El color principal del widget de chat.                                   |
| `botName`           | string  | `'Bot'`            | El nombre del bot que se muestra en el encabezado.                       |
| `headerBgColor`     | string  | `primaryColor`     | El color de fondo del encabezado del chat.                               |
| `headerTextColor`   | string  | `'#ffffff'`        | El color del texto del encabezado del chat.                              |
| `sendButtonText`    | string  | `null`             | El texto del botón de enviar.                                            |
| `iconButton`        | string  | `null`             | La URL de un icono personalizado para el botón flotante.                 |
| `chatWidth`         | string  | `'400px'`          | El ancho del panel de chat en el escritorio.                             |
| `chatHeight`        | string  | `'60vh'`           | La altura del panel de chat en el escritorio.                            |
| `chatMaxWidth`      | string  | `'90vw'`           | El ancho máximo del panel de chat en móviles.                            |
| `chatMaxHeight`     | string  | `'60vh'`           | La altura máxima del panel de chat en móviles.                           |
| `messagesHeight`    | string  | `'350px'`          | La altura del contenedor de mensajes.                                    |
| `buttonSize`        | string  | `'56px'`           | El tamaño del botón flotante.                                            |
| `fullscreenEnabled` | boolean | `true`             | Habilita o deshabilita el modo de pantalla completa en móviles.          |
| `showTime`          | boolean | `true`            | Si es `true`, muestra la hora en cada mensaje del chat.                  |
| `position`          | object  | `{ bottom: '24px', right: '24px' }` | La posición del botón flotante con propiedades `top`, `bottom`, `left`, `right` y `transform`. |

## 📝 Ejemplos

### Ejemplo Básico

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Sitio Web</title>
</head>
<body>
  <h1>Bienvenido a mi sitio</h1>
  
  <script src="https://cdn.jsdelivr.net/npm/hubdox-chat-sdk@0.1.0"></script>
  <script>
    const chat = new ChatBot({
      baseUrl: 'https://mi-api.com',
      apiKey: 'mi-api-key-123',
      tenant: 'mi-tenant',
      options: {
        register: true, // Habilita el registro conversacional
      },
      user: {
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        photo: 'https://ejemplo.com/juan-avatar.jpg'
      },
      bot: {
        name: 'Asistente Virtual',
        img: 'https://ejemplo.com/bot-avatar.jpg'
      }
    });
  </script>
</body>
</html>
```

### Ejemplo con Pantalla de Registro

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.miempresa.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'miempresa-prod',
  options: {
    register: true, // Habilita la pantalla de registro
  },
  user: {
    name: 'Usuario', // Se mostrará pantalla de registro
    email: 'usuario@miempresa.com',
    photo: 'https://miempresa.com/avatars/default.jpg'
  },
  bot: {
    name: 'Asistente Virtual',
    img: 'https://miempresa.com/bots/asistente.jpg'
  },
  custom: {
    primaryColor: '#ff6b35',
    botName: 'Soporte IA',
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    sendButtonText: 'Enviar Mensaje',
    showTime: true
  }
});
```

### Ejemplo Personalizado (Sin Registro)

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.miempresa.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'miempresa-prod',
  options: {
    register: false, // No muestra pantalla de registro
  },
  user: {
    name: 'María García', // Usuario ya registrado
    email: 'maria@miempresa.com',
    photo: 'https://miempresa.com/avatars/maria.jpg'
  },
  bot: {
    name: 'Soporte Técnico',
    img: 'https://miempresa.com/bots/soporte.jpg'
  },
  custom: {
    primaryColor: '#ff6b35',
    botName: 'Soporte IA',
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    sendButtonText: 'Enviar Mensaje',
    showTime: true
  }
});
```

### Ejemplo con Streaming

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.miempresa.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'miempresa-prod',
  options: {
    register: true,
    stream: true,      // Habilita el efecto de streaming
    devMode: true,     // Logs de desarrollo (solo para desarrollo)
  },
  user: {
    name: 'Usuario',
    email: 'usuario@miempresa.com',
    photo: 'https://miempresa.com/avatars/default.jpg'
  },
  bot: {
    name: 'Asistente IA',
    img: 'https://miempresa.com/bots/asistente.jpg'
  },
  custom: {
    primaryColor: '#6366f1',
    botName: 'Asistente Virtual',
    headerBgColor: '#4f46e5',
    headerTextColor: '#ffffff',
    showTime: true
  }
});
```

## 🔧 API del Servidor

El SDK está diseñado para comunicarse con dos puntos finales principales en su servidor backend.

### 1. Registro de Sesión (`/api/sdk/v1/register`)

Este punto final se llama cuando se inicializa el widget de chat. Su propósito es registrar una nueva sesión de chat y obtener la configuración inicial del bot y la licencia.

- **Método:** `POST`
- **Encabezados:**
  - `Authorization`: `Bearer {apiKey}`
  - `Content-Type`: `application/json`

#### Parámetros de Envío (Request Body)

| Parámetro | Tipo   | Requerido | Descripción                           |
|-----------|--------|-----------|---------------------------------------|
| `apiKey`  | string | Sí        | La clave de API para la autenticación.    |
| `tenant`  | string | Sí        | El identificador del tenant/organización. |

**Ejemplo de Envío:**
```json
{
  "apiKey": "sk-1234567890abcdef",
  "tenant": "mi-tenant"
}
```

#### Parámetros de Recibo (Response Body)

| Parámetro | Tipo   | Descripción                                                                                             |
|-----------|--------|---------------------------------------------------------------------------------------------------------|
| `session` | string | Un identificador único para la sesión de chat. El SDK lo almacenará y lo enviará en las solicitudes de mensajes posteriores. |
| `license` | object | Un objeto que contiene información sobre la licencia del cliente.                                       |
| `chatbot` | object | Un objeto que contiene la configuración del bot.                                                        |

**Estructura del Objeto `license`:**

| Parámetro    | Tipo    | Descripción                                            |
|--------------|---------|--------------------------------------------------------|
| `name`       | string  | El nombre del titular de la licencia (por ejemplo, "Hubdox"). |
| `logo`       | string  | La URL del logo del titular de la licencia.            |
| `active`     | boolean | Indica si la licencia está activa.                     |
| `url`        | string  | La URL a la que enlazará el pie de página de la licencia. |
| `showFooter` | boolean | Si es `true`, se mostrará un pie de página "Powered by". |

**Estructura del Objeto `chatbot`:**

| Parámetro         | Tipo   | Descripción                                           |
|-------------------|--------|-------------------------------------------------------|
| `name`            | string | El nombre del bot (por ejemplo, "Asistente Virtual"). |
| `photo`           | string | La URL de la imagen de perfil del bot.                |
| `initial_message` | string | El primer mensaje que el bot enviará al usuario.      |

**Ejemplo de Recibo:**
```json
{
  "session": "sess_a1b2c3d4e5f6",
  "license": {
    "name": "Hubdox",
    "logo": "https://cdn.hubdox.com/logo.png",
    "active": true,
    "url": "https://hubdox.com",
    "showFooter": true
  },
  "chatbot": {
    "name": "Asistente de Ventas",
    "photo": "https://cdn.example.com/bot-avatar.png",
    "initial_message": "¡Hola! 👋 ¿Cómo puedo ayudarte a encontrar el producto perfecto hoy?"
  }
}
```

---

### 2. Envío de Mensajes (`/api/sdk/v1/message`)

Este punto final se llama cada vez que un usuario envía un mensaje a través del widget de chat.

- **Método:** `POST`
- **Encabezados:**
  - `Authorization`: `Bearer {apiKey}`
  - `Content-Type`: `application/json`

#### Parámetros de Envío (Request Body)

| Parámetro | Tipo   | Requerido | Descripción                                      |
|-----------|--------|-----------|--------------------------------------------------|
| `apiKey`  | string | Sí        | La clave de API para la autenticación.               |
| `tenant`  | string | Sí        | El identificador del tenant/organización.            |
| `session` | string | Sí        | El ID de sesión obtenido del punto final de registro. |
| `message` | string | Sí        | El mensaje de texto del usuario.                 |
| `name`    | string | No        | El nombre del usuario.                           |
| `stream`  | boolean| No        | Si es `true`, indica que se debe usar streaming. |

**Ejemplo de Envío:**
```json
{
  "apiKey": "sk-1234567890abcdef",
  "tenant": "mi-tenant",
  "session": "sess_a1b2c3d4e5f6",
  "message": "Hola, me gustaría saber más sobre el producto X.",
  "name": "Juan Pérez",
  "stream": false
}
```

#### Parámetros de Recibo (Response Body)

| Parámetro | Tipo   | Descripción                     |
|-----------|--------|---------------------------------|
| `answer`  | string | La respuesta de texto del bot. |

**Nota sobre Streaming**: Si `stream: true` se envía en la solicitud, el SDK simulará el efecto de streaming mostrando la respuesta carácter por carácter, independientemente de si el servidor soporta streaming real o no.

**Ejemplo de Recibo:**
```json
{
  "answer": "¡Claro! El producto X es una de nuestras mejores opciones. ¿Qué te gustaría saber específicamente sobre él?"
}
```

## 🎯 Flujo del Menú

El chatbot implementa un flujo mejorado que incluye un menú inicial con opciones para el usuario, seguido de una captura del nombre y email antes de comenzar la conversación principal.

### Flujo del Usuario

1. **Mensaje Inicial**: El bot muestra "Hola soy tu asistente ¿Qué gustaría hacer?" (solo si el usuario tiene información completa)

2. **Registro Obligatorio**: Si el usuario no tiene nombre o email válidos, se muestra automáticamente la pantalla de registro

3. **Menú de Opciones**: Se muestran tres botones:
   - 🛍️ **Producto**: Muestra productos disponibles (si hay)
   - ❓ **Pregunta Frecuente**: Muestra FAQs (si hay)
   - 💬 **Iniciar Conversación**: Comienza el flujo de captura de datos

4. **Captura de Datos**: 
   - Primero pregunta usando `this.saludoInicial` o "¡Hola! Para comenzar, ¿cuál es tu nombre?"
   - Luego pregunta "¡Excelente! Ahora ¿cuál es tu email?"

5. **Saludo Personalizado**: Después de capturar ambos datos, el bot dice `¡Hola ${nombre}! 👋 ¿En qué puedo ayudarte hoy?`

### Configuración

```javascript
const chatbot = new ChatBot({
    baseUrl: 'https://api.hubdox.com',
    apiKey: 'your-api-key',
    tenant: 'your-tenant',
    options: {
        register: false,        // No requiere registro inicial
        testMode: true,         // Modo de prueba activado
        show: true,
        cache: false
    }
});
```

Para más detalles sobre el flujo del menú, consulta [MENU_FLOW.md](docs/MENU_FLOW.md).

## 📊 Sistema de Estados de Conversación

El chatbot implementa un sistema de estados (`status_conversation`) que controla el flujo de la conversación de manera estructurada:

### Estados Disponibles

1. **PRESENTATION**: Bot se presenta y muestra menú de opciones
2. **ASKING_NAME**: Bot solicita el nombre del usuario (solo si `options.user.name == null`)
3. **CHAT_READY**: Chat completamente funcional para conversación

### Métodos Disponibles

- `getConversationStatus()`: Obtiene el estado actual de la conversación
- `getRegistrationStatus()`: Obtiene el estado del registro

### Ejemplo de Uso

```javascript
// Obtener estado actual
const status = chatbot.getConversationStatus();
console.log('Estado:', status.currentStatus);

// Verificar estado específico
if (status.isPresentation) {
    console.log('Bot en modo presentación');
} else if (status.isAskingName) {
    console.log('Bot preguntando por el nombre');
} else if (status.isChatReady) {
    console.log('Chat listo para conversación');
}
```

Para más detalles sobre los estados de conversación, consulta [STATUS_CONVERSATION.md](docs/STATUS_CONVERSATION.md).

## ⚙️ Métodos Públicos

### `toggleChatPanel()`

Alterna la visibilidad del panel de chat.

```javascript
chat.toggleChatPanel();
```

### `hideChatPanel()`

Oculta el panel de chat.

```javascript
chat.hideChatPanel();
```

### `sendMessage(message)`

Envía un mensaje al bot.

```javascript
chat.sendMessage('Hola, necesito ayuda.');
```

### `clearCache()`

Borra la sesión de chat y los mensajes almacenados en caché.

```javascript
chat.clearCache();
```

### `reloadFromCache()`

Recarga la sesión de chat y los mensajes desde la caché.

```javascript
chat.reloadFromCache();
```

### `getCacheStatus()`

Obtiene el estado de la caché.

```javascript
const status = chat.getCacheStatus();
console.log(status);
```

### `getRegistrationStatus()`

Obtiene el estado del registro del usuario.

```javascript
const status = chat.getRegistrationStatus();
console.log(status);
```

### `getConversationStatus()`

Obtiene el estado actual de la conversación.

```javascript
const status = chat.getConversationStatus();
console.log('Estado actual:', status.currentStatus);
console.log('¿Es presentación?', status.isPresentation);
console.log('¿Está preguntando por nombre?', status.isAskingName);
console.log('¿Está listo para chat?', status.isChatReady);
```

### `setMaxQuestionLength(length)`

Configura el límite máximo de caracteres para las preguntas del usuario.

```javascript
chat.setMaxQuestionLength(300); // Establece límite de 300 caracteres
```

### `getMaxQuestionLength()`

Obtiene el límite actual de caracteres para las preguntas.

```javascript
const currentLimit = chat.getMaxQuestionLength();
console.log('Límite actual:', currentLimit); // 500 (por defecto)
```

## 🎯 Pantalla de Registro

La nueva funcionalidad de pantalla de registro separa claramente el proceso de registro del chat normal, evitando confusiones y mejorando la experiencia del usuario.

### ¿Cuándo se muestra la pantalla de registro?

La pantalla de registro se muestra automáticamente cuando se cumple alguna de estas condiciones:

1. **Cuando `register: true`** - La opción de registro está habilitada
2. **Cuando el nombre del usuario no existe** - El usuario no tiene un nombre válido
3. **Cuando el usuario no está registrado** - No se ha completado el proceso de registro

### Flujo de la pantalla de registro

1. **Bienvenida**: El bot muestra una pantalla de bienvenida con su imagen
2. **Solicitud de nombre**: Solicita al usuario que escriba su nombre
3. **Confirmación**: Confirma el nombre y transiciona al chat
4. **Chat normal**: Inicia el chat con un mensaje personalizado

### Ejemplo de configuración

```javascript
const chat = new ChatBot({
  baseUrl: 'https://tu-api.com',
  apiKey: 'tu-api-key',
  tenant: 'tu-tenant',
  options: {
    register: true, // Habilita la pantalla de registro
    testMode: true  // Para pruebas sin API real
  },
  user: {
    name: "Usuario", // Se mostrará pantalla de registro
    email: 'usuario@ejemplo.com'
  }
});
```

## 🧪 Modo de Prueba

Cuando `testMode: true` está habilitado, el widget de chat utiliza un conjunto predefinido de respuestas para fines de prueba, sin necesidad de una API en vivo.

### Estados de Conversación en Modo de Prueba

El modo de prueba respeta completamente el sistema de estados de conversación:

- **PRESENTATION**: Bot se presenta y muestra menú (funciona igual que en modo normal)
- **ASKING_NAME**: Solicita nombre del usuario (procesa respuestas como registro)
- **CHAT_READY**: Genera respuestas automáticas usando mensajes predefinidos

### Archivos de Prueba para Modo de Prueba

#### 1. Test Completo del Flujo
**`example/test-mode-status-flow.html`** - Test automático del flujo completo:
- Verificación de que `testMode: true` esté activado
- Test automático del flujo completo de estados
- Simulación de interacciones del usuario
- Log detallado de todas las transiciones de estado

#### 2. Debug Detallado
**`example/debug-test-mode.html`** - Debug completo con interceptación de console:
- Monitoreo en tiempo real de todos los estados
- Interceptación de logs de console para debugging
- Verificación detallada de la configuración
- Diagnóstico de problemas del flujo

#### 3. Flujo Simple Paso a Paso
**`example/simple-test-flow.html`** - Flujo simplificado para pruebas básicas:
- Botones paso a paso para cada etapa del flujo
- Verificación del estado después de cada acción
- Log claro de cada operación
- Ideal para debugging inicial

```javascript
const chat = new ChatBot({
  // ... otras opciones
  options: {
    testMode: true,
  }
});
```

## 📝 Soporte Markdown

El ChatBot incluye soporte completo para renderizar texto Markdown en las respuestas del bot. Los siguientes formatos son soportados:

### Formatos Soportados

| Formato | Sintaxis | Resultado |
|---------|----------|-----------|
| **Negrita** | `**texto**` | **texto** |
| *Cursiva* | `*texto*` | *texto* |
| `Código inline` | `` `código` `` | `código` |
| **Bloque de código** | ```` ```código``` ```` | Bloque de código con resaltado |
| [Enlaces](https://ejemplo.com) | `[texto](url)` | Enlaces externos |
| **Títulos** | `# Título`, `## Subtítulo` | Títulos con jerarquía |
| **Listas** | `- item` o `1. item` | Listas ordenadas y no ordenadas |

### Ejemplo de Respuesta con Markdown

```javascript
// El bot puede responder con Markdown
const respuesta = `# ¡Hola! 👋

Te ayudo con **formato Markdown**. Aquí tienes algunos ejemplos:

## Características principales:
- **Negrita** para énfasis
- *Cursiva* para detalles
- \`código inline\` para comandos
- [Enlaces](https://ejemplo.com) para recursos

## Ejemplo de código:
\`\`\`javascript
function saludar() {
    console.log("¡Hola mundo!");
}
\`\`\``;
```

### Seguridad

El parser de Markdown incluye protección contra XSS (Cross-Site Scripting) al escapar automáticamente el HTML malicioso en el texto de entrada.

## ⚡ Streaming Simulado

El ChatBot SDK incluye una funcionalidad de streaming simulado que permite mostrar las respuestas del bot carácter por carácter, creando un efecto visual similar al de ChatGPT.

### ¿Cómo funciona?

Cuando `stream: true` está habilitado:

1. **Indicador de typing**: Se muestra el indicador "está escribiendo..." primero
2. **Streaming de texto**: El mensaje aparece progresivamente carácter por carácter
3. **Cursor parpadeante**: Un cursor animado indica que el bot está "escribiendo"
4. **Velocidad variable**: Diferentes velocidades para espacios, puntuación y caracteres normales

### Configuración

```javascript
const chat = new ChatBot({
  // ... otras opciones
  options: {
    stream: true,  // Habilita el streaming simulado
  }
});
```

### Comportamiento

- **Con `stream: true`**: Mensaje aparece carácter por carácter con cursor parpadeante
- **Con `stream: false`**: Mensaje aparece completo de una vez

### Personalización

El streaming incluye:
- **Cursor parpadeante** con el color primario del chat
- **Borde izquierdo** especial durante el streaming
- **Fondo degradado** sutil para destacar el mensaje
- **Velocidad variable** que simula typing humano

## 🔤 Límite de Caracteres para Preguntas

El ChatBot SDK incluye una funcionalidad para limitar la longitud de las preguntas del usuario, incluyendo validación en tiempo real y un contador visual.

### Características

- **Límite configurable**: Establecer un número máximo de caracteres (por defecto: 500)
- **Contador visual**: Muestra cuántos caracteres se han usado (ej: 45/500)
- **Validación en tiempo real**: El botón de envío se deshabilita cuando se excede el límite
- **Indicador visual**: El input cambia de color cuando se excede el límite
- **Prevención de envío**: No se pueden enviar mensajes que excedan el límite
- **Configuración dinámica**: Cambiar el límite después de la inicialización

### Configuración Inicial

```javascript
const chat = new ChatBot({
  baseUrl: 'https://tu-api.com',
  apiKey: 'tu-api-key',
  tenant: 'tu-tenant',
  options: {
    maxQuestionLength: 300, // Límite de 300 caracteres
  }
});
```

### Configuración Dinámica

```javascript
// Cambiar límite después de la inicialización
chat.setMaxQuestionLength(200);

// Obtener límite actual
const currentLimit = chat.getMaxQuestionLength();
console.log('Límite actual:', currentLimit);
```

### Casos de Uso

- **Control de costos**: Limitar la longitud para reducir el consumo de tokens en APIs de IA
- **Mejora de UX**: Forzar preguntas más concisas y directas
- **Prevención de spam**: Evitar mensajes excesivamente largos
- **Optimización de rendimiento**: Reducir el tiempo de procesamiento
- **Consistencia**: Mantener un formato estándar en las consultas

### Ejemplo Completo

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.ejemplo.com',
  apiKey: 'mi-api-key',
  tenant: 'mi-tenant',
  options: {
    maxQuestionLength: 250, // Límite de 250 caracteres
    testMode: true
  }
});

// Inicializar el chat
chat.init();

// Cambiar límite dinámicamente
setTimeout(() => {
  chat.setMaxQuestionLength(150);
  console.log('Nuevo límite:', chat.getMaxQuestionLength());
}, 5000);
```

## 🔧 Modo Desarrollo

El SDK incluye un sistema de logging configurable para facilitar el desarrollo y debugging.

### Configuración

```javascript
const chat = new ChatBot({
  // ... otras opciones
  options: {
    devMode: true,  // Habilita logs de desarrollo
  }
});
```

### Tipos de Logs

- **`_log()`**: Logs informativos generales
- **`_logError()`**: Errores (siempre visibles)
- **`_logWarn()`**: Advertencias (solo en modo desarrollo)
- **`_logInfo()`**: Información adicional (solo en modo desarrollo)
- **`_logDebug()`**: Información de debugging (solo en modo desarrollo)

### Uso en Producción

```javascript
// Para producción, deshabilitar logs
options: {
  devMode: false,  // Deshabilita logs para mejor rendimiento
}
```

## 🔄 Almacenamiento en Caché

El widget de chat puede almacenar en caché la sesión de chat y los mensajes en el almacenamiento local del navegador para mantener la conversación a través de las recargas de la página.

Para deshabilitar el almacenamiento en caché, establece `cache: false` en el objeto `options`.

```javascript
const chat = new ChatBot({
  // ... otras opciones
  options: {
    cache: false,
  }
});
```

## 🔒 Shadow DOM

### ¿Qué es Shadow DOM?

El Shadow DOM es una tecnología web que permite encapsular completamente el CSS y JavaScript de un componente, creando un "árbol DOM sombra" aislado del resto de la página. Esto significa que:

- ✅ Los estilos CSS no se filtran hacia afuera
- ✅ Los estilos externos no afectan al componente
- ✅ JavaScript completamente encapsulado
- ✅ **¡Perfecto para evitar conflictos de Bootstrap!**

### Configuración

Por defecto, el SDK usa Shadow DOM para evitar conflictos:

```javascript
// Configuración por defecto (Shadow DOM activado)
const chatbot = new ChatBot({
    baseUrl: 'https://tu-api.com',
    apiKey: 'tu-api-key',
    tenant: 'tu-tenant',
    options: {
        useShadowDOM: true  // Activado por defecto
    }
});
```

### Usar con Bootstrap (Legacy)

Si necesitas usar Bootstrap por alguna razón específica:

```javascript
// Para usar con Bootstrap (comportamiento original)
const chatbot = new ChatBot({
    baseUrl: 'https://tu-api.com',
    apiKey: 'tu-api-key',
    tenant: 'tu-tenant',
    options: {
        useShadowDOM: false  // Desactivar Shadow DOM
    }
});
```

### Ventajas del Shadow DOM

| Característica | Shadow DOM | Bootstrap |
|----------------|------------|-----------|
| **Aislamiento CSS** | ✅ Total | ❌ Conflictos |
| **Dependencias** | ✅ Ninguna | ❌ Bootstrap 5.3.0 |
| **Performance** | ✅ Mejor | ❌ Más peso |
| **Conflictos** | ✅ Ninguno | ❌ Posibles |
| **Personalización** | ✅ Fácil | ❌ Limitada |

## 🎨 Personalización

### Colores

Puedes personalizar completamente la apariencia del widget:

```javascript
const chat = new ChatBot({
  // ... otras opciones
  custom: {
    primaryColor: '#e74c3c',      // Color principal
    headerBgColor: '#2c3e50',     // Fondo del encabezado
    headerTextColor: '#ffffff',   // Texto del encabezado
  }
});
```

### Textos

Personaliza los textos que aparecen en el widget:

```javascript
const chat = new ChatBot({
  // ... otras opciones
  custom: {
    botName: 'Mi Asistente Personal',
    sendButtonText: 'Enviar Mensaje'
  }
});
```

## 🔧 Métodos de Cache

El SDK incluye métodos para gestionar el cache de sesión:

### Configuración de Cache

```javascript
// Habilitar/deshabilitar cache
chat.setCacheEnabled(true);

// Configurar tiempo de expiración (en minutos)
chat.setCacheExpiration(60); // 1 hora

// Obtener estado del cache
const cacheStatus = chat.getCacheStatus();
console.log('Cache habilitado:', cacheStatus.enabled);
console.log('Expira en:', cacheStatus.expiration, 'minutos');
console.log('¿Es válido?', cacheStatus.isValid);
```

### Métodos Disponibles

| Método | Descripción |
|--------|-------------|
| `setCacheEnabled(enabled)` | Habilita o deshabilita el cache |
| `setCacheExpiration(minutes)` | Configura el tiempo de expiración en minutos |
| `getCacheStatus()` | Obtiene el estado completo del cache |
| `getCacheExpiration()` | Obtiene el tiempo de expiración actual |

### Características del Cache

- **Guardado Automático**: Se guarda después de cada mensaje
- **Expiración Configurable**: Por defecto 30 minutos
- **Limpieza Automática**: Se elimina automáticamente al expirar
- **Recuperación de Estado**: Restaura mensajes, usuario y configuración
- **Persistencia Local**: Almacenado en localStorage del navegador

## 📁 Archivos de Ejemplo

El SDK incluye varios archivos de ejemplo para diferentes casos de uso:

### Archivos Principales

- **`example/text.html`**: Ejemplo básico con todas las funcionalidades
- **`example/streaming-test.html`**: Prueba específica del streaming simulado
- **`example/shadow-dom-example.html`**: Ejemplo completo con Shadow DOM
- **`example/options-menu.html`**: Configurador visual con Bootstrap
- **`example/options-menu-tailwind.html`**: Configurador visual con Tailwind CSS
- **`example/registration-screen-example.html`**: Ejemplo de pantalla de registro
- **`example/session-cache.html`**: Ejemplo completo de cache de sesión por 30 minutos
- **`index.html`**: 30 ejemplos diferentes de configuración

### Pruebas

- **`tests/`**: Suite completa de pruebas unitarias
- **`tests/RegistrationScreen.test.js`**: Pruebas específicas para pantalla de registro
- **`tests/streaming.test.js`**: Pruebas para funcionalidad de streaming

## 🚀 Despliegue

### Desarrollo Local

1. Clona el repositorio.
2. Abre `example/streaming-test.html` para probar el streaming.
3. Abre `example/text.html` para ver todas las funcionalidades.
4. Modifica la configuración según tus necesidades.

### Producción

1. Incluye el script desde CDN.
2. Configura tu punto final de la API.
3. Personaliza la apariencia según tu marca.

## 🤝 Contribuir

1. Haz un fork del proyecto.
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`).
3. Confirma tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Empuja a la rama (`git push origin feature/AmazingFeature`).
5. Abre una Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Consulta el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Bemtorres**

- GitHub: [@bemtorres](https://github.com/bemtorres)

## 🙏 Agradecimientos

- [Bootstrap](https://getbootstrap.com/) por el framework CSS.
- [Cloudinary](https://cloudinary.com/) por el alojamiento de imágenes predeterminado.
