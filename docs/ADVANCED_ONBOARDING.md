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

### 1. Mensaje de Bienvenida
- Se muestra el mensaje de bienvenida SIN botones inicialmente
- El usuario debe escribir su nombre y presionar Enter

### 2. Confirmación con Botones
- Después de escribir el nombre, se muestra un mensaje de confirmación CON botones
- **Botón "📚 Preguntas Frecuentes"**: Abre un modal con buscador y lista de FAQ
- **Botón "💬 Iniciar Chat"**: Comienza directamente el chat normal
- El input se deshabilita después de mostrar los botones

### 2. Modal de Preguntas Frecuentes
Al hacer clic en "📚 Preguntas Frecuentes":
- Se abre un modal elegante con buscador en tiempo real
- Lista de preguntas expandibles (click para ver respuesta)
- Búsqueda que filtra tanto títulos como contenido
- Botón de cerrar y navegación con Escape
- Diseño responsive y moderno

### 3. Inicio de Chat Directo
Al hacer clic en "💬 Iniciar Chat":
- Inicia directamente el chat normal
- El usuario puede comenzar a escribir inmediatamente
- El nombre del usuario ya está guardado del paso anterior

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

## Modal de Preguntas Frecuentes

### Características del Modal
- **Buscador en tiempo real**: Filtra preguntas mientras escribes
- **Preguntas expandibles**: Click para mostrar/ocultar respuestas
- **Diseño responsive**: Se adapta a móviles y desktop
- **Navegación con teclado**: Escape para cerrar
- **Cierre múltiple**: Botón X, botón Cerrar, click fuera, Escape
- **Estilos modernos**: Animaciones suaves y efectos hover

### Funcionalidades del Buscador
- Búsqueda en títulos de preguntas
- Búsqueda en contenido de respuestas
- Filtrado instantáneo
- Mensaje cuando no hay resultados
- Restauración automática al limpiar búsqueda

## Fuentes de FAQs

### 1. FAQs de la API (Prioridad Alta)
El sistema prioriza las FAQs que vienen del endpoint `/api/sdk/v1/register` en el campo `faqs`:

```json
{
  "faqs": [
    {
      "title": "¿Cómo puedo hacer una consulta?",
      "content": "Puedes hacer una consulta a través de nuestro formulario de contacto o a través de nuestro chat en línea."
    },
    {
      "title": "¿Cuáles son los horarios de atención?",
      "content": "Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM."
    }
  ]
}
```

### 2. FAQs Hardcodeadas (Fallback)
Si la API no devuelve FAQs o está en modo test, se usan las FAQs hardcodeadas con 8 preguntas:

1. **¿Cómo funciona el chat?** - Explicación del funcionamiento básico
2. **¿Qué puedo preguntar?** - Tipos de preguntas y temas disponibles
3. **¿Es seguro usar este chat?** - Información sobre seguridad y privacidad
4. **¿Puedo usar el chat en cualquier momento?** - Disponibilidad 24/7
5. **¿Cómo puedo obtener la mejor experiencia?** - Consejos para uso óptimo
6. **¿El asistente puede recordar nuestras conversaciones?** - Información sobre memoria
7. **¿Puedo cambiar de tema durante la conversación?** - Flexibilidad de temas
8. **¿Qué hago si no entiendo una respuesta?** - Cómo solicitar aclaraciones

## Funciones Nuevas

### `_showAdvancedOnboarding()`
Inicia el flujo de onboarding avanzado con botones de bienvenida.

### `_showFAQModal()`
Muestra el modal de preguntas frecuentes con buscador y lista expandible.

### `_startNormalChat()`
Inicia el chat normal directamente sin registro previo.

### `_showFAQList()`
Muestra la lista de preguntas frecuentes (método legacy).

### `_showFAQContent(faqId)`
Muestra el contenido de un FAQ específico (método legacy).

### `_goBackOnboarding()`
Permite navegar hacia atrás en el flujo (método legacy).

### `_handleAdvancedOnboardingResponse(userMessage)`
Maneja las respuestas del usuario en el onboarding avanzado (para entrada de texto).

### `_getFAQs()`
Retorna las FAQs disponibles, priorizando las de la API sobre las hardcodeadas.

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

### Archivos de Prueba

#### 1. `example/test-advanced-onboarding.html`
Para probar el flujo completo del onboarding avanzado:
- Inicialización automática con onboarding avanzado
- Verificación del flujo: bienvenida → nombre → botones → modal/chat
- Pruebas del modal de FAQ con buscador
- Pruebas de inicio del chat normal
- Instrucciones paso a paso para testing
- FAQs de prueba incluidas

#### 2. `example/test-api-faqs.html`
Para probar la integración con la API:
- Registro con la API real
- Obtención de FAQs desde la API
- Modal de FAQ con datos de la API
- Fallback a FAQs hardcodeadas si la API no responde

### Pasos de Testing Básico
1. Abrir el chat (botón flotante)
2. Verificar que aparece el mensaje de bienvenida SIN botones
3. Escribir un nombre (ej: "Juan") y presionar Enter
4. Verificar que aparece el mensaje de confirmación CON botones
5. Probar el botón "📚 Preguntas Frecuentes" - debe abrir el modal
6. Probar la búsqueda en el modal - debe filtrar preguntas
7. Probar la expansión de preguntas - click para ver respuestas
8. Cerrar el modal y probar "💬 Iniciar Chat" - debe comenzar chat normal
9. Verificar que el chat funciona normalmente

### Pasos de Testing con API
1. Asegurar que la API esté funcionando
2. Abrir `example/test-api-faqs.html`
3. Verificar en la consola que se obtienen las FAQs de la API
4. Probar el modal de FAQ - debe mostrar las FAQs de la API
5. Verificar que el fallback funciona si la API no responde 