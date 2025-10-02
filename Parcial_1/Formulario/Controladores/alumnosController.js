const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');

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

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conexión exitosa a la base de datos Escuela (Alumnos).');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  }
})();

const validateAlumno = [
  check('num_control').notEmpty().withMessage('El número de control es obligatorio.')
];

const alumnosController = {
  getAll: async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM Alumno');
      console.log('Alumnos obtenidos:', results.length);
      res.status(200).json(results);
    } catch (err) {
      console.error('Error al obtener alumnos:', err.message);
      res.status(500).json({ error: 'Error al obtener alumnos.', details: err.message });
    }
  },

  add: [
    validateAlumno,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { num_control } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [existing] = await connection.query('SELECT id_alumno FROM Alumno WHERE num_control = ?', [num_control]);
        let id_alumno;
        if (existing.length > 0) {
          id_alumno = existing[0].id_alumno;
        } else {
          const [result] = await connection.query(
            'INSERT INTO Alumno (nombre, apellido, email, semestre, num_control, carrera) VALUES (?, ?, ?, ?, ?, ?)',
            ['Desconocido', 'Desconocido', null, 'Desconocido', num_control, 'Desconocida']
          );
          id_alumno = result.insertId;
        }
        await connection.commit();
        res.status(201).json({ mensaje: `Alumno con número de control ${num_control} procesado`, id_alumno });
      } catch (error) {
        await connection.rollback();
        console.error('Error al procesar alumno:', error.message);
        res.status(500).json({ error: 'Error al procesar alumno.', details: error.message });
      } finally {
        connection.release();
      }
    }
  ],

  update: [
    validateAlumno,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id } = req.params;
      const { num_control } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'UPDATE Alumno SET num_control = ? WHERE id_alumno = ?',
          [num_control, id]
        );
        if (result.affectedRows === 0) {
          throw new Error('Alumno no encontrado.');
        }
        await connection.commit();
        res.status(200).json({ mensaje: `Alumno con ID ${id} actualizado` });
      } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar alumno:', error.message);
        res.status(500).json({ error: 'Error al actualizar alumno.', details: error.message });
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
      const [result] = await connection.query('DELETE FROM Alumno WHERE id_alumno = ?', [id]);
      if (result.affectedRows === 0) {
        throw new Error('Alumno no encontrado.');
      }
      await connection.commit();
      res.status(200).json({ mensaje: `Alumno con ID ${id} eliminado` });
    } catch (error) {
      await connection.rollback();
      console.error('Error al eliminar alumno:', error.message);
      res.status(500).json({ error: 'Error al eliminar alumno.', details: error.message });
    } finally {
      connection.release();
    }
  }
};

module.exports = alumnosController;