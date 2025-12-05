const request = require('supertest');
const app = require('../index'); // Tu app Express

describe('Auth API', () => {
  let authToken;
  let testUserId;

  /**
   * Limpiar datos de prueba después de las pruebas
   */
  afterAll(async () => {
    if (testUserId) {
      try {
        await User.destroy({ where: { username: { [Op.like]: 'testuser_%' } } });
      } catch (error) {
        console.log('Error limpiando usuarios de prueba:', error.message);
      }
    }
  });

  /**
   * Test: Registro de usuario
   */
  describe('POST /auth/register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body).toHaveProperty('id');
      expect(response.body.mensaje).toMatch(/registrado|creado|éxito/i);
      
      // Guardar ID para limpieza posterior
      if (response.body.id) {
        testUserId = response.body.id;
      }
    });

    it('debería fallar si el usuario ya existe', async () => {
      // Primero crear un usuario
      const existingUser = {
        username: `existing_${Date.now()}`,
        password: 'TestPass123!',
        email: `existing_${Date.now()}@example.com`
      };

      await request(app)
        .post('/auth/register')
        .send(existingUser)
        .expect(201);

      // Intentar registrar el mismo usuario otra vez
      const response = await request(app)
        .post('/auth/register')
        .send(existingUser)
        .expect(400); // Cambiado de 500 a 400 para error de cliente

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/ya existe|existente|duplicado/i);
    });

    it('debería validar campos requeridos', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          // Falta username o password
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/requerido|faltante|obligatorio/i);
    });

    it('debería validar fortaleza de contraseña', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: `weakpass_${Date.now()}`,
          password: '123', // Contraseña muy débil
          email: `weak_${Date.now()}@example.com`
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/contraseña|password|débil|fuerte/i);
    });
  });

  /**
   * Test: Login de usuario
   */
  describe('POST /auth/login', () => {
    // Crear un usuario de prueba antes de las pruebas de login
    beforeAll(async () => {
      const testUser = {
        username: `loginuser_${Date.now()}`,
        password: 'LoginPass123!',
        email: `login_${Date.now()}@example.com`
      };

      await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Guardar credenciales para las pruebas
      testUserCredentials = testUser;
    });

    it('debería hacer login exitosamente y retornar token válido', async () => {
      const loginData = {
        username: testUserCredentials.username,
        password: testUserCredentials.password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('mensaje', 'Login exitoso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', loginData.username);
      
      // Verificar que el token tenga formato JWT
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      authToken = response.body.token;
    });

    it('debería fallar con credenciales incorrectas', async () => {
      const loginData = {
        username: testUserCredentials.username,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/credenciales|incorrectas|inválidas/i);
    });

    it('debería fallar si el usuario no existe', async () => {
      const loginData = {
        username: 'usuario_inexistente_12345',
        password: 'cualquierpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/usuario|encontrado|existente/i);
    });

    it('debería validar campos requeridos en login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          // Solo username, sin password
          username: testUserCredentials.username
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Test: Verificación de token y rutas protegidas
   */
  describe('Verificación de autenticación', () => {
    it('debería acceder a ruta protegida con token válido', async () => {
      const response = await request(app)
        .get('/api/protected') // Cambiar por tu ruta protegida real
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toMatch(/protegido|autorizado|bienvenido/i);
    });

    it('debería fallar al acceder a ruta protegida sin token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token|autorización|no autorizado/i);
    });

    it('debería fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token_invalido_12345')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar con token mal formado', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'MalformedToken')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Test: Logout (si implementas esta funcionalidad)
   */
  describe('POST /auth/logout', () => {
    it('debería hacer logout exitosamente', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // O 204 si no retorna contenido

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toMatch(/logout|sesión|cerrado/i);
    });

    it('debería invalidar el token después de logout', async () => {
      // Primero hacer logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Intentar usar el mismo token después de logout
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401); // Debería fallar

      expect(response.body).toHaveProperty('error');
    });
  });
});