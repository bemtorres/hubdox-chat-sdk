# HubDox Chat SDK - Onboarding Avanzado

## 🚀 Nuevas Funcionalidades Implementadas

Este documento describe las nuevas funcionalidades del onboarding implementadas según las instrucciones actualizadas.

## 📋 Cambios Principales

### 1. Onboarding Mejorado dentro del Chat
- **Descripción**: El onboarding se muestra dentro del módulo del chat con diseño consistente
- **Implementación**: Nuevo método `_showRegistrationMessage()` que muestra el onboarding como mensaje del bot
- **Diseño**: Imagen del bot en el medio con nombre y bienvenida, input del chat siempre abajo

### 2. Lógica de Registro Mejorada
La lógica de registro ahora maneja 4 escenarios diferentes:

| Escenario | `register` | `user.name` | Comportamiento |
|-----------|------------|-------------|----------------|
| 1 | `true` | vacío | Mostrar card de registro |
| 2 | `true` | con valor | Mostrar verificación de nombre |
| 3 | `false` | vacío | Ir al menú principal |
| 4 | `false` | con valor | Ir al menú principal |

### 3. Menú Principal con 3 Opciones Fijas
El menú principal ahora muestra siempre las 3 opciones:

1. **📚 Preguntas frecuentes** - Con botón "+" para modal
2. **💬 Iniciar conversación** - Entrar al chat principal
3. **📝 Enviar mensaje interno** - Formulario de contacto

### 4. Sistema de FAQ Mejorado
- **Modal de FAQ**: Botón "+" en el menú que abre un modal con todas las FAQ
- **Diseño expandible**: Cada FAQ se puede expandir/contraer haciendo clic
- **Navegación**: Cerrar modal con X, clic fuera o tecla ESC
- **Contenido**: Soporte para HTML y Markdown en las respuestas

### 5. Formulario de Contacto
- **Campos**: Nombre, correo electrónico y mensaje
- **Envío**: POST a `/api/sdk/v1/notification`
- **Validación**: Campos requeridos con mensajes de error

## 🔧 Configuración del API

### Endpoint `/api/sdk/v1/register`
El endpoint debe devolver la siguiente estructura:

```json
{
  "session": "session_id",
  "license": {
    "name": "License Name",
    "logo": "logo_url",
    "active": true,
    "url": "license_url",
    "showFooter": true
  },
  "chatbot": {
    "name": "Bot Name",
    "photo": "bot_photo_url",
    "initial_message": "Mensaje inicial"
  },
  "modules": {
    "faqs": true,
    "chat": true,
    "form": true
  },
  "faqs": [
    {
      "title": "Pregunta frecuente 1",
      "content": "Respuesta en HTML o Markdown"
    },
    {
      "title": "Pregunta frecuente 2",
      "content": "Otra respuesta"
    }
  ]
}
```

### Endpoint `/api/sdk/v1/notification`
Para el formulario de contacto:

```json
{
  "apiKey": "api_key",
  "tenant": "tenant_id",
  "name": "Nombre del usuario",
  "email": "email@ejemplo.com",
  "message": "Mensaje del usuario"
}
```

## 🎨 Diseño y UX

### Principios de Diseño
- **Minimalista**: Interfaz limpia y sin elementos innecesarios
- **Fluido**: Transiciones suaves entre pantallas
- **Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Accesible**: Navegación por teclado y lectores de pantalla
- **Consistente**: Todos los mensajes usan el mismo estilo visual

### Elementos Visuales
- **Onboarding mejorado**: Imagen del bot en el medio con nombre y bienvenida
- **Input siempre abajo**: El input del chat permanece en la parte inferior
- **Modal de FAQ**: Diseño expandible con navegación intuitiva
- **Iconos**: Emojis para mejorar la experiencia visual
- **Colores**: Paleta personalizable a través de `custom.primaryColor`
- **Tipografía**: Fuentes legibles y jerarquía visual clara

## 📱 Flujo de Usuario

### Escenario 1: Registro con Nombre
1. Usuario abre el chat
2. Se muestra el onboarding con imagen del bot y solicitud de nombre
3. Usuario ingresa su nombre en el input del chat
4. Se confirma el registro y se muestra el menú principal
5. Usuario puede acceder a todas las funcionalidades

### Escenario 2: Verificación de Nombre
1. Usuario ya tiene nombre guardado
2. Se muestra pantalla de verificación con imagen del bot
3. Usuario confirma o cambia el nombre
4. Se muestra el menú principal

### Escenario 3: Sin Registro
1. Usuario abre el chat
2. Se muestra directamente el menú principal
3. Usuario puede acceder a todas las funcionalidades

## 🧪 Testing

### Archivo de Prueba
Se ha creado `example/test-onboarding-complete.html` con tests para:

- ✅ Onboarding mejorado con imagen del bot
- ✅ Registro con nombre
- ✅ Registro sin nombre  
- ✅ Sin registro
- ✅ Modal de FAQ
- ✅ Test completo de todas las funcionalidades

### Comandos de Prueba
```bash
# Abrir el archivo de prueba
open example/test-onboarding-complete.html

# Verificar en consola del navegador
console.log(chatbot.getRegistrationStatus());
console.log(chatbot.getCacheStatus());
```

## 🔄 Migración

### Cambios Breaking
- La lógica de registro ha cambiado significativamente
- El onboarding ahora se muestra dentro del chat en lugar de un modal separado
- El menú principal ahora tiene 3 opciones fijas con botón "+" para FAQ
- El modo registro (`isRegistrationMode`) es obligatorio cuando `register: true`

### Compatibilidad
- Se mantiene compatibilidad con configuraciones existentes
- Los valores por defecto aseguran funcionamiento básico
- El modo test permite desarrollo sin API real

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Onboarding no aparece**
   - Verificar que `register: true`
   - Verificar que `user.name` esté vacío
   - Verificar que `isRegistrationMode` se active correctamente
   - Revisar consola para errores de JavaScript

2. **Menú principal no muestra opciones**
   - Verificar respuesta del API `/api/sdk/v1/register`
   - Verificar que `modules` esté definido en la respuesta
   - Usar valores por defecto si no hay respuesta del API

3. **Modal de FAQ no funciona**
   - Verificar que `faqs` esté en la respuesta del API
   - Verificar que el botón "+" esté configurado correctamente
   - Verificar que el modal se cree en el DOM

4. **Input del chat no funciona**
   - Verificar que `isRegistrationMode` se maneje correctamente
   - Verificar que el placeholder cambie según el contexto
   - Verificar que los eventos de envío funcionen

### Debug
```javascript
// Habilitar modo debug
const chatbot = new ChatBot({
  // ... configuración
  options: {
    devMode: true
  }
});

// Ver logs en consola
console.log(chatbot.getRegistrationStatus());
console.log(chatbot.modules);
console.log(chatbot.faqs);
```

## 📈 Próximas Mejoras

- [ ] Soporte para múltiples idiomas en FAQ
- [ ] Animaciones más fluidas
- [ ] Integración con analytics
- [ ] Soporte para archivos adjuntos en formulario
- [ ] Modo offline con caché local
- [ ] Personalización avanzada del onboarding
- [ ] Búsqueda en tiempo real en modal de FAQ
- [ ] Historial de conversaciones

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación:

1. Revisar este documento
2. Probar con el archivo de ejemplo
3. Verificar logs en consola del navegador
4. Contactar al equipo de desarrollo

---

**Versión**: 2.0.0  
**Fecha**: Diciembre 2024  
**Autor**: HubDox Development Team 