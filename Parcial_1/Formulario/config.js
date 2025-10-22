const crypto = require('crypto');

const JWT_SECRET = crypto.randomBytes(32).toString('base64');

module.exports = { JWT_SECRET };