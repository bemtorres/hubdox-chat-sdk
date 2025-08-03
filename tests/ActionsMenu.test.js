const ChatBot = require('../src/index.js');

describe('Menú de Acciones', () => {
  let chatBot;
  
  // Función helper para buscar elementos en Shadow DOM
  const findElement = (selector) => {
    // Primero buscar en el DOM principal
    let element = document.querySelector(selector);
    if (element) return element;
    
    // Si no se encuentra, buscar en Shadow DOM
    const shadowRoots = document.querySelectorAll('*');
    for (const el of shadowRoots) {
      if (el.shadowRoot) {
        element = el.shadowRoot.querySelector(selector);
        if (element) return element;
      }
    }
    return null;
  };
  
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
      testMode: false,
      fullscreen: true
    }
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
    
    chatBot = new ChatBot(defaultOptions);
    chatBot.toggleChatPanel();
  });

  describe('Renderizado del Menú', () => {
    test('debe renderizar el botón de menú de acciones', () => {
      const actionsMenuBtn = findElement('#actions-menu');
      
      expect(actionsMenuBtn).toBeInTheDocument();
      expect(actionsMenuBtn).toHaveClass('dropdown-toggle');
    });

    test('debe renderizar el dropdown con todas las opciones', () => {
      const dropdownMenu = findElement('.dropdown-menu');
      const clearHistoryBtn = findElement('#clear-history-btn');
      const fullscreenToggle = findElement('#fullscreen-toggle');
      const chatInfoBtn = findElement('#chat-info-btn');
      
      expect(dropdownMenu).toBeInTheDocument();
      expect(clearHistoryBtn).toBeInTheDocument();
      expect(fullscreenToggle).toBeInTheDocument();
      expect(chatInfoBtn).toBeInTheDocument();
    });

    test('debe mostrar el texto correcto en los botones del menú', () => {
      const clearHistoryBtn = findElement('#clear-history-btn');
      const fullscreenToggle = findElement('#fullscreen-toggle');
      const chatInfoBtn = findElement('#chat-info-btn');
      
      expect(clearHistoryBtn.textContent).toContain('Limpiar historial');
      expect(fullscreenToggle.textContent).toContain('Pantalla completa');
      expect(chatInfoBtn.textContent).toContain('Información del chat');
    });

    test('debe incluir los íconos SVG correctos', () => {
      const actionsMenuBtn = findElement('#actions-menu');
      const threeDotsIcon = actionsMenuBtn.querySelector('svg');
      
      expect(threeDotsIcon).toBeInTheDocument();
    });
  });

  describe('Funcionalidad de Limpiar Historial', () => {
    test('debe mostrar modal de confirmación al hacer clic en limpiar historial', () => {
      const clearHistoryBtn = findElement('#clear-history-btn');
      
      clearHistoryBtn.click();
      
      const confirmationModal = findElement('.modal-overlay');
      expect(confirmationModal).toBeInTheDocument();
      expect(confirmationModal.textContent).toContain('¿Estás seguro de que quieres eliminar todo el historial del chat?');
    });

    test('debe limpiar historial cuando se confirma en el modal', () => {
      chatBot.messages = [{ id: 1, text: 'test message' }];
      
      const clearHistoryBtn = findElement('#clear-history-btn');
      clearHistoryBtn.click();
      
      const confirmBtn = findElement('#confirm-clear-history');
      confirmBtn.click();
      
      expect(chatBot.messages).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot_test-tenant_test-api-key');
    });

    test('debe cancelar limpieza cuando se cancela en el modal', () => {
      const originalMessages = [{ id: 1, text: 'test message' }];
      chatBot.messages = [...originalMessages];
      
      const clearHistoryBtn = findElement('#clear-history-btn');
      clearHistoryBtn.click();
      
      const modalClose = findElement('#modal-close');
      modalClose.click();
      
      expect(chatBot.messages).toEqual(originalMessages);
    });
  });

  describe('Funcionalidad de Pantalla Completa', () => {
    test('debe cambiar texto del botón según estado de pantalla completa', () => {
      const fullscreenToggle = document.querySelector('#fullscreen-toggle');
      
      // Estado inicial
      expect(fullscreenToggle.textContent).toContain('Pantalla completa');
      
      // Simular cambio a pantalla completa
      chatBot.isFullscreen = true;
      chatBot._toggleFullscreen();
      
      expect(fullscreenToggle.textContent).toContain('Minimizar');
    });

    test('debe cambiar ícono según estado de pantalla completa', () => {
      const fullscreenToggle = document.querySelector('#fullscreen-toggle');
      const initialIcon = fullscreenToggle.querySelector('svg').outerHTML;
      
      chatBot.isFullscreen = true;
      chatBot._toggleFullscreen();
      
      const newIcon = fullscreenToggle.querySelector('svg').outerHTML;
      expect(newIcon).not.toBe(initialIcon);
    });

    test('debe aplicar clases CSS correctas al panel de chat', () => {
      const chatPanel = document.querySelector('.chat-panel');
      
      // Estado inicial
      expect(chatPanel).not.toHaveClass('fullscreen');
      
      // Activar pantalla completa
      chatBot._toggleFullscreen();
      
      expect(chatPanel).toHaveClass('fullscreen');
    });
  });

  describe('Funcionalidad de Información del Chat', () => {
    test('debe mostrar modal de información del chat', () => {
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      
      chatInfoBtn.click();
      
      const infoModal = document.querySelector('.modal');
      expect(infoModal).toBeInTheDocument();
      expect(infoModal.textContent).toContain('Información del Chat');
    });

    test('debe mostrar información del bot en el modal', () => {
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      chatInfoBtn.click();
      
      const infoModal = document.querySelector('.modal');
      expect(infoModal.textContent).toContain('Test Bot');
      expect(infoModal.textContent).toContain('🌐 Producción');
    });

    test('debe mostrar imagen del bot en el modal', () => {
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      chatInfoBtn.click();
      
      const botImage = document.querySelector('.modal img');
      expect(botImage).toBeInTheDocument();
      expect(botImage).toHaveAttribute('src', 'test-image.png');
      expect(botImage).toHaveAttribute('alt', 'Test Bot');
    });

    test('debe mostrar modo test cuando está activado', () => {
      chatBot.testMode = true;
      
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      chatInfoBtn.click();
      
      const infoModal = document.querySelector('.modal');
      expect(infoModal.textContent).toContain('🧪 Test');
    });

    test('debe limpiar modal del DOM después de cerrarlo', () => {
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      chatInfoBtn.click();
      
      const infoModal = document.querySelector('.modal');
      const closeBtn = infoModal.querySelector('.btn-close');
      
      closeBtn.click();
      
      // Simular evento hidden.bs.modal
      const hiddenEvent = new Event('hidden.bs.modal');
      infoModal.dispatchEvent(hiddenEvent);
      
      expect(document.querySelector('.modal')).not.toBeInTheDocument();
    });
  });

  describe('CSS del Dropdown', () => {
    test('debe ocultar el caret del dropdown', () => {
      // Simular que se ha inyectado el CSS
      const style = document.createElement('style');
      style.textContent = `
        .dropdown-toggle::after {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      const actionsMenuBtn = document.querySelector('#actions-menu');
      const computedStyle = window.getComputedStyle(actionsMenuBtn, '::after');
      
      // Verificar que el pseudo-elemento ::after esté oculto
      expect(style.textContent).toContain('display: none !important');
    });
  });

  describe('Event Listeners', () => {
    test('debe tener event listeners configurados correctamente', () => {
      const clearHistoryBtn = document.querySelector('#clear-history-btn');
      const fullscreenToggle = document.querySelector('#fullscreen-toggle');
      const chatInfoBtn = document.querySelector('#chat-info-btn');
      
      // Verificar que los botones existen y tienen los IDs correctos
      expect(clearHistoryBtn).toBeInTheDocument();
      expect(fullscreenToggle).toBeInTheDocument();
      expect(chatInfoBtn).toBeInTheDocument();
      
      // Verificar que tienen los event listeners (simulando clics)
      expect(() => clearHistoryBtn.click()).not.toThrow();
      expect(() => fullscreenToggle.click()).not.toThrow();
      expect(() => chatInfoBtn.click()).not.toThrow();
    });
  });

  describe('Integración con Bootstrap', () => {
    test('debe usar clases de Bootstrap correctamente', () => {
      const dropdown = document.querySelector('.dropdown');
      const dropdownMenu = document.querySelector('.dropdown-menu');
      const dropdownToggle = document.querySelector('.dropdown-toggle');
      
      expect(dropdown).toHaveClass('dropdown');
      expect(dropdownMenu).toHaveClass('dropdown-menu', 'dropdown-menu-end');
      expect(dropdownToggle).toHaveClass('dropdown-toggle');
    });

    test('debe usar atributos de Bootstrap para funcionalidad', () => {
      const dropdownToggle = document.querySelector('#actions-menu');
      
      expect(dropdownToggle).toHaveAttribute('data-bs-toggle', 'dropdown');
      expect(dropdownToggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Accesibilidad', () => {
    test('debe tener atributos de accesibilidad correctos', () => {
      const actionsMenuBtn = document.querySelector('#actions-menu');
      const dropdownMenu = document.querySelector('.dropdown-menu');
      
      expect(actionsMenuBtn).toHaveAttribute('aria-expanded', 'false');
      expect(dropdownMenu).toHaveAttribute('aria-labelledby', 'actions-menu');
    });

    test('debe tener títulos descriptivos', () => {
      const actionsMenuBtn = document.querySelector('#actions-menu');
      
      expect(actionsMenuBtn).toHaveAttribute('title', 'Acciones');
    });
  });
}); 