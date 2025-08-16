class ChatBot {
  constructor(options) {
    // Validar parámetros requeridos
    if (!options || !options.baseUrl || !options.apiKey) {
      throw new Error('baseUrl y apiKey son requeridos');
    }
    
    // Configuración requerida
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.tenant = options.tenant;
    
    // Configuración de opciones
    const optionsConfig = options.options || {};
    this.register = optionsConfig.register || false;
    this.show = optionsConfig.show !== undefined ? optionsConfig.show : true;
    this.cache = optionsConfig.cache || true; // Opción para habilitar cache de sesión
    this.cacheExpiration = optionsConfig.cacheExpiration || 30 * 60 * 1000; // 30 minutos por defecto

    this.testMode = optionsConfig.testMode || false;
    this.devMode = optionsConfig.devMode || false;
    this.stream = optionsConfig.stream || false;
    this.maxQuestionLength = optionsConfig.maxQuestionLength || 50; // Límite de caracteres para preguntas
    

    
    // Configuración del onboarding template
    this.onboardingTemplate = optionsConfig.onboardingTemplate || 'basic';
    
    // Propiedades para el onboarding avanzado
    this.advancedOnboarding = false;
    this.onboardingStep = 0;
    this.faqList = [];
    this.selectedFaq = null;
    
    // Propiedades para FAQs de la API
    this.apiFaqs = [];
    this.moduleConfig = null;
    
    // Propiedades para productos de la API
    this.products = [];
    
    this.user = options.user || {
      email: 'test@mail.com',
      name: "Usuario",
      photo: "https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206933/user_icon_wbwkja.png",
    };
    this.bot = options.bot || {
      name: options.botName || "Bot",
      img: "https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206932/bot_icon_zgo153.png",
    };
    
    // Personalización desde objeto custom
    const custom = options.custom || {};
    this.primaryColor = custom.primaryColor || "#0d6efd";
    this.botName = custom.botName || options.botName || "Bot";
    this.headerBgColor = custom.headerBgColor || this.primaryColor;
    this.headerTextColor = custom.headerTextColor || "#ffffff";
    this.sendButtonText = custom.sendButtonText || null;
    this.iconButton = custom.iconButton || this.bot.img;
    this.showTime = custom.showTime || true;
    
    // Configuración de tamaño del chat
    this.chatWidth = custom.chatWidth || "700px";
    this.chatHeight = custom.chatHeight || "70vh";
    this.chatMaxWidth = custom.chatMaxWidth || "90vw";
    this.chatMaxHeight = custom.chatMaxHeight || "70vh";
    this.messagesHeight = custom.messagesHeight || "350px";
    this.buttonSize = custom.buttonSize || "56px";
    this.fullscreenEnabled = custom.fullscreenEnabled !== undefined ? custom.fullscreenEnabled : true;
    this.sound = custom.sound !== undefined ? custom.sound : false;
    this.soundPlayed = false; // Para controlar que solo se reproduzca una vez
    this.reminderTimeout = custom.reminderTimeout || 60000; // 60 segundos por defecto
    this.reminderTimer = null;
    this.lastUserMessageTime = null;
    this.language = custom.language || 'es'; // Idioma por defecto: español

    // Posición del botón flotante
    this.buttonPosition = custom.position || {
      bottom: "24px",
      right: "24px"
    };
    
    // Estado interno
    this.session = null;
    this.messages = [];
    this.loading = false;
    this.chatVisible = this.show;
    this.registered = false;
    this.isMobile = window.innerWidth <= 768;
    this.isFullscreen = false;
    
    // Nuevas propiedades para manejar la pantalla de registro
    this.registrationScreen = false;
    this.registrationCompleted = false;
    
    this.license = {
      name: "",
      logo: "",
      active: true,
      showFooter: false,
    };
    
    // Mensaje inicial del bot (se actualiza desde la API)
    this.saludoInicial = null;
    
    // Banco de mensajes para modo test
    this.testMessages = {
      welcome: [
        "¡Hola! 👋 Soy tu asistente virtual. ¿Cómo te llamas?",
        "¡Bienvenido! 😊 Me encantaría conocer tu nombre.",
        "¡Hola! Soy tu bot de ayuda. ¿Cuál es tu nombre?",
        "¡Saludos! 🌟 Para personalizar tu experiencia, ¿podrías decirme tu nombre?"
      ],
      greetings: [
        `¡Hola ${this.user.name}! 👋 ¿En qué puedo ayudarte hoy?`,
        `¡Qué gusto verte, ${this.user.name}! 👋 ¿Cómo estás?`,
        `¡Bienvenido de nuevo, ${this.user.name}! 🌟 ¿En qué puedo asistirte?`,
        `¡Hola ${this.user.name}! 💫 ¿Qué te gustaría hacer hoy?`
      ],
      curiosities: [
        "¿Sabías que el primer emoji fue creado en 1999? 😊",
        "El término 'robot' fue acuñado por el escritor checo Karel Čapek en 1920 🤖",
        "La primera computadora pesaba 27 toneladas y ocupaba 1800 pies cuadrados 💻",
        "El internet fue inventado en 1969, pero la World Wide Web no llegó hasta 1989 🌐",
        "El primer teléfono móvil pesaba 2.5 libras y costaba $3,995 📱",
        "Los humanos parpadean aproximadamente 15-20 veces por minuto 👁️",
        "El corazón humano late más de 100,000 veces al día ❤️",
        "La lengua es el músculo más fuerte del cuerpo humano 👅",
        "Los delfines duermen con un ojo abierto 🐬",
        "Las abejas pueden reconocer rostros humanos 🐝"
      ],
      help: [
        "Puedo ayudarte con información general, datos curiosos y responder preguntas básicas 📚",
        "Estoy aquí para charlar, compartir curiosidades y ayudarte con lo que necesites 💬",
        "Puedo contarte datos interesantes, responder preguntas y mantener una conversación amigable 🤝",
        "Mi función es ser tu compañero de conversación y ayudarte con información útil 🎯"
      ],
      unknown: [
        "Interesante pregunta 🤔 Déjame pensar en eso...",
        "Hmm, esa es una buena pregunta. ¿Podrías reformularla? 🤷‍♂️",
        "No estoy seguro de entender. ¿Podrías ser más específico? 🤔",
        "Esa pregunta me hace pensar... ¿Qué más te gustaría saber? 💭"
      ]
    };
    
    // Inicialización
    this._boundHandleResize = this._handleResize.bind(this);
    
    // Limpiar cache expirado si está habilitado
    if (this.cache) {
      this._cleanExpiredCache();
    } else {
      this._clearCache();
    }
    
    // Inicializar con Shadow DOM
    this._renderFloatingButton();
    // this._renderFloatingMain();
    this._handleResize();
    this._initializeChat();
  }

  // Métodos de inicialización
  async _initializeChat() {
    // Siempre inicializar la sesión, el registro se manejará dentro del chat
    await this._initializeSession();
  }

  async _initializeSession() {
    try {
      // En modo test, simular sesión y registro exitoso
      if (this.testMode) {
        this.session = "test-session-" + Date.now();
        this.registered = true;
        this._renderChatPanel();
        this._checkRegistrationStatus();
        return;
      }
      
      // Intentar cargar sesión desde cache si está habilitado
      if (this.cache && this._loadSessionFromCache()) {
        this._log('_initializeSession - Sesión cargada desde cache');
        this._renderChatPanel();
        this._checkRegistrationStatus();
        // return;
      }
      
      // Paso 1: Registrar usuario para obtener configuración del bot
      try {
        await this._registerUser();
      } catch (error) {
        console.warn('No se pudo registrar usuario:', error);
        // Continuar con configuración por defecto
      }
      
      // Renderizar el chat panel después del registro
      this._renderChatPanel();
      
      // Si show es false, ocultar el chat panel inicialmente
      if (!this.show) {
        this.chatPanel.style.display = "none";
      }
      
      // Paso 2: Verificar estado de registro y mostrar pantalla correspondiente
      this._checkRegistrationStatus();
      
    } catch (error) {
      console.error('Error inicializando chat:', error);
      // Renderizar el chat panel incluso si hay error para mostrar el mensaje de error
      this._renderChatPanel();
      // Si show es false, ocultar el chat panel inicialmente
      if (!this.show) {
        this.chatPanel.style.display = "none";
      }
      // Si falla el registro, mostrar mensaje de error con opción de reintentar
      this._showErrorWithRetry("Error al conectar con el servidor. Verifica tu conexión e intenta nuevamente.");
    }
  }

  // API Calls
  async _registerUser() {
    this._log('_registerUser - Iniciando registro de usuario');
    try {
      this._log('Intentando registrar usuario con:', {
        baseUrl: this.baseUrl,
        apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'undefined',
        tenant: this.tenant
      });

      const response = await fetch(`${this.baseUrl}/api/sdk/v1/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          tenant: this.tenant
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        this._logError('Error en registro:', response.status, errorText);
        throw new Error(`Error en registro: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this._log('Registro exitoso:', data);
      
      // Actualizar datos de la sesión
      if (this.cache && this._loadSessionFromCache()) {
        this._log('Sesión cargada desde cache:', this.session);
      } else {
        this.session = data.session;
      }
      this.license = data.license; // name, logo, active, url, showFooter
      
      // Solo marcar como registrado si la licencia está activa Y register es true
      this._log('DEBUG: Verificando registro:', {
        license: this.license,
        licenseActive: this.license?.active,
        register: this.register,
        willRegister: this.license && this.license.active && this.register
      });
      
      if (this.license && this.license.active && this.register) {
        this.registered = true;
        this._log('DEBUG: Usuario registrado exitosamente');
      } else {
        this.registered = false;
        this._log('DEBUG: Usuario NO registrado');
      }
      
      // Actualizar configuración del bot desde la respuesta del registro
      if (data.chatbot) {
        this.bot.name = data.chatbot.name || this.bot.name;
        this.bot.img = data.chatbot.photo || this.bot.img;
        this.botName = data.chatbot.name || this.botName;
        this.saludoInicial = data.chatbot.initial_message;
      }
      
      // Guardar las FAQs de la API si están disponibles
      if (data.module.faqs && data.faqs && Array.isArray(data.faqs)) {
        this.apiFaqs = data.faqs;
        this._log('FAQs de la API guardadas:', this.apiFaqs);
      }
      
      // Guardar configuración de módulos si está disponible
      if (data.module) {
        this.moduleConfig = data.module;
        this._log('Configuración de módulos guardada:', this.moduleConfig);
      }
      
      // Guardar productos de la API si están disponibles
      if (data.module.products && data.products && Array.isArray(data.products)) {
        this.products = data.products;
        this._log('Productos de la API guardados:', this.products);
      }
      
      // Actualizar la UI con la nueva configuración del bot
      this._updateBotUI();
      
      // Actualizar el footer después del registro
      this._updateFooter();
      
      // Guardar sesión en cache después del registro exitoso
      this._saveSessionToCache();
    } catch (error) {
      this._logError('Error en _registerUser:', error);
      throw error;
    }
  }

  async _sendMessageToAPI(message) {
    this._log('_sendMessageToAPI - Enviando mensaje:', message);
    
    // Si está en modo test, devolver respuesta simulada
    if (this.testMode) {
      this._log('_sendMessageToAPI - Modo test activado');
      return {
        success: true,
        data: {
          response: 'Este es un mensaje de prueba. El modo test está activado.',
          session: this.session
        }
      };
    }
    
    const response = await fetch(`${this.baseUrl}/api/sdk/v1/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        tenant: this.tenant,
        session: this.session,
        message: message,
        name: this.user.name
      })
    });

    if (!response.ok) {
      throw new Error('Error enviando mensaje');
    }

    const data = await response.json();
    this._log('_sendMessageToAPI - Respuesta recibida:', data);
    
    // Verificar si el servidor indica que se superó el límite
    if (data.type === 'limit_completed') {
      this._log('_sendMessageToAPI - Límite de mensajes alcanzado según el servidor');
      this._showLimitCompletedMessage();
      return null; // No mostrar respuesta normal
    }
    
    return data.answer || 'No se pudo obtener respuesta del bot';
  }

  // Sistema de traducciones
  _getTranslation(key) {
    const translations = {
      es: {
        // Español
        welcome_message: "Hola {name}, soy {botName} y estoy aquí para ayudarte. ¿En qué puedo asistirte?",
        reminder_message: "¿Hay algo más en lo que pueda ayudarte? 😊",
        limit_reached_message: "⚠️ Has alcanzado el límite de mensajes para esta sesión. El chat ha sido bloqueado temporalmente.",
        limit_reached_placeholder: "Límite de mensajes alcanzado",
        write_message_placeholder: "Escribe un mensaje...",
        send_button_text: "Enviar",
        clear_history: "Limpiar historial",
        fullscreen: "Pantalla completa",
        minimize: "Minimizar",
        chat_info: "Información del chat",
        powered_by: "Desarrollado por",
        registration_name_prompt: "¡Hola! ¿Cuál es tu nombre?",
        registration_complete: "¡Perfecto! Ahora puedo ayudarte mejor.",
        error_message: "Error al obtener respuesta. Intenta nuevamente.",
        registration_required: "Por favor, completa el registro primero. Necesito saber tu nombre para poder ayudarte.",
        loading_message: "Está escribiendo...",
        clear_history_confirm: "¿Estás seguro de que quieres limpiar todo el historial del chat?",
        clear_history_confirm_title: "Confirmar acción",
        cancel: "Cancelar",
        confirm: "Confirmar",
        close: "Cerrar",
        // Mensajes de test
        test_welcome_1: "¡Hola! 👋 Soy tu asistente virtual. ¿Cómo te llamas?",
        test_welcome_2: "¡Bienvenido! 😊 Me encantaría conocer tu nombre.",
        test_welcome_3: "¡Hola! Soy tu bot de ayuda. ¿Cuál es tu nombre?",
        test_welcome_4: "¡Saludos! 🌟 Para personalizar tu experiencia, ¿podrías decirme tu nombre?",
        test_greeting_1: "¡Hola {name}! 👋 ¿En qué puedo ayudarte hoy?",
        test_greeting_2: "¡Qué gusto verte, {name}! 👋 ¿Cómo estás?",
        test_greeting_3: "¡Bienvenido de nuevo, {name}! 🌟 ¿En qué puedo asistirte?",
        test_greeting_4: "¡Hola {name}! 💫 ¿Qué te gustaría hacer hoy?",
        test_curiosity_1: "¿Sabías que el primer emoji fue creado en 1999? 😊",
        test_curiosity_2: "El término 'robot' fue acuñado por el escritor checo Karel Čapek en 1920 🤖",
        test_curiosity_3: "La primera computadora pesaba 27 toneladas y ocupaba 1800 pies cuadrados 💻",
        test_curiosity_4: "El internet fue inventado en 1969, pero la World Wide Web no llegó hasta 1989 🌐",
        test_curiosity_5: "El primer teléfono móvil pesaba 2.5 libras y costaba $3,995 📱",
        test_curiosity_6: "Los humanos parpadean aproximadamente 15-20 veces por minuto 👁️",
        test_curiosity_7: "El corazón humano late más de 100,000 veces al día ❤️",
        test_curiosity_8: "La lengua es el músculo más fuerte del cuerpo humano 👅",
        test_curiosity_9: "Los delfines duermen con un ojo abierto 🐬",
        test_curiosity_10: "Las abejas pueden reconocer rostros humanos 🐝",
        test_help_1: "Puedo ayudarte con información general, datos curiosos y responder preguntas básicas 📚",
        test_help_2: "Estoy aquí para charlar, compartir curiosidades y ayudarte con lo que necesites 💬",
        test_help_3: "Puedo contarte datos interesantes, responder preguntas y mantener una conversación amigable 🤝",
        test_help_4: "Mi función es ser tu compañero de conversación y ayudarte con información útil 🎯",
        test_unknown_1: "Interesante pregunta 🤔 Déjame pensar en eso...",
        test_unknown_2: "Hmm, esa es una buena pregunta. ¿Podrías reformularla? 🤷‍♂️",
        test_unknown_3: "No estoy seguro de entender. ¿Podrías ser más específico? 🤔",
        test_unknown_4: "Esa pregunta me hace pensar... ¿Qué más te gustaría saber? 💭",
        // Onboarding avanzado
        advanced_welcome_message: "¡Hola! 👋 Soy tu asistente virtual. Para personalizar tu experiencia, ¿podrías decirme tu nombre?",
        advanced_name_prompt: "Escribe tu nombre...",
        advanced_name_received: "¡Perfecto! Ahora tienes dos opciones:",
        advanced_faq_option: "Preguntas frecuentes",
        advanced_chat_option: "Comenzar conversación",
        advanced_faq_title: "Preguntas Frecuentes",
        advanced_faq_back: "← Volver",
        advanced_faq_list: [
          {
            title: "¿Cómo funciona el chat?",
            content: "El chat funciona de manera interactiva. Puedes escribir mensajes y recibir respuestas en tiempo real. El asistente virtual está diseñado para ayudarte con información, responder preguntas y mantener conversaciones amigables."
          },
          {
            title: "¿Qué puedo preguntar?",
            content: "Puedes hacer preguntas sobre cualquier tema: información general, datos curiosos, ayuda con tareas, explicaciones sobre conceptos, o simplemente charlar. El asistente está aquí para ayudarte con lo que necesites."
          },
          {
            title: "¿Es seguro usar este chat?",
            content: "Sí, todas las conversaciones son privadas y seguras. No compartimos tu información personal con terceros. Tu privacidad es importante para nosotros."
          },
          {
            title: "¿Puedo usar el chat en cualquier momento?",
            content: "Sí, el chat está disponible 24/7. Puedes usarlo cuando quieras y el asistente estará listo para ayudarte en cualquier momento del día."
          },
          {
            title: "¿Cómo puedo obtener la mejor experiencia?",
            content: "Para obtener la mejor experiencia, sé específico en tus preguntas, proporciona contexto cuando sea necesario, y no dudes en hacer preguntas de seguimiento si necesitas más detalles."
          },
          {
            title: "¿El asistente puede recordar nuestras conversaciones?",
            content: "El asistente puede recordar el contexto de la conversación actual, pero las conversaciones anteriores no se guardan entre sesiones para proteger tu privacidad."
          },
          {
            title: "¿Puedo cambiar de tema durante la conversación?",
            content: "¡Por supuesto! Puedes cambiar de tema en cualquier momento. El asistente se adaptará a tus necesidades y estará listo para ayudarte con cualquier nuevo tema que quieras discutir."
          },
          {
            title: "¿Qué hago si no entiendo una respuesta?",
            content: "Si no entiendes una respuesta, simplemente pide que te lo explique de otra manera o solicita más detalles. El asistente está aquí para ayudarte y se adaptará a tu nivel de comprensión."
          }
        ]
      },
      en: {
        // English
        welcome_message: "Hello {name}, I'm {botName} and I'm here to help you. How can I assist you?",
        reminder_message: "Is there anything else I can help you with? 😊",
        limit_reached_message: "⚠️ You have reached the message limit for this session. The chat has been temporarily blocked.",
        limit_reached_placeholder: "Message limit reached",
        write_message_placeholder: "Write a message...",
        send_button_text: "Send",
        clear_history: "Clear history",
        fullscreen: "Fullscreen",
        minimize: "Minimize",
        chat_info: "Chat information",
        powered_by: "Powered by",
        registration_name_prompt: "Hello! What's your name?",
        registration_complete: "Perfect! Now I can help you better.",
        error_message: "Error getting response. Please try again.",
        registration_required: "Please complete the registration first. I need to know your name to help you.",
        loading_message: "Typing...",
        clear_history_confirm: "Are you sure you want to clear all chat history?",
        clear_history_confirm_title: "Confirm action",
        cancel: "Cancel",
        confirm: "Confirm",
        close: "Close",
        // Test messages
        test_welcome_1: "Hello! 👋 I'm your virtual assistant. What's your name?",
        test_welcome_2: "Welcome! 😊 I'd love to know your name.",
        test_welcome_3: "Hello! I'm your help bot. What's your name?",
        test_welcome_4: "Greetings! 🌟 To personalize your experience, could you tell me your name?",
        test_greeting_1: "Hello {name}! 👋 How can I help you today?",
        test_greeting_2: "Nice to see you, {name}! 👋 How are you?",
        test_greeting_3: "Welcome back, {name}! 🌟 How can I assist you?",
        test_greeting_4: "Hello {name}! 💫 What would you like to do today?",
        test_curiosity_1: "Did you know the first emoji was created in 1999? 😊",
        test_curiosity_2: "The term 'robot' was coined by Czech writer Karel Čapek in 1920 🤖",
        test_curiosity_3: "The first computer weighed 27 tons and occupied 1800 square feet 💻",
        test_curiosity_4: "The internet was invented in 1969, but the World Wide Web didn't arrive until 1989 🌐",
        test_curiosity_5: "The first mobile phone weighed 2.5 pounds and cost $3,995 📱",
        test_curiosity_6: "Humans blink approximately 15-20 times per minute 👁️",
        test_curiosity_7: "The human heart beats more than 100,000 times per day ❤️",
        test_curiosity_8: "The tongue is the strongest muscle in the human body 👅",
        test_curiosity_9: "Dolphins sleep with one eye open 🐬",
        test_curiosity_10: "Bees can recognize human faces 🐝",
        test_help_1: "I can help you with general information, fun facts, and answer basic questions 📚",
        test_help_2: "I'm here to chat, share curiosities, and help you with whatever you need 💬",
        test_help_3: "I can tell you interesting facts, answer questions, and maintain a friendly conversation 🤝",
        test_help_4: "My function is to be your conversation companion and help you with useful information 🎯",
        test_unknown_1: "Interesting question 🤔 Let me think about that...",
        test_unknown_2: "Hmm, that's a good question. Could you rephrase it? 🤷‍♂️",
        test_unknown_3: "I'm not sure I understand. Could you be more specific? 🤔",
        test_unknown_4: "That question makes me think... What else would you like to know? 💭",
        // Advanced onboarding
        advanced_welcome_message: "Hello! 👋 I'm your virtual assistant. To personalize your experience, could you tell me your name?",
        advanced_name_prompt: "Write your name...",
        advanced_name_received: "Perfect! Now you have two options:",
        advanced_faq_option: "📚 Frequently Asked Questions",
        advanced_chat_option: "💬 Start conversation",
        advanced_faq_title: "Frequently Asked Questions",
        advanced_faq_back: "← Back",
        advanced_faq_list: [
          {
            title: "How does the chat work?",
            content: "The chat works interactively. You can write messages and receive responses in real time. The virtual assistant is designed to help you with information, answer questions, and maintain friendly conversations. For more information, visit our [documentation](https://www.example.com/docs)."
          },
          {
            title: "What can I ask?",
            content: "You can ask questions about any topic: general information, fun facts, help with tasks, explanations of concepts, or simply chat. The assistant is here to help you with whatever you need. Check out our [FAQ page](https://www.example.com/faq) for more examples."
          },
          {
            title: "Is it safe to use this chat?",
            content: "Yes, all conversations are private and secure. We don't share your personal information with third parties. Your privacy is important to us. Read our [privacy policy](https://www.example.com/privacy) for more details."
          },
          {
            title: "Can I use the chat at any time?",
            content: "Yes, the chat is available 24/7. You can use it whenever you want and the assistant will be ready to help you at any time of day. Visit our [status page](https://www.example.com/status) to check current availability."
          },
          {
            title: "How can I get the best experience?",
            content: "To get the best experience, be specific in your questions, provide context when necessary, and don't hesitate to ask follow-up questions if you need more details. Check our [best practices guide](https://www.example.com/best-practices) for tips."
          },
          {
            title: "Can the assistant remember our conversations?",
            content: "The assistant can remember the context of the current conversation, but previous conversations are not saved between sessions to protect your privacy. Learn more about our [data retention policy](https://www.example.com/data-policy)."
          },
          {
            title: "Can I change topics during the conversation?",
            content: "Of course! You can change topics at any time. The assistant will adapt to your needs and be ready to help you with any new topic you want to discuss. Explore our [topic categories](https://www.example.com/topics) for inspiration."
          },
          {
            title: "What should I do if I don't understand a response?",
            content: "If you don't understand a response, simply ask for it to be explained in another way or request more details. The assistant is here to help and will adapt to your level of understanding. You can also check our [help center](https://www.example.com/help) for additional resources."
          }
        ]
      },
      pt: {
        // Português
        welcome_message: "Olá {name}, sou {botName} e estou aqui para ajudá-lo. Como posso ajudá-lo?",
        reminder_message: "Há mais alguma coisa em que eu possa ajudá-lo? 😊",
        limit_reached_message: "⚠️ Você atingiu o limite de mensagens para esta sessão. O chat foi temporariamente bloqueado.",
        limit_reached_placeholder: "Limite de mensagens atingido",
        write_message_placeholder: "Escreva uma mensagem...",
        send_button_text: "Enviar",
        clear_history: "Limpar histórico",
        fullscreen: "Tela cheia",
        minimize: "Minimizar",
        chat_info: "Informações do chat",
        powered_by: "Desenvolvido por",
        registration_name_prompt: "Olá! Qual é o seu nome?",
        registration_complete: "Perfeito! Agora posso ajudá-lo melhor.",
        error_message: "Erro ao obter resposta. Tente novamente.",
        registration_required: "Por favor, complete o registro primeiro. Preciso saber seu nome para ajudá-lo.",
        loading_message: "Digitando...",
        clear_history_confirm: "Tem certeza de que deseja limpar todo o histórico do chat?",
        clear_history_confirm_title: "Confirmar ação",
        cancel: "Cancelar",
        confirm: "Confirmar",
        close: "Fechar",
        // Mensagens de teste
        test_welcome_1: "Olá! 👋 Sou seu assistente virtual. Como você se chama?",
        test_welcome_2: "Bem-vindo! 😊 Adoraria conhecer seu nome.",
        test_welcome_3: "Olá! Sou seu bot de ajuda. Qual é o seu nome?",
        test_welcome_4: "Saudações! 🌟 Para personalizar sua experiência, você poderia me dizer seu nome?",
        test_greeting_1: "Olá {name}! 👋 Como posso ajudá-lo hoje?",
        test_greeting_2: "Que prazer vê-lo, {name}! 👋 Como você está?",
        test_greeting_3: "Bem-vindo de volta, {name}! 🌟 Como posso ajudá-lo?",
        test_greeting_4: "Olá {name}! 💫 O que você gostaria de fazer hoje?",
        test_curiosity_1: "Você sabia que o primeiro emoji foi criado em 1999? 😊",
        test_curiosity_2: "O termo 'robô' foi cunhado pelo escritor tcheco Karel Čapek em 1920 🤖",
        test_curiosity_3: "O primeiro computador pesava 27 toneladas e ocupava 1800 pés quadrados 💻",
        test_curiosity_4: "A internet foi inventada em 1969, mas a World Wide Web só chegou em 1989 🌐",
        test_curiosity_5: "O primeiro telefone celular pesava 2.5 libras e custava $3,995 📱",
        test_curiosity_6: "Os humanos piscam aproximadamente 15-20 vezes por minuto 👁️",
        test_curiosity_7: "O coração humano bate mais de 100.000 vezes por dia ❤️",
        test_curiosity_8: "A língua é o músculo mais forte do corpo humano 👅",
        test_curiosity_9: "Os golfinhos dormem com um olho aberto 🐬",
        test_curiosity_10: "As abelhas podem reconhecer rostos humanos 🐝",
        test_help_1: "Posso ajudá-lo com informações gerais, curiosidades e responder perguntas básicas 📚",
        test_help_2: "Estou aqui para conversar, compartilhar curiosidades e ajudá-lo com o que precisar 💬",
        test_help_3: "Posso contar fatos interessantes, responder perguntas e manter uma conversa amigável 🤝",
        test_help_4: "Minha função é ser seu companheiro de conversa e ajudá-lo com informações úteis 🎯",
        test_unknown_1: "Pergunta interessante 🤔 Deixe-me pensar nisso...",
        test_unknown_2: "Hmm, essa é uma boa pergunta. Você poderia reformulá-la? 🤷‍♂️",
        test_unknown_3: "Não tenho certeza se entendo. Você poderia ser mais específico? 🤔",
        test_unknown_4: "Essa pergunta me faz pensar... O que mais você gostaria de saber? 💭"
      },
      ru: {
        // Русский
        welcome_message: "Привет {name}, я {botName} и я здесь, чтобы помочь вам. Как я могу вам помочь?",
        reminder_message: "Могу ли я помочь вам еще с чем-то? 😊",
        limit_reached_message: "⚠️ Вы достигли лимита сообщений для этой сессии. Чат временно заблокирован.",
        limit_reached_placeholder: "Достигнут лимит сообщений",
        write_message_placeholder: "Напишите сообщение...",
        send_button_text: "Отправить",
        clear_history: "Очистить историю",
        fullscreen: "Полный экран",
        chat_info: "Информация о чате",
        powered_by: "Разработано",
        registration_name_prompt: "Привет! Как вас зовут?",
        registration_complete: "Отлично! Теперь я могу лучше вам помочь.",
        error_message: "Ошибка получения ответа. Попробуйте еще раз.",
        registration_required: "Пожалуйста, сначала завершите регистрацию. Мне нужно знать ваше имя, чтобы помочь вам.",
        loading_message: "Печатает...",
        clear_history_confirm: "Вы уверены, что хотите очистить всю историю чата?",
        clear_history_confirm_title: "Подтвердить действие",
        cancel: "Отмена",
        confirm: "Подтвердить",
        close: "Закрыть",
        // Тестовые сообщения
        test_welcome_1: "Привет! 👋 Я ваш виртуальный помощник. Как вас зовут?",
        test_welcome_2: "Добро пожаловать! 😊 Хотел бы узнать ваше имя.",
        test_welcome_3: "Привет! Я ваш бот-помощник. Как вас зовут?",
        test_welcome_4: "Приветствия! 🌟 Чтобы персонализировать ваш опыт, не могли бы вы сказать мне ваше имя?",
        test_greeting_1: "Привет {name}! 👋 Как я могу помочь вам сегодня?",
        test_greeting_2: "Приятно видеть вас, {name}! 👋 Как дела?",
        test_greeting_3: "Добро пожаловать обратно, {name}! 🌟 Как я могу помочь вам?",
        test_greeting_4: "Привет {name}! 💫 Что бы вы хотели сделать сегодня?",
        test_curiosity_1: "Знаете ли вы, что первый эмодзи был создан в 1999 году? 😊",
        test_curiosity_2: "Термин 'робот' был придуман чешским писателем Карелом Чапеком в 1920 году 🤖",
        test_curiosity_3: "Первый компьютер весил 27 тонн и занимал 1800 квадратных футов 💻",
        test_curiosity_4: "Интернет был изобретен в 1969 году, но Всемирная паутина появилась только в 1989 году 🌐",
        test_curiosity_5: "Первый мобильный телефон весил 2.5 фунта и стоил $3,995 📱",
        test_curiosity_6: "Люди моргают примерно 15-20 раз в минуту 👁️",
        test_curiosity_7: "Человеческое сердце бьется более 100,000 раз в день ❤️",
        test_curiosity_8: "Язык - самая сильная мышца в человеческом теле 👅",
        test_curiosity_9: "Дельфины спят с одним открытым глазом 🐬",
        test_curiosity_10: "Пчелы могут узнавать человеческие лица 🐝",
        test_help_1: "Я могу помочь вам с общей информацией, интересными фактами и ответить на базовые вопросы 📚",
        test_help_2: "Я здесь, чтобы общаться, делиться любопытными фактами и помогать вам с тем, что нужно 💬",
        test_help_3: "Я могу рассказывать интересные факты, отвечать на вопросы и поддерживать дружескую беседу 🤝",
        test_help_4: "Моя функция - быть вашим собеседником и помогать вам с полезной информацией 🎯",
        test_unknown_1: "Интересный вопрос 🤔 Дайте мне подумать об этом...",
        test_unknown_2: "Хм, это хороший вопрос. Можете ли вы переформулировать его? 🤷‍♂️",
        test_unknown_3: "Я не уверен, что понимаю. Можете ли вы быть более конкретным? 🤔",
        test_unknown_4: "Этот вопрос заставляет меня думать... Что еще вы хотели бы узнать? 💭"
      },
      de: {
        // Deutsch
        welcome_message: "Hallo {name}, ich bin {botName} und bin hier, um Ihnen zu helfen. Wie kann ich Ihnen helfen?",
        reminder_message: "Kann ich Ihnen noch bei etwas anderem helfen? 😊",
        limit_reached_message: "⚠️ Sie haben das Nachrichtenlimit für diese Sitzung erreicht. Der Chat wurde vorübergehend blockiert.",
        limit_reached_placeholder: "Nachrichtenlimit erreicht",
        write_message_placeholder: "Schreiben Sie eine Nachricht...",
        send_button_text: "Senden",
        clear_history: "Verlauf löschen",
        fullscreen: "Vollbild",
        chat_info: "Chat-Informationen",
        powered_by: "Entwickelt von",
        registration_name_prompt: "Hallo! Wie heißen Sie?",
        registration_complete: "Perfekt! Jetzt kann ich Ihnen besser helfen.",
        error_message: "Fehler beim Abrufen der Antwort. Versuchen Sie es erneut.",
        registration_required: "Bitte schließen Sie zuerst die Registrierung ab. Ich muss Ihren Namen kennen, um Ihnen zu helfen.",
        loading_message: "Schreibt...",
        clear_history_confirm: "Sind Sie sicher, dass Sie den gesamten Chat-Verlauf löschen möchten?",
        clear_history_confirm_title: "Aktion bestätigen",
        cancel: "Abbrechen",
        confirm: "Bestätigen",
        close: "Schließen",
        // Testnachrichten
        test_welcome_1: "Hallo! 👋 Ich bin Ihr virtueller Assistent. Wie heißen Sie?",
        test_welcome_2: "Willkommen! 😊 Ich würde gerne Ihren Namen kennenlernen.",
        test_welcome_3: "Hallo! Ich bin Ihr Hilfsbot. Wie heißen Sie?",
        test_welcome_4: "Grüße! 🌟 Um Ihre Erfahrung zu personalisieren, könnten Sie mir Ihren Namen sagen?",
        test_greeting_1: "Hallo {name}! 👋 Wie kann ich Ihnen heute helfen?",
        test_greeting_2: "Schön, Sie zu sehen, {name}! 👋 Wie geht es Ihnen?",
        test_greeting_3: "Willkommen zurück, {name}! 🌟 Wie kann ich Ihnen helfen?",
        test_greeting_4: "Hallo {name}! 💫 Was möchten Sie heute tun?",
        test_curiosity_1: "Wussten Sie, dass das erste Emoji 1999 erstellt wurde? 😊",
        test_curiosity_2: "Der Begriff 'Roboter' wurde 1920 vom tschechischen Schriftsteller Karel Čapek geprägt 🤖",
        test_curiosity_3: "Der erste Computer wog 27 Tonnen und nahm 1800 Quadratfuß ein 💻",
        test_curiosity_4: "Das Internet wurde 1969 erfunden, aber das World Wide Web kam erst 1989 🌐",
        test_curiosity_5: "Das erste Mobiltelefon wog 2,5 Pfund und kostete $3.995 📱",
        test_curiosity_6: "Menschen blinzeln etwa 15-20 Mal pro Minute 👁️",
        test_curiosity_7: "Das menschliche Herz schlägt mehr als 100.000 Mal pro Tag ❤️",
        test_curiosity_8: "Die Zunge ist der stärkste Muskel im menschlichen Körper 👅",
        test_curiosity_9: "Delfine schlafen mit einem offenen Auge 🐬",
        test_curiosity_10: "Bienen können menschliche Gesichter erkennen 🐝",
        test_help_1: "Ich kann Ihnen mit allgemeinen Informationen, interessanten Fakten und der Beantwortung grundlegender Fragen helfen 📚",
        test_help_2: "Ich bin hier, um zu chatten, Kuriositäten zu teilen und Ihnen bei allem zu helfen, was Sie brauchen 💬",
        test_help_3: "Ich kann Ihnen interessante Fakten erzählen, Fragen beantworten und eine freundliche Konversation führen 🤝",
        test_help_4: "Meine Funktion ist es, Ihr Gesprächspartner zu sein und Ihnen mit nützlichen Informationen zu helfen 🎯",
        test_unknown_1: "Interessante Frage 🤔 Lassen Sie mich darüber nachdenken...",
        test_unknown_2: "Hmm, das ist eine gute Frage. Könnten Sie sie umformulieren? 🤷‍♂️",
        test_unknown_3: "Ich bin mir nicht sicher, ob ich verstehe. Könnten Sie spezifischer sein? 🤔",
        test_unknown_4: "Diese Frage lässt mich nachdenken... Was möchten Sie sonst noch wissen? 💭"
      },
      zh: {
        // 中文
        welcome_message: "你好 {name}，我是 {botName}，我在这里帮助你。我如何能协助你？",
        reminder_message: "还有什么我可以帮助你的吗？😊",
        limit_reached_message: "⚠️ 您已达到本次会话的消息限制。聊天已被临时阻止。",
        limit_reached_placeholder: "已达到消息限制",
        write_message_placeholder: "写一条消息...",
        send_button_text: "发送",
        clear_history: "清除历史",
        fullscreen: "全屏",
        chat_info: "聊天信息",
        powered_by: "由开发",
        registration_name_prompt: "你好！你叫什么名字？",
        registration_complete: "完美！现在我可以更好地帮助你。",
        error_message: "获取响应时出错。请重试。",
        registration_required: "请先完成注册。我需要知道你的名字才能帮助你。",
        loading_message: "正在输入...",
        clear_history_confirm: "您确定要清除所有聊天历史吗？",
        clear_history_confirm_title: "确认操作",
        close: "关闭",
        cancel: "取消",
        confirm: "确认",
        // 测试消息
        test_welcome_1: "你好！👋 我是您的虚拟助手。您叫什么名字？",
        test_welcome_2: "欢迎！😊 我很想知道您的名字。",
        test_welcome_3: "你好！我是您的帮助机器人。您叫什么名字？",
        test_welcome_4: "问候！🌟 为了个性化您的体验，您能告诉我您的名字吗？",
        test_greeting_1: "你好 {name}！👋 我今天能为您做些什么？",
        test_greeting_2: "很高兴见到您，{name}！👋 您怎么样？",
        test_greeting_3: "欢迎回来，{name}！🌟 我能为您提供什么帮助？",
        test_greeting_4: "你好 {name}！💫 您今天想做什么？",
        test_curiosity_1: "您知道第一个表情符号是在1999年创建的吗？😊",
        test_curiosity_2: "'机器人'这个词是由捷克作家卡雷尔·恰佩克在1920年创造的 🤖",
        test_curiosity_3: "第一台计算机重27吨，占地1800平方英尺 💻",
        test_curiosity_4: "互联网是在1969年发明的，但万维网直到1989年才出现 🌐",
        test_curiosity_5: "第一部手机重2.5磅，售价3,995美元 📱",
        test_curiosity_6: "人类每分钟大约眨眼15-20次 👁️",
        test_curiosity_7: "人类心脏每天跳动超过10万次 ❤️",
        test_curiosity_8: "舌头是人体最强的肌肉 👅",
        test_curiosity_9: "海豚睁着一只眼睛睡觉 🐬",
        test_curiosity_10: "蜜蜂能识别人脸 🐝",
        test_help_1: "我可以帮助您了解一般信息、有趣的事实并回答基本问题 📚",
        test_help_2: "我在这里聊天、分享有趣的事情并帮助您解决任何需要 💬",
        test_help_3: "我可以告诉您有趣的事实、回答问题并保持友好的对话 🤝",
        test_help_4: "我的功能是成为您的对话伙伴并帮助您获得有用的信息 🎯",
        test_unknown_1: "有趣的问题 🤔 让我想想...",
        test_unknown_2: "嗯，这是一个好问题。您能重新表述一下吗？🤷‍♂️",
        test_unknown_3: "我不确定我是否理解。您能更具体一些吗？🤔",
        test_unknown_4: "这个问题让我思考...您还想知道什么？💭"
      },
      ja: {
        // 日本語
        welcome_message: "こんにちは {name}、私は {botName} です。お手伝いできることがあればお気軽にお声かけください。",
        reminder_message: "他に何かお手伝いできることはありますか？😊",
        limit_reached_message: "⚠️ このセッションのメッセージ制限に達しました。チャットは一時的にブロックされています。",
        limit_reached_placeholder: "メッセージ制限に達しました",
        write_message_placeholder: "メッセージを入力...",
        send_button_text: "送信",
        clear_history: "履歴をクリア",
        fullscreen: "全画面",
        chat_info: "チャット情報",
        powered_by: "開発者",
        registration_name_prompt: "こんにちは！お名前は何ですか？",
        registration_complete: "完璧です！これでより良くお手伝いできます。",
        error_message: "応答の取得中にエラーが発生しました。もう一度お試しください。",
        registration_required: "まず登録を完了してください。お手伝いするためにあなたの名前を知る必要があります。",
        loading_message: "入力中...",
        clear_history_confirm: "すべてのチャット履歴をクリアしてもよろしいですか？",
        clear_history_confirm_title: "アクションの確認",
        cancel: "キャンセル",
        confirm: "確認",
        close: "閉じる",
        // テストメッセージ
        test_welcome_1: "こんにちは！👋 私はあなたの仮想アシスタントです。お名前は何ですか？",
        test_welcome_2: "ようこそ！😊 あなたの名前を知りたいです。",
        test_welcome_3: "こんにちは！私はあなたのヘルプボットです。お名前は何ですか？",
        test_welcome_4: "ご挨拶！🌟 あなたの体験をパーソナライズするために、お名前を教えていただけますか？",
        test_greeting_1: "こんにちは {name}！👋 今日はどのようにお手伝いできますか？",
        test_greeting_2: "お会いできて嬉しいです、{name}！👋 お元気ですか？",
        test_greeting_3: "おかえりなさい、{name}！🌟 どのようにお手伝いできますか？",
        test_greeting_4: "こんにちは {name}！💫 今日は何をしたいですか？",
        test_curiosity_1: "最初の絵文字は1999年に作成されたことをご存知でしたか？😊",
        test_curiosity_2: "'ロボット'という用語は1920年にチェコの作家カレル・チャペックによって作られました 🤖",
        test_curiosity_3: "最初のコンピューターは27トンの重さで1800平方フィートを占めていました 💻",
        test_curiosity_4: "インターネットは1969年に発明されましたが、World Wide Webは1989年まで登場しませんでした 🌐",
        test_curiosity_5: "最初の携帯電話は2.5ポンドの重さで$3,995の価格でした 📱",
        test_curiosity_6: "人間は1分間に約15-20回まばたきします 👁️",
        test_curiosity_7: "人間の心臓は1日に10万回以上鼓動します ❤️",
        test_curiosity_8: "舌は人体で最も強い筋肉です 👅",
        test_curiosity_9: "イルカは片目を開けて眠ります 🐬",
        test_curiosity_10: "ミツバチは人間の顔を認識できます 🐝",
        test_help_1: "一般的な情報、興味深い事実、基本的な質問への回答をお手伝いできます 📚",
        test_help_2: "私はここでチャットし、好奇心を共有し、必要なことをお手伝いします 💬",
        test_help_3: "興味深い事実を話し、質問に答え、友好的な会話を維持できます 🤝",
        test_help_4: "私の機能はあなたの会話パートナーになり、有用な情報でお手伝いすることです 🎯",
        test_unknown_1: "興味深い質問ですね 🤔 それについて考えてみましょう...",
        test_unknown_2: "うーん、それは良い質問です。言い換えていただけますか？🤷‍♂️",
        test_unknown_3: "理解しているかどうかわかりません。もっと具体的にしていただけますか？🤔",
        test_unknown_4: "その質問は私に考えさせます...他に何を知りたいですか？💭"
      }
    };

    const currentTranslations = translations[this.language] || translations['es'];
    let translation = currentTranslations[key] || key;
    
    // Reemplazar variables en la traducción
    translation = translation.replace('{name}', this.user.name || 'User');
    translation = translation.replace('{botName}', this.botName || 'Bot');
    
    return translation;
  }

  // Obtener mensajes de test traducidos
  _getTestMessages() {
    return {
      welcome: [
        this._getTranslation('test_welcome_1'),
        this._getTranslation('test_welcome_2'),
        this._getTranslation('test_welcome_3'),
        this._getTranslation('test_welcome_4')
      ],
      greetings: [
        this._getTranslation('test_greeting_1'),
        this._getTranslation('test_greeting_2'),
        this._getTranslation('test_greeting_3'),
        this._getTranslation('test_greeting_4')
      ],
      curiosities: [
        this._getTranslation('test_curiosity_1'),
        this._getTranslation('test_curiosity_2'),
        this._getTranslation('test_curiosity_3'),
        this._getTranslation('test_curiosity_4'),
        this._getTranslation('test_curiosity_5'),
        this._getTranslation('test_curiosity_6'),
        this._getTranslation('test_curiosity_7'),
        this._getTranslation('test_curiosity_8'),
        this._getTranslation('test_curiosity_9'),
        this._getTranslation('test_curiosity_10')
      ],
      help: [
        this._getTranslation('test_help_1'),
        this._getTranslation('test_help_2'),
        this._getTranslation('test_help_3'),
        this._getTranslation('test_help_4')
      ],
      unknown: [
        this._getTranslation('test_unknown_1'),
        this._getTranslation('test_unknown_2'),
        this._getTranslation('test_unknown_3'),
        this._getTranslation('test_unknown_4')
      ]
    };
  }

  // Reproducir sonido de notificación (solo una vez)
  _playNotificationSound() {
    if (!this.sound || this.soundPlayed) return;
    
    try {
      const audio = new Audio('https://res.cloudinary.com/dhqqkf4hy/video/upload/v1754209978/new-notification-010-352755_jjgjfu.mp3');
      audio.volume = 0.5; // Volumen al 50%
      audio.play().then(() => {
        this._log('_playNotificationSound - Sonido reproducido correctamente');
        this.soundPlayed = true; // Marcar como reproducido
      }).catch(error => {
        this._logError('_playNotificationSound - Error reproduciendo sonido:', error);
      });
    } catch (error) {
      this._logError('_playNotificationSound - Error creando audio:', error);
    }
  }

  // Reproducir sonido de recordatorio (siempre que esté habilitado)
  _playReminderSound() {
    if (!this.sound) return; // Solo si el sonido está habilitado
    
    try {
      const audio = new Audio('https://res.cloudinary.com/dhqqkf4hy/video/upload/v1754209978/new-notification-010-352755_jjgjfu.mp3');
      audio.volume = 0.4; // Volumen ligeramente más bajo para recordatorios
      audio.play().then(() => {
        this._log('_playReminderSound - Sonido de recordatorio reproducido correctamente');
      }).catch(error => {
        this._logError('_playReminderSound - Error reproduciendo sonido de recordatorio:', error);
      });
    } catch (error) {
      this._logError('_playReminderSound - Error creando audio de recordatorio:', error);
    }
  }

  // Iniciar temporizador de recordatorio
  _startReminderTimer() {
    // Limpiar temporizador existente
    this._clearReminderTimer();
    
    // Solo iniciar si el chat está visible y no estamos en pantalla de registro
    if (!this.chatVisible || this.registrationScreen) {
      return;
    }
    
    // Verificar que no haya streaming activo
    const hasActiveStreaming = this.messages.some(msg => msg.isStreaming === true);
    if (hasActiveStreaming) {
      this._log('_startReminderTimer - Streaming activo detectado, no iniciando temporizador');
      return;
    }
    
    // Verificar que no esté cargando
    if (this.loading) {
      this._log('_startReminderTimer - Chat cargando, no iniciando temporizador');
      return;
    }
    
    this.reminderTimer = setTimeout(() => {
      this._showReminderMessage();
    }, this.reminderTimeout);
    
    this._log('_startReminderTimer - Temporizador iniciado para', this.reminderTimeout / 1000, 'segundos');
  }

  // Limpiar temporizador de recordatorio
  _clearReminderTimer() {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = null;
      this._log('_clearReminderTimer - Temporizador limpiado');
    }
  }

  // Mostrar mensaje de recordatorio
  _showReminderMessage() {
    // Verificar que el chat esté visible y no estemos en registro
    if (!this.chatVisible || this.registrationScreen) {
      return;
    }
    
    const reminderMessage = {
      from: "bot",
      text: this._getTranslation('reminder_message'),
      time: this._getCurrentTime(),
      isReminder: true,
      isSystem: true
    };
    
    this.messages.push(reminderMessage);
    
    // Crear y agregar el elemento del mensaje
    const messageElement = this._createMessageElement(reminderMessage);
    if (this.messagesContainer) {
      this.messagesContainer.appendChild(messageElement);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    // Reproducir sonido de notificación para el recordatorio
    this._playReminderSound();
    
    this._log('_showReminderMessage - Mensaje de recordatorio mostrado con sonido');
  }

  // Mostrar mensaje cuando el servidor indica que se superó el límite
  _showLimitCompletedMessage() {
    const limitMessage = {
      from: "bot",
      text: this._getTranslation('limit_reached_message'),
      time: this._getCurrentTime(),
      isLimitCompleted: true,
      isSystem: true
    };
    
    this.messages.push(limitMessage);
    
    // Crear y agregar el elemento del mensaje
    const messageElement = this._createMessageElement(limitMessage);
    if (this.messagesContainer) {
      this.messagesContainer.appendChild(messageElement);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    // Bloquear el input y botón de envío
            if (this.input) {
          this.input.disabled = true;
          this.input.placeholder = this._getTranslation('limit_reached_placeholder');
        }
    if (this.sendButton) {
      this.sendButton.disabled = true;
    }
    
    this._log('_showLimitCompletedMessage - Chat bloqueado por límite del servidor');
  }

  // Manejar respuesta del usuario durante registro
  async _handleRegistrationResponse(userMessage) {
    this._log('_handleRegistrationResponse - Iniciando con mensaje:', userMessage);
    
    // Si estamos en la pantalla de registro con botones, no procesar mensajes de texto
    if (this.registrationScreen && this.messages.some(msg => msg.showWelcomeButtons)) {
      this._log('_handleRegistrationResponse - En pantalla de registro con botones, ignorando mensaje de texto');
      return;
    }
    
    // Validar que el nombre no esté vacío
    if (!userMessage.trim()) {
      this._log('_handleRegistrationResponse - Nombre vacío, solicitando nombre');
      this._addMessage("bot", this._getTranslation('registration_name_prompt'));
      return;
    }
    
    this._log('_handleRegistrationResponse - Procesando nombre:', userMessage.trim());
    this.user.name = userMessage.trim();
    
    // Marcar como registrado y actualizar el estado
    this._log('_handleRegistrationResponse - Estableciendo registered = true');
    this.registered = true;
    this.registrationCompleted = true;
    
    // Mostrar mensaje de confirmación
    this._addMessage("bot", this._getTranslation('registration_complete'));
    
    // Transicionar al chat normal después de un breve delay
    setTimeout(() => {
      this._showChatScreen();
    }, 1500);
    
    this._log('_handleRegistrationResponse - Registro completado');
  }

  // Métodos para manejar errores y reintentos
  _showBotInfoWithRetry() {
    // Deshabilitar el chat inicialmente
    this.input.disabled = true;
    this.sendButton.disabled = true;
    
    // Limpiar todos los mensajes anteriores
    this.messages = [];
    
    // Mostrar mensaje de error con opción de reintentar
    const errorMessage = {
      from: "bot",
      text: this._getTranslation('error_message'),
      time: this._getCurrentTime(),
      isError: true,
      showRetry: true
    };
    
    this.messages.push(errorMessage);
    this._renderMessages();
  }

  _showErrorWithRetry(message) {
    // Deshabilitar el chat inicialmente
    this.input.disabled = true;
    this.sendButton.disabled = true;
    
    // Limpiar todos los mensajes anteriores
    this.messages = [];
    
    // Mostrar mensaje de error con opción de reintentar
    const errorMessage = {
      from: "bot",
      text: message,
      time: this._getCurrentTime(),
      isError: true,
      showRetry: true
    };
    
    this.messages.push(errorMessage);
    this._renderMessages();
  }

  async _retryConnection() {
    // Limpiar mensajes de error
    this.messages = this.messages.filter(msg => !msg.isError);
    
    // Habilitar el chat
    this.input.disabled = false;
    this.sendButton.disabled = false;
    
    // Mostrar mensaje de intentando conectar
    this._addMessage("bot", "Intentando conectar... ⏳");
    
    try {
      // Reintentar la inicialización
      await this._initializeSession();
    } catch (error) {
      this._logError('Error en reintento:', error);
      this._showBotInfoWithRetry();
    }
  }

  _getCurrentTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _handleResize() {
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        this._updateChatPanelSize();
      }
    });
  }

  _updateChatPanelSize() {
    if (this.chatPanel) {
      if (this.isFullscreen) {
        this.chatPanel.classList.add('fullscreen');
        this.chatPanel.classList.remove('mobile');
      } else if (this.isMobile) {
        this.chatPanel.classList.add('mobile');
        this.chatPanel.classList.remove('fullscreen');
      } else {
        this.chatPanel.classList.remove('fullscreen', 'mobile');
      }
    }
  }

  _renderFloatingButton() {
    // Crear contenedor con Shadow DOM
    this.floatingBtnContainer = document.createElement("div");
    this.floatingBtnContainer.id = "chatbot-floating-btn-container";
    
    // Crear Shadow DOM
    this.floatingBtnShadow = this.floatingBtnContainer.attachShadow({ mode: 'open' });
    
    // Estilos encapsulados
    const styles = document.createElement('style');
    styles.textContent = `
      .floating-btn {
        position: fixed;
        bottom: ${this.buttonPosition.bottom || "24px"};
        right: ${this.buttonPosition.right || "24px"};
        top: ${this.buttonPosition.top || "auto"};
        left: ${this.buttonPosition.left || "auto"};
        transform: ${this.buttonPosition.transform || "none"};
        width: ${this.isMobile ? "60px" : this.buttonSize};
        height: ${this.isMobile ? "60px" : this.buttonSize};
        background-color: ${this.iconButton && this.iconButton !== this.bot.img ? 'transparent' : this.primaryColor};
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 10px ${this._hexToRgba(this.primaryColor, 0.5)};
        display: ${this.iconButton && this.iconButton !== this.bot.img ? 'block' : 'flex'};
        align-items: center;
        justify-content: center;
        z-index: 1050;
        transition: transform 0.2s ease;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      .floating-btn:hover {
        transform: ${this.buttonPosition.transform || "none"} scale(1.1);
      }
      
      .floating-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        display: block;
      }
      
      .floating-btn svg {
        width: ${this.isMobile ? "48px" : "24px"};
        height: ${this.isMobile ? "48px" : "24px"};
      }
    `;
    
    this.floatingBtnShadow.appendChild(styles);
    
    // Crear botón
    this.floatingBtn = document.createElement("button");
    this.floatingBtn.type = "button";
    this.floatingBtn.title = "Abrir chat";
    this.floatingBtn.className = "floating-btn";
    
    // Usar ícono personalizado si está disponible
    if (this.iconButton && this.iconButton !== this.bot.img) {
      this.floatingBtn.innerHTML = `<img src="${this.iconButton}" alt="Chat" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg xmlns=\\"http://www.w3.org/2000/svg\\" fill=\\"white\\" viewBox=\\"0 0 24 24\\"><path d=\\"M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z\\"/></svg>'; this.parentElement.style.backgroundColor='${this.primaryColor}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center';">`;
    } else {
      this.floatingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
    }
    
    this.floatingBtnShadow.appendChild(this.floatingBtn);
    document.body.appendChild(this.floatingBtnContainer);
    
    // Event listeners
    this.floatingBtn.addEventListener("click", () => {
      this._toggleChatPanel();
    });



    
  }

  _renderFloatingMain() {


    // Crear contenedor con Shadow DOM
    this.floatingBtnContainer = document.createElement("div");
    this.floatingBtnContainer.id = "chatbot-floating-btn-container-main";
    
    // Crear Shadow DOM
    this.floatingBtnShadow = this.floatingBtnContainer.attachShadow({ mode: 'open' });
    
    // Estilos encapsulados
    const styles = document.createElement('style');
    styles.textContent = `
      .floating-btn-main {
        position: fixed;
        bottom: 35px; 
        right: 200px;
        top: auto;
        left: ${this.chatWidth / 2 + 60 + "px"};
        transform: ${this.buttonPosition.transform || "none"};
        width: 120px;
        height: 25px;
        background-color: ${this.iconButton && this.iconButton !== this.bot.img ? 'transparent' : this.primaryColor};
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        color: ;
        box-shadow: 0 4px 10px ${this._hexToRgba(this.primaryColor, 0.5)};
        display: 'flex';
        align-items: center;
        justify-content: center;
        z-index: 1050;
        transition: transform 0.2s ease;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      .floating-btn-main:hover {
        transform: ${this.buttonPosition.transform || "none"} scale(1.1);
      }
    `;
    
    this.floatingBtnShadow.appendChild(styles);
    
    // Crear botón
    this.floatingBtnMain = document.createElement("button");
    this.floatingBtnMain.type = "button";
    this.floatingBtnMain.title = "Abrir chat";
    this.floatingBtnMain.className = "floating-btn-main";
    
    this.floatingBtnMain.innerHTML = "Provider"
    
    this.floatingBtnShadow.appendChild(this.floatingBtnMain);
    document.body.appendChild(this.floatingBtnContainer);
    
  }

  _renderChatPanel() {
    // Crear contenedor con Shadow DOM
    this.chatPanelContainer = document.createElement("div");
    this.chatPanelContainer.id = "chatbot-panel-container";
    
    // Crear Shadow DOM
    this.chatPanelShadow = this.chatPanelContainer.attachShadow({ mode: 'open' });
    
    // Estilos encapsulados completos
    const styles = document.createElement('style');
    styles.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      .chatbot-panel {
        position: fixed;
        bottom: 90px;
        right: 24px;
        width: ${this.chatWidth};
        max-width: ${this.chatMaxWidth};
        height: ${this.chatHeight};
        max-height: ${this.chatMaxHeight};
        background-color: white;
        border: 1px solid #dee2e6;
        border-radius: 1.2rem;
        box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
        display: flex;
        flex-direction: column;
        z-index: 1050;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        overflow: hidden;
      }
      
      .chatbot-panel.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        border-radius: 0;
      }
      
      .chatbot-panel.mobile {
        width: calc(100vw - 48px);
        right: 24px;
        left: 24px;
      }
      
      /* Header */
      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background-color: ${this.headerBgColor};
        color: ${this.headerTextColor};
        border-radius: 0.375rem 0.375rem 0 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        flex-shrink: 0;
      }
      
      .chat-header.fullscreen {
        border-radius: 0;
      }
      
      .header-left {
        display: flex;
        align-items: center;
      }
      
      .bot-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 0.5rem;
      }
      
      .bot-name {
        font-weight: 600;
        margin: 0;
        font-size: 1.1rem;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      /* Dropdown */
      .dropdown {
        position: relative;
        display: inline-block;
      }
      
      .dropdown-toggle {
        background: transparent;
        border: none;
        color: inherit;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        border-radius: 0.25rem;
        transition: background-color 0.15s ease-in-out;
      }
      
      .dropdown-toggle:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1000;
        display: none;
        min-width: 12rem;
        padding: 0.5rem 0;
        background-color: white;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
        margin-top: 0.25rem;
      }
      
      .dropdown-menu.show {
        display: block;
      }
      
      .dropdown-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.5rem 1rem;
        clear: both;
        text-decoration: none;
        color: #212529;
        background: none;
        border: 0;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.15s ease-in-out;
      }
      
      .dropdown-item:hover {
        background-color: #f8f9fa;
      }
      
      .dropdown-item svg {
        width: 16px;
        height: 16px;
        margin-right: 0.5rem;
      }
      
      .dropdown-divider {
        height: 1px;
        background-color: #dee2e6;
        margin: 0.5rem 0;
        border: none;
      }
      
      /* Close button */
      .btn-close {
        background: transparent;
        border: 0;
        padding: 0.375rem;
        cursor: pointer;
        color: inherit;
        font-size: 1.25rem;
        line-height: 1;
        border-radius: 0.25rem;
        transition: background-color 0.15s ease-in-out;
      }
      
      .btn-close:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      /* Messages container */
      .messages-container {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1rem;
        min-height: 0;
        background-color: #ffffff;
      }
      
      .messages-container.fullscreen {
        height: calc(100vh - 140px);
      }
      
      /* Message styles */
      .message {
        display: flex;
        margin-bottom: 1rem;
        align-items: flex-start;
      }
      
      .message.user {
        justify-content: flex-end;
      }
      
      .message.bot {
        justify-content: flex-start;
      }
      
      .message-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      
      .message-bubble {
        max-width: 90%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        margin: 0 0.5rem;
        position: relative;
        word-wrap: break-word;
      }
      
      .message.user .message-bubble {
        background-color: ${this.primaryColor};
        color: white;
        border-bottom-right-radius: 0.25rem;
      }
      
      .message.bot .message-bubble {
        background-color: rgb(248, 249, 250);
        color: #212529;
        border: 1px solid #dee2e6;
        border-bottom-left-radius: 0.25rem;
      }
      
      .message-info {
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        opacity: 0.8;
      }
      
      .message-time {
        font-size: 0.7rem;
        opacity: 0.7;
        margin-left: 0.5rem;
      }
      
      .message-text {
        margin: 0;
        line-height: 1.4;
        white-space: pre-wrap;
      }
      
      .message-text code {
        background-color: rgba(0,0,0,0.1);
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875em;
      }
      
      .message-text pre {
        background-color: rgba(0,0,0,0.1);
        padding: 0.5rem;
        border-radius: 0.25rem;
        overflow-x: auto;
        margin: 0.5rem 0;
      }
      
      .message-text a {
        color: inherit;
        text-decoration: underline;
      }
      
      /* Footer */
      .chat-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid #dee2e6;
        background-color: white;
        border-radius: 0 0 0.375rem 0.375rem;
        flex-shrink: 0;
        margin-top: auto;
      }
      
      .chat-footer.fullscreen {
        border-radius: 0;
      }
      
      .chat-form {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      
      .chat-input {
        flex-grow: 1;
        padding: 0.5rem 1rem;
        border: 1px solid #ced4da;
        border-radius: 1.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        outline: none;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
      
      .chat-input:focus {
        border-color: ${this.primaryColor};
        box-shadow: 0 0 0 0.2rem ${this._hexToRgba(this.primaryColor, 0.25)};
      }
      
      .send-button {
        background-color: ${this.primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease-in-out;
        flex-shrink: 0;
      }
      
      .send-button:hover:not(:disabled) {
        background-color: ${this._darkenColor(this.primaryColor, 10)};
      }
      
      .send-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .send-button svg {
        width: 20px;
        height: 20px;
      }
      
      /* Typing indicator */
      .typing-indicator {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .typing-dots {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }
      
      .typing-dots .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #6c757d;
        animation: typing 1.4s infinite ease-in-out;
      }
      
      .typing-dots .dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dots .dot:nth-child(2) { animation-delay: -0.16s; }
      .typing-dots .dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      /* Streaming cursor */
      .streaming-cursor::after {
        content: '|';
        animation: blink 1s infinite;
        color: ${this.primaryColor};
        font-weight: bold;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      /* License footer */
      .license-footer {
        padding: 0.5rem 1rem;
        text-align: center;
        border-top: 1px solid #dee2e6;
        background-color: #f8f9fa;
      }
      
      .license-footer a {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: #6c757d;
        font-size: 0.75rem;
      }
      
      .license-footer img {
        width: 16px;
        height: 16px;
        margin-right: 0.25rem;
        object-fit: cover;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .chatbot-panel {
          width: calc(100vw - 48px);
          right: 24px;
          left: 24px;
        }
        
        .message-bubble {
          max-width: 85%;
        }
      }
    `;
    
    this.chatPanelShadow.appendChild(styles);
    

    const svg_question = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                          </svg>`;

    const svg_products = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"/>
</svg>`;

    // Crear el HTML del chat
    const chatHTML = `
      <div class="chatbot-panel" id="chatbot-panel">
        <div class="chat-header" id="chat-header">
          <div class="header-left">
            <img src="${this.bot.img}" alt="${this.bot.name}" class="bot-avatar">
            <h5 class="bot-name">${this.botName}</h5>
          </div>
          <div class="header-actions">
            ${this.products && this.products.length > 0 ? `
            <button type="button" class="dropdown-toggle" id="products-menu" title="Productos">
              ${svg_products}
            </button>
            ` : ''}
            ${this.apiFaqs && this.apiFaqs.length > 0 ? `
            <button type="button" class="dropdown-toggle" id="questions-menu" title="Preguntas Frecuentes">
              ${svg_question}
            </button>
            ` : ''}
            <div class="dropdown">
              <button type="button" class="dropdown-toggle" id="actions-menu" title="Acciones">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
              </button>
              <div class="dropdown-menu" id="dropdown-menu">
                <button class="dropdown-item" id="clear-history-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  ${this._getTranslation('clear_history')}
                </button>
                ${this.fullscreenEnabled ? `
                <button class="dropdown-item" id="fullscreen-toggle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
                  </svg>
                  ${this.isFullscreen ? this._getTranslation('minimize') : this._getTranslation('fullscreen')}
                </button>
                ` : ''}
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" id="chat-info-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  ${this._getTranslation('chat_info')}
                </button>
              </div>
            </div>
            <button type="button" class="btn-close" id="close-btn" aria-label="${this._getTranslation('close')}">×</button>
          </div>
        </div>
        
        <div class="messages-container" id="chat-messages"></div>
        
        <div class="chat-footer" id="chat-footer">
          <form class="chat-form" id="chat-form">
            <input
              type="text"
              class="chat-input"
              id="chat-input"
              placeholder="${this._getTranslation('write_message_placeholder')}"
              autocomplete="off"
              maxlength="${this.maxQuestionLength}"
            />
            <button
              type="submit"
              class="send-button"
              id="chat-send"
              disabled
            >
              ${this.sendButtonText && this.sendButtonText !== "" ? this.sendButtonText : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <g transform="rotate(90 12 12)">
                    <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clip-rule="evenodd"/>
                  </g>
                </svg>
              `}
            </button>
          </form>
        </div>
      </div>
    `;
    
    this.chatPanelShadow.innerHTML += chatHTML;
    document.body.appendChild(this.chatPanelContainer);
    
    // Configurar referencias a elementos
    this.chatPanel = this.chatPanelShadow.querySelector("#chatbot-panel");
    this.messagesContainer = this.chatPanelShadow.querySelector("#chat-messages");
    this.form = this.chatPanelShadow.querySelector("#chat-form");
    this.input = this.chatPanelShadow.querySelector("#chat-input");
    this.sendButton = this.chatPanelShadow.querySelector("#chat-send");
    this.closeBtn = this.chatPanelShadow.querySelector("#close-btn");
    this.clearHistoryBtn = this.chatPanelShadow.querySelector("#clear-history-btn");
   
    // Configurar event listeners
    this._setupChatEventListeners();
    
    // Renderizar el modal de confirmación
    this._renderConfirmationModal();
    
    // Actualizar el footer después de renderizar el panel
    this._updateFooter();
  }

  _setupChatEventListeners() {
    // Form submit
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._sendMessage();
    });

    // Input change
    this.input.addEventListener("input", () => {
      const currentLength = this.input.value.length;
      const maxLength = this.maxQuestionLength;
      
      // Deshabilitar botón si está vacío, cargando o excede el límite
      this.sendButton.disabled = this.input.value.trim() === "" || this.loading || currentLength > maxLength;
      
      // Mostrar indicador visual si se excede el límite
      if (currentLength > maxLength) {
        this.input.style.borderColor = '#ff4444';
        this.input.style.color = '#ff4444';
      } else {
        this.input.style.borderColor = '';
        this.input.style.color = '';
      }
    });

    // Close button
    this.closeBtn.addEventListener("click", () => this._hideChatPanel());

    // Clear history button
    this.clearHistoryBtn.addEventListener("click", () => this._showConfirmationModal());

    // Dropdown menu
    const actionsMenu = this.chatPanelShadow.querySelector("#actions-menu");
    const dropdownMenu = this.chatPanelShadow.querySelector("#dropdown-menu");

    const productsButton = this.chatPanelShadow.querySelector("#products-menu");
    if (productsButton) {
      productsButton.addEventListener('click', () => {
        this._showProductsModal();
      });
    }    

    const questionsButton = this.chatPanelShadow.querySelector("#questions-menu");
    if (questionsButton) {  
      questionsButton.addEventListener('click', () => {
        this._showFAQModal();
      });
    }

    if (actionsMenu && dropdownMenu) {
      actionsMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("show");
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (this.chatPanelShadow && !this.chatPanelShadow.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Fullscreen toggle
    if (this.fullscreenEnabled) {
      this.fullscreenToggle = this.chatPanelShadow.querySelector("#fullscreen-toggle");
      if (this.fullscreenToggle) {
        this.fullscreenToggle.addEventListener("click", () => {
          this._toggleFullscreen();
          if (dropdownMenu) {
            dropdownMenu.classList.remove("show");
          }
        });
      }
    }

    // Chat info button
    const chatInfoBtn = this.chatPanelShadow.querySelector("#chat-info-btn");
    if (chatInfoBtn) {
      chatInfoBtn.addEventListener("click", () => {
        this._showChatInfo();
        if (dropdownMenu) {
          dropdownMenu.classList.remove("show");
        }
      });
    }
  }

  _renderConfirmationModal() {
    // Crear contenedor del modal con Shadow DOM
    this.modalContainer = document.createElement("div");
    this.modalContainer.id = "chatbot-modal-container";
    
    // Crear Shadow DOM para el modal
    this.modalShadow = this.modalContainer.attachShadow({ mode: 'open' });
    
    // Estilos del modal
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1060;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-dialog {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        max-width: 500px;
        width: 90%;
        margin: 1.75rem auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.show .modal-dialog {
        transform: scale(1);
      }
      
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #dee2e6;
        border-radius: 0.5rem 0.5rem 0 0;
      }
      
      .modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #212529;
      }
      
      .modal-close {
        background: transparent;
        border: 0;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        opacity: 0.5;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: opacity 0.15s ease-in-out;
      }
      
      .modal-close:hover {
        opacity: 0.75;
      }
      
      .modal-body {
        padding: 1rem 1.5rem;
        color: #212529;
        line-height: 1.5;
      }
      
      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        border-radius: 0 0 0.5rem 0.5rem;
      }
      
      .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: 0.25rem;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        cursor: pointer;
        text-decoration: none;
      }
      
      .btn-secondary {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
      }
      
      .btn-secondary:hover {
        color: #fff;
        background-color: #5a6268;
        border-color: #545b62;
      }
      
      .btn-danger {
        color: #fff;
        background-color: #dc3545;
        border-color: #dc3545;
      }
      
      .btn-danger:hover {
        color: #fff;
        background-color: #c82333;
        border-color: #bd2130;
      }

      .border-0 {
        border: 0;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        border-radius: 0.2rem;
      }

      .rounded-pill {
        border-radius: 10rem;
      }

      .text-end {
        text-align: end;
      }
    `;
    
    this.modalShadow.appendChild(modalStyles);
    
    // HTML del modal
    const modalHTML = `
      <div class="modal-overlay" id="confirmation-modal">
        <div class="modal-dialog">
          <div class="modal-header border-0">
            <h5 class="modal-title">Confirmar eliminación</h5>
            <button type="button" class="modal-close" id="modal-close" aria-label="Cerrar">×</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que quieres eliminar todo el historial del chat? Esta acción no se puede deshacer.</p>
            <button type="button" class="btn btn-sm btn-danger text-end rounded-pill" id="confirm-clear-history">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    
    this.modalShadow.innerHTML += modalHTML;
    document.body.appendChild(this.modalContainer);
    
    // Event listeners del modal
    const modalOverlay = this.modalShadow.querySelector("#confirmation-modal");
    const modalClose = this.modalShadow.querySelector("#modal-close");
    const confirmButton = this.modalShadow.querySelector("#confirm-clear-history");
    
    modalClose.addEventListener("click", () => this._hideConfirmationModal());
    confirmButton.addEventListener("click", () => {
      this.clearHistory();
      this._hideConfirmationModal();
    });
    
    // Cerrar modal al hacer clic fuera
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        this._hideConfirmationModal();
      }
    });
    
    // Cerrar modal con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
        this._hideConfirmationModal();
      }
    });
  }

  _renderConfirmationModalBootstrap() {
    this.modal = document.createElement("div");
    this.modal.className = "modal fade";
    this.modal.tabIndex = -1;
    this.modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the entire chat history? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirm-clear-history">Delete</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);

    this.modal.querySelector("#confirm-clear-history").addEventListener("click", () => {
      this.clearHistory();
      this._hideConfirmationModal();
    });

    this.modal.addEventListener("hidden.bs.modal", () => {
      this._hideConfirmationModal();
    });
  }

  _showConfirmationModal() {
    if (this.modalShadow) {
      const modalOverlay = this.modalShadow.querySelector("#confirmation-modal");
      if (modalOverlay) {
        modalOverlay.classList.add("show");
      }
    } else {
      // Si el modal no está renderizado, renderizarlo primero
      this._renderConfirmationModal();
      setTimeout(() => {
        const modalOverlay = this.modalShadow.querySelector("#confirmation-modal");
        if (modalOverlay) {
          modalOverlay.classList.add("show");
        }
      }, 100);
    }
  }

  _hideConfirmationModal() {
    if (this.modalShadow) {
      const modalOverlay = this.modalShadow.querySelector("#confirmation-modal");
      if (modalOverlay) {
        modalOverlay.classList.remove("show");
      }
    }
  }

  _showChatInfo() {
    this._showChatInfoShadowDOM();
  }

  _showChatInfoShadowDOM() {
    // Crear contenedor del modal de información con Shadow DOM
    const infoModalContainer = document.createElement("div");
    infoModalContainer.id = "chatbot-info-modal-container";
    
    // Crear Shadow DOM para el modal de información
    const infoModalShadow = infoModalContainer.attachShadow({ mode: 'open' });
    
    // Estilos del modal de información
    const infoModalStyles = document.createElement('style');
    infoModalStyles.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1060;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-dialog {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        max-width: 400px;
        width: 90%;
        margin: 1.75rem auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.show .modal-dialog {
        transform: scale(1);
      }
      
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #dee2e6;
        border-radius: 0.5rem 0.5rem 0 0;
      }
      
      .modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #212529;
      }
      
      .modal-close {
        background: transparent;
        border: 0;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        opacity: 0.5;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: opacity 0.15s ease-in-out;
      }
      
      .modal-close:hover {
        opacity: 0.75;
      }
      
      .modal-body {
        padding: 1.5rem;
        text-align: center;
      }
      
      .bot-info {
        margin-bottom: 1rem;
      }
      
      .bot-title {
        font-size: 1rem;
        font-weight: 600;
        color: #212529;
        margin-bottom: 1rem;
      }
      
      .bot-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin: 0 auto 1rem;
        display: block;
        border: 3px solid #f8f9fa;
      }
      
      .bot-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #212529;
        margin-bottom: 0.5rem;
      }
      
      .bot-mode {
        font-size: 0.875rem;
        color: #6c757d;
        margin-bottom: 1rem;
      }
      
      .license-info {
        border-top: 1px solid #dee2e6;
        padding-top: 1rem;
        margin-top: 1rem;
      }
      
      .license-link {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: #6c757d;
        font-size: 0.875rem;
        transition: color 0.15s ease-in-out;
      }
      
      .license-link:hover {
        color: #495057;
      }
      
      .license-logo {
        width: 20px;
        height: 20px;
        object-fit: cover;
        margin-right: 0.5rem;
      }
    `;
    
    infoModalShadow.appendChild(infoModalStyles);
    
    // HTML del modal de información
    const infoModalHTML = `
      <div class="modal-overlay" id="info-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h5 class="modal-title">${this._getTranslation('chat_info')}</h5>
            <button type="button" class="modal-close" id="info-modal-close" aria-label="${this._getTranslation('close')}">×</button>
          </div>
          <div class="modal-body">
            <div class="bot-info">
              <div class="bot-title">Bot</div>
              <img src="${this.bot.img}" alt="${this.botName}" class="bot-avatar">
              <div class="bot-name">${this.botName}</div>
            </div>
            
            ${this.license.showFooter ? `
            <div class="license-info">
              <a href="${this.license.url}" target="_blank" class="license-link">
                <img src="${this.license.logo}" alt="${this.license.name}" class="license-logo">
                <span>Powered by ${this.license.name ?? ""}</span>
              </a>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    infoModalShadow.innerHTML += infoModalHTML;
    document.body.appendChild(infoModalContainer);
    
    // Mostrar el modal
    const modalOverlay = infoModalShadow.querySelector("#info-modal");
    modalOverlay.classList.add("show");
    
    // Event listeners
    const modalClose = infoModalShadow.querySelector("#info-modal-close");
    
    const closeModal = () => {
      modalOverlay.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(infoModalContainer);
      }, 300);
    };
    
    modalClose.addEventListener("click", closeModal);
    
    // Cerrar modal al hacer clic fuera
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
    
    // Cerrar modal con Escape
    const handleEscape = (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }

  _toggleFullscreen() {
    // Solo permitir pantalla completa si está habilitado
    if (!this.fullscreenEnabled) return;
    
    this.isFullscreen = !this.isFullscreen;
    this._updateChatPanelSize();
    
    // Actualizar ícono y texto del botón en el menú dropdown
    if (this.fullscreenToggle) {
      const iconSvg = this.isFullscreen ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9h4m0 0V5m0 4L4 4m15 5h-4m0 0V5m0 4 5-5M5 15h4m0 0v4m0-4-5 5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      `;
      
      this.fullscreenToggle.innerHTML = iconSvg + (this.isFullscreen ? this._getTranslation('minimize') : this._getTranslation('fullscreen'));
    }
  }

  _toggleChatPanel() {
    this.chatVisible = !this.chatVisible;
    
    // Verificar que el panel de chat existe
    if (!this.chatPanel) {
      this._log('_toggleChatPanel - Panel de chat no renderizado, renderizando...');
      this._renderChatPanel();
    }
    
    // En móviles, abrir automáticamente en pantalla completa
    if (this.chatVisible && this.isMobile) {
      this.isFullscreen = true;
    } else if (!this.chatVisible && this.isMobile) {
      // Al cerrar en móviles, resetear el estado de pantalla completa
      this.isFullscreen = false;
    }
    
    this.chatPanel.style.display = this.chatVisible ? "flex" : "none";

    // Actualizar el tamaño del panel
    this._updateChatPanelSize();
    
    if (this.chatVisible) {
      this.input.focus();
      // Iniciar temporizador cuando se abre el chat (si hay mensajes y no estamos en registro)
      if (this.messages.length > 0 && !this.registrationScreen && (this.testMode || this.registrationCompleted)) {
        this._startReminderTimer();
      }
    } else {
      // Limpiar temporizador cuando se cierra el chat
      this._clearReminderTimer();
    }
  }

  _hideChatPanel() {
    this.chatVisible = false;
    this.chatPanel.style.display = "none";
 
    if (this.isFullscreen) {
      this.isFullscreen = false;
      this._updateChatPanelSize();
    }
  }

  _addInitialMessage() {
    // Verificar si ya existe un mensaje inicial en el historial
    const hasInitialMessage = this.messages.some(msg => 
      msg.from === "bot" && 
      (msg.text === this.saludoInicial || 
       msg.text.includes("estoy aquí para ayudarte") ||
       (this.testMode && this._getTestMessages().welcome.includes(msg.text)))
    );
    
    // Si ya existe el mensaje inicial, no agregarlo nuevamente
    if (hasInitialMessage) {
      this._log('_addInitialMessage - Mensaje inicial ya existe en el historial, omitiendo');
      return;
    }
    
    let message;
    
    if (this.testMode) {
      // En modo test, usar mensaje de bienvenida traducido
      const testMessages = this._getTestMessages();
      message = testMessages.welcome[Math.floor(Math.random() * testMessages.welcome.length)];
    } else {
      // Mensaje normal para modo producción
      message = this.saludoInicial || this._getTranslation('welcome_message');
    }
    
    this._log('_addInitialMessage - Agregando mensaje inicial:', message);
    this._addMessage("bot", message);

    // Reproducir sonido de notificación en el primer mensaje del bot
    this._playNotificationSound();
  }

  _addMessage(from, text, isRegistration = false) {
    const time = this._getCurrentTime();
    const message = { from, text, time, isRegistration };
    this.messages.push(message);

    // Si es un mensaje del usuario, actualizar el tiempo y limpiar temporizador
    if (from === "user") {
      this.lastUserMessageTime = Date.now();
      this._clearReminderTimer();
      this._log('_addMessage - Mensaje del usuario, temporizador limpiado');
    }
    
    // Si es un mensaje del bot, iniciar temporizador de recordatorio
    if (from === "bot" && !isRegistration && !this.registrationScreen) {
      // Pequeño delay para asegurar que el mensaje se haya renderizado completamente
      setTimeout(() => {
        this._startReminderTimer();
        this._log('_addMessage - Mensaje del bot completado, temporizador iniciado');
      }, 100);
    }

    // Renderizar todos los mensajes para evitar duplicados
    this._renderMessages();
    
    // Verificar si el mensaje contiene enlaces y mostrar advertencia
    this._checkMessageForLinks(text);
    
    // Guardar sesión en cache después de cada mensaje
    this._saveSessionToCache();
  }

  _checkMessageForLinks(text) {
    // Detectar enlaces en el texto (URLs y enlaces Markdown)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    let urls = [];
    
    // Buscar URLs directas
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[1]);
    }
    
    // Buscar enlaces Markdown
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      urls.push(match[2]);
    }
    
    // Si se encontraron enlaces, mostrar advertencia para el primero
    if (urls.length > 0) {
      this._log('_checkMessageForLinks - Enlaces detectados:', urls);
      // Pequeño delay para asegurar que el mensaje se haya renderizado
      setTimeout(() => {
        this._showLinkWarningModal(urls[0]);
      }, 500);
    }
  }

  _createMessageElement(msg) {
    // Si es mensaje de bienvenida, renderizar de forma especial
    if (msg.isWelcome) {
      const welcomeWrapper = document.createElement("div");
      welcomeWrapper.style.textAlign = "center";
      welcomeWrapper.style.marginBottom = "1rem";
      welcomeWrapper.style.marginTop = "20px";
      
      const botImage = document.createElement("img");
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
      botImage.style.width = "80px";
      botImage.style.height = "80px";
      botImage.style.objectFit = "cover";
      botImage.style.margin = "0 auto 1rem";
      botImage.style.display = "block";
      botImage.style.borderRadius = "50%";
      
      const welcomeText = document.createElement("div");
      welcomeText.style.backgroundColor = "#f8f9fa";
      welcomeText.style.borderRadius = "0.5rem";
      welcomeText.style.padding = "1rem";
      welcomeText.style.maxWidth = "80%";
      welcomeText.style.margin = "0 auto";
      welcomeText.innerHTML = `
        <p style="margin: 0; font-weight: 600; color: #000000;">${this.botName}</p>
        <p style="margin: 0.5rem 0 0; color: #000000;">${this._parseMarkdown(msg.text)}</p>
      `;
      
      welcomeWrapper.appendChild(botImage);
      welcomeWrapper.appendChild(welcomeText);
      
      // Agregar botones si es mensaje de bienvenida avanzado
      if (msg.showWelcomeButtons) {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.marginTop = "1rem";
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.flexDirection = "column";
        buttonsContainer.style.gap = "0.5rem";
        buttonsContainer.style.alignItems = "center";
        
        // Botón de Preguntas Frecuentes
        const faqButton = document.createElement("button");
        if (this.apiFaqs && this.apiFaqs.length > 0) {
          faqButton.style.backgroundColor = this.primaryColor;
          faqButton.style.color = "white";
          faqButton.style.border = "none";
          faqButton.style.borderRadius = "1.5rem";
          // faqButton.style.padding = "0.75rem 1.5rem";
          faqButton.style.padding = "0.75rem 0rem";
          faqButton.style.cursor = "pointer";
          faqButton.style.fontSize = "0.9rem";
          faqButton.style.fontWeight = "500";
          faqButton.style.minWidth = "200px";
          faqButton.style.transition = "all 0.3s ease";
          faqButton.innerHTML = "Preguntas Frecuentes";
          
          faqButton.addEventListener('mouseenter', () => {
            faqButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
            faqButton.style.transform = "translateY(-2px)";
          });
          
          faqButton.addEventListener('mouseleave', () => {
            faqButton.style.backgroundColor = this.primaryColor;
            faqButton.style.transform = "translateY(0)";
          });
          
          faqButton.addEventListener('click', () => {
            this._showFAQModal();
          });
        }
        
        // Botón de Productos (solo mostrar si hay productos disponibles)
        const productsButton = document.createElement("button");
        if (this.products && this.products.length > 0) {
          productsButton.style.backgroundColor = "#ff6b35";
          productsButton.style.color = "white";
          productsButton.style.border = "none";
          productsButton.style.borderRadius = "1.5rem";
          productsButton.style.padding = "0.75rem 1.5rem";
          productsButton.style.cursor = "pointer";
          productsButton.style.fontSize = "0.9rem";
          productsButton.style.fontWeight = "500";
          productsButton.style.minWidth = "300px";
          productsButton.style.maxWidth = "450px";
          productsButton.style.transition = "all 0.3s ease";
          productsButton.innerHTML = "Ver Productos";
          
          productsButton.addEventListener('mouseenter', () => {
            productsButton.style.backgroundColor = "#e55a2b";
            productsButton.style.transform = "translateY(-2px)";
          });
          
          productsButton.addEventListener('mouseleave', () => {
            productsButton.style.backgroundColor = "#ff6b35";
            productsButton.style.transform = "translateY(0)";
          });
          
          productsButton.addEventListener('click', () => {
            this._showProductsModal();
          });
          
          buttonsContainer.appendChild(productsButton);
        }
        
        // Botón de Iniciar Chat
        const chatButton = document.createElement("button");
        chatButton.style.backgroundColor = this.primaryColor;
        chatButton.style.color = "white";
        chatButton.style.border = "none";
        chatButton.style.borderRadius = "1.5rem";
        chatButton.style.padding = "0.75rem 1.5rem";
        chatButton.style.cursor = "pointer";
        chatButton.style.fontSize = "0.9rem";
        chatButton.style.fontWeight = "500";
        chatButton.style.minWidth = "200px";
        chatButton.style.transition = "all 0.3s ease";
        chatButton.innerHTML = "Iniciar Conversación";

        if (!this.products || this.products.length === 0) {
          if (this.isFullscreen && this.isMobile) {
            chatButton.style.minWidth = "200px";
            chatButton.style.maxWidth = "300px";
          } else {
            chatButton.style.minWidth = "300px";
            chatButton.style.maxWidth = "450px";
          }
        }
        
        chatButton.addEventListener('mouseenter', () => {
          chatButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
          chatButton.style.transform = "translateY(-2px)";
        });
        
        chatButton.addEventListener('mouseleave', () => {
          chatButton.style.backgroundColor = this.primaryColor;
          chatButton.style.transform = "translateY(0)";
        });
        
        chatButton.addEventListener('click', () => {
          this._startNormalChat();
        });
        
        if (this.apiFaqs && this.apiFaqs.length > 0) {  
          buttonsContainer.appendChild(faqButton);
        }
        if (this.products && this.products.length > 0) {
          buttonsContainer.appendChild(productsButton);
        }
        buttonsContainer.appendChild(chatButton); 
        welcomeWrapper.appendChild(buttonsContainer);
      }
      
      // Agregar botones si es mensaje de opciones después del nombre
      if (msg.showOptionsButtons) {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.marginTop = "1rem";
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.flexDirection = "column";
        buttonsContainer.style.gap = "0.5rem";
        buttonsContainer.style.alignItems = "center";
        
        // Botón de Preguntas Frecuentes
        const faqButton = document.createElement("button");
        faqButton.style.backgroundColor = this.primaryColor;
        faqButton.style.color = "white";
        faqButton.style.border = "none";
        faqButton.style.borderRadius = "1.5rem";
        faqButton.style.padding = "0.75rem 1.5rem";
        faqButton.style.cursor = "pointer";
        faqButton.style.fontSize = "0.9rem";
        faqButton.style.fontWeight = "500";
        faqButton.style.minWidth = "200px";
        faqButton.style.transition = "all 0.3s ease";
        faqButton.innerHTML = "Preguntas Frecuentes";
        
        faqButton.addEventListener('mouseenter', () => {
          faqButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
          faqButton.style.transform = "translateY(-2px)";
        });
        
        faqButton.addEventListener('mouseleave', () => {
          faqButton.style.backgroundColor = this.primaryColor;
          faqButton.style.transform = "translateY(0)";
        });
        
        faqButton.addEventListener('click', () => {
          this._showFAQModal();
        });
        
        // Botón de Iniciar Chat
        const chatButton = document.createElement("button");
        chatButton.style.backgroundColor = "#28a745";
        chatButton.style.color = "white";
        chatButton.style.border = "none";
        chatButton.style.borderRadius = "1.5rem";
        chatButton.style.padding = "0.75rem 1.5rem";
        chatButton.style.cursor = "pointer";
        chatButton.style.fontSize = "0.9rem";
        chatButton.style.fontWeight = "500";
        chatButton.style.minWidth = "200px";
        chatButton.style.transition = "all 0.3s ease";
        chatButton.innerHTML = "Iniciar Chat";
        
        chatButton.addEventListener('mouseenter', () => {
          chatButton.style.backgroundColor = "#218838";
          chatButton.style.transform = "translateY(-2px)";
        });
        
        chatButton.addEventListener('mouseleave', () => {
          chatButton.style.backgroundColor = "#28a745";
          chatButton.style.transform = "translateY(0)";
        });
        
        chatButton.addEventListener('click', () => {
          this._startNormalChat();
        });
        
        buttonsContainer.appendChild(faqButton);
        buttonsContainer.appendChild(chatButton);
        welcomeWrapper.appendChild(buttonsContainer);
      }
      
      return welcomeWrapper;
    }

    // Si es mensaje de límite alcanzado, renderizar de forma especial
    if (msg.isLimitReached) {
      const limitWrapper = document.createElement("div");
      limitWrapper.style.textAlign = "center";
      limitWrapper.style.marginBottom = "1rem";
      limitWrapper.style.marginTop = "20px";
      
      const limitText = document.createElement("div");
      limitText.style.backgroundColor = "#fff3cd";
      limitText.style.border = "1px solid #ffeaa7";
      limitText.style.borderRadius = "0.5rem";
      limitText.style.padding = "1rem";
      limitText.style.maxWidth = "90%";
      limitText.style.margin = "0 auto";
      limitText.style.color = "#856404";
      limitText.innerHTML = `
        <p style="margin: 0; font-weight: 600; font-size: 1.1rem;">⚠️ ${this._getTranslation('limit_reached_placeholder')}</p>
        <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">${this._parseMarkdown(msg.text)}</p>
        <p style="margin: 0.5rem 0 0; font-size: 0.8rem; opacity: 0.8;">${this._getTranslation('limit_reached_message')}</p>
      `;
      
      limitWrapper.appendChild(limitText);
      return limitWrapper;
    }

    // Si es mensaje de error con reintento, renderizar de forma especial
    if (msg.isError && msg.showRetry) {
      const errorWrapper = document.createElement("div");
      errorWrapper.style.textAlign = "center";
      errorWrapper.style.marginBottom = "1rem";
      errorWrapper.style.marginTop = "20px";
      
      const botImage = document.createElement("img");
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
      botImage.style.width = "60px";
      botImage.style.height = "60px";
      botImage.style.objectFit = "cover";
      botImage.style.margin = "0 auto 1rem";
      botImage.style.display = "block";
      botImage.style.borderRadius = "50%";
      
      const errorText = document.createElement("div");
      errorText.style.backgroundColor = "#f8f9fa";
      errorText.style.borderRadius = "0.5rem";
      errorText.style.padding = "1rem";
      errorText.style.maxWidth = "90%";
      errorText.style.margin = "0 auto";
      errorText.innerHTML = `
        <p style="margin: 0; font-weight: 600; color: #dc3545;">${this.botName}</p>
        <p style="margin: 0.5rem 0 0; font-size: 0.875rem;">${msg.text}</p>
      `;
      
      const retryButton = document.createElement("button");
      retryButton.style.backgroundColor = this.primaryColor;
      retryButton.style.color = "white";
      retryButton.style.border = "none";
      retryButton.style.borderRadius = "1.5rem";
      retryButton.style.padding = "0.5rem 1rem";
      retryButton.style.marginTop = "1rem";
      retryButton.style.cursor = "pointer";
      retryButton.style.fontSize = "0.875rem";
      retryButton.textContent = this._getTranslation('error_message');
      retryButton.addEventListener("click", () => {
        this._retryConnection();
      });
      
      errorWrapper.appendChild(botImage);
      errorWrapper.appendChild(errorText);
      errorWrapper.appendChild(retryButton);
      return errorWrapper;
    }
    
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `message ${msg.from}`;

    const avatar = document.createElement("img");
    avatar.src = msg.from === "user" ? this.user.photo : this.bot.img;
    avatar.alt = msg.from === "user" ? this.user.name : this.bot.name;
    avatar.className = "message-avatar";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const info = document.createElement("div");
    info.className = "message-info";
    info.innerHTML = `${msg.from === "user" ? this.user.name : this.botName}${this.showTime ? `<span class="message-time">${msg.time}</span>` : ""}`;

    const textP = document.createElement("div");
    textP.className = "message-text";
    
    // Si es un mensaje con streaming, agregar clases especiales
    if (msg.isStreaming) {
      textP.classList.add('streaming-cursor');
      //textP.style.borderLeft = `3px solid ${this.primaryColor}`;
      textP.style.paddingLeft = '10px';
      textP.style.background = `linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%)`;
    }
    
    textP.innerHTML = this._parseMarkdown(msg.text);
    
    // Interceptar clics en enlaces dentro del contenido del mensaje
    const links = textP.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.href;
        this._showLinkWarningModal(url);
      });
      
      // Agregar estilo visual para indicar que es clickeable
      link.style.color = this.primaryColor;
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';
    });

    bubble.appendChild(info);
    bubble.appendChild(textP);

    msgWrapper.appendChild(avatar);
    msgWrapper.appendChild(bubble);
    return msgWrapper;
  }

  _renderMessages() {
    const frag = document.createDocumentFragment();
    this.messagesContainer.innerHTML = "";

    this.messages.forEach((msg) => {
      const messageElement = this._createMessageElement(msg);
      frag.appendChild(messageElement);
    });

    this.messagesContainer.appendChild(frag);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;


    

  }

  _hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  _updateFooter() {
    if (!this.chatPanel) return;
    
    // Verificar que license existe
    if (!this.license) {
      this.license = {
        name: "",
        logo: "",
        active: true,
        showFooter: false,
      };
    }
    
    // Buscar el footer existente
    let footer = this.chatPanel.querySelector('.license-footer');
    
    // Si showFooter es true y no existe el footer, crearlo
    if (this.license.showFooter && !footer) {
      footer = document.createElement('div');
      footer.className = 'license-footer';
      footer.innerHTML = `
        <a href="${this.license.url}" target="_blank">
          <img src="${this.license.logo}" alt="${this.license.name}" class="license-logo">
          <span>Powered by ${this.license.name ?? ""}</span>
        </a>
      `;
      this.chatPanel.appendChild(footer);
    }
    // Si showFooter es false y existe el footer, eliminarlo
    else if (!this.license.showFooter && footer) {
      footer.remove();
    }
    // Si showFooter es true y existe el footer, actualizar su contenido
    else if (this.license.showFooter && footer) {
      footer.innerHTML = `
        <a href="${this.license.url}" target="_blank">
          <img src="${this.license.logo}" alt="${this.license.name}" class="license-logo">
          <span>Powered by ${this.license.name ?? ""}</span>
        </a>
      `;
    }
  }

  _updateFooterBootstrap() {
    if (!this.chatPanel) return;
    
    // Verificar que license existe
    if (!this.license) {
      this.license = {
        name: "",
        logo: "",
        active: true,
        showFooter: false,
      };
    }
    
    // Buscar el footer existente
    let footer = this.chatPanel.querySelector('.license-footer');
    
    // Si showFooter es true y no existe el footer, crearlo
    if (this.license.showFooter && !footer) {
      footer = document.createElement('div');
      footer.className = 'license-footer';
      footer.innerHTML = `
        <div class="d-flex justify-content-center">
          <small class="text-muted text-center my-3 px-2" style="font-size: 10px;">
            <a href="${this.license.url}" target="_blank">
              <img class="me-2" src="${this.license.logo}" alt="${this.license.name}" style="width: 20px; height: 20px; object-fit: cover;">
              <span class="text-muted">Powered by ${this.license.name ?? ""}</span>
            </a>
          </small>
        </div>
      `;
      this.chatPanel.appendChild(footer);
    }
    // Si showFooter es false y existe el footer, eliminarlo
    else if (!this.license.showFooter && footer) {
      footer.remove();
    }
    // Si showFooter es true y existe el footer, actualizar su contenido
    else if (this.license.showFooter && footer) {
      footer.innerHTML = `
        <small class="text-muted text-center my-3 px-2" style="font-size: 10px;">
          <a href="${this.license.url}" target="_blank">
            <img class="me-2" src="${this.license.logo}" alt="${this.license.name}" style="width: 20px; height: 20px; object-fit: cover;">
            <span class="text-muted">Powered by ${this.license.name ?? ""}</span>
          </a>
        </small>
      `;
    }
  }

  _updateBotUI() {
    if (!this.chatPanel) return;
    
    // Actualizar imagen del bot en el header
    const botImage = this.chatPanel.querySelector('.bot-avatar');
    if (botImage) {
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
    }
    
    // Actualizar nombre del bot en el header
    const botNameElement = this.chatPanel.querySelector('.bot-name');
    if (botNameElement) {
      botNameElement.textContent = this.botName;
    }
    
    // Actualizar imagen del botón flotante
    if (this.floatingBtn) {
      // Verificar si hay un iconButton personalizado
      if (this.iconButton && this.iconButton !== this.bot.img) {
        this.floatingBtn.innerHTML = `<img src="${this.iconButton}" alt="Chat" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg xmlns=\\"http://www.w3.org/2000/svg\\" fill=\\"white\\" viewBox=\\"0 0 24 24\\"><path d=\\"M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z\\"/></svg>'; this.parentElement.style.backgroundColor='${this.primaryColor}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center';">`;
      } else {
        this.floatingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
      }
    }
    
    // Re-renderizar mensajes para actualizar las imágenes del bot
    this._renderMessages();
  }

  _updateBotUIBootstrap() {
    if (!this.chatPanel) return;
    
    // Actualizar imagen del bot en el header
    const botImage = this.chatPanel.querySelector('.card-header img');
    if (botImage) {
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
    }
    
    // Actualizar nombre del bot en el header
    const botNameElement = this.chatPanel.querySelector('.card-header h5');
    if (botNameElement) {
      botNameElement.textContent = this.botName;
    }
    
    // Actualizar imagen del botón flotante
    if (this.floatingBtn) {
      // Verificar si hay un iconButton personalizado
      if (this.iconButton && this.iconButton !== this.bot.img) {
        this.floatingBtn.innerHTML = `<img src="${this.iconButton}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<svg xmlns=\\"http://www.w3.org/2000/svg\\" fill=\\"white\\" width=\\"${this.isMobile ? '48' : '24'}\\" height=\\"${this.isMobile ? '48' : '24'}\\" viewBox=\\"0 0 24 24\\"><path d=\\"M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z\\"/></svg>'; this.parentElement.style.backgroundColor='${this.primaryColor}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center';">`;
      } else {
        const iconSize = this.isMobile ? "48" : "24";
        this.floatingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
      }
    }
    
    // Re-renderizar mensajes para actualizar las imágenes del bot
    this._renderMessages();
  }

  async _sendMessage() {
    const msg = this.input.value.trim();
    if (!msg || this.loading) return;
    
    // Validar longitud del mensaje
    if (msg.length > this.maxQuestionLength) {
      this._log('_sendMessage - Mensaje excede el límite de caracteres:', msg.length, '>', this.maxQuestionLength);
      return;
    }

    // Verificar si estamos en la pantalla de registro con botones
    if (this.registrationScreen && this.messages.some(msg => msg.showWelcomeButtons)) {
      this._log('_sendMessage - En pantalla de registro con botones, ignorando mensaje de texto');
      return;
    }

    // Debug: Log del estado actual
    this._log('_sendMessage - Estado actual:', {
      register: this.register,
      registered: this.registered,
      registrationScreen: this.registrationScreen,
      registrationCompleted: this.registrationCompleted,
      advancedOnboarding: this.advancedOnboarding,
      onboardingStep: this.onboardingStep,
      testMode: this.testMode,
      stream: this.stream,
      message: msg
    });

    this._addMessage("user", msg);
    this.input.value = "";
    this.sendButton.disabled = true;

    this.loading = true;
    
    // Mostrar indicador de "está escribiendo..."
    this._showTypingIndicator();

    try {
      // Si está en modo test, usar respuestas automáticas
      if (this.testMode) {
        this._log('_sendMessage - Usando modo test');
        await this._handleTestResponse(msg);
      } else {
        // Verificar si estamos en onboarding avanzado
        if (this.advancedOnboarding) {
          this._log('_sendMessage - Procesando onboarding avanzado');
          await this._handleAdvancedOnboardingResponse(msg);
        } else if (this.registrationScreen && !this.registrationCompleted) {
          this._log('_sendMessage - Procesando registro en pantalla de registro');
          await this._handleRegistrationResponse(msg);
        } else if (this.registered && this.registrationCompleted) {
          // Envío normal de mensaje solo si está registrado y completado
          this._log('_sendMessage - Enviando mensaje al API');
          const answer = await this._sendMessageToAPI(msg);
          
          // Si la respuesta es null, significa que el servidor indicó límite alcanzado
          if (answer === null) {
            this._log('_sendMessage - Respuesta null, límite alcanzado');
            return; // No mostrar respuesta normal
          }
          
          // Si streaming está habilitado, mostrar el texto carácter por carácter
          if (this.stream) {
            // Ocultar el indicador de typing antes de mostrar el streaming
            this._hideTypingIndicator();
            await this._displayMessageWithStreaming(answer);
          } else {
            // Ocultar el indicador de typing y mostrar el mensaje completo
            this._hideTypingIndicator();
            this._addMessage("bot", answer);
          }
        } else {
          // Si no está registrado y no está en modo registro, mostrar mensaje de error
          this._log('_sendMessage - Usuario no registrado');
          this._addMessage("bot", this._getTranslation('registration_required'));
        }
      }
    } catch (error) {
      this._logError('Error enviando mensaje:', error);
      this._addMessage("bot", this._getTranslation('error_message'));
    } finally {
      this.loading = false;
      this.sendButton.disabled = false;
      // Ocultar indicador de "está escribiendo..."
      this._hideTypingIndicator();
      
      // El temporizador se iniciará después de que termine el streaming
      // No se inicia aquí para evitar conflictos con el streaming
      if (this.testMode || this.registrationCompleted) {
        this.input.focus();
      }
    }
  }

  // Nuevo método para simular streaming de texto
  async _displayMessageWithStreaming(text) {
    this._log('_displayMessageWithStreaming - Iniciando simulación de streaming');
    
    // Crear mensaje vacío inicial
    const streamingMessage = {
      from: "bot",
      text: "",
      time: this._getCurrentTime(),
      isStreaming: true
    };
    
    this.messages.push(streamingMessage);
    this._renderMessages();
    
    // Obtener el elemento del mensaje para actualizarlo
    const messageElement = this.messagesContainer.lastElementChild;
    let textElement = messageElement.querySelector('.message-text');
  
    // Simular typing carácter por carácter
    let currentText = "";
    const characters = text.split('');
    
    for (let i = 0; i < characters.length; i++) {
      currentText += characters[i];
      streamingMessage.text = currentText;
      
      // Actualizar el elemento en el DOM
      if (textElement) {
        textElement.innerHTML = this._parseMarkdown(currentText);
      }
      
      // Scroll al final del contenedor
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      // Delay aleatorio entre 10-30ms para simular typing humano (más rápido)
      const delay = Math.random() * 20 + 10;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Streaming completado
    streamingMessage.isStreaming = false;
    this._renderMessages();
    
    // Iniciar temporizador de recordatorio después de que termine el streaming
    if (!this.registrationScreen && (this.testMode || this.registrationCompleted)) {
      setTimeout(() => {
        this._startReminderTimer();
        this._log('_displayMessageWithStreaming - Streaming completado, temporizador iniciado');
      }, 100);
    }
    
    this._log('_displayMessageWithStreaming - Streaming completado');
  }

  _showTypingIndicator() {
    // Crear el elemento de "está escribiendo..."
    this.typingIndicator = document.createElement("div");
    this.typingIndicator.className = "typing-indicator";
    this.typingIndicator.style.display = "flex";
    this.typingIndicator.style.alignItems = "center";
    this.typingIndicator.style.marginBottom = "1rem";
    this.typingIndicator.style.justifyContent = "flex-start";
    
    // Avatar del bot
    const avatar = document.createElement("img");
    avatar.src = this.bot.img;
    avatar.alt = this.bot.name;
    avatar.className = "message-avatar";
    
    // Contenedor del mensaje
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-bubble";
    messageContainer.style.maxWidth = "70%";
    
    // Texto "está escribiendo..."
    const typingText = document.createElement("div");
    typingText.className = "typing-dots";
    typingText.style.display = "inline-flex";
    typingText.style.alignItems = "center";
    typingText.style.gap = "2px";
    
    // Crear los puntos animados
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #6c757d;
        animation: typing 1.4s infinite ease-in-out;
        animation-delay: ${-0.32 + i * 0.16}s;
      `;
      typingText.appendChild(dot);
    }
    
    // Agregar estilos de animación al Shadow DOM
    const typingStyles = document.createElement("style");
    typingStyles.textContent = `
      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    
    // Agregar estilos al Shadow DOM del panel de chat
    if (this.chatPanelShadow) {
      this.chatPanelShadow.appendChild(typingStyles);
    }
    
    messageContainer.appendChild(typingText);
    this.typingIndicator.appendChild(avatar);
    this.typingIndicator.appendChild(messageContainer);
    
    // Agregar al contenedor de mensajes
    this.messagesContainer.appendChild(this.typingIndicator);
    
    // Hacer scroll hacia abajo
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  _showTypingIndicatorBootstrap() {
    // Crear el elemento de "está escribiendo..."
    this.typingIndicator = document.createElement("div");
    this.typingIndicator.className = "typing-indicator d-flex align-items-center mb-3";
    this.typingIndicator.style.justifyContent = "flex-start";
    
    // Avatar del bot
    const avatar = document.createElement("img");
    avatar.src = this.bot.img;
    avatar.alt = this.bot.name;
    avatar.className = "rounded-circle me-2";
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    avatar.style.objectFit = "cover";
    
    // Contenedor del mensaje
    const messageContainer = document.createElement("div");
    messageContainer.className = "bg-light rounded-3 p-3";
    messageContainer.style.maxWidth = "70%";
    
    // Texto "está escribiendo..."
    const typingText = document.createElement("div");
    typingText.className = "d-flex align-items-center";
    
    typingText.innerHTML = `
    <div class="typing-dots ms-2">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;
    
    // Estilos para los puntos animados y dropdown personalizado
    const dotsStyle = document.createElement("style");
    dotsStyle.textContent = `
      .typing-dots {
        display: inline-flex;
        align-items: center;
      }
      .typing-dots .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #6c757d;
        margin: 0 1px;
        animation: typing 1.4s infinite ease-in-out;
      }
      .typing-dots .dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dots .dot:nth-child(2) { animation-delay: -0.16s; }
      .typing-dots .dot:nth-child(3) { animation-delay: 0s; }
      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#typing-dots-style')) {
      dotsStyle.id = 'typing-dots-style';
      document.head.appendChild(dotsStyle);
    }
    
    messageContainer.appendChild(typingText);
    this.typingIndicator.appendChild(avatar);
    this.typingIndicator.appendChild(messageContainer);
    
    // Agregar al contenedor de mensajes
    this.messagesContainer.appendChild(this.typingIndicator);
    
    // Hacer scroll hacia abajo
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  // Nuevo método para ocultar indicador de "está escribiendo..."
  _hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.remove();
      this.typingIndicator = null;
    }
  }

  // Nuevo método para manejar respuestas en modo test
  async _handleTestResponse(userMessage) {
    this._log('_handleTestResponse - Procesando mensaje de test:', userMessage);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    let response = "";
    
    // Obtener mensajes de test traducidos
    const testMessages = this._getTestMessages();
    
    // Lógica de respuesta basada en el mensaje del usuario
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = testMessages.greetings[Math.floor(Math.random() * testMessages.greetings.length)];
    } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('help') || lowerMessage.includes('qué puedes hacer')) {
      response = testMessages.help[Math.floor(Math.random() * testMessages.help.length)];
    } else if (lowerMessage.includes('curiosidad') || lowerMessage.includes('dato') || lowerMessage.includes('interesante')) {
      response = testMessages.curiosities[Math.floor(Math.random() * testMessages.curiosities.length)];
    } else {
      response = testMessages.unknown[Math.floor(Math.random() * testMessages.unknown.length)];
    }
    
    // Si streaming está habilitado, mostrar el texto carácter por carácter
    if (this.stream) {
      // Ocultar el indicador de typing antes de mostrar el streaming
      this._hideTypingIndicator();
      await this._displayMessageWithStreaming(response);
    } else {
      // Ocultar el indicador de typing y mostrar el mensaje completo
      this._hideTypingIndicator();
      this._addMessage("bot", response);
    }
    
    this._log('_handleTestResponse - Respuesta generada:', response);
  }

  // Nuevo método para verificar el estado de registro
  _checkRegistrationStatus() {
    this._log('_checkRegistrationStatus - Verificando estado de registro');
    this._log('_checkRegistrationStatus - onboardingTemplate:', this.onboardingTemplate);
    this._log('_checkRegistrationStatus - testMode:', this.testMode);
    this._log('_checkRegistrationStatus - registered:', this.registered);
    
    // Verificar si debe usar onboarding avanzado
    if (this.onboardingTemplate === 'advanced') {
      this._log('_checkRegistrationStatus - Usando onboarding avanzado');
      this._showAdvancedOnboarding();
      return;
    }
    
    // Condiciones para mostrar pantalla de registro (onboarding básico):
    // 1. Cuando register es true
    // 2. Cuando register es true o el nombre del usuario no existe
    // 3. Cuando register es true o el usuario no existe
    const shouldShowRegistration = this.register || 
                                 !this.user.name || 
                                 this.user.name === "Usuario" ||
                                 !this.registered;

    if (shouldShowRegistration && this.session) {
      this._log('_checkRegistrationStatus - Mostrando pantalla de registro');
      this._showRegistrationScreen();
    } else if (this.session) {
      this._log('_checkRegistrationStatus - Mostrando chat normal');
      this._showChatScreen();
    } else {
      this._log('_checkRegistrationStatus - No hay sesión, mostrando error');
      this._showBotInfoWithRetry();
    }
  }

  // Nuevo método para mostrar la pantalla de registro
  _showRegistrationScreen() {
    this._log('_showRegistrationScreen - Mostrando pantalla de registro');
    this.registrationScreen = true;
    this.registrationCompleted = false;
    
    // Limpiar mensajes anteriores
    this.messages = [];
    
    // Verificar si los elementos del DOM están inicializados
    if (this.input && this.sendButton) {
      // Deshabilitar el chat completamente - el usuario debe elegir una opción
      this.input.disabled = true;
      this.sendButton.disabled = true;
    }
    
    // Mostrar pantalla de bienvenida con imagen del bot y botones de opciones
    const welcomeMessage = {
      from: "bot",
      text: this._getTranslation('registration_name_prompt'),
      time: this._getCurrentTime(),
      isWelcome: true,
      isRegistration: true,
      showWelcomeButtons: true // Mostrar los dos botones
    };
    
    this.messages.push(welcomeMessage);
    
    // Solo renderizar si el contenedor existe
    if (this.messagesContainer) {
      this._renderMessages();
    }
    
    // El input permanece deshabilitado hasta que el usuario seleccione una opción
    if (this.input) {
      this.input.placeholder = "Selecciona una opción para continuar...";
    }
  }

  // Nuevo método para mostrar la pantalla de chat normal
  _showChatScreen() {
    this._log('_showChatScreen - Mostrando pantalla de chat');
    this.registrationScreen = false;
    this.registrationCompleted = true;
    
    // Verificar si los elementos del DOM están inicializados
    if (this.input && this.sendButton) {
      // Restaurar el placeholder original del input
      this.input.placeholder = "Escribe un mensaje...";
      
      // Habilitar el chat
      this.input.disabled = false;
      this.sendButton.disabled = false;
      this.input.focus();
    }
    
    // Mostrar mensaje inicial del bot
    this._addInitialMessage();
  }

  // Método para mostrar el onboarding avanzado
  _showAdvancedOnboarding() {
    this._log('_showAdvancedOnboarding - Iniciando onboarding avanzado');
    this._log('_showAdvancedOnboarding - Estado inicial:', {
      advancedOnboarding: this.advancedOnboarding,
      onboardingStep: this.onboardingStep,
      messages: this.messages.length
    });
    this.advancedOnboarding = true;
    this.onboardingStep = 0;
    
    // Limpiar mensajes anteriores
    this.messages = [];
    
    // Deshabilitar el input inicialmente
    if (this.input && this.sendButton) {
      this.input.disabled = true;
      this.sendButton.disabled = true;
    }
    
    // Mostrar mensaje de bienvenida SIN botones inicialmente
    const welcomeMessage = {
      from: "bot",
      text: this._getTranslation('advanced_welcome_message'),
      time: this._getCurrentTime(),
      isWelcome: true,
      isAdvancedOnboarding: true
    };
    
    this.messages.push(welcomeMessage);
    
    // Renderizar mensajes
    if (this.messagesContainer) {
      this._renderMessages();
    }
    
    // Habilitar el input para que el usuario pueda escribir su nombre
    if (this.input && this.sendButton) {
      this.input.disabled = false;
      this.sendButton.disabled = false;
      this.input.focus();
      this.input.placeholder = this._getTranslation('advanced_name_prompt');
    }
  }

  // Método para manejar las respuestas del onboarding avanzado
  async _handleAdvancedOnboardingResponse(userMessage) {
    this._log('_handleAdvancedOnboardingResponse - Procesando respuesta:', userMessage);
    this._log('_handleAdvancedOnboardingResponse - Estado actual:', {
      onboardingStep: this.onboardingStep,
      advancedOnboarding: this.advancedOnboarding,
      user: this.user.name
    });
    
    // Ocultar indicador de typing
    this._hideTypingIndicator();
    
    // Si el usuario escribe algo, guardar como nombre y mostrar opciones
    if (this.onboardingStep === 0) {
      this._log('_handleAdvancedOnboardingResponse - Guardando nombre del usuario');
      
      // Guardar el nombre del usuario
      this.user.name = userMessage.trim();
      
      // Mostrar mensaje de confirmación y opciones CON BOTONES
      const optionsMessage = {
        from: "bot",
        text: `${this._getTranslation('advanced_name_received')}`,
        time: this._getCurrentTime(),
        isAdvancedOnboarding: true,
        showOptionsButtons: true
      };
      
      this.messages.push(optionsMessage);
      this.onboardingStep = 1;
      
      // Deshabilitar el input después de mostrar los botones
      if (this.input && this.sendButton) {
        this.input.disabled = true;
        this.sendButton.disabled = true;
      }
    } else {
      // Si ya se guardó el nombre, procesar selección de opción
      this._log('_handleAdvancedOnboardingResponse - Procesando selección');
      
      const selection = userMessage.trim().toLowerCase();
      
      if (selection === '1' || selection.includes('faq') || selection.includes('preguntas')) {
        // Mostrar modal de FAQ
        this._showFAQModal();
      } else if (selection === '2' || selection.includes('chat') || selection.includes('conversación')) {
        // Comenzar chat normal
        this._startNormalChat();
      } else {
        // Opción inválida
        const invalidMessage = {
          from: "bot",
          text: "Por favor, escribe 1 para ver las preguntas frecuentes o 2 para comenzar una conversación.",
          time: this._getCurrentTime(),
          isAdvancedOnboarding: true
        };
        this.messages.push(invalidMessage);
      }
    }
    
    // Renderizar mensajes
    if (this.messagesContainer) {
      this._renderMessages();
    }
  }

  // Método para mostrar la lista de FAQ
  _showFAQList() {
    this._log('_showFAQList - Mostrando lista de FAQ');
    
    const faqList = this._getFAQs();
    let faqText = `${this._getTranslation('advanced_faq_title')}:\n\n`;
    
    faqList.forEach((faq, index) => {
      faqText += `${index + 1}. ${faq.title}\n`;
    });
    
    faqText += `\n${this._getTranslation('advanced_faq_back')}`;
    
    const faqMessage = {
      from: "bot",
      text: faqText,
      time: this._getCurrentTime(),
      isAdvancedOnboarding: true,
      showFAQList: true
    };
    
    this.messages.push(faqMessage);
    this.onboardingStep = 2;
    
    // Actualizar placeholder
    if (this.input) {
      this.input.placeholder = "Escribe el número de la pregunta que quieres ver...";
    }
  }

  _getFAQs() {
    // Priorizar FAQs de la API sobre las hardcodeadas
    if (this.apiFaqs && this.apiFaqs.length > 0) {
      this._log('_getFAQs - Usando FAQs de la API:', this.apiFaqs.length);
      return this.apiFaqs;
    }
    
    // Fallback a FAQs hardcodeadas
    this._log('_getFAQs - Usando FAQs hardcodeadas');
    return this._getTranslation('advanced_faq_list');
  }

  _getProducts() {
    // Obtener productos de la API
    if (this.products && this.products.length > 0) {
      this._log('_getProducts - Usando productos de la API:', this.products.length);
      return this.products;
    }
    
    // Fallback a productos de prueba (solo en modo test)
    if (this.testMode) {
      this._log('_getProducts - Usando productos de prueba');
      return [
        {
          category: 'Tejidos',
          code: '1313',
          title: 'Tejido Luffy',
          description: 'Amigurumi hecho a mano de **Luffy**, ideal para fans de *One Piece*.',
          price: 9990,
          photo: 'https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206932/bot_icon_zgo153.png'
        },
        {
          category: 'Tejidos 2',
          code: '131322',
          title: 'Tejido Luffy',
          description: 'Amigurumi hecho a mano de **Luffy**, ideal para fans de *One Piece*.',
          price: 9990,
          photo: 'https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206932/bot_icon_zgo153.png'
        },
        {
          category: 'Tejidos',
          code: '131322',
          title: 'Tejido Luffy',
          description: 'Amigurumi hecho a mano de **Luffy**, ideal para fans de *One Piece*.',
          price: 9990,
          photo: 'https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206932/bot_icon_zgo153.png'
        },
        {
          category: 'Sin categoria',
          code: '131322',
          title: 'Tejido Luffy',
          description: 'Amigurumi hecho a mano de **Luffy**, ideal para fans de *One Piece*.',
          price: 9990,
          photo: 'https://res.cloudinary.com/dhqqkf4hy/image/upload/v1754206932/bot_icon_zgo153.png'
        }
      ];
    }
    
    this._log('_getProducts - No hay productos disponibles');
    return [];
  }

  _showFAQModal() {
    this._log('_showFAQModal - Mostrando modal de FAQ');
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.id = 'faq-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '1rem';
    modalContent.style.padding = '1rem';
    modalContent.style.maxWidth = '650px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '85vh';
    modalContent.style.overflow = 'hidden';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    
    // Header del modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';
    header.style.borderBottom = '1px solid #e9ecef';
    header.style.paddingBottom = '1rem';
    
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.color = '#333';
    title.style.fontSize = '1rem';
    title.style.fontWeight = '600';
    title.textContent = 'Preguntas Frecuentes';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.style.padding = '0.5rem';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.transition = 'background-color 0.3s ease';
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#f8f9fa';
    });
    
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Buscador
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '1.5rem';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar preguntas...';
    searchInput.style.width = '100%';
    searchInput.style.boxSizing = 'border-box';
    searchInput.style.padding = '0.75rem 1rem';
    searchInput.style.border = '2px solid #e9ecef';
    searchInput.style.borderRadius = '0.5rem';
    searchInput.style.fontSize = '1rem';
    searchInput.style.outline = 'none';
    searchInput.style.transition = 'border-color 0.3s ease';
    
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = this.primaryColor;
    });
    
    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = '#e9ecef';
    });
    
    searchContainer.appendChild(searchInput);
    
    // Contenedor de preguntas
    const questionsContainer = document.createElement('div');
    questionsContainer.style.flex = '1';
    questionsContainer.style.overflowY = 'auto';
    questionsContainer.style.paddingRight = '0.5rem';
    
    // Obtener lista de FAQ usando la nueva función
    const faqList = this._getFAQs();
    
    // Función para renderizar preguntas
    const renderQuestions = (questions) => {
      questionsContainer.innerHTML = '';
      
      if (questions.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '2rem';
        noResults.style.color = '#666';
        noResults.innerHTML = 'No se encontraron preguntas que coincidan con tu búsqueda';
        questionsContainer.appendChild(noResults);
        return;
      }
      
      questions.forEach((faq, index) => {
        const questionItem = document.createElement('div');
        questionItem.style.border = '1px solid #e9ecef';
        questionItem.style.borderRadius = '0.8rem';
        questionItem.style.marginBottom = '0.5rem';
        questionItem.style.overflow = 'hidden';
        questionItem.style.transition = 'all 0.3s ease';
        
        const questionHeader = document.createElement('div');
        questionHeader.style.padding = '1rem';
        questionHeader.style.backgroundColor = '#f8f9fa';
        questionHeader.style.cursor = 'pointer';
        questionHeader.style.fontWeight = '500';
        questionHeader.style.color = '#333';
        questionHeader.style.borderBottom = '1px solid #e9ecef';
        // Procesar título que puede ser HTML o Markdown
        questionHeader.innerHTML = `${faq.title}`;
        
        const answerContent = document.createElement('div');
        answerContent.style.padding = '1rem';
        answerContent.style.backgroundColor = 'white';
        answerContent.style.color = '#666';
        answerContent.style.lineHeight = '1.6';
        // Procesar contenido que puede ser HTML o Markdown
        answerContent.innerHTML = this._parseMarkdown(faq.content);
        answerContent.style.display = 'none';
        
        // Interceptar clics en enlaces dentro del contenido
        const links = answerContent.querySelectorAll('a');
        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;
            this._showLinkWarningModal(url);
          });
          
          // Agregar estilo visual para indicar que es clickeable
          link.style.color = this.primaryColor;
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';
        });
        
        questionHeader.addEventListener('click', () => {
          const isVisible = answerContent.style.display === 'block';
          answerContent.style.display = isVisible ? 'none' : 'block';
          questionItem.style.boxShadow = isVisible ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
        
        questionItem.appendChild(questionHeader);
        questionItem.appendChild(answerContent);
        questionsContainer.appendChild(questionItem);
      });
    };
    
    // Renderizar todas las preguntas inicialmente
    renderQuestions(faqList);
    
    // Función de búsqueda
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        renderQuestions(faqList);
      } else {
        const filteredQuestions = faqList.filter(faq => 
          faq.title.toLowerCase().includes(searchTerm) || 
          faq.content.toLowerCase().includes(searchTerm)
        );
        renderQuestions(filteredQuestions);
      }
    });
    
    // Botón de cerrar en la parte inferior
    // const footer = document.createElement('div');
    // footer.style.marginTop = '1.5rem';
    // footer.style.textAlign = 'center';
    // footer.style.borderTop = '1px solid #e9ecef';
    // footer.style.paddingTop = '1rem';
    
    // const closeFooterButton = document.createElement('button');
    // closeFooterButton.innerHTML = 'Cerrar';
    // closeFooterButton.style.backgroundColor = this.primaryColor;
    // closeFooterButton.style.color = 'white';
    // closeFooterButton.style.border = 'none';
    // closeFooterButton.style.borderRadius = '0.5rem';
    // closeFooterButton.style.padding = '0.75rem 2rem';
    // closeFooterButton.style.cursor = 'pointer';
    // closeFooterButton.style.fontSize = '1rem';
    // closeFooterButton.style.fontWeight = '500';
    // closeFooterButton.style.transition = 'background-color 0.3s ease';
    
    // closeFooterButton.addEventListener('mouseenter', () => {
    //   closeFooterButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
    // });
    
    // closeFooterButton.addEventListener('mouseleave', () => {
    //   closeFooterButton.style.backgroundColor = this.primaryColor;
    // });
    
    // closeFooterButton.addEventListener('click', () => {
    //   document.body.removeChild(modal);
    // });
    
    // footer.appendChild(closeFooterButton);
    
    // Cerrar modal con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Ensamblar modal
    modalContent.appendChild(header);
    modalContent.appendChild(searchContainer);
    modalContent.appendChild(questionsContainer);
    // modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Agregar al DOM
    document.body.appendChild(modal);
    
    // Enfocar el buscador
    searchInput.focus();
  }

  _showProductsModal() {
    this._log('_showProductsModal - Mostrando modal de productos');
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.id = 'products-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '1rem';
    modalContent.style.padding = '1rem';
    modalContent.style.maxWidth = '800px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '85vh';
    modalContent.style.overflow = 'hidden';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    
    // Header del modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';
    header.style.borderBottom = '1px solid #e9ecef';
    header.style.paddingBottom = '1rem';
    
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.color = '#333';
    title.style.fontSize = '1rem';
    title.style.fontWeight = '600';
    title.textContent = 'Nuestros Productos';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.style.padding = '0.5rem';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.transition = 'background-color 0.3s ease';
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#f8f9fa';
    });
    
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Buscador
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '1.5rem';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar productos...';
    searchInput.style.width = '100%';
    searchInput.style.boxSizing = 'border-box';
    searchInput.style.padding = '0.75rem 1rem';
    searchInput.style.border = '2px solid #e9ecef';
    searchInput.style.borderRadius = '0.5rem';
    searchInput.style.fontSize = '1rem';
    searchInput.style.outline = 'none';
    searchInput.style.transition = 'border-color 0.3s ease';
    
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = this.primaryColor;
    });
    
    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = '#e9ecef';
    });
    
    searchContainer.appendChild(searchInput);
    
    // Contenedor de productos
    const productsContainer = document.createElement('div');
    productsContainer.style.flex = '1';
    productsContainer.style.overflowY = 'auto';
    productsContainer.style.paddingRight = '0.5rem';
    
    // Obtener lista de productos
    const productsList = this._getProducts();
    
    // Función para renderizar productos
    const renderProducts = (products) => {
      productsContainer.innerHTML = '';
      
      if (products.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '2rem';
        noResults.style.color = '#666';
        noResults.innerHTML = 'No se encontraron productos que coincidan con tu búsqueda';
        productsContainer.appendChild(noResults);
        return;
      }
      
      products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.style.border = '1px solid #e9ecef';
        productItem.style.borderRadius = '0.8rem';
        productItem.style.marginBottom = '0.5rem';
        productItem.style.overflow = 'hidden';
        productItem.style.transition = 'all 0.3s ease';
        productItem.style.backgroundColor = '#fff';
        productItem.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        
        productItem.addEventListener('mouseenter', () => {
          productItem.style.transform = 'translateY(-2px)';
          productItem.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        });
        
        productItem.addEventListener('mouseleave', () => {
          productItem.style.transform = 'translateY(0)';
          productItem.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
        
        // Contenido del producto
        const productContent = document.createElement('div');
        productContent.style.padding = '1.5rem';
        productContent.style.display = 'flex';
        productContent.style.gap = '1rem';
        productContent.style.alignItems = 'flex-start';
        
        // Imagen del producto
        const productImage = document.createElement('img');
        productImage.src = product.photo;
        productImage.alt = product.title;
        productImage.style.width = '120px';
        productImage.style.height = '100px';
        productImage.style.objectFit = 'cover';
        productImage.style.borderRadius = '0.5rem';
        productImage.style.flexShrink = '0';
        
        // Información del producto
        const productInfo = document.createElement('div');
        productInfo.style.flex = '1';
        
        // Código del producto
        // const productCode = document.createElement('div');
        // productCode.style.fontSize = '0.8rem';
        // productCode.style.color = '#666';
        // productCode.style.marginBottom = '0.5rem';
        // productCode.innerHTML = `Código: <strong>${product.code}</strong>`;
        
        // Título del producto
        const productTitle = document.createElement('h4');
        productTitle.style.margin = '0 0 0.5rem 0';
        productTitle.style.color = '#333';
        productTitle.style.fontSize = '1.2rem';
        productTitle.style.fontWeight = '600';
        productTitle.innerHTML = product.title;
        
        // Descripción del producto
        const productDescription = document.createElement('div');
        productDescription.style.color = '#666';
        productDescription.style.lineHeight = '1.6';
        productDescription.style.marginBottom = '1rem';
        productDescription.innerHTML = this._parseMarkdown(product.description);
        
        // Precio del producto
        const productPrice = document.createElement('div');
        productPrice.style.fontSize = '1.3rem';
        productPrice.style.fontWeight = '700';
        productPrice.style.color = this.primaryColor;
        productPrice.innerHTML = `$${product.price.toLocaleString('es-CL')}`;
        
        // productInfo.appendChild(productCode);
        productInfo.appendChild(productTitle);
        productInfo.appendChild(productDescription);
        productInfo.appendChild(productPrice);
        
        productContent.appendChild(productImage);
        productContent.appendChild(productInfo);
        productItem.appendChild(productContent);
        productsContainer.appendChild(productItem);
      });
    };
    
    // Renderizar todos los productos inicialmente
    renderProducts(productsList);
    
    // Función de búsqueda
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        renderProducts(productsList);
      } else {
        const filteredProducts = productsList.filter(product => 
          product.title.toLowerCase().includes(searchTerm) || 
          product.description.toLowerCase().includes(searchTerm) ||
          product.code.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
      }
    });
    
    // Botón de cerrar en la parte inferior
    // const footer = document.createElement('div');
    // footer.style.marginTop = '1.5rem';
    // footer.style.textAlign = 'center';
    // footer.style.borderTop = '1px solid #e9ecef';
    // footer.style.paddingTop = '1rem';
    
    // const closeFooterButton = document.createElement('button');
    // closeFooterButton.innerHTML = 'Cerrar';
    // closeFooterButton.style.backgroundColor = this.primaryColor;
    // closeFooterButton.style.color = 'white';
    // closeFooterButton.style.border = 'none';
    // closeFooterButton.style.borderRadius = '0.5rem';
    // closeFooterButton.style.padding = '0.75rem 2rem';
    // closeFooterButton.style.cursor = 'pointer';
    // closeFooterButton.style.fontSize = '1rem';
    // closeFooterButton.style.fontWeight = '500';
    // closeFooterButton.style.transition = 'background-color 0.3s ease';
    
    // closeFooterButton.addEventListener('mouseenter', () => {
    //   closeFooterButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
    // });
    
    // closeFooterButton.addEventListener('mouseleave', () => {
    //   closeFooterButton.style.backgroundColor = this.primaryColor;
    // });
    
    // closeFooterButton.addEventListener('click', () => {
    //   document.body.removeChild(modal);
    // });
    
    // footer.appendChild(closeFooterButton);
    
    // Cerrar modal con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Ensamblar modal
    modalContent.appendChild(header);
    modalContent.appendChild(searchContainer);
    modalContent.appendChild(productsContainer);
    // modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Agregar al DOM
    document.body.appendChild(modal);
    
    // Enfocar el buscador
    searchInput.focus();
  }

  _showLinkWarningModal(url) {
    this._log('_showLinkWarningModal - Mostrando advertencia para enlace:', url);
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.id = 'link-warning-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10001'; // Mayor que el modal de FAQ
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '1rem';
    modalContent.style.padding = '2rem';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    modalContent.style.textAlign = 'center';
    modalContent.style.position = 'relative';
    
    // Botón de cerrar en la esquina superior derecha
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1rem';
    closeButton.style.right = '1rem';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.style.padding = '0.5rem';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.transition = 'background-color 0.3s ease';
    closeButton.style.zIndex = '1';
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#f8f9fa';
    });
    
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Icono de advertencia
    // const warningIcon = document.createElement('div');
    // warningIcon.style.fontSize = '3rem';
    // warningIcon.style.marginBottom = '1rem';
    // warningIcon.innerHTML = '⚠️';
    
    // Título
    const title = document.createElement('h3');
    title.style.margin = '0 0 1rem 0';
    title.style.color = '#d32f2f';
    title.style.fontSize = '1rem';
    title.style.fontWeight = '600';
    title.textContent = 'Este enlace no está verificado';
    
    // Contenido
    const content = document.createElement('p');
    content.style.margin = '0 0 1.5rem 0';
    content.style.color = '#666';
    content.style.lineHeight = '1.6';
    content.style.fontSize = '1rem';
    content.innerHTML = 'Asegúrate de que confías en este enlace antes de continuar. Si no reconoces la URL, no abras el enlace para acceder al sitio.';
    
    // URL del sitio
    const urlDisplay = document.createElement('div');
    urlDisplay.style.backgroundColor = '#f5f5f5';
    urlDisplay.style.padding = '0.75rem';
    urlDisplay.style.borderRadius = '0.5rem';
    urlDisplay.style.marginBottom = '1.5rem';
    urlDisplay.style.fontFamily = 'monospace';
    urlDisplay.style.fontSize = '0.9rem';
    urlDisplay.style.color = '#333';
    urlDisplay.style.wordBreak = 'break-all';
    urlDisplay.textContent = url;
    
    // Contenedor de botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '1rem';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.flexWrap = 'wrap';
    
    // Botón Copiar Enlace
    const copyButton = document.createElement('button');
    copyButton.innerHTML = 'Copiar Enlace';
    copyButton.style.backgroundColor = '#6c757d';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '0.8rem';
    copyButton.style.padding = '0.75rem 1.5rem';
    copyButton.style.cursor = 'pointer';
    copyButton.style.fontSize = '0.8rem';
    copyButton.style.fontWeight = '500';
    copyButton.style.transition = 'background-color 0.3s ease';
    copyButton.style.flex = '1';
    copyButton.style.minWidth = '140px';
    
    copyButton.addEventListener('mouseenter', () => {
      copyButton.style.backgroundColor = '#5a6268';
    });
    
    copyButton.addEventListener('mouseleave', () => {
      copyButton.style.backgroundColor = '#6c757d';
    });
    
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        // Cambiar temporalmente el texto del botón
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '¡Copiado!';
        copyButton.style.backgroundColor = '#28a745';
        setTimeout(() => {
          copyButton.innerHTML = originalText;
          copyButton.style.backgroundColor = '#6c757d';
        }, 2000);
      }).catch(err => {
        console.error('Error al copiar:', err);
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '¡Copiado!';
        copyButton.style.backgroundColor = '#28a745';
        setTimeout(() => {
          copyButton.innerHTML = originalText;
          copyButton.style.backgroundColor = '#6c757d';
        }, 2000);
      });
    });
    
    // Botón Abrir Enlace
    const openButton = document.createElement('button');
    openButton.innerHTML = 'Abrir Enlace';
    openButton.style.backgroundColor = this.primaryColor;
    openButton.style.color = 'white';
    openButton.style.border = 'none';
    openButton.style.borderRadius = '0.8rem';
    openButton.style.padding = '0.75rem 1.5rem';
    openButton.style.cursor = 'pointer';
    openButton.style.fontSize = '0.8rem';
    openButton.style.fontWeight = '500';
    openButton.style.transition = 'background-color 0.3s ease';
    openButton.style.flex = '1';
    openButton.style.minWidth = '140px';
    
    openButton.addEventListener('mouseenter', () => {
      openButton.style.backgroundColor = this._darkenColor(this.primaryColor, 10);
    });
    
    openButton.addEventListener('mouseleave', () => {
      openButton.style.backgroundColor = this.primaryColor;
    });
    
    openButton.addEventListener('click', () => {
      window.open(url, '_blank', 'noopener,noreferrer');
      document.body.removeChild(modal);
    });
    
    // Botón Cancelar
    // const cancelButton = document.createElement('button');
    // cancelButton.innerHTML = '❌ Cancelar';
    // cancelButton.style.backgroundColor = '#dc3545';
    // cancelButton.style.color = 'white';
    // cancelButton.style.border = 'none';
    // cancelButton.style.borderRadius = '0.5rem';
    // cancelButton.style.padding = '0.75rem 1.5rem';
    // cancelButton.style.cursor = 'pointer';
    // cancelButton.style.fontSize = '0.8rem';
    // cancelButton.style.fontWeight = '500';
    // cancelButton.style.transition = 'background-color 0.3s ease';
    // cancelButton.style.flex = '1';
    // cancelButton.style.minWidth = '140px';
    
    // cancelButton.addEventListener('mouseenter', () => {
    //   cancelButton.style.backgroundColor = '#c82333';
    // });
    
    // cancelButton.addEventListener('mouseleave', () => {
    //   cancelButton.style.backgroundColor = '#dc3545';
    // });
    
    // cancelButton.addEventListener('click', () => {
    //   document.body.removeChild(modal);
    // });
    
    buttonsContainer.appendChild(copyButton);
    buttonsContainer.appendChild(openButton);
    // buttonsContainer.appendChild(cancelButton);
    
    // Cerrar modal con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Ensamblar modal
    // modalContent.appendChild(warningIcon);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modalContent.appendChild(urlDisplay);
    modalContent.appendChild(buttonsContainer);
    modal.appendChild(modalContent);
    
    // Agregar al DOM
    document.body.appendChild(modal);
  }

  // Método para comenzar chat normal
  _startNormalChat() {
    this._log('_startNormalChat - Comenzando chat normal');
    
    this.advancedOnboarding = false;
    this.registrationScreen = false;
    this.registered = true;
    this.registrationCompleted = true;
    
    // Limpiar mensajes anteriores
    this.messages = [];
    
    // Mostrar mensaje de bienvenida al chat
    const welcomeMessage = {
      from: "bot",
      text: `¡Hola ${this.user.name || 'usuario'}! 👋 ¿En qué puedo ayudarte hoy?`,
      time: this._getCurrentTime(),
      isWelcome: true
    };
    
    this.messages.push(welcomeMessage);
    
    // Habilitar el input y actualizar placeholder
    if (this.input) {
      this.input.placeholder = this._getTranslation('write_message_placeholder');
      this.input.disabled = false;
      this.input.focus();
    }
    
    if (this.sendButton) {
      this.sendButton.disabled = false;
    }
    
    // Renderizar mensajes
    if (this.messagesContainer) {
      this._renderMessages();
    }
  }

  // Métodos públicos
  toggleChatPanel() {
    this._toggleChatPanel();
  }

  hideChatPanel() {
    this._hideChatPanel();
  }

  sendMessage(message) {
    if (typeof message === 'string' && message.trim()) {
      this.input.value = message;
      this._sendMessage();
    }
  }

  clearHistory() {
    this._log('clearHistory - Iniciando limpieza y reinicio de conversación');
    
    // Limpiar mensajes
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    
    // Limpiar cache si está habilitado
    if (this.cache) {
      this._clearCache();
    }
    
    // Reiniciar estado de registro
    this.registered = false;
    this.registrationCompleted = false;
    this.registrationScreen = false;
    this.advancedOnboarding = false;
    this.onboardingStep = 0;
    
    // Reiniciar el estado del input
    if (this.input && this.sendButton) {
      this.input.disabled = true;
      this.sendButton.disabled = true;
    }
    
    this._log('clearHistory - Estado reiniciado, reinicializando sesión');
    
    // Reinicializar la sesión para poder mostrar la pantalla inicial correcta
    this._initializeSession().then(() => {
      this._log('clearHistory - Sesión reinicializada, verificando estado de registro');
      this._checkRegistrationStatus();
    }).catch((error) => {
      this._logError('clearHistory - Error reinicializando sesión:', error);
      // Si falla la reinicialización, mostrar pantalla de registro
      this._showRegistrationScreen();
    });
    
    this._log('clearHistory - Conversación reiniciada desde el punto inicial');
  }

  // Método público para verificar el estado del registro
  getRegistrationStatus() {
    return {
      registerOption: this.register,
      registered: this.registered,
      registrationScreen: this.registrationScreen,
      registrationCompleted: this.registrationCompleted,
      session: this.session ? true : false,
      licenseActive: this.license?.active || false,
      welcomeMessages: this.messages.filter(msg => msg.isWelcome).length,
      user: {
        name: this.user.name,
        email: this.user.email
      }
    };
  }

  // Método para guardar la sesión en cache
  _saveSessionToCache() {
    if (!this.cache) return;
    
    try {
      const sessionData = {
        session: this.session,
        // messages: this.messages,
        // user: this.user,
        // registered: this.registered,
        // registrationCompleted: this.registrationCompleted,
        // license: this.license,
        timestamp: Date.now(),
        expiration: Date.now() + this.cacheExpiration
      };
      
      localStorage.setItem('hubdox_chat_cache', JSON.stringify(sessionData));
      this._log('_saveSessionToCache - Sesión guardada en cache');
    } catch (error) {
      this._logError('_saveSessionToCache - Error guardando en cache:', error);
    }
  }

  // Método para cargar la sesión desde cache
  _loadSessionFromCache() {
    if (!this.cache) return false;
    
    try {
      const cachedData = localStorage.getItem('hubdox_chat_cache');
      if (!cachedData) return false;
      
      const sessionData = JSON.parse(cachedData);
      
      // Verificar si el cache ha expirado
      if (sessionData.expiration && Date.now() > sessionData.expiration) {
        this._log('_loadSessionFromCache - Cache expirado, limpiando');
        this._clearCache();
        return false;
      }
      
      // Restaurar datos de la sesión
      this.session = sessionData.session;
      // this.messages = sessionData.messages || [];
      // this.user = sessionData.user || this.user;
      // this.registered = sessionData.registered || false;
      // this.registrationCompleted = sessionData.registrationCompleted || false;
      // this.license = sessionData.license || this.license;
      this._log('_loadSessionFromCache - Sesión cargada desde cache');
      return true;
    } catch (error) {
      this._logError('_loadSessionFromCache - Error cargando desde cache:', error);
      this._clearCache();
      return false;
    }
  }

  // Método para limpiar el cache
  _clearCache() {
    try {
      localStorage.removeItem('hubdox_chat_cache');
      this._log('_clearCache - Cache limpiado');
    } catch (error) {
      this._logError('_clearCache - Error limpiando cache:', error);
    }
  }

  // Método para verificar si el cache está activo y válido
  _isCacheValid() {
    if (!this.cache) return false;
    
    try {
      const cachedData = localStorage.getItem('hubdox_chat_cache');
      if (!cachedData) return false;
      
      const sessionData = JSON.parse(cachedData);
      return sessionData.expiration && Date.now() <= sessionData.expiration;
    } catch (error) {
      return false;
    }
  }

  // Método para limpiar cache expirado
  _cleanExpiredCache() {
    if (!this.cache) return;
    
    try {
      const cachedData = localStorage.getItem('hubdox_chat_cache');
      if (!cachedData) return;
      
      const sessionData = JSON.parse(cachedData);
      
      // Si el cache ha expirado, limpiarlo
      if (sessionData.expiration && Date.now() > sessionData.expiration) {
        this._log('_cleanExpiredCache - Cache expirado detectado, limpiando');
        this._clearCache();
      }
    } catch (error) {
      this._logError('_cleanExpiredCache - Error verificando cache expirado:', error);
      // Si hay error al leer el cache, limpiarlo por seguridad
      this._clearCache();
    }
  }

  // Configurar tiempo de recordatorio
  setReminderTimeout(timeout) {
    this.reminderTimeout = timeout;
    this._log('setReminderTimeout - Tiempo de recordatorio configurado a', timeout / 1000, 'segundos');
  }

  // Obtener estado del recordatorio
  getReminderStatus() {
    return {
      reminderTimeout: this.reminderTimeout,
      lastUserMessageTime: this.lastUserMessageTime,
      hasActiveTimer: this.reminderTimer !== null,
      timeSinceLastMessage: this.lastUserMessageTime ? Date.now() - this.lastUserMessageTime : null
    };
  }

  // Configurar límite de caracteres para preguntas
  setMaxQuestionLength(length) {
    if (typeof length === 'number' && length > 0) {
      this.maxQuestionLength = length;
      this._log('setMaxQuestionLength - Límite de caracteres configurado a:', length);
      
      // Actualizar el atributo maxlength del input si existe
      if (this.input) {
        this.input.maxLength = length;
      }      
      return true;
    } else {
      this._logError('setMaxQuestionLength - Longitud inválida:', length);
      return false;
    }
  }

  // Obtener límite de caracteres actual
  getMaxQuestionLength() {
    return this.maxQuestionLength;
  }

  // Configurar tiempo de expiración del cache
  setCacheExpiration(minutes) {
    if (typeof minutes === 'number' && minutes > 0) {
      this.cacheExpiration = minutes * 60 * 1000; // Convertir minutos a milisegundos
      this._log('setCacheExpiration - Tiempo de expiración del cache configurado a:', minutes, 'minutos');
      return true;
    } else {
      this._logError('setCacheExpiration - Tiempo inválido:', minutes);
      return false;
    }
  }

  // Obtener tiempo de expiración actual del cache
  getCacheExpiration() {
    return this.cacheExpiration / (60 * 1000); // Convertir milisegundos a minutos
  }

  // Habilitar o deshabilitar el cache
  setCacheEnabled(enabled) {
    if (typeof enabled === 'boolean') {
      this.cache = enabled;
      this._log('setCacheEnabled - Cache', enabled ? 'habilitado' : 'deshabilitado');
      
      // Si se deshabilita el cache, limpiarlo
      if (!enabled) {
        this._clearCache();
      }
      
      return true;
    } else {
      this._logError('setCacheEnabled - Valor inválido:', enabled);
      return false;
    }
  }

  // Obtener estado del cache
  getCacheStatus() {
    return {
      enabled: this.cache,
      expiration: this.getCacheExpiration(),
      isValid: this._isCacheValid(),
      hasData: this._isCacheValid()
    };
  }

  // Cambiar idioma del chat
  setLanguage(language) {
    const supportedLanguages = ['es', 'en', 'pt', 'ru', 'de', 'zh', 'ja'];
    if (supportedLanguages.includes(language)) {
      this.language = language;
      this._log('setLanguage - Idioma cambiado a:', language);
      
      // Actualizar la UI con el nuevo idioma
      this._updateUILanguage();
      

      
      return true;
    } else {
      this._logError('setLanguage - Idioma no soportado:', language);
      return false;
    }
  }

  // Obtener idioma actual
  getLanguage() {
    return this.language;
  }

  // Obtener idiomas soportados
  getSupportedLanguages() {
    return ['es', 'en', 'pt', 'ru', 'de', 'zh', 'ja'];
  }

  // Actualizar UI con el nuevo idioma
  _updateUILanguage() {
    // Actualizar placeholders
    if (this.input) {
      if (this.registrationScreen) {
        this.input.placeholder = this._getTranslation('write_message_placeholder');
      } else {
        this.input.placeholder = this._getTranslation('write_message_placeholder');
      }
    }
    
    // Actualizar botones si existen
    if (this.sendButton) {
      this.sendButton.textContent = this._getTranslation('send_button_text');
    }
    
    // Actualizar elementos del header si existen
    this._updateUILanguageShadowDOM();
    
    // Re-renderizar mensajes para actualizar textos
    if (this.messagesContainer) {
      this._renderMessages();
    }
    
    // Si estamos en modo test, actualizar los mensajes de test
    if (this.testMode) {
      this._log('_updateUILanguage - Modo test detectado, mensajes de test actualizados');
    }
    
    this._log('_updateUILanguage - UI actualizada con idioma:', this.language);
  }

  // Actualizar UI de idioma para Shadow DOM
  _updateUILanguageShadowDOM() {
    if (!this.chatPanelShadow) return;
    
    // Actualizar botones del header
    const clearHistoryBtn = this.chatPanelShadow.querySelector('.clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.textContent = this._getTranslation('clear_history');
    }
    
    const fullscreenBtn = this.chatPanelShadow.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.textContent = this._getTranslation('fullscreen');
    }
    
    // Actualizar botón de pantalla completa en el dropdown
    const fullscreenToggle = this.chatPanelShadow.querySelector('#fullscreen-toggle');
    if (fullscreenToggle) {
      const iconSvg = this.isFullscreen ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9h4m0 0V5m0 4L4 4m15 5h-4m0 0V5m0 4 5-5M5 15h4m0 0v4m0-4-5 5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      `;
      fullscreenToggle.innerHTML = iconSvg + (this.isFullscreen ? this._getTranslation('minimize') : this._getTranslation('fullscreen'));
    }
    
    const infoBtn = this.chatPanelShadow.querySelector('.info-btn');
    if (infoBtn) {
      infoBtn.textContent = this._getTranslation('chat_info');
    }
    
    // Actualizar footer
    const footerText = this.chatPanelShadow.querySelector('.footer-text');
    if (footerText) {
      footerText.innerHTML = `${this._getTranslation('powered_by')} <strong>Hubdox</strong>`;
    }
    
    // Actualizar modal de confirmación si existe
    if (this.modalShadow) {
      const modalTitle = this.modalShadow.querySelector('.modal-title');
      if (modalTitle) {
        modalTitle.textContent = this._getTranslation('clear_history_confirm_title');
      }
      
      const modalBody = this.modalShadow.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = this._getTranslation('clear_history_confirm');
      }
      
      const cancelBtn = this.modalShadow.querySelector('.btn-secondary');
      if (cancelBtn) {
        cancelBtn.textContent = this._getTranslation('cancel');
      }
      
      const confirmBtn = this.modalShadow.querySelector('.btn-primary');
      if (confirmBtn) {
        confirmBtn.textContent = this._getTranslation('confirm');
      }
    }
    
    this._log('_updateUILanguageShadowDOM - Elementos del header actualizados');
  }

  // Actualizar UI de idioma para Bootstrap
  _updateUILanguageBootstrap() {
    if (!this.chatPanel) return;
    
    // Actualizar botones del header
    const clearHistoryBtn = this.chatPanel.querySelector('.clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.textContent = this._getTranslation('clear_history');
    }
    
    const fullscreenBtn = this.chatPanel.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.textContent = this._getTranslation('fullscreen');
    }
    
    // Actualizar botón de pantalla completa en el dropdown
    const fullscreenToggle = this.chatPanel.querySelector('#fullscreen-toggle');
    if (fullscreenToggle) {
      const iconSvg = this.isFullscreen ? `
        <svg class="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9h4m0 0V5m0 4L4 4m15 5h-4m0 0V5m0 4 5-5M5 15h4m0 0v4m0-4-5 5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      ` : `
        <svg class="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      `;
      fullscreenToggle.innerHTML = iconSvg + (this.isFullscreen ? this._getTranslation('minimize') : this._getTranslation('fullscreen'));
    }
    
    const infoBtn = this.chatPanel.querySelector('.info-btn');
    if (infoBtn) {
      infoBtn.textContent = this._getTranslation('chat_info');
    }
    
    // Actualizar footer
    const footerText = this.chatPanel.querySelector('.footer-text');
    if (footerText) {
      footerText.innerHTML = `${this._getTranslation('powered_by')} <strong>Hubdox</strong>`;
    }
    
    // Actualizar modal de confirmación si existe
    if (this.modal) {
      const modalTitle = this.modal.querySelector('.modal-title');
      if (modalTitle) {
        modalTitle.textContent = this._getTranslation('clear_history_confirm_title');
      }
      
      const modalBody = this.modal.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = this._getTranslation('clear_history_confirm');
      }
      
      const cancelBtn = this.modal.querySelector('.btn-secondary');
      if (cancelBtn) {
        cancelBtn.textContent = this._getTranslation('cancel');
      }
      
      const confirmBtn = this.modal.querySelector('.btn-primary');
      if (confirmBtn) {
        confirmBtn.textContent = this._getTranslation('confirm');
      }
    }
    
    this._log('_updateUILanguageBootstrap - Elementos del header actualizados');
  }

  /**
   * Parsea texto Markdown básico a HTML
   * @param {string} text - Texto en formato Markdown
   * @returns {string} - Texto convertido a HTML
   */
  _parseMarkdown(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Detectar si el contenido ya es HTML (contiene tags HTML)
    const htmlTagRegex = /<[^>]*>/;
    if (htmlTagRegex.test(text)) {
      // Si ya es HTML, solo sanitizar y retornar
      this._log('_parseMarkdown - Contenido detectado como HTML, sanitizando...');
      return this._sanitizeHTML(text);
    }

    // Si no es HTML, procesar como Markdown
    this._log('_parseMarkdown - Procesando como Markdown...');
    let html = text;

    // Escapar HTML existente para evitar XSS
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;');

    // **texto** -> <strong>texto</strong> (negrita)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // *texto* -> <em>texto</em> (cursiva)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // `texto` -> <code>texto</code> (código inline)
    html = html.replace(/`(.*?)`/g, '<code class="bg-light px-1 rounded">$1</code>');
    
    // ```texto``` -> <pre><code>texto</code></pre> (bloque de código)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-light p-2 rounded"><code>$1</code></pre>');
    
    // [texto](url) -> <a href="url">texto</a> (enlaces)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // # Título -> <h1>Título</h1> (títulos)
    html = html.replace(/^### (.*$)/gim, '<h3 class="mt-2 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="mt-2 mb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="mt-2 mb-1">$1</h1>');
    
    // - item -> <li>item</li> (listas)
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="mb-2">$1</ul>');
    
    // 1. item -> <li>item</li> (listas numeradas)
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol class="mb-2">$1</ol>');
    
    // Saltos de línea
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Sanitiza HTML para evitar XSS
   * @param {string} html - HTML a sanitizar
   * @returns {string} - HTML sanitizado
   */
  _sanitizeHTML(html) {
    if (!html || typeof html !== 'string') {
      return html;
    }

    // Lista de tags HTML permitidos
    const allowedTags = {
      'p': ['class', 'style'],
      'div': ['class', 'style'],
      'span': ['class', 'style'],
      'strong': ['class'],
      'b': ['class'],
      'em': ['class'],
      'i': ['class'],
      'u': ['class'],
      'code': ['class'],
      'pre': ['class'],
      'a': ['href', 'target', 'rel', 'class'],
      'h1': ['class'],
      'h2': ['class'],
      'h3': ['class'],
      'h4': ['class'],
      'h5': ['class'],
      'h6': ['class'],
      'ul': ['class'],
      'ol': ['class'],
      'li': ['class'],
      'br': [],
      'hr': ['class'],
      'blockquote': ['class'],
      'table': ['class'],
      'thead': ['class'],
      'tbody': ['class'],
      'tr': ['class'],
      'th': ['class'],
      'td': ['class'],
      'img': ['src', 'alt', 'class', 'style', 'width', 'height']
    };

    // Crear un elemento temporal para sanitizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Función recursiva para sanitizar elementos
    const sanitizeElement = (element) => {
      const children = Array.from(element.children);
      
      children.forEach(child => {
        const tagName = child.tagName.toLowerCase();
        
        // Si el tag no está permitido, convertir a texto
        if (!allowedTags[tagName]) {
          const textNode = document.createTextNode(child.textContent);
          element.replaceChild(textNode, child);
          return;
        }
        
        // Sanitizar atributos
        const allowedAttrs = allowedTags[tagName];
        const attrs = Array.from(child.attributes);
        
        attrs.forEach(attr => {
          if (!allowedAttrs.includes(attr.name)) {
            child.removeAttribute(attr.name);
          } else if (attr.name === 'href' && !attr.value.startsWith('http')) {
            // Solo permitir enlaces http/https
            child.removeAttribute(attr.name);
          } else if (attr.name === 'src' && !attr.value.startsWith('http')) {
            // Solo permitir imágenes http/https
            child.removeAttribute(attr.name);
          }
        });
        
        // Sanitizar hijos recursivamente
        sanitizeElement(child);
      });
    };

    sanitizeElement(tempDiv);
    return tempDiv.innerHTML;
  }

  _darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  destroy() {
    // Remove DOM elements
    if (this.floatingBtnContainer) this.floatingBtnContainer.remove();
    if (this.chatPanelContainer) this.chatPanelContainer.remove();
    if (this.modalContainer) this.modalContainer.remove();

    // Remove event listeners
    window.removeEventListener('resize', this._boundHandleResize);

    // Nullify references
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = null;
      }
    }
    this._log('ChatBot instance destroyed');
  }

  // Método de logging que respeta el modo desarrollo
  _log(...args) {
    if (this.devMode) {
      console.log('[ChatBot SDK]', ...args);
    }
  }
  
  // Método de logging de errores (siempre se muestra)
  _logError(...args) {
    console.error('[ChatBot SDK] ERROR:', ...args);
  }
  
  // Método de logging de warnings (solo en modo desarrollo)
  _logWarn(...args) {
    if (this.devMode) {
      console.warn('[ChatBot SDK] WARNING:', ...args);
    }
  }
  
  // Método de logging de información (solo en modo desarrollo)
  _logInfo(...args) {
    if (this.devMode) {
      console.info('[ChatBot SDK] INFO:', ...args);
    }
  }
  
  // Método de logging de debug (solo en modo desarrollo)
  _logDebug(...args) {
    if (this.devMode) {
      console.debug('[ChatBot SDK] DEBUG:', ...args);
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ChatBot = ChatBot;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatBot;
}