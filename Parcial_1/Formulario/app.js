const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const { JWT_SECRET } = require('./config');
const { handleGlobalError } = require('./ManejadorErrores/ManErrores');

const app = express();

// Middleware global
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware JWT
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
 //rutas
try {
  const alumnosRouter = require('./rutas/alumnos');
  const inventarioRouter = require('./rutas/inventario');
  const prestamosRouter = require('./rutas/prestamos');
  const authRouter = require('./rutas/auth');

  app.use('/alumnos', verifyToken, alumnosRouter);
  app.use('/inventario', verifyToken, inventarioRouter);
  app.use('/prestamos', verifyToken, prestamosRouter);
  app.use('/auth', authRouter);

  console.log('Todas las rutas cargadas correctamente');
} catch (err) {
  console.error('Error al cargar las rutas:', err.message);
}

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente', 
    fecha: new Date().toLocaleString()
  });
});

app.use((err, req, res, next) => {
  handleGlobalError(err, req, res);
});

module.exports = app; 