const express = require('express');
const router = express.Router();
const prestamosController = require('../Controladores/prestamosController');

router.get('/', prestamosController.getAll);
router.post('/', prestamosController.add);
router.put('/return/:id_prestamo', prestamosController.returnItem);
router.get('/report', prestamosController.generateReport);

module.exports.router = router;