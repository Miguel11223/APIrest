const express = require('express');
const router = express.Router();


let data = {
    message: 'Hello World(AAgregar una funcion middleware)'
  };
  
  router.get('/', (req, res) => {
    res.send(data.message);
  });
  
  router.post('/', (req, res) => {
    res.send('Post Hello World!');
  });
  
    router.put('/', (req, res) => {
      const newMessage = req.body.message;
      if (!newMessage) {
        return res.status(400).send('El campo "message" es requerido');
      }
      data.message = newMessage; 
      res.send(`Mensaje actualizado: ${newMessage}`);
    });
  
    router.delete('/', (req, res) => {
      data.message = ''; 
      res.send('Mensaje eliminado');
    });
  

    module.exports.router = router;