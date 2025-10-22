const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');
const { sendErrorResponse, logError } = require('../ManejadorErrores/ManErrores');

// Importar JWT_SECRET desde config.js
const { JWT_SECRET } = require('../config');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Escuela',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const validateLogin = [
  check('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  check('password').notEmpty().withMessage('La contraseña es obligatoria.')
];

const validateRegister = [
  check('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  check('password').notEmpty().withMessage('La contraseña es obligatoria.')
];

const authController = {
  register: [
    validateRegister,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Errores de validación', errors.array());
      }

      const { username, password } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // Verificar si el usuario ya existe
        const [existing] = await connection.query('SELECT id_usuario FROM Usuarios WHERE username = ?', [username]);
        if (existing.length > 0) {
          throw new Error('El nombre de usuario ya está registrado.');
        }

        // Insertar nuevo usuario (contraseña en plano)
        const [result] = await connection.query(
          'INSERT INTO Usuarios (username, password) VALUES (?, ?)',
          [username, password]
        );

        await connection.commit();
        res.status(201).json({ mensaje: `Usuario ${username} registrado correctamente`, id_usuario: result.insertId });
      } catch (error) {
        await connection.rollback();
        logError('Error al registrar usuario:', error);
        sendErrorResponse(res, 500, 'Error al registrar usuario.', error.message);
      } finally {
        connection.release();
      }
    }
  ],

  login: [
    validateLogin,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Errores de validación', errors.array());
      }

      const { username, password } = req.body;
      try {
        const [users] = await db.query('SELECT * FROM Usuarios WHERE username = ?', [username]);
        if (users.length === 0) {
          return sendErrorResponse(res, 401, 'Credenciales inválidas.');
        }

        const user = users[0];
        // Verificar contraseña en texto plano
        if (password !== user.password) {
          return sendErrorResponse(res, 401, 'Credenciales inválidas.');
        }

        // Generar token JWT
        const token = jwt.sign(
          { id: user.id_usuario, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: 'Inicio de sesión exitoso.' });
      } catch (error) {
        logError('Error al iniciar sesión:', error);
        sendErrorResponse(res, 500, 'Error al iniciar sesión.', error.message);
      }
    }
  ]
};

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports.router = router;