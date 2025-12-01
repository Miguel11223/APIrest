const express = require('express');
const router = express.Router();
const inventarioController = require('../Controladores/inventarioController');

/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Lista todo el inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/', inventarioController.getAll);

/**
 * @swagger
 * /inventario:
 *   post:
 *     summary: Agrega un nuevo item
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item creado
 */
router.post('/', inventarioController.add);

/**
 * @swagger
 * /inventario/{id}:
 *   put:
 *     summary: Actualiza un item
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item actualizado
 */
router.put('/:id', inventarioController.update);

/**
 * @swagger
 * /inventario/{id}:
 *   delete:
 *     summary: Elimina un item
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item eliminado
 */
router.delete('/:id', inventarioController.delete);

module.exports = router;