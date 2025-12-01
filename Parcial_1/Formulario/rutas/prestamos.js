const express = require('express');
const router = express.Router();
const prestamosController = require('../Controladores/prestamosController');

/**
 * @swagger
 * /prestamos:
 *   get:
 *     summary: "Lista todos los préstamos (opcional: filtrar por num_control)"
 *     tags: [Prestamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: num_control
 *         schema:
 *           type: string
 *         description: Filtrar por número de control del alumno
 *     responses:
 *       200:
 *         description: Lista de préstamos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrestamoResponse'
 */
router.get('/', prestamosController.getAll);

/**
 * @swagger
 * /prestamos:
 *   post:
 *     summary: Crear un nuevo préstamo
 *     tags: [Prestamos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrestamoInput'
 *     responses:
 *       201:
 *         description: Préstamo creado correctamente
 */
router.post('/', prestamosController.add);

/**
 * @swagger
 * /prestamos/return/{id_prestamo}:
 *   put:
 *     summary: Devolver un préstamo
 *     tags: [Prestamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_prestamo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item devuelto correctamente
 */
router.put('/return/:id_prestamo', prestamosController.returnItem);

/**
 * @swagger
 * /prestamos/report:
 *   get:
 *     summary: Generar reporte TXT de un préstamo
 *     tags: [Prestamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_prestamo
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: delete
 *         schema:
 *           type: boolean
 *         description: Si es true, elimina el archivo después de enviarlo
 *     responses:
 *       200:
 *         description: Archivo TXT descargable
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/report', prestamosController.generateReport);  // ← AQUÍ ESTABA EL ERROR

module.exports = router;