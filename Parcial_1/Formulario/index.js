const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const clientesRouter = require('./rutas/clientes');
const mascotasRouter = require('./rutas/mascotas');

const app = express();
const port = process.env.PORT || 8082;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: accessLogStream }));
app.use('/archivos', express.static(path.join(__dirname, 'archivos')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/clientes', clientesRouter.router);
app.use('/mascota', mascotasRouter.router); 
app.use('/mascotas', mascotasRouter.router); 
app.use('/consulta-pdf', mascotasRouter.router); 

// Start server
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});