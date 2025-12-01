const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const https = require('https');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const { JWT_SECRET } = require('./config');
const { handleGlobalError } = require('./ManejadorErrores/ManErrores');

const app = express();
const port = 8082;

// Stream para logs de acceso
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware global
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, 'public')));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware JWT (excluye rutas públicas)
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

// Cargar rutas (asumiendo que ahora cada archivo exporta directamente el router con module.exports = router)
let alumnosRouter, inventarioRouter, prestamosRouter, authRouter;

try {
  alumnosRouter    = require('./rutas/alumnos');
  inventarioRouter = require('./rutas/inventario');
  prestamosRouter  = require('./rutas/prestamos');
  authRouter       = require('./rutas/auth');

  app.use('/alumnos', verifyToken, alumnosRouter);
  app.use('/inventario', verifyToken, inventarioRouter);
  app.use('/prestamos', verifyToken, prestamosRouter);
  app.use('/auth', authRouter);

  console.log('Todas las rutas cargadas correctamente');
} catch (err) {
  console.error('Error al cargar las rutas:', err.message);
  process.exit(1);
}

// Ruta de prueba pública
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente', 
    puerto: port,
    fecha: new Date().toLocaleString()
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  handleGlobalError(err, req, res);
});

// Certificados SSL
const privateKey = fs.readFileSync(path.join(__dirname, './Api_openssl/key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './Api_openssl/cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Iniciar servidor HTTPS
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
  console.log(`Documentación Swagger disponible en https://localhost:${port}/api-docs`);
});
