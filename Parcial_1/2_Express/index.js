const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

let data = {
  message: 'Hello World!'
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
    data.message = newMessage; // Actualiza el mensaje en la "base de datos"
    res.send(`Mensaje actualizado: ${newMessage}`);
  });

  app.delete('/', (req, res) => {
    data.message = ''; // Simula la eliminación del mensaje
    res.send('Mensaje eliminado');
  });

app.listen(port, () => {
  console.log(`El puerto es  ${port}`)
})