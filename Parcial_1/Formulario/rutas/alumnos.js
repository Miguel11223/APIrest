const express = require('express');
const router = express.Router();
const alumnosController = require('../Controladores/alumnosController');

/**
 * @swagger
 * /alumnos:
 *   get:
 *   summary: Obtiene todos los alumnos
 *   tags: [Alumnos]
 *   security:
 *     - bearerAuth: []
 *   responses:
 *     200:
 *       description: Lista de alumnos
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Alumno'
 */
router.get('/', alumnosController.getAll);

/**
 * @swagger
 * /alumnos:
 *   post:
 *     summary: Crea o busca un alumno por número de control
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlumnoInput'
 *     responses:
 *       201:
 *         description: Alumno procesado correctamente
 */
router.post('/', alumnosController.add);

/**
 * @swagger
 * /alumnos/{id}:
 *   put:
 *     summary: Actualiza el número de control de un alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlumnoInput'
 *     responses:
 *       200:
 *         description: Alumno actualizado
 *       404:
 *         description: Alumno no encontrado
 */
router.put('/:id', alumnosController.update);

/**
 * @swagger
 * /alumnos/{id}:
 *   delete:
 *     summary: Elimina un alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     responses:
 *       200:
 *         description: Alumno eliminado
 *       404:
 *         description: Alumno no encontrado
 */
router.delete('/:id', alumnosController.delete);

module.exports = router;