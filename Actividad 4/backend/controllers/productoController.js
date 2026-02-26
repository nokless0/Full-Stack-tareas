const Producto = require('../models/Producto');

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('proveedor', 'username');
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, cantidad } = req.body;
    const producto = new Producto({
      nombre,
      descripcion,
      precio,
      cantidad,
      proveedor: req.usuario.id
    });
    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };
