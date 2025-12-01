const request = require('supertest');
const app = require('../index'); // Asegúrate de que tu app Express exporte el servidor

describe('Inventario API', () => {
  let authToken;
  let testItemId;

  beforeAll(async () => {
    // Login para obtener token antes de todas las pruebas
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: '12345'
      });
    
    authToken = loginResponse.body.token;
  });

  /**
   * Test: Obtener todo el inventario
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/inventario', {
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * });
   * const inventario = await response.json();
   */
  describe('GET /inventario', () => {
    it('debería obtener todos los items del inventario', async () => {
      const response = await request(app)
        .get('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Verificar estructura de los items
      if (response.body.length > 0) {
        const item = response.body[0];
        expect(item).toHaveProperty('id_item');
        expect(item).toHaveProperty('nombre_item');
        expect(item).toHaveProperty('cantidad_disponible');
      }
    });

    it('debería fallar sin token de autorización', async () => {
      await request(app)
        .get('/inventario')
        .expect(401);
    });
  });

  /**
   * Test: Crear nuevo item en inventario
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/inventario', {
   *   method: 'POST',
   *   headers: {
   *     'Authorization': 'Bearer ' + token,
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({
   *     nombre_item: "Laptop Dell",
   *     descripcion: "Laptop Dell Inspiron 15",
   *     cantidad_disponible: 5
   *   })
   * });
   */
  describe('POST /inventario', () => {
    it('debería crear un nuevo item en el inventario', async () => {
      const itemData = {
        nombre_item: `Item Test ${Date.now()}`,
        descripcion: 'Descripción del item de prueba',
        cantidad_disponible: 10
      };

      const response = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body).toHaveProperty('id_item');
      expect(response.body.mensaje).toContain('agregado');

      testItemId = response.body.id_item;
    });

    it('debería fallar si falta el nombre del item', async () => {
      const invalidItemData = {
        descripcion: 'Item sin nombre',
        cantidad_disponible: 5
      };

      const response = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidItemData)
        .expect(400);

      expect(response.body).toHaveProperty('errores');
    });

    it('debería fallar si la cantidad es negativa', async () => {
      const invalidItemData = {
        nombre_item: 'Item con cantidad negativa',
        cantidad_disponible: -5
      };

      const response = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidItemData)
        .expect(400);

      expect(response.body).toHaveProperty('errores');
    });
  });

  /**
   * Test: Actualizar item existente
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/inventario/1', {
   *   method: 'PUT',
   *   headers: {
   *     'Authorization': 'Bearer ' + token,
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({
   *     nombre_item: "Laptop Dell Actualizada",
   *     descripcion: "Laptop Dell Inspiron 15 - Nueva versión",
   *     cantidad_disponible: 8
   *   })
   * });
   */
  describe('PUT /inventario/:id', () => {
    it('debería actualizar un item existente', async () => {
      // Primero creamos un item para luego actualizarlo
      const createResponse = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre_item: `Item para actualizar ${Date.now()}`,
          descripcion: 'Descripción inicial',
          cantidad_disponible: 5
        });

      const itemId = createResponse.body.id_item;

      const updateData = {
        nombre_item: 'Item Actualizado',
        descripcion: 'Descripción actualizada',
        cantidad_disponible: 15
      };

      const response = await request(app)
        .put(`/inventario/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('actualizado');
    });

    it('debería fallar al actualizar un item que no existe', async () => {
      const updateData = {
        nombre_item: 'Item Inexistente',
        cantidad_disponible: 10
      };

      await request(app)
        .put('/inventario/99999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(500); // O el código de error que devuelve tu API
    });
  });

  /**
   * Test: Eliminar item del inventario
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/inventario/1', {
   *   method: 'DELETE',
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * });
   */
  describe('DELETE /inventario/:id', () => {
    it('debería eliminar un item existente', async () => {
      // Primero creamos un item para luego eliminarlo
      const createResponse = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre_item: `Item para eliminar ${Date.now()}`,
          descripcion: 'Este item será eliminado',
          cantidad_disponible: 3
        });

      const itemId = createResponse.body.id_item;

      const response = await request(app)
        .delete(`/inventario/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('eliminado');
    });

    it('debería fallar al eliminar un item que no existe', async () => {
      await request(app)
        .delete('/inventario/99999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500); // O el código de error que devuelve tu API
    });
  });

  /**
   * Test: Integración - Flujo completo de inventario
   * @example
   * // Código de ejemplo de flujo completo
   * // 1. Crear item
   * // 2. Obtener items
   * // 3. Actualizar item
   * // 4. Eliminar item
   */
  describe('Flujo completo de inventario', () => {
    it('debería completar el flujo CRUD completo', async () => {
      // 1. CREAR
      const createData = {
        nombre_item: `Item Flujo Completo ${Date.now()}`,
        descripcion: 'Item para prueba de flujo completo',
        cantidad_disponible: 20
      };

      const createResponse = await request(app)
        .post('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createData)
        .expect(201);

      const itemId = createResponse.body.id_item;

      // 2. LEER (verificar que se creó)
      const readResponse = await request(app)
        .get('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const createdItem = readResponse.body.find(item => item.id_item === itemId);
      expect(createdItem).toBeDefined();
      expect(createdItem.nombre_item).toBe(createData.nombre_item);

      // 3. ACTUALIZAR
      const updateData = {
        nombre_item: 'Item Actualizado Flujo',
        descripcion: 'Descripción actualizada del flujo',
        cantidad_disponible: 25
      };

      await request(app)
        .put(`/inventario/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // 4. ELIMINAR
      await request(app)
        .delete(`/inventario/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 5. VERIFICAR ELIMINACIÓN
      const finalResponse = await request(app)
        .get('/inventario')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedItem = finalResponse.body.find(item => item.id_item === itemId);
      expect(deletedItem).toBeUndefined();
    });
  });
});