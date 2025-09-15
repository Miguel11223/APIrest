const clientesController = {
    clientes: [],
  
    getAll: (req, res) => {
      res.json(clientesController.clientes);
    },
  
    add: (req, res) => {
      const { nombre } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es requerido' });
      }
      const newCliente = {
        id: clientesController.clientes.length + 1,
        nombre,
        profileImage: req.file ? `/uploads/${req.file.filename}` : null
      };
      clientesController.clientes.push(newCliente);
      res.status(201).json({ message: `Cliente ${nombre} agregado`, cliente: newCliente });
    },
  
    update: (req, res) => {
      const { id } = req.params;
      const { nombre } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es requerido' });
      }
      const cliente = clientesController.clientes.find(c => c.id === parseInt(id));
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      cliente.nombre = nombre;
      if (req.file) {
        cliente.profileImage = `/uploads/${req.file.filename}`;
      }
      res.json({ message: `Cliente con ID ${id} actualizado`, cliente });
    },
  
    delete: (req, res) => {
      const { id } = req.params;
      const index = clientesController.clientes.findIndex(c => c.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      const [deletedCliente] = clientesController.clientes.splice(index, 1);
      if (deletedCliente.profileImage) {
        const imagePath = path.join(__dirname, '..', deletedCliente.profileImage);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error al eliminar imagen:', err);
        });
      }
      res.json({ message: `Cliente con ID ${id} eliminado`, cliente: deletedCliente });
    }
  };


  
  
  module.exports = clientesController;
