const request = require('supertest');
const app = require('../index'); // Tu app Express

describe('Auth API', () => {
  let authToken;

  /**
   * Test: Registro de usuario
   * @example
   * // Código de ejemplo para registro
   * const response = await fetch('https://localhost:8082/auth/register', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     username: "testuser",
   *     password: "testpass123"
   *   })
   * });
   */
  describe('POST /auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body).toHaveProperty('id');
    });

    it('debería fallar si el usuario ya existe', async () => {
      const userData = {
        username: 'admin',
        password: '12345'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Test: Login de usuario
   * @example
   * // Código de ejemplo para login
   * const response = await fetch('https://localhost:8082/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     username: "admin",
   *     password: "12345"
   *   })
   * });
   * const { token } = await response.json();
   */
  describe('POST /auth/login', () => {
    it('debería hacer login y retornar token', async () => {
      const loginData = {
        username: 'admin',
        password: '12345'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('mensaje', 'Login exitoso');

      authToken = response.body.token;
    });

    it('debería fallar con credenciales incorrectas', async () => {
      const loginData = {
        username: 'admin',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});