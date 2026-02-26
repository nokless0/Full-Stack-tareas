const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const registrar = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const existe = await Usuario.findOne({ username });
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const usuario = new Usuario({ username, password });
    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, username: usuario.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, username: usuario.username });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuario = await Usuario.findOne({ username });
    if (!usuario || !(await usuario.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id, username: usuario.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, username: usuario.username });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { registrar, login };
