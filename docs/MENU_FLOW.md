# Flujo del Menú del Chatbot

## Descripción General

El chatbot ahora implementa un flujo mejorado que incluye un menú inicial con opciones para el usuario, seguido de una captura del nombre antes de comenzar la conversación principal.

## Flujo del Usuario

### 1. Mensaje Inicial
- **Mensaje por defecto**: "Hola soy tu asistente ¿Qué gustaría hacer?"
- **Mensaje personalizado**: Si se configura `initial_message` en la API, se usa ese mensaje
- **Ubicación**: Se muestra automáticamente al inicializar el chatbot

### 2. Menú de Opciones
El botón flotante del chatbot se expande mostrando tres opciones principales:

#### 🛍️ Producto
- **Función**: Muestra un modal con la lista de productos disponibles
- **Condición**: Solo aparece si hay productos configurados en la API
- **Comportamiento**: Abre el modal de productos con búsqueda y filtros

#### ❓ Pregunta Frecuente
- **Función**: Muestra un modal con las preguntas frecuentes
- **Condición**: Solo aparece si hay FAQs configuradas en la API
- **Comportamiento**: Abre el modal de FAQs con navegación

#### 💬 Iniciar Conversación
- **Función**: Comienza el flujo de captura del nombre
- **Condición**: Siempre disponible
- **Comportamiento**: Pregunta por el nombre del usuario

### 3. Captura del Nombre
Al seleccionar "Iniciar Conversación":

1. **Pregunta**: Se usa `this.saludoInicial` o el mensaje por defecto "¡Hola! Para comenzar, ¿cuál es tu nombre?"
2. **Input**: Se habilita para que el usuario escriba su nombre
3. **Validación**: Se verifica que el nombre no esté vacío
4. **Almacenamiento**: El nombre se guarda en `this.user.name`

### 4. Saludo Personalizado
Después de capturar el nombre:

- **Mensaje**: `¡Hola ${this.user.name || 'usuario'}! 👋 ¿En qué puedo ayudarte hoy?`
- **Estado**: El usuario está registrado y puede comenzar a chatear
- **Funcionalidad**: El chatbot está listo para recibir mensajes

## Configuración

### Opciones del SDK

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

### Configuración de la API

```json
{
    "chatbot": {
        "name": "Nombre del Bot",
        "photo": "URL de la imagen",
        "initial_message": "Mensaje personalizado de saludo"
    },
    "module": {
        "products": [...],
        "faqs": [...]
    }
}
```

## Estados del Sistema

### Estado Inicial
- `registrationScreen: false`
- `registered: false`
- `registrationCompleted: false`
- Se muestra el mensaje inicial con menú (solo si el usuario tiene información válida)

### Estado de Registro Obligatorio
- `registrationScreen: true`
- `registered: false`
- `registrationCompleted: false`
- Se muestra pantalla de registro automáticamente

### Estado de Captura de Nombre
- `registrationScreen: false`
- `registered: false`
- `registrationCompleted: false`
- Se pregunta por el nombre

### Estado de Captura de Email
- `registrationScreen: false`
- `registered: false`
- `registrationCompleted: false`
- Se pregunta por el email (después del nombre)

### Estado de Conversación
- `registrationScreen: false`
- `registered: true`
- `registrationCompleted: true`
- Chat completamente funcional

## Funciones Principales

### `_addInitialMessage()`
- Muestra el mensaje inicial con el menú de opciones
- Configura los botones según la disponibilidad de productos y FAQs
- Se ejecuta automáticamente al inicializar

### `_startNormalChat()`
- Inicia el flujo de captura del nombre
- Pregunta usando `this.saludoInicial` o el mensaje por defecto
- Habilita el input para la respuesta

### `_handleRegistrationResponse()`
- Procesa la respuesta del nombre y email del usuario
- Valida que el nombre no esté vacío
- Valida que el email tenga formato válido
- Muestra el saludo personalizado
- Completa el registro del usuario

## Casos de Uso

### 1. Usuario Sin Información (Registro Obligatorio)
1. Se muestra automáticamente la pantalla de registro
2. Selecciona "Iniciar Conversación"
3. Proporciona su nombre
4. Proporciona su email
5. Recibe saludo personalizado
6. Comienza a chatear

### 2. Usuario con Información Parcial (Registro Obligatorio)
1. Se muestra automáticamente la pantalla de registro
2. Selecciona "Iniciar Conversación"
3. Completa la información faltante (nombre o email)
4. Recibe saludo personalizado
5. Comienza a chatear

### 3. Usuario con Información Completa
1. Ve el mensaje inicial con menú completo
2. Puede explorar productos o FAQs antes de chatear
3. Selecciona "Iniciar Conversación" cuando esté listo
4. Va directamente al chat (no requiere registro)

### 4. Usuario con Registro Forzado
1. Si `register: true`, siempre se muestra pantalla de registro
2. Sigue el flujo completo de captura de nombre y email
3. Recibe saludo personalizado
4. Comienza a chatear

## Personalización

### Mensajes
- Los mensajes se pueden personalizar a través de las traducciones
- Se respeta el `initial_message` de la API si está configurado

### Colores y Estilos
- Los botones usan `primaryColor` para el estilo principal
- Los botones de productos usan un color naranja distintivo
- Los botones de FAQs usan el color primario

### Funcionalidad
- Los botones solo aparecen si hay contenido disponible
- El comportamiento se adapta según la configuración de la API

## Pruebas

### Archivo de Prueba
- `example/menu-flow-test.html` - Prueba completa del flujo
- Configurado en modo test para verificar la funcionalidad
- Incluye botón de reinicio para probar múltiples veces

### Verificaciones
- ✅ Mensaje inicial correcto
- ✅ Botones del menú visibles
- ✅ Funcionamiento de productos y FAQs
- ✅ Captura del nombre
- ✅ Saludo personalizado
- ✅ Transición al chat

## Consideraciones Técnicas

### Rendimiento
- Los botones se renderizan dinámicamente
- Solo se muestran si hay contenido disponible
- El estado se mantiene en memoria

### Compatibilidad
- Funciona con el sistema de traducciones existente
- Compatible con el modo de prueba
- Se integra con el sistema de cache

### Extensibilidad
- Fácil agregar nuevas opciones al menú
- Configurable a través de la API
- Personalizable por tenant
