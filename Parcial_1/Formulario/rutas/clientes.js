const express = require('express');
const router = express.Router();
const clientesController = require('../Controladores/clientesController');

router.get('/', clientesController.getAll);
router.post('/', clientesController.add);
router.put('/:id', clientesController.update);
router.delete('/:id', clientesController.delete);

module.exports.router = router;