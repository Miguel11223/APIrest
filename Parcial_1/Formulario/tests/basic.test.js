describe('Configuración básica de Jest', () => {
    test('debería sumar correctamente', () => {
      expect(1 + 1).toBe(2);
    });
  
    test('debería verificar truthy values', () => {
      expect(true).toBeTruthy();
      expect('hello').toBeTruthy();
    });
  
    test('debería manejar arrays', () => {
      const array = [1, 2, 3];
      expect(array).toHaveLength(3);
      expect(array).toContain(2);
    });
  });