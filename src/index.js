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
    this.cache = optionsConfig.cache !== undefined ? optionsConfig.cache : true;
    this.testMode = optionsConfig.testMode || false;
    
    this.user = options.user || {
      email: 'test@mail.com',
      name: "Usuario",
      photo: "../src/img/user_icon.png",
    };
    this.bot = options.bot || {
      name: options.botName || "Bot",
      img: "../src/img/bot_icon.png",
    };
    
    // Personalización desde objeto custom
    const custom = options.custom || {};
    this.primaryColor = custom.primaryColor || "#0d6efd";
    this.botName = custom.botName || options.botName || "Bot";
    this.headerBgColor = custom.headerBgColor || this.primaryColor;
    this.headerTextColor = custom.headerTextColor || "#ffffff";
    this.sendButtonText = custom.sendButtonText || null;
    this.iconButton = custom.iconButton || this.bot.img;
    this.showTime = custom.showTime || false;
    
    // Configuración de tamaño del chat
    this.chatWidth = custom.chatWidth || "400px";
    this.chatHeight = custom.chatHeight || "60vh";
    this.chatMaxWidth = custom.chatMaxWidth || "90vw";
    this.chatMaxHeight = custom.chatMaxHeight || "60vh";
    this.messagesHeight = custom.messagesHeight || "350px";
    this.buttonSize = custom.buttonSize || "56px";
    this.fullscreenEnabled = custom.fullscreenEnabled !== undefined ? custom.fullscreenEnabled : true;
    
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
    this._loadBootstrapCSS().then(() => {
      this._loadBootstrapJS().then(() => {
        this._renderFloatingButton();
        this._handleResize();
        this._initializeChat();
      });
    });
  }

  _loadBootstrapJS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error loading Bootstrap JS'));
      document.body.appendChild(script);
    });
  }

  // Métodos de inicialización
  async _initializeChat() {
    // Siempre inicializar la sesión, el registro se manejará dentro del chat
    await this._initializeSession();
  }

  async _initializeSession() {
    try {
      // Verificar caché si está habilitado
      if (this.cache) {
        const loadedFromCache = this._loadFromCache();
        if (loadedFromCache) {
          // Si se cargaron datos desde caché, actualizar la UI
          this._updateBotUI();
        }
      }
      
      // En modo test, simular sesión y registro exitoso
      if (this.testMode) {
        this.session = "test-session-" + Date.now();
        this.registered = true;
        this._renderChatPanel();
        this._addInitialMessage();
        return;
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
      
      // Paso 2: Mostrar mensaje inicial o formulario de registro
      if (this.session) {
        // Si register es true y el usuario no está registrado, mostrar formulario de registro
        if (this.register && !this.registered) {
          this._showRegistrationInChat();
        } else if (this.registered && this.user.name) {
          // Si el usuario ya está registrado y tiene nombre, mostrar mensaje inicial
          this._addInitialMessage();
        } else {
          // Si está registrado pero no tiene nombre, mostrar formulario de registro
          this._showRegistrationInChat();
        }
      } else {
        // Si no hay sesión después del registro, mostrar error
        this._showBotInfoWithRetry();
      }
      
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
    try {
      console.log('Intentando registrar usuario con:', {
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
        console.error('Error en registro:', response.status, errorText);
        throw new Error(`Error en registro: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);
      
      // Actualizar datos de la sesión
      this.session = data.session;
      this.license = data.license; // name, logo, active, url, showFooter
      
      // Solo marcar como registrado si la licencia está activa Y register es true
      console.log('DEBUG: Verificando registro:', {
        license: this.license,
        licenseActive: this.license?.active,
        register: this.register,
        willRegister: this.license && this.license.active && this.register
      });
      
      if (this.license && this.license.active && this.register) {
        this.registered = true;
        console.log('DEBUG: Usuario registrado exitosamente');
      } else {
        this.registered = false;
        console.log('DEBUG: Usuario NO registrado');
      }
      
      // Actualizar configuración del bot desde la respuesta del registro
      if (data.chatbot) {
        this.bot.name = data.chatbot.name || this.bot.name;
        this.bot.img = data.chatbot.photo || this.bot.img;
        this.botName = data.chatbot.name || this.botName;
        this.saludoInicial = data.chatbot.initial_message;
      }
      
      this._saveToCache();
      
      // Actualizar la UI con la nueva configuración del bot
      this._updateBotUI();
      
      // Actualizar el footer después del registro
      this._updateFooter();
    } catch (error) {
      console.error('Error en _registerUser:', error);
      throw error;
    }
  }



  async _sendMessageToAPI(message) {
    console.log('_sendMessageToAPI - Llamando al API con mensaje:', message);
    
    // Si está en modo test, devolver respuesta simulada
    if (this.testMode) {
      console.log('_sendMessageToAPI - Modo test activado');
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
    console.log('_sendMessageToAPI - Respuesta recibida:', data);
    return data.answer || 'No se pudo obtener respuesta del bot';
  }

  // Registro dentro del chat
  _showRegistrationInChat() {
    // Deshabilitar el chat inicialmente
    this.input.disabled = true;
    this.sendButton.disabled = true;
    
    // Mostrar mensaje de bienvenida centrado con imagen del bot
    // Solo si ya tenemos sesión (configuración del bot obtenida)
    if (this.session) {
      const welcomeMessage = {
        from: "bot",
        text: "¡Hola! 👋 Soy tu asistente virtual. Para personalizar tu experiencia, necesito saber tu nombre.",
        time: this._getCurrentTime(),
        isWelcome: true
      };
      
      this.messages.push(welcomeMessage);
      this._renderMessages();
      
      // Habilitar el input para que el usuario pueda escribir su nombre
      this.input.disabled = false;
      this.sendButton.disabled = false;
      this.input.focus();
      
      // Cambiar el placeholder del input para indicar que debe escribir su nombre
      this.input.placeholder = "Escribe tu nombre...";
    } else {
      // Si no hay sesión, mostrar mensaje de error
      this._showBotInfoWithRetry();
    }
  }

  // Manejar respuesta del usuario durante registro
  async _handleRegistrationResponse(userMessage) {
    console.log('_handleRegistrationResponse - Iniciando con mensaje:', userMessage);
    const currentStep = this._getCurrentRegistrationStep();
    console.log('_handleRegistrationResponse - Paso actual:', currentStep);
    
    switch (currentStep) {
      case 'name':
        // Validar que el nombre no esté vacío
        if (!userMessage.trim()) {
          console.log('_handleRegistrationResponse - Nombre vacío, solicitando nombre');
          this._addMessage("bot", "Por favor, escribe tu nombre para continuar.");
          return;
        }
        
        console.log('_handleRegistrationResponse - Procesando nombre:', userMessage.trim());
        this.user.name = userMessage.trim();
        
        // Marcar como registrado y actualizar el estado
        console.log('_handleRegistrationResponse - Estableciendo registered = true');
        this.registered = true;
        this._saveToCache();
        
        // Restaurar el placeholder original del input
        this.input.placeholder = "Escribe un mensaje...";
        
        // Habilitar el chat después del registro
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
        
        // Mostrar la pregunta por defecto del bot después del registro
        console.log('_handleRegistrationResponse - Llamando a _addInitialMessage');
        this._addInitialMessage();
        console.log('_handleRegistrationResponse - Registro completado');
        break;
    }
  }

  _getCurrentRegistrationStep() {
    const welcomeMessages = this.messages.filter(msg => 
      msg.from === "bot" && 
      msg.isWelcome
    );
    
    if (welcomeMessages.length === 0) return 'name';
    return 'complete';
  }

  // Métodos para manejar errores y reintentos
  _showBotInfoWithRetry() {
    // Deshabilitar el chat inicialmente
    this.input.disabled = true;
    this.sendButton.disabled = true;
    
    // Limpiar todos los mensajes anteriores
    this.messages = [];
    
    // Mostrar información del bot con opción de reintentar
    const errorMessage = {
      from: "bot",
      text: `¡Hola! Soy ${this.botName}. Parece que hubo un problema con la conexión. Por favor, verifica que tu API Key y Tenant sean correctos, luego intenta nuevamente.`,
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
      console.error('Error en reintento:', error);
      this._showBotInfoWithRetry();
    }
  }

  // Métodos de caché
  _getCacheKey() {
    return `chatbot_${this.tenant}_${this.apiKey}`;
  }

  _saveToCache() {
    if (!this.cache) return;
    
    try {
      const cacheData = {
        session: this.session,
        messages: this.messages,
        registered: this.registered,
        user: this.user,
        bot: {
          name: this.bot.name,
          img: this.bot.img
        },
        botName: this.botName,
        saludoInicial: this.saludoInicial,
        license: this.license,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this._getCacheKey(), JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error guardando en caché:', error);
    }
  }

  _loadFromCache() {
    if (!this.cache) return;
    
    try {
      const cached = localStorage.getItem(this._getCacheKey());
      if (cached) {
        const cacheData = JSON.parse(cached);
        
        // Verificar si el caché no es muy antiguo (24 horas)
        const cacheAge = Date.now() - cacheData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        if (cacheAge < maxAge) {
          this.session = cacheData.session;
          this.messages = cacheData.messages || [];
          this.registered = cacheData.registered || false;
          this.user = { ...this.user, ...cacheData.user };
          
          // Cargar configuración del bot desde caché
          if (cacheData.bot) {
            this.bot.name = cacheData.bot.name || this.bot.name;
            this.bot.img = cacheData.bot.img || this.bot.img;
          }
          if (cacheData.botName) {
            this.botName = cacheData.botName;
          }
          if (cacheData.saludoInicial) {
            this.saludoInicial = cacheData.saludoInicial;
          }
          if (cacheData.license) {
            this.license = { ...this.license, ...cacheData.license };
          }
          
          console.log('Datos cargados desde caché');
          return true;
        } else {
          // Caché expirado, eliminarlo
          this._clearCache();
        }
      }
    } catch (error) {
      console.warn('Error cargando desde caché:', error);
      this._clearCache();
    }
    
    return false;
  }

  _clearCache() {
    try {
      localStorage.removeItem(this._getCacheKey());
    } catch (error) {
      console.warn('Error limpiando caché:', error);
    }
  }

  // Métodos de UI
  _loadBootstrapCSS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('link[data-bootstrap="injected"]')) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
      link.dataset.bootstrap = 'injected';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Error cargando Bootstrap CSS'));
      document.head.appendChild(link);
    });
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
        this.chatPanel.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          display: flex;
          flex-direction: column;
          z-index: 1050;
          background-color: white;
          border-radius: 0;
        `;
      } else if (this.isMobile) {
        this.chatPanel.style.cssText = `
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: calc(100vw - 48px);
          max-width: ${this.chatMaxWidth};
          max-height: ${this.chatMaxHeight};
          display: flex;
          flex-direction: column;
          z-index: 1050;
          background-color: white;
        `;
      } else {
        this.chatPanel.style.cssText = `
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: ${this.chatWidth};
          max-width: ${this.chatMaxWidth};
          max-height: ${this.chatMaxHeight};
          display: flex;
          flex-direction: column;
          z-index: 1050;
          background-color: white;
        `;
      }
    }
  }

  _renderFloatingButton() {
    this.floatingBtn = document.createElement("button");
    this.floatingBtn.type = "button";
    this.floatingBtn.title = "Abrir chat";
    
    // Tamaño del botón según dispositivo y configuración personalizada
    const buttonSize = this.isMobile ? "60px" : this.buttonSize;
    const iconSize = this.isMobile ? "48" : "24";
    
    // Usar ícono personalizado si está disponible, sino usar el SVG por defecto
    if (this.iconButton && this.iconButton !== this.bot.img) {
      this.floatingBtn.innerHTML = `<img src="${this.iconButton}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      this.floatingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
    }
    
    // Aplicar estilos directamente para evitar conflictos
    this.floatingBtn.style.position = "fixed";
    this.floatingBtn.style.bottom = this.buttonPosition.bottom || "24px";
    this.floatingBtn.style.right = this.buttonPosition.right || "24px";
    this.floatingBtn.style.top = this.buttonPosition.top || "auto";
    this.floatingBtn.style.left = this.buttonPosition.left || "auto";
    this.floatingBtn.style.transform = this.buttonPosition.transform || "none";
    this.floatingBtn.style.backgroundColor = this.iconButton && this.iconButton !== this.bot.img ? 'transparent' : this.primaryColor;
    this.floatingBtn.style.border = "none";
    this.floatingBtn.style.borderRadius = "50%";
    this.floatingBtn.style.width = buttonSize;
    this.floatingBtn.style.height = buttonSize;
    this.floatingBtn.style.cursor = "pointer";
    this.floatingBtn.style.boxShadow = `0 4px 10px ${this._hexToRgba(this.primaryColor, 0.5)}`;
    this.floatingBtn.style.display = this.iconButton && this.iconButton !== this.bot.img ? 'block' : 'flex';
    this.floatingBtn.style.alignItems = "center";
    this.floatingBtn.style.justifyContent = "center";
    this.floatingBtn.style.zIndex = "1050";
    this.floatingBtn.style.transition = "transform 0.2s ease";
    this.floatingBtn.style.overflow = "hidden";
    
    document.body.appendChild(this.floatingBtn);

    this.floatingBtn.addEventListener("click", () => {
      this._toggleChatPanel();
    });

    // Efecto hover
    this.floatingBtn.addEventListener('mouseenter', () => {
      this.floatingBtn.style.transform = `${this.buttonPosition.transform || "none"} scale(1.1)`;
    });
    this.floatingBtn.addEventListener('mouseleave', () => {
      this.floatingBtn.style.transform = this.buttonPosition.transform || "none";
    });
  }

  _renderChatPanel() {
    this.chatPanel = document.createElement("div");
    this.chatPanel.className = "card shadow";
    
    // Aplicar tamaño inicial
    this._updateChatPanelSize();

    this.chatPanel.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center" style="
        background-color: ${this.headerBgColor};
        color: ${this.headerTextColor};
        border-radius: ${this.isFullscreen ? '0' : '0.375rem 0.375rem 0 0'};
      ">
        <div class="d-flex align-items-center">
          <img src="${this.bot.img}" alt="${this.bot.name}" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;">
          <h5 class="mb-0">${this.botName}</h5>
        </div>
        <div class="d-flex align-items-center">
          <div class="dropdown">
            <button type="button" class="btn btn-sm text-white dropdown-toggle" id="actions-menu" data-bs-toggle="dropdown" aria-expanded="false" title="Acciones">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="actions-menu">
              <li>
                <button class="dropdown-item" type="button" id="clear-history-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash me-2" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Limpiar historial
                </button>
              </li>
              ${this.fullscreenEnabled ? `
              <li>
                <button class="dropdown-item" type="button" id="fullscreen-toggle">
                  <svg class="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
                  </svg>
                  ${this.isFullscreen ? 'Minimizar' : 'Pantalla completa'}
                </button>
              </li>
              ` : ''}
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item" type="button" id="chat-info-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle me-2" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  Información del chat
                </button>
              </li>
            </ul>
          </div>
          <button type="button" class="btn-close btn-close-white ms-2" aria-label="Cerrar"></button>
        </div>
      </div>
      <div class="card-body overflow-auto" style="flex-grow: 1; ${this.isFullscreen ? 'height: calc(100vh - 140px);' : `height: ${this.messagesHeight};`}" id="chat-messages"></div>
      <div class="card-footer bg-white" style="border-radius: ${this.isFullscreen ? '0' : '0 0 0.375rem 0.375rem'};">
        <form id="chat-form" class="d-flex gap-2 align-items-center" autocomplete="off" novalidate>
          <input
            id="chat-input"
            type="text"
            class="form-control rounded-pill"
            placeholder="Escribe un mensaje..."
            aria-label="Mensaje"
            required
          />
          <button
            id="chat-send"
            type="submit"
            class="btn rounded-pill px-2 align-items-center"
            style="background-color: ${this.primaryColor}; color: white;"
            disabled
          >
            
            ${this.sendButtonText && this.sendButtonText !== "" ? this.sendButtonText : '<svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(90 12 12)"><path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clip-rule="evenodd"/></g></svg>'}
          </button>
        </form>
        
        </div>
    `;

    document.body.appendChild(this.chatPanel);

    // Actualizar el footer después de renderizar el panel
    this._updateFooter();

    this.messagesContainer = this.chatPanel.querySelector("#chat-messages");
    this.form = this.chatPanel.querySelector("#chat-form");
    this.input = this.chatPanel.querySelector("#chat-input");
    this.sendButton = this.chatPanel.querySelector("#chat-send");
    this.closeBtn = this.chatPanel.querySelector(".btn-close");
    this.clearHistoryBtn = this.chatPanel.querySelector("#clear-history-btn");
    
    this._renderConfirmationModal();

    if (this.fullscreenEnabled) {
      this.fullscreenToggle = this.chatPanel.querySelector("#fullscreen-toggle");
      if (this.fullscreenToggle) {
        this.fullscreenToggle.addEventListener("click", () => {
          this._toggleFullscreen();
        });
      }
    }

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._sendMessage();
    });

    this.input.addEventListener("input", () => {
      this.sendButton.disabled = this.input.value.trim() === "" || this.loading;
    });

    this.closeBtn.addEventListener("click", () => this._hideChatPanel());
    this.clearHistoryBtn.addEventListener("click", () => this._showConfirmationModal());
    
    // Agregar event listener para el botón de información del chat
    const chatInfoBtn = this.chatPanel.querySelector("#chat-info-btn");
    if (chatInfoBtn) {
      chatInfoBtn.addEventListener("click", () => this._showChatInfo());
    }
  }

  _renderConfirmationModal() {
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
    const modal = new bootstrap.Modal(this.modal);
    modal.show();
  }

  _hideConfirmationModal() {
    const modal = bootstrap.Modal.getInstance(this.modal);
    if (modal) {
      modal.hide();
    }
  }

  _showChatInfo() {
    const cacheStatus = this.getCacheStatus();
    const regStatus = this.getRegistrationStatus();
    
    const infoModal = document.createElement("div");
    infoModal.className = "modal fade";
    infoModal.tabIndex = -1;
    infoModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">Información del Chat</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="justify-content-center text-center">
                <h6>Bot</h6>
                <img src="${this.bot.img}" alt="${this.botName}" class="rounded-circle mb-3" style="width: 80px; height: 80px; object-fit: cover;">
                <p>${this.botName}</p>
                <p>${this.testMode ? '🧪 Test' : '🌐 Producción'}</p>
              </div>
              
              ${this.license.showFooter ? `
              <div class="d-flex justify-content-center">
                <small class="text-muted text-center my-3 px-2" style="font-size: 16px;">
                  <a href="${this.license.url}" target="_blank">
                    <img class="me-2" src="${this.license.logo}" alt="${this.license.name}" style="width: 20px; height: 20px; object-fit: cover;">
                    <span class="text-muted">Powered by ${this.license.name ?? ""}</span>
                  </a>
                </small>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(infoModal);
    
    const modal = new bootstrap.Modal(infoModal);
    modal.show();
    
    // Limpiar el modal del DOM después de cerrarlo
    infoModal.addEventListener("hidden.bs.modal", () => {
      document.body.removeChild(infoModal);
    });
  }

  _toggleFullscreen() {
    // Solo permitir pantalla completa si está habilitado
    if (!this.fullscreenEnabled) return;
    
    this.isFullscreen = !this.isFullscreen;
    this._updateChatPanelSize();
    
    // Actualizar ícono y texto del botón en el menú dropdown
    if (this.fullscreenToggle) {
      const iconSvg = this.isFullscreen ? `
        <svg class="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9h4m0 0V5m0 4L4 4m15 5h-4m0 0V5m0 4 5-5M5 15h4m0 0v4m0-4-5 5m15-5h-4m0 0v4m0-4 5 5"/>
        </svg>
      ` : `
        <svg class="me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
        </svg>
      `;
      
      this.fullscreenToggle.innerHTML = iconSvg + (this.isFullscreen ? 'Minimizar' : 'Pantalla completa');
    }
  }

  _toggleChatPanel() {
    this.chatVisible = !this.chatVisible;
    
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
       (this.testMode && this.testMessages.welcome.includes(msg.text)))
    );
    
    // Si ya existe el mensaje inicial, no agregarlo nuevamente
    if (hasInitialMessage) {
      console.log('_addInitialMessage - Mensaje inicial ya existe en el historial, omitiendo');
      return;
    }
    
    let message;
    
    if (this.testMode) {
      // En modo test, usar mensaje de bienvenida del banco de mensajes
      message = this.testMessages.welcome[Math.floor(Math.random() * this.testMessages.welcome.length)];
    } else {
      // Mensaje normal para modo producción
      message = this.saludoInicial || `Hola ${this.user.name}, soy ${this.botName} y estoy aquí para ayudarte. ¿En qué puedo asistirte?`;
    }
    
    console.log('_addInitialMessage - Agregando mensaje inicial:', message);
    this._addMessage("bot", message);
  }

  _addMessage(from, text, isRegistration = false) {
    const time = this._getCurrentTime();
    const message = { from, text, time, isRegistration };
    this.messages.push(message);

    const messageElement = this._createMessageElement(message);
    this.messagesContainer.appendChild(messageElement);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this._saveToCache();
  }

  _createMessageElement(msg) {
    // Si es mensaje de bienvenida, renderizar de forma especial
    if (msg.isWelcome) {
      const welcomeWrapper = document.createElement("div");
      welcomeWrapper.className = "text-center mb-4";
      welcomeWrapper.style.marginTop = "20px";
      
      const botImage = document.createElement("img");
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
      botImage.className = "rounded-circle mb-3";
      botImage.style.width = "80px";
      botImage.style.height = "80px";
      botImage.style.objectFit = "cover";
      botImage.style.margin = "0 auto";
      botImage.style.display = "block";
      
      const welcomeText = document.createElement("div");
      welcomeText.className = "bg-light rounded-3 p-3 mx-auto";
      welcomeText.style.maxWidth = "80%";
      welcomeText.innerHTML = `
        <p class="mb-0 fw-bold">${this.botName}</p>
        <p class="mb-0 text-muted small">${msg.time}</p>
        <p class="mb-0 mt-2">${this._parseMarkdown(msg.text)}</p>
      `;
      
      welcomeWrapper.appendChild(botImage);
      welcomeWrapper.appendChild(welcomeText);
      return welcomeWrapper;
    }

    // Si es mensaje de error con reintento, renderizar de forma especial
    if (msg.isError && msg.showRetry) {
      const errorWrapper = document.createElement("div");
      errorWrapper.className = "text-center mb-4";
      errorWrapper.style.marginTop = "20px";
      
      const botImage = document.createElement("img");
      botImage.src = this.bot.img;
      botImage.alt = this.bot.name;
      botImage.className = "rounded-circle mb-3";
      botImage.style.width = "60px";
      botImage.style.height = "60px";
      botImage.style.objectFit = "cover";
      botImage.style.margin = "0 auto";
      botImage.style.display = "block";
      
      const errorText = document.createElement("div");
      errorText.className = "bg-light rounded-3 p-3 mx-auto";
      errorText.style.maxWidth = "90%";
      errorText.innerHTML = `
        <p class="mb-0 fw-bold text-danger">${this.botName}</p>
        <p class="mb-0 mt-2" style="font-size: 12px;">${msg.text}</p>
      `;
      
      const retryButton = document.createElement("button");
      retryButton.className = "btn btn-primary mt-3 btn-sm rounded-pill";
      retryButton.textContent = "Intentar nuevamente";
      retryButton.addEventListener("click", () => {
        this._retryConnection();
      });
      
      errorWrapper.appendChild(botImage);
      errorWrapper.appendChild(errorText);
      errorWrapper.appendChild(retryButton);
      return errorWrapper;
    }
    
    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("d-flex", "mb-3");
    msgWrapper.classList.add(
      msg.from === "user" ? "justify-content-end" : "justify-content-start"
    );

    const avatar = document.createElement("img");
    avatar.src = msg.from === "user" ? this.user.photo : this.bot.img;
    avatar.alt = msg.from === "user" ? this.user.name : this.bot.name;
    avatar.className = "rounded-circle";
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    avatar.style.objectFit = "cover";

    const bubble = document.createElement("div");
    bubble.className = [
      "px-3",
      "py-2",
      "mx-2",
      "rounded-3",
      "position-relative",
      "w-auto",
    ].join(" ");

    bubble.style.maxWidth = "98%";

    if (msg.from === "user") {
      bubble.style.backgroundColor = this.primaryColor;
      bubble.style.color = "white";
    } else {
      bubble.classList.add("bg-light", "text-dark");
    }

    const info = document.createElement("small");
    info.className = "fw-bold d-block mb-1";
    info.innerHTML = `${msg.from === "user" ? this.user.name : this.botName} <span class="text-muted fs-7 ms-2" style="font-size:0.75rem;">${this.showTime ? msg.time : ""}</span>`;

    const textP = document.createElement("p");
    textP.className = "mb-0";
    textP.style.whiteSpace = "pre-wrap";
    textP.innerHTML = this._parseMarkdown(msg.text);

    bubble.appendChild(info);
    bubble.appendChild(textP);

    const tail = document.createElement("span");
    tail.style.position = "absolute";
    tail.style.bottom = "0";
    tail.style.width = "0";
    tail.style.height = "0";
    tail.style.borderStyle = "solid";

    if (msg.from === "user") {
      tail.style.borderColor = `transparent transparent transparent ${this.primaryColor}`;
    } else {
      tail.style.borderColor = "transparent #f8f9fa transparent transparent";
    }

    bubble.appendChild(tail);

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

    this.sendButton.disabled = this.input.value.trim() === "" || this.loading;
  }

  _hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  _updateFooter() {
    if (!this.chatPanel) return;
    
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
    
    // Actualizar imagen del bot en el botón flotante si no es personalizada
    if (this.floatingBtn && this.iconButton === this.bot.img) {
      if (this.iconButton && this.iconButton !== this.bot.img) {
        this.floatingBtn.innerHTML = `<img src="${this.iconButton}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
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

    // Debug: Log del estado actual
    console.log('_sendMessage - Estado actual:', {
      register: this.register,
      registered: this.registered,
      testMode: this.testMode,
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
        console.log('_sendMessage - Usando modo test');
        await this._handleTestResponse(msg);
      } else {
        // Verificar si estamos en proceso de registro ANTES de procesar el mensaje
        const isInRegistration = this.register && !this.registered;
        
        if (isInRegistration) {
          console.log('_sendMessage - Procesando registro');
          await this._handleRegistrationResponse(msg);
        } else if (this.registered) {
          // Envío normal de mensaje solo si está registrado
          console.log('_sendMessage - Enviando mensaje al API');
          const answer = await this._sendMessageToAPI(msg);
          this._addMessage("bot", answer);
        } else {
          // Si no está registrado y no está en modo registro, mostrar mensaje de error
          console.log('_sendMessage - Usuario no registrado');
          this._addMessage("bot", "Por favor, completa el registro primero. Necesito saber tu nombre para poder ayudarte.");
        }
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this._addMessage("bot", "Error al obtener respuesta. Intenta nuevamente.");
    } finally {
      this.loading = false;
      this.sendButton.disabled = false;
      // Ocultar indicador de "está escribiendo..."
      this._hideTypingIndicator();
      if (this.testMode || !this.register || this.registered) {
        this.input.focus();
      }
    }
  }

  // Nuevo método para mostrar indicador de "está escribiendo..."
  _showTypingIndicator() {
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
    
    // typingText.innerHTML = `
    //   <span class="text-muted small">${this.botName} está escribiendo</span>
    //   <div class="typing-dots ms-2">
    //     <span class="dot"></span>
    //     <span class="dot"></span>
    //     <span class="dot"></span>
    //   </div>
    // `;
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
    const message = userMessage.toLowerCase();
    
    // Simular delay de respuesta (más realista)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    // Detectar el nombre del usuario
    if (!this.user.name || this.user.name === "Usuario") {
      if (message.includes("me llamo") || message.includes("soy") || message.includes("mi nombre es")) {
        const nameMatch = message.match(/(?:me llamo|soy|mi nombre es)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)/i);
        if (nameMatch) {
          this.user.name = nameMatch[1].trim();
          const greeting = this.testMessages.greetings[Math.floor(Math.random() * this.testMessages.greetings.length)];
          this._addMessage("bot", greeting);
          return;
        }
      }
      
      // Si no se detectó nombre, pedir el nombre
      const welcome = this.testMessages.welcome[Math.floor(Math.random() * this.testMessages.welcome.length)];
      this._addMessage("bot", welcome);
      return;
    }
    
    // Respuestas basadas en palabras clave
    if (message.includes("hola") || message.includes("buenos días") || message.includes("buenas")) {
      const greeting = this.testMessages.greetings[Math.floor(Math.random() * this.testMessages.greetings.length)];
      this._addMessage("bot", greeting);
    } else if (message.includes("ayuda") || message.includes("qué puedes hacer") || message.includes("funciones")) {
      const help = this.testMessages.help[Math.floor(Math.random() * this.testMessages.help.length)];
      this._addMessage("bot", help);
    } else if (message.includes("curiosidad") || message.includes("dato") || message.includes("interesante") || message.includes("sabías")) {
      const curiosity = this.testMessages.curiosities[Math.floor(Math.random() * this.testMessages.curiosities.length)];
      this._addMessage("bot", curiosity);
    } else if (message.includes("gracias") || message.includes("grax")) {
      this._addMessage("bot", `¡De nada, ${this.user.name}! 😊 Me alegra poder ayudarte.`);
    } else if (message.includes("adiós") || message.includes("chao") || message.includes("hasta luego")) {
      this._addMessage("bot", `¡Hasta luego, ${this.user.name}! 👋 Que tengas un excelente día.`);
    } else {
      // Respuesta aleatoria para mensajes no reconocidos
      const unknown = this.testMessages.unknown[Math.floor(Math.random() * this.testMessages.unknown.length)];
      this._addMessage("bot", unknown);
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

  // Métodos públicos para manejar caché
  clearCache() {
    this._clearCache();
    console.log('Caché limpiado');
  }

  clearHistory() {
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    this._saveToCache();
    console.log('Historial de chat limpiado');
  }

  reloadFromCache() {
    if (this.cache) {
      const loaded = this._loadFromCache();
      if (loaded) {
        this._renderMessages();
        console.log('Datos recargados desde caché');
      } else {
        console.log('No hay datos en caché para recargar');
      }
    } else {
      console.log('Caché está deshabilitado');
    }
  }

  getCacheStatus() {
    if (!this.cache) {
      return { enabled: false, message: 'Caché deshabilitado' };
    }
    
    try {
      const cached = localStorage.getItem(this._getCacheKey());
      if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheAge = Date.now() - cacheData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;
        
        return {
          enabled: true,
          exists: true,
          expired: cacheAge >= maxAge,
          age: Math.floor(cacheAge / (1000 * 60)), // minutos
          messages: cacheData.messages?.length || 0,
          registered: cacheData.registered || false
        };
      } else {
        return { enabled: true, exists: false, message: 'No hay datos en caché' };
      }
    } catch (error) {
      return { enabled: true, exists: false, error: error.message };
    }
  }

  // Método público para verificar el estado del registro
  getRegistrationStatus() {
    return {
      registerOption: this.register,
      registered: this.registered,
      session: this.session ? true : false,
      licenseActive: this.license?.active || false,
      welcomeMessages: this.messages.filter(msg => msg.isWelcome).length,
      user: {
        name: this.user.name,
        email: this.user.email
      }
    };
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

  destroy() {
    // Remove DOM elements
    if (this.floatingBtn) this.floatingBtn.remove();
    if (this.chatPanel) this.chatPanel.remove();
    if (this.modal) this.modal.remove();

    // Remove event listeners
    window.removeEventListener('resize', this._boundHandleResize);

    // Nullify references
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = null;
      }
    }
    console.log('ChatBot instance destroyed');
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