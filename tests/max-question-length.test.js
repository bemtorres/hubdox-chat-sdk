const ChatBot = require('../src/index.js');

/**
 * Test para la funcionalidad de límite de caracteres para preguntas
 */

describe('Límite de Caracteres para Preguntas', () => {
  let chatBot;

  describe('Configuración inicial', () => {
    test('debe establecer el límite por defecto correctamente', () => {
      const defaultChatBot = new ChatBot({
        baseUrl: 'https://test-api.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {}
      });

      expect(defaultChatBot.maxQuestionLength).toBe(500);
    });

    test('debe establecer el límite personalizado correctamente', () => {
      const customChatBot = new ChatBot({
        baseUrl: 'https://test-api.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          maxQuestionLength: 100
        }
      });

      expect(customChatBot.maxQuestionLength).toBe(100);
    });
  });

  describe('Funciones públicas', () => {
    beforeEach(() => {
      chatBot = new ChatBot({
        baseUrl: 'https://test-api.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          testMode: true,
          maxQuestionLength: 100
        }
      });
    });

    test('setMaxQuestionLength debe actualizar el límite correctamente', () => {
      const result = chatBot.setMaxQuestionLength(200);
      
      expect(result).toBe(true);
      expect(chatBot.maxQuestionLength).toBe(200);
    });

    test('setMaxQuestionLength debe rechazar valores inválidos', () => {
      const result1 = chatBot.setMaxQuestionLength(0);
      const result2 = chatBot.setMaxQuestionLength(-10);
      const result3 = chatBot.setMaxQuestionLength('invalid');
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(chatBot.maxQuestionLength).toBe(100); // No debe cambiar
    });

    test('getMaxQuestionLength debe retornar el límite actual', () => {
      const currentLimit = chatBot.getMaxQuestionLength();
      expect(currentLimit).toBe(100);
    });
  });

  describe('Validación en _sendMessage', () => {
    beforeEach(() => {
      chatBot = new ChatBot({
        baseUrl: 'https://test-api.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          testMode: true,
          maxQuestionLength: 100
        }
      });

      // Mock de métodos necesarios
      chatBot._addMessage = jest.fn();
      chatBot._showTypingIndicator = jest.fn();
      chatBot._hideTypingIndicator = jest.fn();
      chatBot._handleTestResponse = jest.fn();
      chatBot.loading = false;
      chatBot.register = false;
      chatBot.registered = false;
      chatBot.registrationScreen = false;
      chatBot.registrationCompleted = false;
      chatBot.advancedOnboarding = false;
    });

    test('debe prevenir el envío de mensajes que excedan el límite', async () => {
      // Mensaje que excede el límite
      const longMessage = 'A'.repeat(101);
      
      // Simular que el input tiene el mensaje largo
      chatBot.input = { value: longMessage };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // No debe llamar a _addMessage porque el mensaje excede el límite
      expect(chatBot._addMessage).not.toHaveBeenCalled();
    });

    test('debe permitir el envío de mensajes dentro del límite', async () => {
      // Mensaje dentro del límite
      const shortMessage = 'Hola mundo';
      
      // Simular que el input tiene el mensaje corto
      chatBot.input = { value: shortMessage };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // Debe llamar a _addMessage porque el mensaje está dentro del límite
      expect(chatBot._addMessage).toHaveBeenCalledWith('user', shortMessage);
    });

    test('debe prevenir el envío de mensajes vacíos', async () => {
      // Mensaje vacío
      chatBot.input = { value: '' };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // No debe llamar a _addMessage porque el mensaje está vacío
      expect(chatBot._addMessage).not.toHaveBeenCalled();
    });

    test('debe prevenir el envío cuando está cargando', async () => {
      // Mensaje válido
      chatBot.input = { value: 'Hola mundo' };
      chatBot.loading = true;
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // No debe llamar a _addMessage porque está cargando
      expect(chatBot._addMessage).not.toHaveBeenCalled();
    });

    test('debe prevenir el envío cuando está en pantalla de registro con botones', async () => {
      // Mensaje válido
      chatBot.input = { value: 'Hola mundo' };
      chatBot.registrationScreen = true;
      chatBot.messages = [{ showWelcomeButtons: true }];
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // No debe llamar a _addMessage porque está en pantalla de registro con botones
      expect(chatBot._addMessage).not.toHaveBeenCalled();
    });
  });

  describe('Casos edge', () => {
    beforeEach(() => {
      chatBot = new ChatBot({
        baseUrl: 'https://test-api.com',
        apiKey: 'test-key',
        tenant: 'test-tenant',
        options: {
          testMode: true,
          maxQuestionLength: 100
        }
      });
    });

    test('debe manejar mensaje con exactamente el límite de caracteres', async () => {
      // Mock de métodos necesarios
      chatBot._addMessage = jest.fn();
      chatBot._showTypingIndicator = jest.fn();
      chatBot._hideTypingIndicator = jest.fn();
      chatBot._handleTestResponse = jest.fn();
      chatBot.loading = false;
      chatBot.register = false;
      chatBot.registered = false;
      chatBot.registrationScreen = false;
      chatBot.registrationCompleted = false;
      chatBot.advancedOnboarding = false;

      // Mensaje con exactamente el límite
      const exactMessage = 'A'.repeat(100);
      chatBot.input = { value: exactMessage };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // Debe permitir el envío porque está exactamente en el límite
      expect(chatBot._addMessage).toHaveBeenCalledWith('user', exactMessage);
    });

    test('debe manejar caracteres especiales correctamente', async () => {
      // Mock de métodos necesarios
      chatBot._addMessage = jest.fn();
      chatBot._showTypingIndicator = jest.fn();
      chatBot._hideTypingIndicator = jest.fn();
      chatBot._handleTestResponse = jest.fn();
      chatBot.loading = false;
      chatBot.register = false;
      chatBot.registered = false;
      chatBot.registrationScreen = false;
      chatBot.registrationCompleted = false;
      chatBot.advancedOnboarding = false;

      // Mensaje con caracteres especiales
      const specialMessage = '¡Hola! ¿Cómo estás? 🌟';
      chatBot.input = { value: specialMessage };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // Debe permitir el envío porque está dentro del límite
      expect(chatBot._addMessage).toHaveBeenCalledWith('user', specialMessage);
    });

    test('debe manejar mensaje con espacios en blanco', async () => {
      // Mock de métodos necesarios
      chatBot._addMessage = jest.fn();
      chatBot._showTypingIndicator = jest.fn();
      chatBot._hideTypingIndicator = jest.fn();
      chatBot._handleTestResponse = jest.fn();
      chatBot.loading = false;
      chatBot.register = false;
      chatBot.registered = false;
      chatBot.registrationScreen = false;
      chatBot.registrationCompleted = false;
      chatBot.advancedOnboarding = false;

      // Mensaje con espacios en blanco
      const spacedMessage = '   Hola mundo   ';
      chatBot.input = { value: spacedMessage };
      
      // Intentar enviar el mensaje
      await chatBot._sendMessage();
      
      // Debe permitir el envío del mensaje sin espacios
      expect(chatBot._addMessage).toHaveBeenCalledWith('user', 'Hola mundo');
    });
  });
}); 