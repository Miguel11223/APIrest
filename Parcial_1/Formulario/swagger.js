const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Escuela API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de escuela'
    },
    servers: [
      { url: 'https://localhost:8082' }
    ],
    tags: [
      { name: 'Auth', description: 'Gestión de autenticación y usuarios' },
      { name: 'Alumnos', description: 'Gestión de estudiantes' },
      { name: 'Inventario', description: 'Gestión de items y equipos' },
      { name: 'Prestamos', description: 'Gestión de préstamos' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        AuthLogin: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', format: 'password', example: '12345' }
          }
        },
        Alumno: {
          type: 'object',
          properties: {
            id_alumno: { type: 'integer' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            email: { type: 'string' },
            semestre: { type: 'string' },
            num_control: { type: 'string' },
            carrera: { type: 'string' }
          }
        },
        AlumnoInput: {
           type: 'object',
           required: ['num_control'],
           properties: {
             num_control: { type: 'string', example: '18293040' }
           }
        },
        Item: {
          type: 'object',
          required: ['nombre_item', 'cantidad_disponible'],
          properties: {
            id_item: { type: 'integer' },
            nombre_item: { type: 'string', example: 'Proyector Epson' },
            descripcion: { type: 'string', example: 'Proyector HDMI 4K' },
            cantidad_disponible: { type: 'integer', example: 5 }
          }
        },
        PrestamoInput: {
          type: 'object',
          required: ['id_alumno', 'id_item'],
          properties: {
            id_alumno: { type: 'integer', example: 1 },
            id_item: { type: 'integer', example: 3 }
          }
        },
        PrestamoResponse: {
            type: 'object',
            properties: {
              id_prestamo: { type: 'integer' },
              fecha_prestamo: { type: 'string', format: 'date-time' },
              fecha_devolucion: { type: 'string', format: 'date-time' },
              estado: { type: 'string' },
              num_control: { type: 'string' },
              nombre_item: { type: 'string' }
            }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, 'rutas/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;