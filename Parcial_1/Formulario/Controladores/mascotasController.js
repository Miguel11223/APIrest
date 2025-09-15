const mysql = require('mysql2/promise');
const { jsPDF } = require('jspdf');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

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
    console.log('Conexión exitosa a la base de datos Veterion (Mascotas).');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  }
})();

const validateMascota = [
  check('cliente_nombre').notEmpty().withMessage('El nombre del cliente es obligatorio.'),
  check('cliente_apellido').notEmpty().withMessage('El apellido del cliente es obligatorio.'),
  check('cliente_telefono').notEmpty().withMessage('El teléfono del cliente es obligatorio.'),
  check('mascota_nombre').notEmpty().withMessage('El nombre de la mascota es obligatorio.'),
  check('mascota_especie').notEmpty().withMessage('La especie de la mascota es obligatoria.'),
  check('mascota_peso').optional().isFloat({ min: 0 }).withMessage('El peso debe ser un número positivo.'),
  check('mascota_sexo').optional().isIn(['M', 'H']).withMessage('El sexo debe ser "M" o "H".'),
  check('mascota_esterilizado').optional().isIn(['0', '1']).withMessage('Esterilizado debe ser 0 o 1.'),
  check('factura_total').optional().isFloat({ min: 0 }).withMessage('El total debe ser un número positivo.'),
  check('factura_subtotal').optional().isFloat({ min: 0 }).withMessage('El subtotal debe ser un número positivo.'),
  check('factura_impuestos').optional().isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo.'),
  check('cliente_email').optional().isEmail().withMessage('El email del cliente debe ser válido.'),
  check('factura_empleado_nombre').notEmpty().withMessage('El nombre del empleado es obligatorio.'),
  check('factura_empleado_apellido').notEmpty().withMessage('El apellido del empleado es obligatorio.')
];

const mascotasController = {
  getAll: async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT m.mascota_id, m.nombre AS mascota_nombre, m.especie AS mascota_especie, m.raza AS mascota_raza, m.imagen_path, m.imagen_tipo, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido
        FROM Mascotas m
        JOIN Clientes c ON m.cliente_id = c.cliente_id
      `);
      const processedResults = results.map(mascota => {
        if (mascota.imagen_path && fs.existsSync(mascota.imagen_path)) {
          try {
            const imageData = fs.readFileSync(mascota.imagen_path, { encoding: 'base64' });
            const imageType = mascota.imagen_tipo.toUpperCase();
            return {
              ...mascota,
              imagen_path: `data:image/${imageType.toLowerCase()};base64,${imageData}`
            };
          } catch (fileError) {
            console.error(`Error al leer la imagen para mascota ${mascota.mascota_id}:`, fileError.message);
            return { ...mascota, imagen_path: '' };
          }
        }
        return { ...mascota, imagen_path: '' };
      });
      res.status(200).json(processedResults);
    } catch (err) {
      console.error('Error al obtener las mascotas:', err.message);
      res.status(500).json({ error: 'Error al obtener las mascotas.', details: err.message });
    }
  },

  add: [
    validateMascota,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió una imagen válida para la mascota.' });
      }

      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // Cliente
        const { cliente_nombre, cliente_apellido, cliente_direccion, cliente_telefono, cliente_email, cliente_notas, cliente_fecha_registro } = req.body;
        const [clienteResult] = await connection.query(
          'INSERT INTO Clientes (nombre, apellido, direccion, telefono, email, fecha_registro, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cliente_nombre, cliente_apellido, cliente_direccion || null, cliente_telefono, cliente_email || null, cliente_fecha_registro || new Date().toISOString().split('T')[0], cliente_notas || null]
        );
        const cliente_id = clienteResult.insertId;

        // Mascota
        const { mascota_nombre, mascota_especie, mascota_raza, mascota_fecha_nacimiento, mascota_color, mascota_peso, mascota_alergias, mascota_notas, mascota_sexo, mascota_esterilizado, mascota_microchip } = req.body;
        const imagen_path = req.file.path;
        const imagen_tipo = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        const [mascotaResult] = await connection.query(
          'INSERT INTO Mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, color, peso, alergias, notas, imagen_path, imagen_tipo, sexo, esterilizado, microchip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [cliente_id, mascota_nombre, mascota_especie, mascota_raza || null, mascota_fecha_nacimiento || null, mascota_color || null, mascota_peso || null, mascota_alergias || null, mascota_notas || null, imagen_path, imagen_tipo, mascota_sexo || null, mascota_esterilizado || 0, mascota_microchip || null]
        );
        const mascota_id = mascotaResult.insertId;

        // Vacuna
        const vacuna_nombre = req.body.vacuna_nombre || 'Vacuna Desconocida';
        const [vacunaResult] = await connection.query('INSERT INTO Vacunas (nombre) VALUES (?)', [vacuna_nombre]);
        const vacuna_id = vacunaResult.insertId;

        // Empleado predeterminado
        const [defaultEmpleado] = await connection.query('SELECT empleado_id FROM Empleados LIMIT 1');
        let empleado_id_default;
        if (defaultEmpleado.length === 0) {
          const [newDefaultEmpleado] = await connection.query(
            'INSERT INTO Empleados (nombre, apellido, email, telefono, fecha_contratacion, cargo) VALUES (?, ?, ?, ?, ?, ?)',
            ['Empleado', 'Predeterminado', 'default@veterinaria.com', '123456789', new Date().toISOString().split('T')[0], 'Veterinario']
          );
          empleado_id_default = newDefaultEmpleado.insertId;
        } else {
          empleado_id_default = defaultEmpleado[0].empleado_id;
        }
        await connection.query('INSERT INTO Vacunaciones (mascota_id, vacuna_id, empleado_id) VALUES (?, ?, ?)', [mascota_id, vacuna_id, empleado_id_default]);

        // Tratamiento
        const tratamiento_nombre = req.body.tratamiento_nombre || 'Tratamiento Desconocido';
        const tratamiento_costo = req.body.tratamiento_costo || 0;
        const [tratamientoResult] = await connection.query('INSERT INTO Tratamientos (nombre, costo) VALUES (?, ?)', [tratamiento_nombre, tratamiento_costo]);
        const tratamiento_id = tratamientoResult.insertId;

        // Consulta
        const consulta_diagnostico = req.body.consulta_diagnostico || null;
        const consulta_observaciones = req.body.consulta_observaciones || null;
        const consulta_fecha_consulta = req.body.consulta_fecha_consulta || new Date().toISOString().split('T')[0];
        const [citaResult] = await connection.query(
          'INSERT INTO Citas (mascota_id, empleado_id, fecha_hora, motivo) VALUES (?, ?, ?, ?)',
          [mascota_id, empleado_id_default, new Date().toISOString(), 'Consulta inicial']
        );
        const cita_id = citaResult.insertId;
        await connection.query(
          'INSERT INTO Consultas (cita_id, diagnostico, observaciones, fecha_consulta) VALUES (?, ?, ?, ?)',
          [cita_id, consulta_diagnostico, consulta_observaciones, consulta_fecha_consulta]
        );
        await connection.query('INSERT INTO Consulta_Tratamientos (consulta_id, tratamiento_id) VALUES (?, ?)', [cita_id, tratamiento_id]);

        // Factura
        const factura_subtotal = req.body.factura_subtotal || 0;
        const factura_impuestos = req.body.factura_impuestos || 0;
        const factura_total = req.body.factura_total || (parseFloat(factura_subtotal) + parseFloat(factura_impuestos));
        const factura_estado = req.body.factura_estado || 'Pendiente';
        const factura_metodo_pago = req.body.factura_metodo_pago || null;
        const factura_empleado_nombre = req.body.factura_empleado_nombre;
        const factura_empleado_apellido = req.body.factura_empleado_apellido;

        let factura_empleado_id;
        const [empleadoMatch] = await connection.query(
          'SELECT empleado_id FROM Empleados WHERE nombre = ? AND apellido = ? LIMIT 1',
          [factura_empleado_nombre, factura_empleado_apellido]
        );
        if (empleadoMatch.length === 0) {
          const [newEmpleadoResult] = await connection.query(
            'INSERT INTO Empleados (nombre, apellido, email, telefono, fecha_contratacion, cargo) VALUES (?, ?, ?, ?, ?, ?)',
            [factura_empleado_nombre, factura_empleado_apellido, 'nuevo@veterinaria.com', '123456789', new Date().toISOString().split('T')[0], 'Veterinario']
          );
          factura_empleado_id = newEmpleadoResult.insertId;
        } else {
          factura_empleado_id = empleadoMatch[0].empleado_id;
        }

        const [facturaResult] = await connection.query(
          'INSERT INTO Facturas (cliente_id, fecha_emision, subtotal, impuestos, total, estado, metodo_pago, empleado_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [cliente_id, req.body.factura_fecha_emision || new Date().toISOString(), factura_subtotal, factura_impuestos, factura_total, factura_estado, factura_metodo_pago, factura_empleado_id]
        );
        const factura_id = facturaResult.insertId;

        // Detalle_Factura
        const [productoResult] = await connection.query(
          'INSERT INTO Productos (nombre, categoria, precio_compra, precio_venta) VALUES (?, ?, ?, ?)',
          ['Consulta Veterinaria', 'Servicio', 10.00, factura_subtotal]
        );
        const producto_id = productoResult.insertId;
        await connection.query(
          'INSERT INTO Detalle_Factura (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
          [factura_id, producto_id, 1, factura_subtotal, factura_subtotal]
        );

        // Historial_Clinico
        await connection.query('INSERT INTO Historial_Clinico (mascota_id, notas) VALUES (?, ?)', [mascota_id, 'Historial inicial creado']);
        const [historialResult] = await connection.query('SELECT LAST_INSERT_ID() as historial_id');
        const historial_id = historialResult[0].historial_id;
        await connection.query(
          'INSERT INTO Historial_Detalle (historial_id, tipo, referencia_id, fecha, descripcion) VALUES (?, ?, ?, ?, ?)',
          [historial_id, 'Consulta', cita_id, new Date().toISOString().split('T')[0], 'Consulta inicial']
        );

        await connection.commit();
        res.status(200).json({ mensaje: 'Mascota y datos relacionados guardados correctamente.', mascota_id });
      } catch (error) {
        await connection.rollback();
        console.error('Error al procesar el formulario:', error.message);
        res.status(500).json({ error: 'Error al procesar el formulario.', details: error.message });
      } finally {
        connection.release();
      }
    }
  ],

  delete: async (req, res) => {
    const { mascota_id } = req.query;
    if (!mascota_id) {
      return res.status(400).json({ error: 'El parámetro mascota_id es obligatorio.' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM Historial_Detalle WHERE historial_id IN (SELECT historial_id FROM Historial_Clinico WHERE mascota_id = ?)', [mascota_id]);
      await connection.query('DELETE FROM Historial_Clinico WHERE mascota_id = ?', [mascota_id]);
      await connection.query('DELETE FROM Consulta_Tratamientos WHERE consulta_id IN (SELECT cita_id FROM Consultas WHERE cita_id IN (SELECT cita_id FROM Citas WHERE mascota_id = ?))', [mascota_id]);
      await connection.query('DELETE FROM Consultas WHERE cita_id IN (SELECT cita_id FROM Citas WHERE mascota_id = ?)', [mascota_id]);
      await connection.query('DELETE FROM Citas WHERE mascota_id = ?', [mascota_id]);
      await connection.query('DELETE FROM Vacunaciones WHERE mascota_id = ?', [mascota_id]);
      const [result] = await connection.query('DELETE FROM Mascotas WHERE mascota_id = ?', [mascota_id]);
      if (result.affectedRows === 0) {
        throw new Error('Mascota no encontrada.');
      }
      await connection.commit();
      res.status(200).json({ mensaje: 'Mascota eliminada correctamente.' });
    } catch (error) {
      await connection.rollback();
      console.error('Error al eliminar mascota:', error.message);
      res.status(500).json({ error: 'Error al eliminar mascota.', details: error.message });
    } finally {
      connection.release();
    }
  },

  generatePDF: async (req, res) => {
    const { mascota_id } = req.query;
    if (!mascota_id) {
      return res.status(400).json({ error: 'El parámetro "mascota_id" es obligatorio.' });
    }

    try {
      const [results] = await db.query(`
        SELECT m.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, f.factura_id, f.fecha_emision, f.subtotal, f.impuestos, f.total, f.estado, f.metodo_pago, 
               e.nombre AS empleado_nombre, e.apellido AS empleado_apellido, ci.fecha_hora AS cita_fecha, t.nombre AS tratamiento_nombre
        FROM Mascotas m
        JOIN Clientes c ON m.cliente_id = c.cliente_id
        LEFT JOIN Facturas f ON m.cliente_id = f.cliente_id
        LEFT JOIN Empleados e ON f.empleado_id = e.empleado_id
        LEFT JOIN Citas ci ON m.mascota_id = ci.mascota_id
        LEFT JOIN Consultas co ON ci.cita_id = co.cita_id
        LEFT JOIN Consulta_Tratamientos ct ON co.cita_id = ct.consulta_id
        LEFT JOIN Tratamientos t ON ct.tratamiento_id = t.tratamiento_id
        WHERE m.mascota_id = ?
        ORDER BY f.factura_id DESC, ci.fecha_hora DESC LIMIT 1
      `, [mascota_id]);

      if (results.length === 0) {
        return res.status(404).json({ error: 'No se encontraron datos para la mascota proporcionada.' });
      }

      const data = results[0];
      if (!data.factura_id) {
        return res.status(400).json({ error: 'No se encontró una factura asociada a esta mascota.' });
      }

      const subtotal = parseFloat(data.subtotal) || 0;
      const impuestos = parseFloat(data.impuestos) || 0;
      const total = parseFloat(data.total) || (subtotal + impuestos);

      const doc = new jsPDF();
      doc.setFillColor(0, 123, 255);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Veterinaria Kuchau', 15, 15);
      doc.setFontSize(10);
      doc.text('Dirección: Calle Falsa 123, Ciudad', 15, 22);
      doc.text('Teléfono: (555) 123-4567 | Email: info@veterinariaabc.com', 15, 27);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`Factura #${data.factura_id}`, 150, 15);
      doc.text(`Fecha: ${new Date(data.fecha_emision).toLocaleDateString()}`, 150, 22);

      doc.setFontSize(12);
      doc.text('Cliente:', 15, 40);
      doc.text(`${data.cliente_nombre} ${data.cliente_apellido}`, 15, 50);
      doc.text('Empleado:', 15, 60);
      doc.text(`${data.empleado_nombre || 'No especificado'} ${data.empleado_apellido || ''}`, 15, 70);

      doc.setFontSize(12);
      doc.text('Descripción', 15, 90);
      doc.text('Cantidad', 80, 90);
      doc.text('Precio Unitario', 110, 90);
      doc.text('Subtotal', 140, 90);

      doc.line(15, 95, 195, 95);
      doc.text('Consulta Veterinaria', 15, 105);
      doc.text('1', 80, 105);
      doc.text(`$${subtotal.toFixed(2)}`, 110, 105);
      doc.text(`$${subtotal.toFixed(2)}`, 140, 105);

      doc.text(`Tratamiento: ${data.tratamiento_nombre || 'No especificado'}`, 15, 115);
      doc.text(`Fecha de Cita: ${new Date(data.cita_fecha).toLocaleDateString() || 'No especificada'}`, 15, 125);

      doc.line(15, 130, 195, 130);
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, 140);
      doc.text(`Impuestos: $${impuestos.toFixed(2)}`, 140, 150);
      doc.text(`Total: $${total.toFixed(2)}`, 140, 160);
      doc.text(`Estado: ${data.estado || 'Pendiente'}`, 140, 170);
      doc.text(`Método de Pago: ${data.metodo_pago || 'No especificado'}`, 140, 180);

      doc.setFillColor(245, 245, 245);
      doc.rect(0, 190, 210, 40, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text('Términos y Condiciones: Pago dentro de 30 días. Sin reembolso para servicios realizados.', 15, 200);
      doc.text('© 2025 Veterinaria Kuchau. Todos los derechos reservados.', 15, 210);

      const pdfFolder = path.join(__dirname, '..', 'archivosgen');
      if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);
      const pdfPath = path.join(pdfFolder, `factura-${data.factura_id}.pdf`);
      doc.save(pdfPath);

      res.sendFile(pdfPath, (err) => {
        if (err) {
          console.error('Error al enviar el PDF:', err.message);
          return res.status(500).json({ error: 'Error al enviar el PDF.', details: err.message });
        }
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error al eliminar el archivo PDF:', unlinkErr.message);
          }
        });
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error.message);
      res.status(500).json({ error: 'Error al generar el PDF.', details: error.message });
    }
  }
};

module.exports = mascotasController;