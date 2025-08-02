const ChatBot = require('../src/index.js');

describe('Test de Mocks', () => {
  test('debe usar mocks de localStorage correctamente', () => {
    // Configurar mock
    localStorage.getItem.mockReturnValue('test-value');
    localStorage.setItem.mockImplementation(() => {});
    
    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      tenant: 'test-tenant'
    };

    const chatBot = new ChatBot(options);
    
    // Verificar que se puede acceder a localStorage
    expect(localStorage.getItem).toBeDefined();
    expect(localStorage.setItem).toBeDefined();
    
    // Verificar que los mocks funcionan
    expect(localStorage.getItem('test')).toBe('test-value');
    expect(localStorage.setItem).toHaveBeenCalledTimes(0);
  });

  test('debe usar mocks de fetch correctamente', () => {
    // Configurar mock de fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      tenant: 'test-tenant'
    };

    const chatBot = new ChatBot(options);
    
    // Verificar que fetch está disponible
    expect(global.fetch).toBeDefined();
    expect(typeof global.fetch).toBe('function');
  });

  test('debe usar mocks de Bootstrap correctamente', () => {
    const options = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      tenant: 'test-tenant'
    };

    const chatBot = new ChatBot(options);
    
    // Verificar que Bootstrap está disponible
    expect(global.bootstrap).toBeDefined();
    expect(global.bootstrap.Modal).toBeDefined();
    expect(typeof global.bootstrap.Modal).toBe('function');
  });

  test('debe limpiar mocks después de cada test', () => {
    // Este test verifica que los mocks se limpian correctamente
    expect(localStorage.getItem).toHaveBeenCalledTimes(0);
    expect(localStorage.setItem).toHaveBeenCalledTimes(0);
  });
}); 