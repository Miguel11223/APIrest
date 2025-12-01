const request = require('supertest');
const app = require('../index');

describe('Alumnos API', () => {
  let authToken;
  let testAlumnoId;

  beforeAll(async () => {
    // Login para obtener token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: '12345'
      });
    
    authToken = loginResponse.body.token;
  });

  /**
   * Test: Obtener todos los alumnos
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/alumnos', {
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * });
   */
  describe('GET /alumnos', () => {
    it('debería obtener todos los alumnos', async () => {
      const response = await request(app)
        .get('/alumnos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería fallar sin token', async () => {
      await request(app)
        .get('/alumnos')
        .expect(401);
    });
  });

  /**
   * Test: Crear alumno
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/alumnos', {
   *   method: 'POST',
   *   headers: {
   *     'Authorization': 'Bearer ' + token,
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({
   *     num_control: "2024001"
   *   })
   * });
   */
  describe('POST /alumnos', () => {
    it('debería crear un nuevo alumno', async () => {
      const alumnoData = {
        num_control: `TEST${Date.now()}`
      };

      const response = await request(app)
        .post('/alumnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(alumnoData)
        .expect(201);

      expect(response.body).toHaveProperty('id_alumno');
      expect(response.body).toHaveProperty('mensaje');

      testAlumnoId = response.body.id_alumno;
    });
  });

  /**
   * Test: Actualizar alumno
   * @example
   * // Código de ejemplo
   * const response = await fetch('https://localhost:8082/alumnos/1', {
   *   method: 'PUT',
   *   headers: {
   *     'Authorization': 'Bearer ' + token,
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({
   *     num_control: "2024001-UPDATED"
   *   })
   * });
   */
  describe('PUT /alumnos/:id', () => {
    it('debería actualizar un alumno existente', async () => {
      const updateData = {
        num_control: `UPDATED${Date.now()}`
      };

      const response = await request(app)
        .put(`/alumnos/${testAlumnoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
    });
  });
});