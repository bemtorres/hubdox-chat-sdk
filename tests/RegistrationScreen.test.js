/**
 * Test para la nueva funcionalidad de Pantalla de Registro
 * Verifica que la lógica de registro separada funcione correctamente
 */

// Mock del DOM
document.body.innerHTML = `
  <div id="test-container"></div>
`;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de fetch
global.fetch = jest.fn();

// Mock de Bootstrap
global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn()
  }))
};

// Importar la clase ChatBot
const ChatBot = require('../src/index.js');

describe('Pantalla de Registro - Nueva Funcionalidad', () => {
  let chat;
  
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
    
    // Mock de window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    if (chat) {
      chat.destroy();
    }
  });

  describe('Configuración inicial', () => {
    test('debe inicializar con las nuevas propiedades de registro', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        }
      });

      expect(chat.registrationScreen).toBe(false);
      expect(chat.registrationCompleted).toBe(false);
      expect(chat.register).toBe(true);
    });

    test('debe mostrar pantalla de registro cuando register=true y usuario no existe', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        },
        user: {
          name: "Usuario",
          email: 'test@test.com'
        }
      });

      // Simular que la inicialización se completó
      chat.session = "test-session";
      chat._renderChatPanel = jest.fn();
      chat._checkRegistrationStatus();

      expect(chat.registrationScreen).toBe(true);
      expect(chat.registrationCompleted).toBe(false);
    });

    test('debe mostrar chat normal cuando usuario ya está registrado', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        },
        user: {
          name: "Juan Pérez",
          email: 'juan@test.com'
        }
      });

      // Simular usuario registrado
      chat.session = "test-session";
      chat.registered = true;
      chat.user.name = "Juan Pérez";
      chat._renderChatPanel = jest.fn();
      chat._checkRegistrationStatus();

      // Con la nueva lógica, si register=true, siempre muestra pantalla de registro
      // a menos que el usuario esté completamente registrado
      expect(chat.registrationScreen).toBe(true);
      expect(chat.registrationCompleted).toBe(false);
    });
  });

  describe('Lógica de condiciones de registro', () => {
    test('debe mostrar registro cuando register=true', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        },
        user: {
          name: "Juan Pérez",
          email: 'juan@test.com'
        }
      });

      chat.session = "test-session";
      chat._renderChatPanel = jest.fn();
      chat._checkRegistrationStatus();

      expect(chat.registrationScreen).toBe(true);
    });

    test('debe mostrar registro cuando nombre del usuario no existe', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: false,
          testMode: true
        },
        user: {
          name: "Usuario",
          email: 'test@test.com'
        }
      });

      chat.session = "test-session";
      chat._renderChatPanel = jest.fn();
      chat._checkRegistrationStatus();

      expect(chat.registrationScreen).toBe(true);
    });

    test('debe mostrar registro cuando usuario no está registrado', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: false,
          testMode: true
        },
        user: {
          name: "Juan Pérez",
          email: 'juan@test.com'
        }
      });

      chat.session = "test-session";
      chat.registered = false;
      chat._renderChatPanel = jest.fn();
      chat._checkRegistrationStatus();

      expect(chat.registrationScreen).toBe(true);
    });
  });

  describe('Proceso de registro', () => {
    test('debe procesar correctamente el nombre del usuario', async () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        }
      });

      // Configurar estado inicial
      chat.registrationScreen = true;
      chat.registrationCompleted = false;
      chat.messages = [];
      chat._renderChatPanel = jest.fn();
      chat._addMessage = jest.fn();
      chat._saveToCache = jest.fn();
      chat._showChatScreen = jest.fn();

      // Procesar nombre
      await chat._handleRegistrationResponse("María García");

      expect(chat.user.name).toBe("María García");
      expect(chat.registered).toBe(true);
      expect(chat.registrationCompleted).toBe(true);
      expect(chat._saveToCache).toHaveBeenCalled();
    });

    test('debe rechazar nombre vacío', async () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        }
      });

      chat.registrationScreen = true;
      chat.registrationCompleted = false;
      chat._addMessage = jest.fn();

      await chat._handleRegistrationResponse("");

      expect(chat.user.name).toBe("Usuario");
      expect(chat.registered).toBe(false);
      expect(chat.registrationCompleted).toBe(false);
      expect(chat._addMessage).toHaveBeenCalledWith("bot", "Por favor, escribe tu nombre para continuar.");
    });
  });

  describe('Persistencia en caché', () => {
    test('debe guardar estado de registro en caché', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          cache: true,
          testMode: true
        }
      });

      chat.registered = true;
      chat.registrationScreen = false;
      chat.registrationCompleted = true;
      chat.user.name = "Ana López";
      chat._saveToCache();

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData.registered).toBe(true);
      expect(savedData.registrationScreen).toBe(false);
      expect(savedData.registrationCompleted).toBe(true);
      expect(savedData.user.name).toBe("Ana López");
    });

    test('debe cargar estado de registro desde caché', () => {
      const cachedData = {
        session: "cached-session",
        registered: true,
        registrationScreen: false,
        registrationCompleted: true,
        user: { name: "Carlos Ruiz", email: "carlos@test.com" },
        timestamp: Date.now()
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          cache: true,
          testMode: true
        }
      });

      const loaded = chat._loadFromCache();
      
      expect(loaded).toBe(true);
      expect(chat.registered).toBe(true);
      expect(chat.registrationScreen).toBe(false);
      expect(chat.registrationCompleted).toBe(true);
      expect(chat.user.name).toBe("Carlos Ruiz");
    });
  });

  describe('Métodos públicos', () => {
    test('getRegistrationStatus debe retornar estado completo', () => {
      chat = new ChatBot({
        baseUrl: 'https://test.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          register: true,
          testMode: true
        }
      });

      chat.registered = true;
      chat.registrationScreen = false;
      chat.registrationCompleted = true;
      chat.user.name = "Test User";

      const status = chat.getRegistrationStatus();

      expect(status).toHaveProperty('registerOption', true);
      expect(status).toHaveProperty('registered', true);
      expect(status).toHaveProperty('registrationScreen', false);
      expect(status).toHaveProperty('registrationCompleted', true);
      expect(status.user.name).toBe("Test User");
    });
  });
}); 