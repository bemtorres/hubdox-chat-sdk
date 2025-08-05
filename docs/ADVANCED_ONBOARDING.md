# Onboarding Avanzado - Documentación

## Descripción General

El nuevo sistema de onboarding avanzado permite dos flujos diferentes de registro de usuarios:

1. **Template: basic** - Mantiene el flujo actual
2. **Template: advanced** - Nuevo flujo con opciones de FAQ y conversación

## Configuración

### Opciones de Configuración

```javascript
const chatbot = new ChatBot({
    // ... otras opciones
    options: {
        // ... otras opciones
        onboardingTemplate: 'advanced' // 'basic' o 'advanced'
    }
});
```

### Propiedades Nuevas

- `onboardingTemplate`: Define el tipo de onboarding ('basic' | 'advanced')
- `advancedOnboarding`: Estado interno para controlar el flujo avanzado
- `onboardingStep`: Paso actual del onboarding ('name' | 'options' | 'faq' | 'chat')
- `faqList`: Lista de preguntas frecuentes
- `selectedFaq`: FAQ seleccionado actualmente

## Flujo Avanzado

### 1. Solicitud de Nombre
- Se oculta el chat completo
- Se muestra un mensaje solicitando el nombre del usuario
- El usuario ingresa su nombre

### 2. Opciones de Acción
Después de ingresar el nombre, se muestran dos opciones:

#### Opción 1: Preguntas Frecuentes (📚)
- Muestra una lista de FAQ con títulos
- Cada FAQ puede contener contenido en HTML o Markdown
- Incluye un botón de retroceso

#### Opción 2: Nueva Conversación (💬)
- Inicia directamente el chat normal
- Comienza la conversación con el bot

### 3. Navegación FAQ
- **Lista de FAQ**: Muestra todos los títulos disponibles
- **Contenido FAQ**: Muestra el contenido completo de un FAQ específico
- **Botón Retroceso**: Permite volver al paso anterior

## Traducciones

### Español
```javascript
onboarding_welcome: "¡Hola! ¿Cuál es tu nombre?",
onboarding_options_title: "¿Qué te gustaría hacer?",
onboarding_faq_option: "📚 Preguntas frecuentes",
onboarding_chat_option: "💬 Nueva conversación",
onboarding_back_button: "← Volver",
onboarding_faq_title: "Preguntas frecuentes",
onboarding_faq_empty: "No hay preguntas frecuentes disponibles.",
onboarding_chat_start: "¡Perfecto! Comencemos la conversación."
```

### English
```javascript
onboarding_welcome: "Hello! What's your name?",
onboarding_options_title: "What would you like to do?",
onboarding_faq_option: "📚 Frequently asked questions",
onboarding_chat_option: "💬 New conversation",
onboarding_back_button: "← Back",
onboarding_faq_title: "Frequently asked questions",
onboarding_faq_empty: "No frequently asked questions available.",
onboarding_chat_start: "Perfect! Let's start the conversation."
```

### Português
```javascript
onboarding_welcome: "Olá! Qual é o seu nome?",
onboarding_options_title: "O que você gostaria de fazer?",
onboarding_faq_option: "📚 Perguntas frequentes",
onboarding_chat_option: "💬 Nova conversa",
onboarding_back_button: "← Voltar",
onboarding_faq_title: "Perguntas frequentes",
onboarding_faq_empty: "Não há perguntas frequentes disponíveis.",
onboarding_chat_start: "Perfeito! Vamos começar a conversa."
```

## Datos de Prueba (FAQ)

El sistema incluye datos de prueba con 5 preguntas frecuentes:

1. **¿Cómo funciona el chat?** - Explicación del funcionamiento básico
2. **¿Cuáles son los límites de uso?** - Información sobre límites y restricciones
3. **¿Cómo puedo cambiar el idioma?** - Instrucciones para cambiar idioma
4. **¿Es seguro usar este chat?** - Información sobre seguridad y privacidad
5. **¿Cómo puedo obtener ayuda técnica?** - Canales de soporte técnico

## Funciones Nuevas

### `_showAdvancedOnboarding()`
Inicia el flujo de onboarding avanzado.

### `_showOnboardingOptions()`
Muestra las opciones después de ingresar el nombre.

### `_showFAQList()`
Muestra la lista de preguntas frecuentes.

### `_showFAQContent(faqId)`
Muestra el contenido de un FAQ específico.

### `_goBackOnboarding()`
Permite navegar hacia atrás en el flujo.

### `_handleAdvancedOnboardingResponse(userMessage)`
Maneja las respuestas del usuario en el onboarding avanzado.

### `_getTestFAQ()`
Retorna datos de prueba para las FAQ.

## Ejemplo de Uso

```javascript
// Inicializar con onboarding avanzado
const chatbot = new ChatBot({
    baseUrl: 'https://api.hubdox.com',
    apiKey: 'your-api-key',
    tenant: 'your-tenant',
    options: {
        register: true,
        onboardingTemplate: 'advanced' // Habilitar flujo avanzado
    },
    user: {
        email: 'user@example.com',
        name: 'Usuario',
        img: 'user-avatar.png'
    },
    bot: {
        name: 'Mi Bot',
        img: 'bot-avatar.png'
    },
    custom: {
        primaryColor: '#007bff',
        language: 'es'
    }
});
```

## Estados del Onboarding

### `onboardingStep: 'name'`
- Usuario debe ingresar su nombre
- Input habilitado para texto

### `onboardingStep: 'options'`
- Se muestran las dos opciones (FAQ/Conversación)
- Input deshabilitado, solo clicks

### `onboardingStep: 'faq'`
- Navegación en la sección de FAQ
- Input deshabilitado, solo clicks

### `onboardingStep: 'chat'`
- Chat normal activo
- Input habilitado para conversación

## Compatibilidad

- ✅ **Template: basic** - Mantiene compatibilidad total
- ✅ **Template: advanced** - Nuevo flujo sin afectar el básico
- ✅ **Multilingüe** - Soporte para ES, EN, PT
- ✅ **Responsive** - Funciona en móvil y desktop
- ✅ **Shadow DOM** - Compatible con Shadow DOM y Bootstrap

## Testing

Para probar el nuevo flujo, usar el archivo:
```
example/advanced-onboarding-test.html
```

Este archivo incluye:
- Botones para alternar entre templates
- Verificación de estados
- Pruebas de funcionalidad
- Auto-inicialización con onboarding avanzado 