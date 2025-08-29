const express = require('express')
const app = express()
const port = 3000

app.use(express.json());


const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['Contrasena'];
  if (!apiKey || apiKey !== 'desbloqueado') {
    return res.status(401).send('Acceso no autorizado: se requiere una clave API válida');
  }
  next();
};

app.use(logRequest);
app.use(checkApiKey);


let data = {
  message: 'Hello World(AAgregar una funcion middleware)'
};

app.get('/', (req, res) => {
  res.send(data.message);
});

app.post('/', (req, res) => {
  res.send('Post Hello World!');
});

  app.put('/', (req, res) => {
    const newMessage = req.body.message;
    if (!newMessage) {
      return res.status(400).send('El campo "message" es requerido');
    }
    data.message = newMessage; 
    res.send(`Mensaje actualizado: ${newMessage}`);
  });

  app.delete('/', (req, res) => {
    data.message = ''; 
    res.send('Mensaje eliminado');
  });

app.listen(port, () => {
  console.log(`El puerto en el que corre es el  ${port}`)
})