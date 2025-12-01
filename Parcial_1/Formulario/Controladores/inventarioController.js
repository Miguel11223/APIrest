const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');

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

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conexión exitosa a la base de datos Escuela (Inventario).');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  }
})();

const validateItem = [
  check('nombre_item').notEmpty().withMessage('El nombre del item es obligatorio.'),
  check('cantidad_disponible').isInt({ min: 0 }).withMessage('La cantidad debe ser un número no negativo.')
];

const inventarioController = {
  getAll: async (req, res) => {
    try {
      const [results] = await db.query('SELECT id_item, nombre_item, cantidad_disponible FROM Inventario');
      console.log('Items obtenidos:', results.length);
      res.status(200).json(results);
    } catch (err) {
      console.error('Error al obtener inventario:', err.message);
      res.status(500).json({ error: 'Error al obtener inventario.', details: err.message });
    }
  },

  add: [
    validateItem,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { nombre_item, descripcion, cantidad_disponible } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'INSERT INTO Inventario (nombre_item, descripcion, cantidad_disponible) VALUES (?, ?, ?)',
          [nombre_item, descripcion || null, cantidad_disponible]
        );
        await connection.commit();
        res.status(201).json({ mensaje: `Item ${nombre_item} agregado`, id_item: result.insertId });
      } catch (error) {
        await connection.rollback();
        console.error('Error al agregar item:', error.message);
        res.status(500).json({ error: 'Error al agregar item.', details: error.message });
      } finally {
        connection.release();
      }
    }
  ],

  update: [
    validateItem,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id } = req.params;
      const { nombre_item, descripcion, cantidad_disponible } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'UPDATE Inventario SET nombre_item = ?, descripcion = ?, cantidad_disponible = ? WHERE id_item = ?',
          [nombre_item, descripcion || null, cantidad_disponible, id]
        );
        if (result.affectedRows === 0) {
          throw new Error('Item no encontrado.');
        }
        await connection.commit();
        res.status(200).json({ mensaje: `Item con ID ${id} actualizado` });
      } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar item:', error.message);
        res.status(500).json({ error: 'Error al actualizar item.', details: error.message });
      } finally {
        connection.release();
      }````````````````````````````````````````````
    }
  ],

  delete: async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query('DELETE FROM Inventario WHERE id_item = ?', [id]);
      if (result.affectedRows === 0) {
        throw new Error('Item no encontrado.');
      }
      await connection.commit();
      res.status(200).json({ mensaje: `Item con ID ${id} eliminado` });
    } catch (error) {
      await connection.rollback();
      console.error('Error al eliminar item:', error.message);
      res.status(500).json({ error: 'Error al eliminar item.', details: error.message });
    } finally {
      connection.release();
    }
  }
};

module.exports = inventarioController