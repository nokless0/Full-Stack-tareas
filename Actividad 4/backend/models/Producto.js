const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
