const express = require('express');
const router = express.Router();
const inventarioController = require('../Controladores/inventarioController');

router.get('/', inventarioController.getAll);
router.post('/', inventarioController.add);
router.put('/:id', inventarioController.update);
router.delete('/:id', inventarioController.delete);

module.exports.router = router;