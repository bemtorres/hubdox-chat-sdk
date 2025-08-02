const ChatBot = require('../src/index.js');

describe('Test Simplificado - Problema de Registro', () => {
  let chatBot;
  
  const testOptions = {
    baseUrl: 'https://api.example.com',
    apiKey: 'test-api-key',
    tenant: 'test-tenant',
    user: {
      name: 'Test User',
      email: 'test@example.com'
    },
    bot: {
      name: 'Test Bot',
      img: 'test-image.png'
    },
    options: {
      show: true,
      register: true,
      cache: true,
      testMode: false
    }
  };

  beforeEach(() => {
    // Limpiar DOM
    document.body.innerHTML = '';
    
    // Resetear mocks
    jest.clearAllMocks();
    
    // Mock de fetch exitoso
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
  });

  test('debe inicializar correctamente con opciones de registro', () => {
    chatBot = new ChatBot(testOptions);
    
    expect(chatBot.register).toBe(true);
    expect(chatBot.cache).toBe(true);
    expect(chatBot.testMode).toBe(false);
    expect(chatBot.user.name).toBe('Test User');
    expect(chatBot.bot.name).toBe('Test Bot');
  });

  test('debe registrar usuario correctamente', async () => {
    // Mock de respuesta de registro exitoso
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          session: 'test-session-123',
          user: { name: 'Test User' },
          license: {
            active: true,
            name: 'Test License',
            logo: 'test-logo.png',
            url: 'https://example.com',
            showFooter: false
          }
        }
      })
    });

    chatBot = new ChatBot(testOptions);
    
    // Debug: verificar estado inicial
    console.log('Estado inicial:', {
      register: chatBot.register,
      registered: chatBot.registered,
      license: chatBot.license
    });
    
    // Simular registro exitoso
    await chatBot._registerUser();
    
    // Debug: verificar estado después del registro
    console.log('Estado después del registro:', {
      register: chatBot.register,
      registered: chatBot.registered,
      session: chatBot.session,
      license: chatBot.license
    });
    
    expect(chatBot.registered).toBe(true);
    expect(chatBot.session).toBe('test-session-123');
  });

  test('debe guardar en cache después del registro', async () => {
    // Mock de respuesta de registro
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          session: 'test-session-456',
          user: { name: 'Test User' },
          license: {
            active: true,
            name: 'Test License',
            logo: 'test-logo.png',
            url: 'https://example.com',
            showFooter: false
          }
        }
      })
    });

    chatBot = new ChatBot(testOptions);
    
    // Registrar usuario
    await chatBot._registerUser();
    
    // Guardar en cache
    chatBot._saveToCache();
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'chatbot_test-tenant_test-api-key',
      expect.stringContaining('test-session-456')
    );
  });

  test('debe cargar desde cache correctamente', () => {
    // Mock de datos de cache
    const cachedData = {
      session: 'cached-session-789',
      messages: [],
      registered: true,
      user: { name: 'Test User', email: 'test@example.com' },
      bot: { name: 'Test Bot', img: 'test-image.png' },
      timestamp: Date.now()
    };

    localStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

    chatBot = new ChatBot(testOptions);
    
    // Cargar desde cache
    chatBot._loadFromCache();
    
    expect(chatBot.session).toBe('cached-session-789');
    expect(chatBot.registered).toBe(true);
    expect(chatBot.user.name).toBe('Test User');
  });

  test('debe enviar mensaje sin solicitar registro si ya está registrado', async () => {
    // Mock de respuesta de mensaje
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          response: 'Respuesta del bot',
          session: 'test-session'
        }
      })
    });

    chatBot = new ChatBot(testOptions);
    chatBot.registered = true;
    chatBot.session = 'test-session';
    
    // Enviar mensaje
    await chatBot._sendMessageToAPI('Hola bot');
    
    // Verificar que se envió directamente a la API sin solicitar registro
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/sdk/v1/message',
      expect.objectContaining({
        body: JSON.stringify({
          apiKey: 'test-api-key',
          tenant: 'test-tenant',
          session: 'test-session',
          message: 'Hola bot',
          name: 'Test User'
        })
      })
    );
  });

  test('debe funcionar en modo test', async () => {
    const testModeOptions = {
      ...testOptions,
      options: { ...testOptions.options, testMode: true }
    };

    chatBot = new ChatBot(testModeOptions);
    chatBot.registered = true;
    chatBot.session = 'test-session';
    
    // Enviar mensaje en modo test
    const result = await chatBot._sendMessageToAPI('Mensaje de prueba');
    
    expect(result).toEqual({
      success: true,
      data: {
        response: 'Este es un mensaje de prueba. El modo test está activado.',
        session: 'test-session'
      }
    });
    
    // Verificar que no se hace llamada a API real
    expect(global.fetch).not.toHaveBeenCalled();
  });
}); 