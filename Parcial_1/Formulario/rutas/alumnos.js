const express = require('express');
const router = express.Router();
const alumnosController = require('../Controladores/alumnosController');

router.get('/', alumnosController.getAll);
router.post('/', alumnosController.add);
router.put('/:id', alumnosController.update);
router.delete('/:id', alumnosController.delete);

module.exports.router = router;