// const express = require('express');
// const app = express();
// const routerClientes = require('./rutas/clientes.js');
// const routerProveedor = require('./rutas/proveedor.js');
// const cors = require('cors')
// const morgan = require ('morgan');
// const multer = require('multer');
// const port = 3000

// //middleware
// // const logRequest = (req, res, next) => {
// //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
// //   next();
// // };

// // const checkApiKey = (req, res, next) => {
// //   const apiKey = req.headers['x-api-key'];
// //   if (!apiKey || apiKey !== 'mi-clave-secreta') {
// //     return res.status(401).send('Acceso no autorizado: se requiere una clave API válida');
// //   }
// //   next();
// // };

// // app.use(logRequest);
// // app.use(checkApiKey);

// //cors express


// //aca va lo que pegue en clientes 
// //Funciiones middleware
// app.use(express.json());

// app.use(morgan('combined'))
// app.use(cors());

// //rutas 
//   app.use('/',routerClientes.router);
//   app.use('/proveedor',routerProveedor.router);
// app.listen(port, () => {
//   console.log(`El puerto en el que corre es el  ${port}`)
// })



const express = require('express');
const app = express();
const routerClientes = require('./rutas/clientes.js');
const routerProveedor = require('./rutas/proveedor.js');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const port = 3000;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(express.json());
app.use(morgan('dev', { stream: accessLogStream })); 
app.use(cors());

// Rutas
app.use('/', routerClientes.router);
app.use('/proveedor', routerProveedor.router);

// Start server
app.listen(port, () => {
  console.log(`El puerto en el que corre es el ${port}`);
});