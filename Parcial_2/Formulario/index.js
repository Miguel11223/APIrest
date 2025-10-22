const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const { handleGlobalError } = require('./ManejadorErrores/ManErrores');

const app = express();
const port = 8082;
const API_KEY = 'mi_clave_api_123456789'; // Clave API fija, cambiar en producción

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar X-API-Key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Acceso denegado. Clave API no proporcionada.' });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Clave API inválida.' });
  }

  next();
};

// rutas generales
try {
  const alumnosRouter = require('./rutas/alumnos');
  const inventarioRouter = require('./rutas/inventario');
  const prestamosRouter = require('./rutas/prestamos');
  app.use('/alumnos', verifyApiKey, alumnosRouter.router);
  app.use('/inventario', verifyApiKey, inventarioRouter.router);
  app.use('/prestamos', verifyApiKey, prestamosRouter.router);
  console.log('Rutas montadas correctamente');
} catch (err) {
  console.error('Error al cargar rutas:', err.message);
}

// Ruta 
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando en puerto ' + port });
});

app.use((err, req, res, next) => {
  handleGlobalError(err, req, res);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});