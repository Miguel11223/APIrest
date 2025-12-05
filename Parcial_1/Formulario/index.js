const app = require('./app'); 
const fs = require('fs');
const path = require('path');
const https = require('https');

const port = 8082;

const privateKey = fs.readFileSync(path.join(__dirname, './Api_openssl/key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './Api_openssl/cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

if (process.env.NODE_ENV !== 'test') {
  httpsServer.listen(port, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${port}`);
    console.log(`Documentación Swagger disponible en https://localhost:${port}/api-docs`);
  });
}

module.exports = app;  
