const ChatBot = require('../src/index.js');

describe('Test Básico - Configuración', () => {
  test('debe importar ChatBot correctamente', () => {
    expect(ChatBot).toBeDefined();
    expect(typeof ChatBot).toBe('function');
  });

  test('debe crear instancia con configuración válida', () => {
    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      tenant: 'test-tenant'
    };

    const chatBot = new ChatBot(options);
    
    expect(chatBot).toBeDefined();
    expect(chatBot.baseUrl).toBe('https://api.example.com');
    expect(chatBot.apiKey).toBe('test-key');
    expect(chatBot.tenant).toBe('test-tenant');
  });

  test('debe lanzar error sin baseUrl', () => {
    const options = {
      apiKey: 'test-key',
      tenant: 'test-tenant'
    };

    expect(() => new ChatBot(options)).toThrow('baseUrl y apiKey son requeridos');
  });

  test('debe lanzar error sin apiKey', () => {
    const options = {
      baseUrl: 'https://api.example.com',
      tenant: 'test-tenant'
    };

    expect(() => new ChatBot(options)).toThrow('baseUrl y apiKey son requeridos');
  });

  test('debe lanzar error sin opciones', () => {
    expect(() => new ChatBot()).toThrow('baseUrl y apiKey son requeridos');
  });
}); 