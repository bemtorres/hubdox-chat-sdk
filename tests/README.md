# Tests del SDK Hubdox Chat

Este directorio contiene todos los tests para el SDK de Hubdox Chat, organizados en diferentes tipos de pruebas para garantizar la calidad y funcionalidad del código.

## Estructura de Tests

### 1. `ChatBot.test.js` - Tests Unitarios
Tests unitarios que cubren las funcionalidades principales de la clase `ChatBot`:

- **Inicialización**: Validación de configuración y valores por defecto
- **Registro de Usuario**: Proceso de registro y manejo de respuestas de API
- **Cache y Persistencia**: Guardado, carga y limpieza de datos en localStorage
- **Envío de Mensajes**: Comunicación con la API y manejo de respuestas
- **Modo Test**: Funcionalidad sin llamadas a API real
- **Interfaz de Usuario**: Mostrar/ocultar elementos del chat
- **Manejo de Eventos**: Interacciones del usuario con la interfaz
- **Utilidades**: Métodos auxiliares y validaciones

### 2. `ActionsMenu.test.js` - Tests del Menú de Acciones
Tests específicos para las funcionalidades del menú de acciones:

- **Renderizado del Menú**: Verificación de estructura HTML y elementos
- **Funcionalidad de Limpiar Historial**: Modal de confirmación y limpieza
- **Funcionalidad de Pantalla Completa**: Cambio de estado y clases CSS
- **Funcionalidad de Información del Chat**: Modal con información del bot
- **CSS del Dropdown**: Verificación de estilos personalizados
- **Event Listeners**: Configuración de eventos
- **Integración con Bootstrap**: Uso correcto de clases y atributos
- **Accesibilidad**: Atributos ARIA y navegación por teclado

### 3. `Integration.test.js` - Tests de Integración
Tests que verifican el flujo completo del SDK:

- **Flujo de Registro y Primera Conversación**: Proceso completo desde registro hasta primera interacción
- **Flujo de Cache y Persistencia**: Carga de sesiones guardadas y continuidad
- **Flujo de Interfaz de Usuario**: Interacciones completas del usuario
- **Flujo de Modo Test**: Funcionamiento completo en modo de pruebas
- **Flujo de Manejo de Errores**: Gestión de errores de API y cache
- **Flujo de Configuración Personalizada**: Aplicación de configuraciones personalizadas
- **Flujo de Rendimiento**: Manejo eficiente de múltiples mensajes

## Configuración

### Dependencias
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

### Configuración de Jest
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

## Comandos de Ejecución

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests con debug
```bash
npm run test:debug
```

### Ejecutar tests específicos
```bash
# Solo tests unitarios
npm test -- ChatBot.test.js

# Solo tests del menú de acciones
npm test -- ActionsMenu.test.js

# Solo tests de integración
npm test -- Integration.test.js

# Tests que contengan una palabra específica
npm test -- --testNamePattern="registro"
```

## Mocks y Configuración

### `setup.js`
Archivo de configuración global que incluye:

- **localStorage Mock**: Simulación del almacenamiento local del navegador
- **fetch Mock**: Simulación de llamadas HTTP
- **Bootstrap Mock**: Simulación de componentes de Bootstrap
- **Console Mock**: Supresión de logs durante los tests
- **Limpieza Automática**: Limpieza de mocks y DOM después de cada test

### Mocks Utilizados

#### localStorage
```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

#### fetch
```javascript
global.fetch = jest.fn();
```

#### Bootstrap
```javascript
global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};
```

## Cobertura de Tests

Los tests cubren las siguientes áreas:

### Funcionalidades Principales
- ✅ Inicialización y configuración
- ✅ Registro de usuarios
- ✅ Envío y recepción de mensajes
- ✅ Cache y persistencia
- ✅ Modo test
- ✅ Interfaz de usuario

### Casos de Uso
- ✅ Flujo completo de registro
- ✅ Carga desde cache
- ✅ Manejo de errores
- ✅ Configuración personalizada
- ✅ Interacciones de usuario

### Edge Cases
- ✅ Cache corrupto
- ✅ Errores de red
- ✅ Configuración inválida
- ✅ Múltiples mensajes simultáneos

## Mejores Prácticas

### 1. Organización de Tests
- Usar `describe` para agrupar tests relacionados
- Usar nombres descriptivos para los tests
- Mantener tests independientes entre sí

### 2. Setup y Teardown
- Usar `beforeEach` para configuración común
- Limpiar mocks y DOM después de cada test
- Resetear estado global cuando sea necesario

### 3. Mocks
- Mockear dependencias externas (API, localStorage)
- Usar mocks específicos para cada test
- Verificar que los mocks se llaman correctamente

### 4. Assertions
- Usar assertions específicos y descriptivos
- Verificar tanto el estado como los efectos secundarios
- Incluir tests para casos de error

## Debugging de Tests

### Ver logs durante los tests
```javascript
// En el test
console.log('Debug info:', someVariable);

// Ejecutar con --verbose
npm test -- --verbose
```

### Debug interactivo
```javascript
// Pausar ejecución para inspección
debugger;
```

### Ver cobertura detallada
```bash
npm run test:coverage
# Abrir coverage/lcov-report/index.html en el navegador
```

## Contribución

Al agregar nuevas funcionalidades al SDK:

1. **Escribir tests primero** (TDD)
2. **Cubrir casos de éxito y error**
3. **Incluir tests de integración**
4. **Verificar cobertura de código**
5. **Documentar nuevos tests**

### Ejemplo de Nuevo Test
```javascript
describe('Nueva Funcionalidad', () => {
  test('debe funcionar correctamente', () => {
    // Arrange
    const chatBot = new ChatBot(testOptions);
    
    // Act
    const result = chatBot.nuevaFuncionalidad();
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
``` 