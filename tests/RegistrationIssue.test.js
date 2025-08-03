const ChatBot = require('../src/index.js');

describe('Tests Específicos - Problema de Registro Repetitivo', () => {
  let chatBot;
  
  const registrationOptions = {
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
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
  });

  describe('Problema Original: Registro Repetitivo', () => {
    test('NO debe solicitar nombre repetidamente después del registro exitoso', async () => {
      // Mock de respuesta de registro exitoso
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

      chatBot = new ChatBot(registrationOptions);
      
      // Simular registro exitoso
      await chatBot._registerUser();
      
      // Verificar que el usuario está registrado
      expect(chatBot.registered).toBe(true);
      expect(chatBot.session).toBe('test-session-123');
      
      // Simular envío de mensaje después del registro
      const result = await chatBot._sendMessage('Hola bot');
      
      // Verificar que NO se solicita nombre nuevamente
      // El mensaje debe enviarse directamente a la API
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

    test('debe guardar estado de registro en cache y no solicitar nombre al recargar', () => {
      // Simular cache con usuario ya registrado
      const cachedData = {
        session: 'cached-session-456',
        messages: [],
        registered: true,
        user: { name: 'Test User', email: 'test@example.com' },
        bot: { name: 'Test Bot', img: 'test-image.png' },
        timestamp: Date.now()
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

      chatBot = new ChatBot(registrationOptions);
      
      // Verificar que se carga el estado registrado del cache
      expect(chatBot.registered).toBe(true);
      expect(chatBot.session).toBe('cached-session-456');
      expect(chatBot.user.name).toBe('Test User');
      
      // Verificar que NO se inicia el proceso de registro
      expect(chatBot._getCurrentRegistrationStep()).toBe('completed');
    });

    test('debe manejar correctamente el flujo: registro → cache → mensaje', async () => {
      // Mock de respuesta de registro
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            session: 'test-session-789',
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
            session: 'test-session-789'
          }
        })
      });

      chatBot = new ChatBot(registrationOptions);
      
      // Paso 1: Registrar usuario
      await chatBot._registerUser();
      expect(chatBot.registered).toBe(true);
      
      // Paso 2: Guardar en cache
      chatBot._saveToCache();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'hubdox_chat_cache',
        expect.stringContaining('test-session-789')
      );
      
      // Paso 3: Enviar mensaje (NO debe solicitar registro)
      await chatBot._sendMessage('Hola');
      
      // Verificar que se envió directamente a la API
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/message',
        expect.objectContaining({
          body: JSON.stringify({
            tenant: 'test-tenant',
            session: 'test-session-789',
            message: 'Hola',
            name: 'Test User'
          })
        })
      );
    });
  });

  describe('Configuraciones de Registro', () => {
    test('con register: true y cache: true - debe registrar y guardar', async () => {
      const options = {
        ...registrationOptions,
        options: { ...registrationOptions.options, register: true, cache: true }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { session: 'test-session', user: { name: 'Test User' } }
        })
      });

      chatBot = new ChatBot(options);
      
      await chatBot._registerUser();
      chatBot._saveToCache();
      
      expect(chatBot.registered).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('con register: false - debe usar nombre por defecto sin registro', () => {
      const options = {
        ...registrationOptions,
        options: { ...registrationOptions.options, register: false }
      };

      chatBot = new ChatBot(options);
      
      expect(chatBot.register).toBe(false);
      expect(chatBot.registered).toBe(false);
      expect(chatBot.user.name).toBe('Test User'); // Usa el nombre del objeto user
    });

    test('con register: false y sin user.name - debe usar "Usuario" por defecto', () => {
      const options = {
        ...registrationOptions,
        user: { email: 'test@example.com' }, // Sin name
        options: { ...registrationOptions.options, register: false }
      };

      chatBot = new ChatBot(options);
      
      expect(chatBot.user.name).toBe('Usuario');
    });

    test('con cache: false - debe limpiar cache al inicializar', () => {
      const options = {
        ...registrationOptions,
        options: { ...registrationOptions.options, cache: false }
      };

      // Simular cache existente
      localStorage.getItem.mockReturnValue(JSON.stringify({
        session: 'old-session',
        registered: true,
        timestamp: Date.now()
      }));

      chatBot = new ChatBot(options);
      
      // Verificar que se limpia el cache
      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
      expect(chatBot.session).toBe(null);
      expect(chatBot.registered).toBe(false);
    });
  });

  describe('Manejo de Errores en Registro', () => {
    test('debe manejar error de registro sin romper el flujo', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Registration failed'));

      chatBot = new ChatBot(registrationOptions);
      
      // Intentar registro
      await expect(chatBot._registerUser()).rejects.toThrow('Registration failed');
      
      // Verificar que el estado no se corrompe
      expect(chatBot.registered).toBe(false);
      expect(chatBot.session).toBe(null);
    });

    test('debe permitir reintentar registro después de error', async () => {
      // Primer intento falla
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      chatBot = new ChatBot(registrationOptions);
      
      await expect(chatBot._registerUser()).rejects.toThrow('Network error');
      
      // Segundo intento exitoso
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { session: 'retry-session', user: { name: 'Test User' } }
        })
      });

      await chatBot._registerUser();
      
      expect(chatBot.registered).toBe(true);
      expect(chatBot.session).toBe('retry-session');
    });
  });

  describe('Validación de Cache', () => {
    test('debe validar edad del cache y limpiar si es muy antiguo', () => {
      const oldCacheData = {
        session: 'old-session',
        registered: true,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 horas atrás
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(oldCacheData));

      chatBot = new ChatBot(registrationOptions);
      
      // Verificar que se limpia el cache antiguo
      expect(localStorage.removeItem).toHaveBeenCalledWith('hubdox_chat_cache');
      expect(chatBot.session).toBe(null);
      expect(chatBot.registered).toBe(false);
    });

    test('debe mantener cache válido (menos de 24 horas)', () => {
      const validCacheData = {
        session: 'valid-session',
        registered: true,
        timestamp: Date.now() - (12 * 60 * 60 * 1000) // 12 horas atrás
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(validCacheData));

      chatBot = new ChatBot(registrationOptions);
      
      // Verificar que se mantiene el cache válido
      expect(chatBot.session).toBe('valid-session');
      expect(chatBot.registered).toBe(true);
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Flujo de Mensajes Post-Registro', () => {
    test('debe enviar mensajes directamente después del registro exitoso', async () => {
      // Mock de registro exitoso
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { session: 'post-reg-session', user: { name: 'Test User' } }
        })
      });

      // Mock de respuesta de mensaje
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { response: 'Respuesta del bot', session: 'post-reg-session' }
        })
      });

      chatBot = new ChatBot(registrationOptions);
      
      // Registrar usuario
      await chatBot._registerUser();
      
      // Enviar mensaje inmediatamente después
      await chatBot._sendMessage('Primer mensaje después del registro');
      
      // Verificar que se envió a la API sin solicitar registro
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/sdk/v1/message',
        expect.objectContaining({
          body: JSON.stringify({
            tenant: 'test-tenant',
            session: 'post-reg-session',
            message: 'Primer mensaje después del registro',
            name: 'Test User'
          })
        })
      );
    });

    test('debe agregar mensaje de bienvenida después del registro', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { session: 'welcome-session', user: { name: 'Test User' } }
        })
      });

      chatBot = new ChatBot(registrationOptions);
      
      await chatBot._registerUser();
      
      // Verificar que se agrega mensaje de bienvenida
      expect(chatBot.messages).toHaveLength(1);
      expect(chatBot.messages[0].sender).toBe('bot');
      expect(chatBot.messages[0].text).toContain('Test User');
    });
  });

  describe('Compatibilidad con Modo Test', () => {
    test('debe funcionar registro en modo test sin llamadas a API', async () => {
      const testModeOptions = {
        ...registrationOptions,
        options: { ...registrationOptions.options, testMode: true }
      };

      chatBot = new ChatBot(testModeOptions);
      
      // En modo test, el registro debe funcionar sin llamadas a API
      await chatBot._registerUser();
      
      expect(chatBot.registered).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('debe enviar mensajes en modo test después del registro', async () => {
      const testModeOptions = {
        ...registrationOptions,
        options: { ...registrationOptions.options, testMode: true }
      };

      chatBot = new ChatBot(testModeOptions);
      chatBot.registered = true;
      chatBot.session = 'test-session';
      
      const result = await chatBot._sendMessageToAPI('Mensaje en modo test');
      
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
}); 