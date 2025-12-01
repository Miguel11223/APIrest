const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const { sendErrorResponse, logError } = require('../ManejadorErrores/ManErrores');
const { JWT_SECRET } = require('../config');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Escuela',
  port: 3306,
   charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const validateRegister = [
  check('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  check('password').isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres.')
];

const validateLogin = [
  check('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  check('password').notEmpty().withMessage('La contraseña es obligatoria.')
];

const register = [
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
      const [existing] = await connection.query('SELECT id_usuario FROM Usuarios WHERE username = ?', [username]);
      if (existing.length > 0) {
        throw new Error('El usuario ya existe');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.query(
        'INSERT INTO Usuarios (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      await connection.commit();
      res.status(201).json({ mensaje: 'Usuario registrado', id: result.insertId });
    } catch (error) {
      await connection.rollback();
      logError('Error en register:', error);
      sendErrorResponse(res, 500, error.message);
    } finally {
      connection.release();
    }
  }
];

const login = [
  validateLogin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, 'Errores de validación', errors.array());
    }

    const { username, password } = req.body;
    try {
      const [rows] = await db.query('SELECT * FROM Usuarios WHERE username = ?', [username]);
      if (rows.length === 0) return sendErrorResponse(res, 401, 'Credenciales inválidas');

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return sendErrorResponse(res, 401, 'Credenciales inválidas');

      const token = jwt.sign({ id: user.id_usuario, username: user.username }, JWT_SECRET, { expiresIn: '2h' });

      res.json({ mensaje: 'Login exitoso', token });
    } catch (error) {
      logError('Error en login:', error);
      sendErrorResponse(res, 500, 'Error interno');
    }
  }
];

module.exports = {
  register,
  login
};