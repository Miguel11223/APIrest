const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Import error handler
const { sendErrorResponse, logError } = require('../ManejadorErrores/ManErrores');

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
    console.log('Conexión exitosa a la base de datos Escuela (Prestamos).');
    connection.release();
  } catch (err) {
    logError('Error al conectar a la base de datos (Prestamos):', err);
    process.exit(1);
  }
})();

const validatePrestamo = [
  check('id_alumno').isInt().withMessage('El ID del alumno debe ser un número entero.'),
  check('id_item').isInt().withMessage('El ID del item debe ser un número entero.'),
  check('estado').optional().isIn(['activo', 'devuelto']).withMessage('El estado debe ser "activo" o "devuelto".')
];

const prestamosController = {
  getAll: async (req, res) => {
    const { num_control } = req.query;
    let query = `
      SELECT p.id_prestamo, p.fecha_prestamo, p.fecha_devolucion, p.estado, 
             a.num_control, i.nombre_item
      FROM Prestamos p
      JOIN Alumno a ON p.id_alumno = a.id_alumno
      JOIN Inventario i ON p.id_item = i.id_item
    `;
    const params = [];
    if (num_control) {
      query += ' WHERE a.num_control = ?';
      params.push(num_control);
    }
    try {
      const [results] = await db.query(query, params);
      console.log('Préstamos obtenidos:', results.length);
      res.status(200).json(results);
    } catch (err) {
      logError('Error al obtener préstamos:', err);
      sendErrorResponse(res, 500, 'Error al obtener préstamos.', err.message);
    }
  },

  add: [
    validatePrestamo,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Errores de validación', errors.array());
      }

      const { id_alumno, id_item } = req.body;
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // Verificar si el alumno existe
        const [alumno] = await connection.query('SELECT id_alumno FROM Alumno WHERE id_alumno = ?', [id_alumno]);
        if (alumno.length === 0) {
          throw new Error('Alumno no encontrado.');
        }

        // Verificar si el item está disponible
        const [item] = await connection.query('SELECT cantidad_disponible FROM Inventario WHERE id_item = ?', [id_item]);
        if (item.length === 0 || item[0].cantidad_disponible <= 0) {
          throw new Error('Item no disponible.');
        }

        // Crear préstamo
        const [result] = await connection.query(
          'INSERT INTO Prestamos (id_alumno, id_item) VALUES (?, ?)',
          [id_alumno, id_item]
        );

        // Reducir cantidad disponible
        await connection.query('UPDATE Inventario SET cantidad_disponible = cantidad_disponible - 1 WHERE id_item = ?', [id_item]);

        await connection.commit();
        res.status(201).json({ mensaje: 'Préstamo registrado correctamente.', id_prestamo: result.insertId });
      } catch (error) {
        await connection.rollback();
        logError('Error al registrar préstamo:', error);
        sendErrorResponse(res, 500, 'Error al registrar préstamo.', error.message);
      } finally {
        connection.release();
      }
    }
  ],

  returnItem: async (req, res) => {
    const { id_prestamo } = req.params;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar préstamo
      const [prestamo] = await connection.query('SELECT id_item, estado FROM Prestamos WHERE id_prestamo = ?', [id_prestamo]);
      if (prestamo.length === 0) {
        throw new Error('Préstamo no encontrado.');
      }
      if (prestamo[0].estado === 'devuelto') {
        throw new Error('El préstamo ya fue devuelto.');
      }

      // Actualizar estado y fecha de devolución
      await connection.query(
        'UPDATE Prestamos SET estado = ?, fecha_devolucion = ? WHERE id_prestamo = ?',
        ['devuelto', new Date().toISOString().slice(0, 19).replace('T', ' '), id_prestamo]
      );

      // Incrementar cantidad disponible
      await connection.query('UPDATE Inventario SET cantidad_disponible = cantidad_disponible + 1 WHERE id_item = ?', [prestamo[0].id_item]);

      await connection.commit();
      res.status(200).json({ mensaje: 'Item devuelto correctamente.' });
    } catch (error) {
      await connection.rollback();
      logError('Error al devolver item:', error);
      sendErrorResponse(res, 500, 'Error al devolver item.', error.message);
    } finally {
      connection.release();
    }
  },

  generateReport: async (req, res) => {
    const { id_prestamo } = req.query;
    if (!id_prestamo) {
      return sendErrorResponse(res, 400, 'El parámetro id_prestamo es obligatorio.');
    }

    try {
      const [results] = await db.query(`
        SELECT p.id_prestamo, p.fecha_prestamo, p.fecha_devolucion, p.estado,
               a.num_control, i.nombre_item, i.descripcion
        FROM Prestamos p
        JOIN Alumno a ON p.id_alumno = a.id_alumno
        JOIN Inventario i ON p.id_item = i.id_item
        WHERE p.id_prestamo = ?
      `, [id_prestamo]);

      if (results.length === 0) {
        return sendErrorResponse(res, 404, 'Préstamo no encontrado.');
      }

      const data = results[0];
      const reportContent = `
Reporte de Préstamo #${data.id_prestamo}
----------------------------------------
Número de Control del Alumno: ${data.num_control}
Item Prestado: ${data.nombre_item}
Descripción del Item: ${data.descripcion || 'Sin descripción'}
Fecha de Préstamo: ${new Date(data.fecha_prestamo).toLocaleString()}
Fecha de Devolución: ${data.fecha_devolucion ? new Date(data.fecha_devolucion).toLocaleString() : 'No devuelto'}
Estado: ${data.estado}
----------------------------------------
Generado el: ${new Date().toLocaleString()}
Escuela - Sistema de Préstamos
`;

      const reportFolder = path.join(__dirname, '..', 'reportes');
      if (!fs.existsSync(reportFolder)) fs.mkdirSync(reportFolder, { recursive: true });
      const reportPath = path.join(reportFolder, `prestamo-${data.id_prestamo}.txt`);
      fs.writeFileSync(reportPath, reportContent, 'utf8');

      // Handle delete request
      if (req.query.delete) {
        if (fs.existsSync(reportPath)) {
          fs.unlinkSync(reportPath);
          console.log(`Reporte ${reportPath} eliminado.`);
        }
        return res.status(200).json({ message: 'Reporte eliminado.' });
      }

      res.setHeader('Content-Disposition', `attachment; filename=prestamo-${data.id_prestamo}.txt`);
      res.sendFile(reportPath, (err) => {
        if (err) {
          logError('Error al enviar el reporte:', err);
          sendErrorResponse(res, 500, 'Error al enviar el reporte.', err.message);
        } else {
          fs.unlink(reportPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error al eliminar el archivo de reporte:', unlinkErr.message);
          });
        }
      });
    } catch (error) {
      logError('Error al generar el reporte:', error);
      sendErrorResponse(res, 500, 'Error al generar el reporte.', error.message);
    }
  }
};

module.exports = prestamosController;