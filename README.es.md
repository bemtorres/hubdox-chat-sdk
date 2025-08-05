# HubDox Chat SDK - Español

## 🚀 Nuevas Funcionalidades - Onboarding Avanzado

### ✨ Cambios Implementados

Se han implementado las siguientes mejoras según las instrucciones actualizadas:

#### 1. **Registro sin Chat** 
- Card modal centrado para preguntar el nombre
- No muestra el chat de abajo durante el registro
- Diseño minimalista y fluido

#### 2. **Lógica de Registro Inteligente**
- **Register true + sin nombre**: Muestra card de registro
- **Register true + con nombre**: Muestra verificación de nombre
- **Register false + sin nombre**: Va al menú principal
- **Register false + con nombre**: Va al menú principal

#### 3. **Menú Principal con 3 Opciones Fijas**
1. 📚 **Preguntas frecuentes** - "¿Encuentra tu pregunta aquí?"
2. 💬 **Iniciar conversación** - Chat principal con IA
3. 📝 **Enviar mensaje interno** - Formulario de contacto

#### 4. **Sistema FAQ Mejorado**
- Listado con buscador inteligente
- Navegación con botón "volver"
- Soporte para HTML y Markdown
- FAQ por defecto si no hay datos del API

#### 5. **Formulario de Contacto**
- Campos: Nombre, correo y mensaje
- Envío a `/api/sdk/v1/notification`
- Validación de campos requeridos

## 📋 Características Principales

### 🔧 Configuración Fácil
```javascript
const chatbot = new ChatBot({
    baseUrl: 'https://api.hubdox.com',
    apiKey: 'tu-api-key',
    tenant: 'tu-tenant',
    options: {
        register: true,        // Habilitar registro
        show: true,           // Mostrar chat
        cache: true,          // Usar caché
        testMode: true,       // Modo de prueba
        devMode: true         // Modo desarrollo
    },
    user: {
        email: 'usuario@ejemplo.com',
        name: '',             // Vacío para mostrar registro
        photo: 'avatar.png'
    },
    bot: {
        name: 'Mi Bot',
        img: 'bot-avatar.png'
    },
    custom: {
        primaryColor: '#667eea',
        language: 'es',
        sound: false,
        showTime: true
    }
});
```

### 🎨 Personalización
- **Colores**: Personalización completa de la paleta
- **Idiomas**: Soporte para español, inglés y portugués
- **Tamaños**: Configuración de dimensiones del chat
- **Posición**: Ubicación personalizable del botón flotante

### 📱 Responsive Design
- Adaptable a móviles y tablets
- Interfaz optimizada para touch
- Navegación por teclado
- Accesibilidad mejorada

## 🧪 Testing

### Archivo de Prueba Actualizado
```bash
# Abrir el nuevo archivo de prueba
open example/test-new-onboarding.html
```

### Tests Disponibles
- ✅ **Registro con nombre**: Prueba el flujo completo
- ✅ **Registro sin nombre**: Prueba el card de registro
- ✅ **Sin registro**: Prueba acceso directo al menú
- ✅ **Test completo**: Todas las funcionalidades

### Verificación de Estado
```javascript
// Verificar estado del registro
console.log(chatbot.getRegistrationStatus());

// Verificar caché
console.log(chatbot.getCacheStatus());

// Verificar módulos disponibles
console.log(chatbot.modules);
```

## 🔄 API Endpoints

### Registro
```http
POST /api/sdk/v1/register
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "apiKey": "tu-api-key",
  "tenant": "tu-tenant"
}
```

**Respuesta esperada:**
```json
{
  "session": "session_id",
  "license": {
    "name": "License Name",
    "active": true
  },
  "modules": {
    "faqs": true,
    "chat": true,
    "form": true
  },
  "faqs": [
    {
      "title": "Pregunta frecuente",
      "content": "Respuesta en HTML/Markdown"
    }
  ]
}
```

### Formulario de Contacto
```http
POST /api/sdk/v1/notification
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "apiKey": "tu-api-key",
  "tenant": "tu-tenant",
  "name": "Nombre del usuario",
  "email": "email@ejemplo.com",
  "message": "Mensaje del usuario"
}
```

## 📖 Documentación

### Guías Detalladas
- [📋 Onboarding Avanzado](docs/ADVANCED_ONBOARDING.md) - Documentación completa
- [🔧 Configuración](docs/CONFIGURATION.md) - Opciones de configuración
- [🎨 Personalización](docs/CUSTOMIZATION.md) - Temas y estilos
- [🌐 Internacionalización](docs/I18N.md) - Soporte multiidioma

### Ejemplos
- [📝 Ejemplo Básico](example/simple.html)
- [🧪 Test Onboarding](example/test-new-onboarding.html)
- [🎯 Test Avanzado](example/test-onboarding.html)

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Card de registro no aparece**
   ```javascript
   // Verificar configuración
   console.log(chatbot.register); // debe ser true
   console.log(chatbot.user.name); // debe estar vacío
   ```

2. **Menú no muestra opciones**
   ```javascript
   // Verificar módulos
   console.log(chatbot.modules);
   // Debe mostrar: {faqs: true, chat: true, form: true}
   ```

3. **FAQ no se cargan**
   ```javascript
   // Verificar datos FAQ
   console.log(chatbot.faqs);
   // Debe ser un array con objetos {title, content}
   ```

### Debug Mode
```javascript
const chatbot = new ChatBot({
    // ... configuración
    options: {
        devMode: true  // Habilitar logs detallados
    }
});
```

## 🔄 Migración

### Cambios Breaking
- La lógica de registro ha cambiado significativamente
- El menú principal ahora tiene 3 opciones fijas
- El card de registro es obligatorio cuando `register: true`

### Compatibilidad
- ✅ Se mantiene compatibilidad con configuraciones existentes
- ✅ Los valores por defecto aseguran funcionamiento básico
- ✅ El modo test permite desarrollo sin API real

## 📞 Soporte

### Canales de Ayuda
1. **Documentación**: Revisar este README y docs/
2. **Ejemplos**: Probar archivos en example/
3. **Debug**: Usar modo devMode para logs detallados
4. **Consola**: Verificar errores en consola del navegador

### Contacto
- 📧 Email: soporte@hubdox.com
- 💬 Chat: Usar el chat de soporte
- 📖 Docs: [docs/](docs/) para documentación completa

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2024  
**Compatibilidad**: Navegadores modernos (ES6+)
