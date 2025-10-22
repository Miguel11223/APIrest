const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const https = require('https');  

const { JWT_SECRET } = require('./config');

const { handleGlobalError } = require('./ManejadorErrores/ManErrores');

const app = express();
const port = 8082;  

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

// JWT Middleware
const verifyToken = (req, res, next) => {
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
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

// rutas generales
try {
  const alumnosRouter = require('./rutas/alumnos');
  const inventarioRouter = require('./rutas/inventario');
  const prestamosRouter = require('./rutas/prestamos');
  const authRouter = require('./rutas/auth');
  app.use('/alumnos', verifyToken, alumnosRouter.router);
  app.use('/inventario', verifyToken, inventarioRouter.router);
  app.use('/prestamos', verifyToken, prestamosRouter.router);
  app.use('/auth', authRouter.router);
  console.log('Rutas montadas correctamente');
} catch (err) {
  console.error('Error al cargar rutas:', err.message);
}

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando en puerto ' + port });
});

app.use((err, req, res, next) => {
  handleGlobalError(err, req, res);
});

//Openssl
const privateKey = fs.readFileSync(path.join(__dirname, './Api_openssl/key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './Api_openssl/cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crear servidor HTTPS
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
});