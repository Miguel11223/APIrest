let JWT_SECRET;

if (process.env.NODE_ENV === 'test') {
  JWT_SECRET = 'clave_fija_para_tests_12345';
} else if (process.env.JWT_SECRET) {
  JWT_SECRET = process.env.JWT_SECRET;
} else {
  const fs = require('fs');
  const path = require('path');
  const secretFile = path.join(__dirname, '.jwtsecret');
  
  if (fs.existsSync(secretFile)) {
    JWT_SECRET = fs.readFileSync(secretFile, 'utf8');
  } else {
    const crypto = require('crypto');
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile, JWT_SECRET);
  }
}

module.exports = { JWT_SECRET };