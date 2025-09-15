const express = require('express');
const app = express();
const clientesRouter = require('./rutas/clientes.js');
const proveedoresRouter = require('./rutas/proveedor.js');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const port = 3000;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'anime_db',
});

// Multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, gif)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Middleware
app.use(express.json());
app.use(morgan('dev', { stream: accessLogStream }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Routes
app.use('/clientes', upload.single('profileImage'), clientesRouter.router);
app.use('/proveedores', upload.single('profileImage'), proveedoresRouter.router);

app.listen(port, () => {
  console.log(`El puerto en el que corre es el ${port}`);
});