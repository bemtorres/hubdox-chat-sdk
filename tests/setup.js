// Configuración global para Jest
require('@testing-library/jest-dom');

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock de fetch
global.fetch = jest.fn();

// Mock de Bootstrap
global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};

// Mock de console para evitar logs en tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock de window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock de document.createElement para evitar errores de DOM
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = originalCreateElement.call(document, tagName);
  
  // Mock de métodos que podrían no existir en jsdom
  if (!element.addEventListener) {
    element.addEventListener = jest.fn();
  }
  if (!element.removeEventListener) {
    element.removeEventListener = jest.fn();
  }
  if (!element.dispatchEvent) {
    element.dispatchEvent = jest.fn();
  }
  if (!element.remove) {
    element.remove = jest.fn();
  }
  
  return element;
};

// Limpiar todos los mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
  
  // Resetear localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
}); 