// app.js - Solo la configuración de Express sin el servidor
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const { JWT_SECRET } = require('./config');

const app = express();

// Middleware global (el mismo que tienes en index.js)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware JWT (el mismo que tienes)
const verifyToken = (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/test') || req.path.startsWith('/api-docs')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Rutas (las mismas que tienes)
app.use('/alumnos', verifyToken, require('./rutas/alumnos'));
app.use('/inventario', verifyToken, require('./rutas/inventario'));
app.use('/prestamos', verifyToken, require('./rutas/prestamos'));
app.use('/auth', require('./rutas/auth'));

// Ruta de prueba pública
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente', 
    fecha: new Date().toLocaleString()
  });
});

module.exports = app;