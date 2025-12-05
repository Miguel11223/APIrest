// tests/setup.js
const request = require('supertest');
const app = require('../index');

// Función para obtener token de prueba
global.getAuthToken = async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'testuser',
      password: 'testpassword'
    });
  
  if (response.status === 200 && response.body.token) {
    return response.body.token;
  }
  
  console.warn('Login falló, usando token mock');
  return 'mock_token_for_testing';
};

jest.setTimeout(30000);