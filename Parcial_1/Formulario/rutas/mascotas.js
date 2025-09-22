const express = require('express');
const router = express.Router();
const mascotasController = require('../Controladores/mascotasController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '..', 'archivos');
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

router.get('/mascotas', mascotasController.getAll);
router.post('/', upload.single('mascota_imagen'), mascotasController.add);
router.delete('/eliminar', mascotasController.delete);
router.get('/consulta-pdf', mascotasController.generatePDF);

module.exports.router = router;