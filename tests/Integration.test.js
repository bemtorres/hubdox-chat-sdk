const { ChatBot } = require('../src/index.js');

describe('Tests de Integración - Flujo Completo', () => {
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
      testMode: false,
      fullscreen: true
    }
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Mock de fetch para diferentes escenarios
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
  });

  describe('Flujo de Registro y Primera Conversación', () => {
    test('debe completar flujo completo de registro y primera conversación', async () => {
      // Mock de respuesta de registro
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            session: 'test-session-123',
            user: { name: 'Test User' }
          }
        })
      });

      // Mock de respuesta de mensaje
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            response: '¡Hola Test User! ¿En qué puedo ayudarte?',
            session: 'test-session-123'
          }
        })
      });

      chatBot = new ChatBot(testOptions);
      
      // Verificar que se inicia el proceso de registro
      expect(chatBot.register).toBe(true);
      expect(chatBot.registered).toBe(false);
      
      // Simular que el usuario completa el registro
      chatBot.user.name = 'Test User';
      chatBot.registered = true;
      chatBot.session = 'test-session-123';
      
      // Verificar que se guarda en cache
      chatBot._saveToCache();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'hubdox_chat_cache',
        expect.stringContaining('test-session-123')
      );
      
      // Simular envío de primer mensaje
      await chatBot._sendMessage('Hola bot');
      
      // Verificar que se envió a la API
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/message',
        expect.objectContaining({
          body: JSON.stringify({
            tenant: 'test-tenant',
            session: 'test-session-123',
            message: 'Hola bot',
            name: 'Test User'
          })
        })
      );
    });
  });

  describe('Flujo de Cache y Persistencia', () => {
    test('debe cargar sesión desde cache y continuar conversación', async () => {
      // Mock de datos de cache existentes
      const cachedData = {
        session: 'cached-session-456',
        messages: [
          { id: 1, text: 'Hola', sender: 'user', timestamp: Date.now() },
          { id: 2, text: '¡Hola! ¿En qué puedo ayudarte?', sender: 'bot', timestamp: Date.now() }
        ],
        registered: true,
        user: { name: 'Test User', email: 'test@example.com' },
        bot: { name: 'Test Bot', img: 'test-image.png' },
        timestamp: Date.now()
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

      // Mock de respuesta de mensaje
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            response: 'Perfecto, continuemos con la conversación',
            session: 'cached-session-456'
          }
        })
      });

      chatBot = new ChatBot(testOptions);
      
      // Verificar que se cargan los datos del cache
      expect(chatBot.session).toBe('cached-session-456');
      expect(chatBot.registered).toBe(true);
      expect(chatBot.messages).toHaveLength(2);
      expect(chatBot.user.name).toBe('Test User');
      
      // Simular envío de mensaje adicional
      await chatBot._sendMessage('Continuemos');
      
      // Verificar que se usa la sesión del cache
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/message',
        expect.objectContaining({
          body: JSON.stringify({
            tenant: 'test-tenant',
            session: 'cached-session-456',
            message: 'Continuemos',
            name: 'Test User'
          })
        })
      );
    });

    test('debe limpiar cache y reiniciar conversación', () => {
      // Configurar datos iniciales
      chatBot = new ChatBot(testOptions);
      chatBot.session = 'test-session';
      chatBot.messages = [{ id: 1, text: 'test' }];
      chatBot.registered = true;
      
      // Limpiar cache
      chatBot._clearCache();
      
      // Verificar que se reinicia todo
      expect(chatBot.session).toBe(null);
      expect(chatBot.messages).toEqual([]);
      expect(chatBot.registered).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
    });
  });

  describe('Flujo de Interfaz de Usuario', () => {
    test('debe mostrar y ocultar elementos de UI correctamente', () => {
      chatBot = new ChatBot(testOptions);
      
      // Verificar que se muestra el botón flotante inicialmente
      expect(document.querySelector('.floating-chat-btn')).toBeInTheDocument();
      expect(document.querySelector('.floating-chat-btn')).toHaveClass('show');
      
      // Mostrar panel de chat
      chatBot._showChatPanel();
      
      // Verificar que se muestra el panel y se oculta el botón
      expect(document.querySelector('.chat-panel')).toBeInTheDocument();
      expect(document.querySelector('.chat-panel')).toHaveClass('show');
      expect(document.querySelector('.floating-chat-btn')).not.toHaveClass('show');
      
      // Ocultar panel de chat
      chatBot._hideChatPanel();
      
      // Verificar que se oculta el panel y se muestra el botón
      expect(document.querySelector('.chat-panel')).not.toHaveClass('show');
      expect(document.querySelector('.floating-chat-btn')).toHaveClass('show');
    });

    test('debe manejar interacciones de usuario completas', async () => {
      // Mock de respuesta de mensaje
      global.fetch.mockResolvedValue({
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
      
      // Mostrar panel de chat
      chatBot._showChatPanel();
      
      // Simular envío de mensaje desde la UI
      const input = document.querySelector('#chat-input');
      const sendBtn = document.querySelector('#send-btn');
      
      input.value = 'Mensaje de prueba';
      sendBtn.click();
      
      // Verificar que se procesa el mensaje
      expect(global.fetch).toHaveBeenCalled();
      
      // Simular uso del menú de acciones
      const clearHistoryBtn = document.querySelector('#clear-history-btn');
      clearHistoryBtn.click();
      
      // Verificar que se muestra modal de confirmación
      expect(document.querySelector('.modal')).toBeInTheDocument();
    });
  });

  describe('Flujo de Modo Test', () => {
    test('debe funcionar completamente en modo test', async () => {
      const testModeOptions = {
        ...testOptions,
        options: { ...testOptions.options, testMode: true }
      };

      chatBot = new ChatBot(testModeOptions);
      chatBot.registered = true;
      chatBot.session = 'test-session';
      
      // Enviar mensaje en modo test
      const result = await chatBot._sendMessageToAPI('Mensaje de prueba');
      
      // Verificar respuesta de modo test
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

  describe('Flujo de Manejo de Errores', () => {
    test('debe manejar errores de API correctamente', async () => {
      // Mock de error de red
      global.fetch.mockRejectedValue(new Error('Network error'));

      chatBot = new ChatBot(testOptions);
      chatBot.registered = true;
      chatBot.session = 'test-session';
      
      // Intentar enviar mensaje
      await expect(chatBot._sendMessageToAPI('test')).rejects.toThrow('Network error');
    });

    test('debe manejar errores de registro correctamente', async () => {
      // Mock de error en registro
      global.fetch.mockRejectedValue(new Error('Registration failed'));

      chatBot = new ChatBot(testOptions);
      
      // Intentar registrar usuario
      await expect(chatBot._registerUser()).rejects.toThrow('Registration failed');
    });

    test('debe manejar cache corrupto', () => {
      // Mock de cache con datos corruptos
      localStorage.getItem.mockReturnValue('invalid-json');

      chatBot = new ChatBot(testOptions);
      
      // Verificar que se maneja el error de JSON
      expect(chatBot.session).toBe(null);
      expect(chatBot.registered).toBe(false);
    });
  });

  describe('Flujo de Configuración Personalizada', () => {
    test('debe aplicar configuración personalizada correctamente', () => {
      const customOptions = {
        ...testOptions,
        custom: {
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00'
          },
          position: 'top-left',
          size: 'large'
        }
      };

      chatBot = new ChatBot(customOptions);
      
      // Verificar que se aplican las configuraciones personalizadas
      expect(chatBot.custom.colors.primary).toBe('#ff0000');
      expect(chatBot.custom.position).toBe('top-left');
      expect(chatBot.custom.size).toBe('large');
    });

    test('debe usar valores por defecto cuando no se especifican configuraciones personalizadas', () => {
      chatBot = new ChatBot(testOptions);
      
      // Verificar valores por defecto
      expect(chatBot.custom.colors.primary).toBe('#007bff');
      expect(chatBot.custom.position).toBe('bottom-right');
      expect(chatBot.custom.size).toBe('medium');
    });
  });

  describe('Flujo de Rendimiento', () => {
    test('debe manejar múltiples mensajes eficientemente', async () => {
      // Mock de múltiples respuestas
      global.fetch.mockResolvedValue({
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
      
      // Enviar múltiples mensajes
      const messages = ['Hola', '¿Cómo estás?', 'Gracias'];
      
      for (const message of messages) {
        await chatBot._sendMessage(message);
      }
      
      // Verificar que se enviaron todos los mensajes
      expect(global.fetch).toHaveBeenCalledTimes(messages.length);
      expect(chatBot.messages).toHaveLength(messages.length * 2); // Mensajes de usuario + respuestas del bot
    });

    test('debe limpiar recursos correctamente', () => {
      chatBot = new ChatBot(testOptions);
      chatBot._showChatPanel();
      
      // Simular limpieza de recursos
      chatBot._clearCache();
      chatBot._hideChatPanel();
      
      // Verificar que se limpian los datos
      expect(chatBot.session).toBe(null);
      expect(chatBot.messages).toEqual([]);
      expect(document.querySelector('.chat-panel')).not.toHaveClass('show');
    });
  });
}); 