const proveedoresController = {
    proveedores: [],
  
    getAll: (req, res) => {
      res.json(proveedoresController.proveedores);
    },
  
    add: (req, res) => {
      const { nombre } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es requerido' });
      }
      const newProveedor = {
        id: proveedoresController.proveedores.length + 1,
        nombre,
        profileImage: req.file ? `/uploads/${req.file.filename}` : null
      };
      proveedoresController.proveedores.push(newProveedor);
      res.status(201).json({ message: `Proveedor ${nombre} agregado`, proveedor: newProveedor });
    },
  
    update: (req, res) => {
      const { id } = req.params;
      const { nombre } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es requerido' });
      }
      const proveedor = proveedoresController.proveedores.find(p => p.id === parseInt(id));
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      proveedor.nombre = nombre;
      if (req.file) {
        proveedor.profileImage = `/uploads/${req.file.filename}`;
      }
      res.json({ message: `Proveedor con ID ${id} actualizado`, proveedor });
    },
  
    delete: (req, res) => {
      const { id } = req.params;
      const index = proveedoresController.proveedores.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      const [deletedProveedor] = proveedoresController.proveedores.splice(index, 1);
      if (deletedProveedor.profileImage) {
        const imagePath = path.join(__dirname, '..', deletedProveedor.profileImage);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error al eliminar imagen:', err);
        });
      }
      res.json({ message: `Proveedor con ID ${id} eliminado`, proveedor: deletedProveedor });
    }
  };
  
  module.exports = proveedoresController;