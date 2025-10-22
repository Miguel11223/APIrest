const crypto = require('crypto');

// Generar clave secreta al cargar el módulo
const JWT_SECRET = crypto.randomBytes(32).toString('base64');

module.exports = { JWT_SECRET };