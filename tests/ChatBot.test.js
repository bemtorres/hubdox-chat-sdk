const { ChatBot } = require('../src/index.js');

describe('ChatBot', () => {
  let chatBot;
  
  const defaultOptions = {
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

  describe('Inicialización', () => {
    test('debe inicializar correctamente con opciones por defecto', () => {
      chatBot = new ChatBot(defaultOptions);
      
      expect(chatBot.baseUrl).toBe('https://api.example.com');
      expect(chatBot.apiKey).toBe('test-api-key');
      expect(chatBot.tenant).toBe('test-tenant');
      expect(chatBot.user.name).toBe('Test User');
      expect(chatBot.botName).toBe('Test Bot');
      expect(chatBot.register).toBe(true);
      expect(chatBot.cache).toBe(true);
      expect(chatBot.testMode).toBe(false);
    });

    test('debe usar valores por defecto cuando no se proporcionan opciones', () => {
      chatBot = new ChatBot({
        baseUrl: 'https://api.example.com',
        apiKey: 'test-key'
      });
      
      expect(chatBot.user.name).toBe('Usuario');
      expect(chatBot.botName).toBe('Bot');
      expect(chatBot.register).toBe(false);
      expect(chatBot.cache).toBe(false);
    });

    test('debe validar que baseUrl y apiKey sean requeridos', () => {
      expect(() => new ChatBot({})).toThrow('baseUrl y apiKey son requeridos');
      expect(() => new ChatBot({ baseUrl: 'test' })).toThrow('baseUrl y apiKey son requeridos');
      expect(() => new ChatBot({ apiKey: 'test' })).toThrow('baseUrl y apiKey son requeridos');
    });
  });

  describe('Registro de Usuario', () => {
    beforeEach(() => {
      chatBot = new ChatBot({
        ...defaultOptions,
        options: { ...defaultOptions.options, register: true }
      });
    });

    test('debe registrar usuario correctamente', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { 
            session: 'test-session',
            user: { name: 'Test User' }
          }
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      await chatBot._registerUser();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          }),
          body: JSON.stringify({
            tenant: 'test-tenant',
            user: { name: 'Test User', email: 'test@example.com' },
            bot: { name: 'Test Bot', img: 'test-image.png' }
          })
        })
      );
    });

    test('debe manejar errores de registro', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(chatBot._registerUser()).rejects.toThrow('Network error');
    });

    test('debe procesar respuesta de registro correctamente', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { 
            session: 'test-session',
            user: { name: 'Test User' }
          }
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      await chatBot._registerUser();

      expect(chatBot.registered).toBe(true);
      expect(chatBot.session).toBe('test-session');
    });
  });

  describe('Cache y Persistencia', () => {
    beforeEach(() => {
      chatBot = new ChatBot({
        ...defaultOptions,
        options: { ...defaultOptions.options, cache: true }
      });
    });

    test('debe guardar datos en cache correctamente', () => {
      chatBot.registered = true;
      chatBot.session = 'test-session';
      chatBot.messages = [{ id: 1, text: 'test' }];

      chatBot._saveToCache();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'hubdox_chat_cache',
        expect.stringContaining('test-session')
      );
    });

    test('debe cargar datos desde cache correctamente', () => {
      const mockCacheData = {
        session: 'test-session',
        messages: [{ id: 1, text: 'test' }],
        registered: true,
        user: { name: 'Test User' },
        bot: { name: 'Test Bot' },
        timestamp: Date.now()
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(mockCacheData));

      chatBot._loadFromCache();

      expect(chatBot.session).toBe('test-session');
      expect(chatBot.registered).toBe(true);
      expect(chatBot.messages).toEqual([{ id: 1, text: 'test' }]);
    });

    test('debe limpiar cache correctamente', () => {
      chatBot._clearCache();

      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
      expect(chatBot.session).toBe(null);
      expect(chatBot.registered).toBe(false);
      expect(chatBot.messages).toEqual([]);
    });

    test('debe validar edad del cache', () => {
      const oldCacheData = {
        session: 'test-session',
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 horas atrás
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(oldCacheData));

      chatBot._loadFromCache();

      expect(chatBot.session).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
    });
  });

  describe('Envío de Mensajes', () => {
    beforeEach(() => {
      chatBot = new ChatBot(defaultOptions);
      chatBot.registered = true;
      chatBot.session = 'test-session';
    });

    test('debe enviar mensaje a la API correctamente', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { 
            response: 'Respuesta del bot',
            session: 'test-session'
          }
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      await chatBot._sendMessageToAPI('Hola bot');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/message',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          }),
          body: JSON.stringify({
            tenant: 'test-tenant',
            session: 'test-session',
            message: 'Hola bot',
            name: 'Test User'
          })
        })
      );
    });

    test('debe manejar errores de envío de mensajes', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'));

      await expect(chatBot._sendMessageToAPI('test')).rejects.toThrow('API Error');
    });

    test('debe agregar mensaje del usuario al chat', () => {
      chatBot._addUserMessage('Hola bot');

      expect(chatBot.messages).toHaveLength(1);
      expect(chatBot.messages[0].text).toBe('Hola bot');
      expect(chatBot.messages[0].sender).toBe('user');
    });

    test('debe agregar mensaje del bot al chat', () => {
      chatBot._addBotMessage('Hola usuario');

      expect(chatBot.messages).toHaveLength(1);
      expect(chatBot.messages[0].text).toBe('Hola usuario');
      expect(chatBot.messages[0].sender).toBe('bot');
    });
  });

  describe('Modo Test', () => {
    test('debe funcionar en modo test sin llamadas a API', async () => {
      chatBot = new ChatBot({
        ...defaultOptions,
        options: { ...defaultOptions.options, testMode: true }
      });

      const result = await chatBot._sendMessageToAPI('test message');

      expect(result).toEqual({
        success: true,
        data: {
          response: 'Este es un mensaje de prueba. El modo test está activado.',
          session: 'test-session'
        }
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Interfaz de Usuario', () => {
    beforeEach(() => {
      chatBot = new ChatBot(defaultOptions);
    });

    test('debe mostrar el panel de chat', () => {
      chatBot._showChatPanel();

      const chatPanel = document.querySelector('.chat-panel');
      expect(chatPanel).toBeInTheDocument();
      expect(chatPanel).toHaveClass('show');
    });

    test('debe ocultar el panel de chat', () => {
      chatBot._showChatPanel();
      chatBot._hideChatPanel();

      const chatPanel = document.querySelector('.chat-panel');
      expect(chatPanel).not.toHaveClass('show');
    });

    test('debe mostrar el botón flotante', () => {
      chatBot._showFloatingButton();

      const floatingBtn = document.querySelector('.floating-chat-btn');
      expect(floatingBtn).toBeInTheDocument();
      expect(floatingBtn).toHaveClass('show');
    });

    test('debe ocultar el botón flotante', () => {
      chatBot._showFloatingButton();
      chatBot._hideFloatingButton();

      const floatingBtn = document.querySelector('.floating-chat-btn');
      expect(floatingBtn).not.toHaveClass('show');
    });
  });

  describe('Manejo de Eventos', () => {
    beforeEach(() => {
      chatBot = new ChatBot(defaultOptions);
      chatBot._showChatPanel();
    });

    test('debe manejar envío de mensaje desde input', async () => {
      const input = document.querySelector('#chat-input');
      const sendBtn = document.querySelector('#send-btn');

      // Mock de la función _sendMessage
      chatBot._sendMessage = jest.fn();

      input.value = 'Hola bot';
      sendBtn.click();

      expect(chatBot._sendMessage).toHaveBeenCalledWith('Hola bot');
    });

    test('debe manejar tecla Enter en input', async () => {
      const input = document.querySelector('#chat-input');
      
      chatBot._sendMessage = jest.fn();

      input.value = 'Hola bot';
      input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

      expect(chatBot._sendMessage).toHaveBeenCalledWith('Hola bot');
    });

    test('debe limpiar historial correctamente', () => {
      chatBot.messages = [{ id: 1, text: 'test' }];
      chatBot._clearHistory();

      expect(chatBot.messages).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
    });
  });

  describe('Utilidades', () => {
    beforeEach(() => {
      chatBot = new ChatBot(defaultOptions);
    });

    test('debe obtener estado del cache correctamente', () => {
      chatBot.registered = true;
      chatBot.session = 'test-session';

      const status = chatBot.getCacheStatus();

      expect(status).toEqual({
        hasCache: false,
        isRegistered: true,
        hasSession: true,
        messageCount: 0
      });
    });

    test('debe obtener estado de registro correctamente', () => {
      chatBot.registered = true;
      chatBot.user.name = 'Test User';

      const status = chatBot.getRegistrationStatus();

      expect(status).toEqual({
        isRegistered: true,
        userName: 'Test User',
        hasSession: false
      });
    });

    test('debe validar configuración correctamente', () => {
      const validConfig = chatBot._validateConfig(defaultOptions);
      expect(validConfig).toBe(true);

      const invalidConfig = chatBot._validateConfig({});
      expect(invalidConfig).toBe(false);
    });
  });
}); 