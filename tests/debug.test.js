const ChatBot = require('../src/index.js');

describe('Debug Test', () => {
  test('debug registro', async () => {
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
    
    console.log('ChatBot creado:', {
      register: chatBot.register,
      registered: chatBot.registered,
      license: chatBot.license
    });

    // Mock de fetch más simple
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          session: 'test-session',
          license: {
            active: true
          }
        }
      })
    });

    console.log('Mock configurado');

    try {
      console.log('Iniciando registro...');
      await chatBot._registerUser();
      console.log('Registro completado:', {
        registered: chatBot.registered,
        session: chatBot.session,
        license: chatBot.license
      });
    } catch (error) {
      console.error('Error en registro:', error);
    }

    expect(chatBot.registered).toBe(true);
  });
}); 