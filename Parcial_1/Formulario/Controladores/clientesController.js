const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Veterion',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conexión exitosa a la base de datos Veterion (Clientes).');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  }
})();

const validateCliente = [
  check('nombre').notEmpty().withMessage('El nombre del cliente es obligatorio.'),
  check('apellido').notEmpty().withMessage('El apellido del cliente es obligatorio.'),
  check('telefono').notEmpty().withMessage('El teléfono del cliente es obligatorio.'),
  check('email').optional().isEmail().withMessage('El email del cliente debe ser válido.')
];

const clientesController = {
  getAll: async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM Clientes');
      res.status(200).json(results);
    } catch (err) {
      console.error('Error al obtener clientes:', err.message);
      res.status(500).json({ error: 'Error al obtener clientes.', details: err.message });
    }
  },

  add: [
    validateCliente,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { nombre, apellido, direccion, telefono, email, fecha_registro, notas } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'INSERT INTO Clientes (nombre, apellido, direccion, telefono, email, fecha_registro, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [nombre, apellido, direccion || null, telefono, email || null, fecha_registro || new Date().toISOString().split('T')[0], notas || null]
        );
        await connection.commit();
        res.status(201).json({ message: `Cliente ${nombre} ${apellido} agregado`, cliente_id: result.insertId });
      } catch (error) {
        await connection.rollback();
        console.error('Error al agregar cliente:', error.message);
        res.status(500).json({ error: 'Error al agregar cliente.', details: error.message });
      } finally {
        connection.release();
      }
    }
  ],

  update: [
    validateCliente,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id } = req.params;
      const { nombre, apellido, direccion, telefono, email, notas } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'UPDATE Clientes SET nombre = ?, apellido = ?, direccion = ?, telefono = ?, email = ?, notas = ? WHERE cliente_id = ?',
          [nombre, apellido, direccion || null, telefono, email || null, notas || null, id]
        );
        if (result.affectedRows === 0) {
          throw new Error('Cliente no encontrado.');
        }
        await connection.commit();
        res.status(200).json({ message: `Cliente con ID ${id} actualizado` });
      } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar cliente:', error.message);
        res.status(500).json({ error: 'Error al actualizar cliente.', details: error.message });
      } finally {
        connection.release();
      }
    }
  ],

  delete: async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query('DELETE FROM Clientes WHERE cliente_id = ?', [id]);
      if (result.affectedRows === 0) {
        throw new Error('Cliente no encontrado.');
      }
      await connection.commit();
      res.status(200).json({ message: `Cliente con ID ${id} eliminado` });
    } catch (error) {
      await connection.rollback();
      console.error('Error al eliminar cliente:', error.message);
      res.status(500).json({ error: 'Error al eliminar cliente.', details: error.message });
    } finally {
      connection.release();
    }
  }
};

module.exports = clientesController;