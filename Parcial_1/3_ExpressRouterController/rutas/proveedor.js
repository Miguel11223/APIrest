const express = require('express');
const router = express.Router();
const proveedoresController = require('..//Controladores/provedoresController');

// Routes
router.get('/', proveedoresController.getAll);
router.post('/', proveedoresController.add);
router.put('/:id', proveedoresController.update);
router.delete('/:id', proveedoresController.delete);

module.exports.router = router;