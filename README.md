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
- **Bootstrap incluido**: Utiliza Bootstrap 5 para un diseño moderno y profesional.
- **Soporte para avatares**: Imágenes de perfil para el usuario y el bot.
- **Indicador de escritura**: Muestra cuándo el bot está procesando una respuesta.
- **Gestión de estado**: Manejo automático de mensajes y sesiones, con caché opcional.
- **Diseño minimalista**: Interfaz limpia y fácil de usar.
- **Sistema simplificado**: Solo 2 API (registro y mensaje).
- **Configuración automática**: El bot se configura automáticamente desde la API.
- **Actualización dinámica**: La interfaz de usuario se actualiza automáticamente con la configuración del bot.
- **Modo de prueba**: Un modo de prueba para el desarrollo y las pruebas sin una API en vivo.
- **Soporte Markdown**: Renderizado automático de texto Markdown en las respuestas del bot.

## 📦 Instalación

### CDN (Recomendado)

last version:
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
| `cache`    | boolean | `true`      | Habilita o deshabilita el almacenamiento en caché de la sesión de chat y los mensajes. |
| `testMode` | boolean | `false`     | Habilita o deshabilita el modo de prueba.                                   |

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

**Ejemplo de Envío:**
```json
{
  "apiKey": "sk-1234567890abcdef",
  "tenant": "mi-tenant",
  "session": "sess_a1b2c3d4e5f6",
  "message": "Hola, me gustaría saber más sobre el producto X.",
  "name": "Juan Pérez"
}
```

#### Parámetros de Recibo (Response Body)

| Parámetro | Tipo   | Descripción                     |
|-----------|--------|---------------------------------|
| `answer`  | string | La respuesta de texto del bot. |

**Ejemplo de Recibo:**
```json
{
  "answer": "¡Claro! El producto X es una de nuestras mejores opciones. ¿Qué te gustaría saber específicamente sobre él?"
}
```

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

## 🚀 Despliegue

### Desarrollo Local

1. Clona el repositorio.
2. Abre `example/text.html` en tu navegador.
3. Modifica la configuración según tus necesidades.

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
