const request = require('supertest');
const app = require('../index');

describe('Préstamos API', () => {
  let authToken;
  let testPrestamoId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: '12345'
      });
    
    authToken = loginResponse.body.token;
  });

  /**
   * Test: Obtener préstamos
   * @example
   * // Código de ejemplo con filtro
   * const response = await fetch('https://localhost:8082/prestamos?num_control=18293040', {
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * });
   */
  describe('GET /prestamos', () => {
    it('debería obtener todos los préstamos', async () => {
      const response = await request(app)
        .get('/prestamos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería filtrar préstamos por número de control', async () => {
      const response = await request(app)
        .get('/prestamos?num_control=18293040')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  /**
   * Test: Generar reporte
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/prestamos/report?id_prestamo=1', {
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * });
   * // El response será un archivo TXT para descargar
   */
  describe('GET /prestamos/report', () => {
    it('debería generar reporte de préstamo', async () => {
      // Primero necesitamos un ID de préstamo válido
      // Esto asume que existe al menos un préstamo en la BD
      const prestamosResponse = await request(app)
        .get('/prestamos')
        .set('Authorization', `Bearer ${authToken}`);

      if (prestamosResponse.body.length > 0) {
        const prestamoId = prestamosResponse.body[0].id_prestamo;
        
        const response = await request(app)
          .get(`/prestamos/report?id_prestamo=${prestamoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.text).toBeDefined();
      }
    });

    it('debería fallar sin id_prestamo', async () => {
      await request(app)
        .get('/prestamos/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});