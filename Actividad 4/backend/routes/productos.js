const express = require('express');
const auth = require('../middleware/auth');
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productoController');
const router = express.Router();

router.get('/', auth, obtenerProductos);
router.post('/', auth, crearProducto);
router.put('/:id', auth, actualizarProducto);
router.delete('/:id', auth, eliminarProducto);

module.exports = router;
