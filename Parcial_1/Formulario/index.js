const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const { handleGlobalError } = require('./ManejadorErrores/ManErrores');

const app = express();
const port = process.env.PORT || 8082;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, 'public')));

// rutas generales
try {
  const alumnosRouter = require('./rutas/alumnos');
  const inventarioRouter = require('./rutas/inventario');
  const prestamosRouter = require('./rutas/prestamos');
  app.use('/alumnos', alumnosRouter.router);
  app.use('/inventario', inventarioRouter.router);
  app.use('/prestamos', prestamosRouter.router);
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