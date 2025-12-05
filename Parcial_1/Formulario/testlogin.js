const request = require('supertest');
const app = require('./app');

async function testLoginReal() {
  console.log('=== Probando login real ===\n');
  
  console.log('1. Intentando login con admin:12345');
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'admin',
      password: '12345'
    });
  
  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(response.body, null, 2));
  
  if (response.status === 200 && response.body.token) {
    const token = response.body.token;
    console.log('\nToken obtenido!');
    
    // 2. Probar ruta protegida con el token
    console.log('\n2. Probando /inventario con token...');
    const inventarioResponse = await request(app)
      .get('/inventario')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status inventario:', inventarioResponse.status);
    console.log('Body inventario:', JSON.stringify(inventarioResponse.body, null, 2));
  } else {
    console.log('\nNo se pudo obtener token');
    console.log('Posibles causas:');
    console.log('- Usuario admin no existe en BD');
    console.log('- Password incorrecto');
    console.log('- Error en bcrypt/JWT');
  }
}

testLoginReal().catch(console.error);