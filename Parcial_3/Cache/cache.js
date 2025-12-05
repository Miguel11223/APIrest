const express = require('express');
const mysql = require('mysql2/promise');
const cache = require('cache-express');
const app = express();

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

const cacheConfig = {
  ttl: 180, 
  prefix: 'alumnos_cache:',
  stores: [
    {
      type: 'memory',
      max: 50,
      ttl: 180
    }
  ]
};

app.get('/api/alumnos', cache(cacheConfig), async (req, res) => {
  try {
    console.log('Consultando alumnos desde la base de datos...');
    
    const [rows] = await db.query('SELECT * FROM alumno');
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      timestamp: new Date().toISOString(),
      source: 'Database Query'
    });
  } catch (error) {
    console.error('Error en /api/alumnos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  GET http://localhost:${PORT}/api/alumnos`);
});