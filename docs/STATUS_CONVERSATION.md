# 📊 Sistema de Estados de Conversación - ChatBot SDK

## 🎯 Descripción General

El sistema de estados de conversación (`status_conversation`) es una implementación que permite rastrear y controlar el flujo de la conversación del chatbot de manera estructurada y predecible.

## 🔄 Estados Disponibles

### 1. `PRESENTATION` - Presentación del Bot
- **Descripción**: Estado inicial donde el bot se presenta al usuario
- **Comportamiento**: 
  - Muestra la imagen del bot (`chatbot.img`)
  - Presenta el mensaje inicial (`chatbot.initial_message`)
  - Muestra el menú de opciones:
    - Preguntas Frecuentes
    - Productos  
    - Iniciar Conversación
- **Cuándo se activa**: Al inicializar el chatbot o después de limpiar el historial
- **Propiedades del mensaje**: `isWelcome: true`, `showWelcomeButtons: true`

### 2. `ASKING_NAME` - Preguntando por el Nombre
- **Descripción**: Estado donde el bot solicita el nombre del usuario
- **Comportamiento**:
  - Pregunta por el nombre usando `this.saludoInicial` o mensaje por defecto
  - Solo solicita el nombre (no el email)
  - El input se habilita para que el usuario escriba su nombre
- **Cuándo se activa**: Al hacer clic en "Iniciar Conversación"
- **Condición**: Solo si `options.user.name == null`
- **Propiedades del mensaje**: `isWelcome: true`

### 3. `CHAT_READY` - Chat Listo para Conversación
- **Descripción**: Estado final donde el chat está completamente funcional
- **Comportamiento**:
  - Saluda al usuario con su nombre: `¡Hola ${this.user.name}! 👋 ¿En qué puedo ayudarte hoy?`
  - El input está habilitado para conversación normal
  - Se pueden enviar mensajes al API
- **Cuándo se activa**: Después de que el usuario proporcione su nombre
- **Propiedades del mensaje**: `isWelcome: true`

## 🚀 Implementación Técnica

### Constantes de Estado
```javascript
this.STATUS_CONVERSATION = {
  PRESENTATION: 'presentation',      // 1. Bot se presenta y muestra menú
  ASKING_NAME: 'asking_name',        // 2. Preguntando por el nombre
  CHAT_READY: 'chat_ready'          // 3. Chat listo para conversación
};
```

### Estado Actual
```javascript
this.statusConversation = this.STATUS_CONVERSATION.PRESENTATION;
```

### Transiciones de Estado
1. **PRESENTATION** → **ASKING_NAME**: Al hacer clic en "Iniciar Conversación"
2. **ASKING_NAME** → **CHAT_READY**: Al proporcionar el nombre del usuario
3. **Cualquier estado** → **PRESENTATION**: Al limpiar el historial

## 📋 Métodos Públicos

### `getConversationStatus()`
Retorna información completa sobre el estado actual de la conversación.

```javascript
const status = chatbot.getConversationStatus();
console.log(status);
// Resultado:
{
  currentStatus: 'presentation',
  availableStatuses: { PRESENTATION: 'presentation', ASKING_NAME: 'asking_name', CHAT_READY: 'chat_ready' },
  isPresentation: true,
  isAskingName: false,
  isChatReady: false,
  user: { name: null, email: null }
}
```

### `getRegistrationStatus()`
Retorna información sobre el estado del registro (mantiene compatibilidad).

## 🔧 Uso en el Código

### Verificar Estado Actual
```javascript
if (this.statusConversation === this.STATUS_CONVERSATION.PRESENTATION) {
  // Mostrar menú de opciones
} else if (this.statusConversation === this.STATUS_CONVERSATION.ASKING_NAME) {
  // Procesar entrada del nombre
} else if (this.statusConversation === this.STATUS_CONVERSATION.CHAT_READY) {
  // Enviar mensaje al API
}
```

### Cambiar Estado
```javascript
// Al iniciar conversación
this.statusConversation = this.STATUS_CONVERSATION.ASKING_NAME;

// Al completar nombre
this.statusConversation = this.STATUS_CONVERSATION.CHAT_READY;

// Al limpiar historial
this.statusConversation = this.STATUS_CONVERSATION.PRESENTATION;
```

## 📱 Flujo de Usuario

### Escenario 1: Usuario Nuevo
1. **PRESENTATION**: Bot se presenta y muestra menú
2. Usuario hace clic en "Iniciar Conversación"
3. **ASKING_NAME**: Bot pregunta por el nombre
4. Usuario escribe su nombre
5. **CHAT_READY**: Bot saluda y chat está listo

### Escenario 2: Usuario con Nombre
1. **PRESENTATION**: Bot se presenta y muestra menú
2. Usuario hace clic en "Iniciar Conversación"
3. **CHAT_READY**: Chat está listo (nombre ya existe)

### Escenario 3: Limpiar Historial
1. Cualquier estado → **PRESENTATION**: Reinicia al estado inicial

## 🧪 Testing

### Archivos de Prueba

#### 1. Test General de Estados
- **Ubicación**: `example/status-conversation-test.html`
- **Funcionalidades**:
  - Muestra el estado actual en tiempo real
  - Permite simular interacciones del usuario
  - Visualiza todos los estados disponibles
  - Log de actividad para debugging

#### 2. Test Modo Prueba con Estados
- **Ubicación**: `example/test-mode-status-flow.html`
- **Funcionalidades**:
  - Verifica que `testMode: true` funcione con estados de conversación
  - Prueba el flujo completo en modo de prueba
  - Simula interacciones automáticas
  - Confirma que los estados se respeten en modo de prueba

### Comandos de Prueba
```javascript
// Obtener estado actual
chatbot.getConversationStatus();

// Limpiar historial (reinicia a PRESENTATION)
chatbot.clearHistory();

// Simular interacción (cambia a ASKING_NAME)
chatbot._startNormalChat();
```

## 🔍 Debugging

### Logs de Estado
```javascript
// En modo desarrollo (devMode: true)
this._log('Estado de conversación:', this.statusConversation);
this._log('Transición de estado:', 'PRESENTATION → ASKING_NAME');
```

## 🧪 Modo de Prueba (testMode: true)

### Comportamiento con Estados de Conversación

Cuando `testMode: true` está habilitado, el sistema de estados de conversación funciona de la siguiente manera:

#### 1. **PRESENTATION** - Estado Inicial
- El bot se presenta y muestra el menú de opciones
- Funciona igual que en modo normal
- Los botones del menú están disponibles

#### 2. **ASKING_NAME** - Preguntando por el Nombre
- Al hacer clic en "Iniciar Conversación", cambia a este estado
- El bot pregunta por el nombre usando `this.saludoInicial`
- **En modo de prueba**: Las respuestas se procesan a través de `_handleTestResponse`
- **Comportamiento**: Se delega al método `_handleRegistrationResponse` para mantener consistencia

#### 3. **CHAT_READY** - Chat Listo
- Después de proporcionar el nombre, cambia a este estado
- **En modo de prueba**: Las respuestas se generan automáticamente usando mensajes de test
- **Comportamiento**: Se usan respuestas predefinidas en lugar de llamadas a la API

### Implementación Técnica

```javascript
// En _handleTestResponse
if (this.statusConversation === this.STATUS_CONVERSATION.ASKING_NAME) {
  // Procesar nombre directamente en modo test
  if (!userMessage.trim()) {
    this._addMessage("bot", "Por favor, escribe tu nombre.");
    return;
  }
  
  this.user.name = userMessage.trim();
  this.statusConversation = this.STATUS_CONVERSATION.CHAT_READY;
  this.registered = true;
  this.registrationCompleted = true;
  
  // Mostrar mensaje de bienvenida personalizado
  const welcomeMessage = {
    from: "bot",
    text: `¡Hola ${this.user.name}! 👋 ¿En qué puedo ayudarte hoy?`,
    time: this._getCurrentTime(),
    isWelcome: true,
    statusConversation: this.statusConversation
  };
  
  this.messages.push(welcomeMessage);
  this._renderMessages();
  return;
}

if (this.statusConversation === this.STATUS_CONVERSATION.CHAT_READY) {
  // Procesar como conversación normal con respuestas de test
  // ... lógica de respuestas automáticas
}
```

### Ventajas del Modo de Prueba con Estados

1. **Consistencia**: El flujo de estados es idéntico al modo normal
2. **Testing**: Permite probar la lógica de estados sin dependencias externas
3. **Debugging**: Facilita la identificación de problemas en el flujo
4. **Desarrollo**: Permite trabajar offline con respuestas predefinidas

### Solución a Problemas Comunes

#### Problema: "Error al obtener respuesta. Intenta nuevamente."

**Causa**: El método `_handleTestResponse` estaba delegando al método `_handleRegistrationResponse`, lo que causaba conflictos en el flujo.

**Solución**: El método `_handleTestResponse` ahora maneja directamente el estado `ASKING_NAME` sin delegar:

```javascript
// Antes (problemático)
if (this.statusConversation === this.STATUS_CONVERSATION.ASKING_NAME) {
  await this._handleRegistrationResponse(userMessage); // ❌ Delegación problemática
  return;
}

// Ahora (funcional)
if (this.statusConversation === this.STATUS_CONVERSATION.ASKING_NAME) {
  // ✅ Manejo directo del nombre en modo test
  this.user.name = userMessage.trim();
  this.statusConversation = this.STATUS_CONVERSATION.CHAT_READY;
  // ... resto de la lógica
  return;
}
```

#### Archivos de Prueba para Debugging

1. **`example/debug-test-mode.html`**: Debug completo con interceptación de console
2. **`example/simple-test-flow.html`**: Flujo paso a paso simplificado
3. **`example/test-mode-status-flow.html`**: Test completo del flujo

### Verificación de Estado
```javascript
// Verificar que el estado sea válido
if (Object.values(this.STATUS_CONVERSATION).includes(this.statusConversation)) {
  this._log('Estado válido:', this.statusConversation);
} else {
  this._logError('Estado inválido:', this.statusConversation);
}
```

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad
- El sistema mantiene compatibilidad con el código existente
- Los métodos `getRegistrationStatus()` siguen funcionando
- No se rompen las funcionalidades existentes

### 2. Validaciones
- Solo se solicita el nombre si `options.user.name == null`
- El email no es requerido en este flujo
- Los estados se validan antes de las transiciones

### 3. Persistencia
- Los estados se reinician al limpiar el historial
- No se persisten en el cache de sesión
- Se mantienen durante la sesión activa

## 🚀 Próximas Mejoras

### 1. Estados Adicionales
- `SHOWING_FAQ`: Mostrando preguntas frecuentes
- `SHOWING_PRODUCTS`: Mostrando productos
- `ERROR_STATE`: Estado de error

### 2. Transiciones Avanzadas
- Validación de transiciones permitidas
- Hooks antes/después de cambio de estado
- Logging automático de transiciones

### 3. Integración con API
- Sincronización de estado con el servidor
- Estados remotos para funcionalidades avanzadas
- Persistencia de estado en la base de datos

## 📚 Referencias

- [Flujo del Menú](MENU_FLOW.md) - Documentación del flujo de menú
- [Onboarding Avanzado](ADVANCED_ONBOARDING.md) - Sistema de onboarding
- [README Principal](../README.es.md) - Documentación general del SDK
