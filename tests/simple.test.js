const ChatBot = require('../src/index.js');

describe('Test Simple', () => {
  test('debe crear ChatBot', () => {
    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-api-key',
      tenant: 'test-tenant'
    };

    const chatBot = new ChatBot(options);
    
    expect(chatBot).toBeDefined();
    expect(chatBot.baseUrl).toBe('https://api.example.com');
    expect(chatBot.apiKey).toBe('test-api-key');
  });

  test('debe tener configuración correcta', () => {
    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-api-key',
      tenant: 'test-tenant',
      options: {
        register: true,
        cache: true
      }
    };

    const chatBot = new ChatBot(options);
    
    expect(chatBot.register).toBe(true);
    expect(chatBot.cache).toBe(true);
    expect(chatBot.registered).toBe(false); // Inicialmente false
  });
}); 