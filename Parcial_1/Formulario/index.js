const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const clientesRouter = require('./rutas/clientes');
const mascotasController = require('./Controladores/mascotasController');

const app = express();
const port = process.env.PORT || 8082;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, 'archivos');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png).'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});




// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: accessLogStream }));
app.use('/archivos', express.static(path.join(__dirname, 'archivos')));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de clientes
app.use('/clientes', clientesRouter.router);

// Rutas
app.get('/mascotas', mascotasController.getAll);
app.post('/mascota', upload.single('mascota_imagen'), mascotasController.add);
app.delete('/mascota/eliminar', mascotasController.delete);
app.get('/consulta-pdf', mascotasController.generatePDF);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});