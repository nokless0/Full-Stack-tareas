const express = require('express'); // Framework web
const mongoose = require('mongoose'); // ORM para MongoDB
const cors = require('cors'); // Permite conexiones cruzadas
const jwt = require('jsonwebtoken'); // Para tokens de autenticación
const bcrypt = require('bcryptjs'); // Para encriptar contraseñas

const app = express();
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON en las peticiones

// Conexión a MongoDB (base de datos)
// Usa variable de entorno o localhost por defecto
const MONGO_URI = process.env.MONGO_URI || 
  (process.env.TEST ? 'mongodb://localhost:27017/vetcare_test' : 'mongodb://localhost:27017/vetcare');

// Función para conectar a la base de datos
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
};

// Solo conectar si NO estamos en modo test
if (!process.env.TEST) {
  connectDB().catch(console.error);
}

// ==================== ESQUEMAS DE BASE DE DATOS ====================

// Esquema para Usuarios
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, minlength: 2, maxlength: 50 }, // Nombre del usuario
  email: { type: String, required: true, unique: true }, // Email único
  password: { type: String, required: true, minlength: 6 }, // Contraseña encriptada
  rol: { type: String, enum: ['user', 'admin'], default: 'user' }, // Rol: usuario normal o admin
}, { timestamps: true }); // CreatedAt y UpdatedAt automáticos

// Esquema para Citas
const citaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Quién creó la cita
  nombreDueno: { type: String, required: true }, // Nombre del dueño
  nombrePerro: { type: String, required: true }, // Nombre de la mascota
  raza: { type: String, required: true }, // Raza del perro
  fecha: { type: String, required: true }, // Fecha de la cita
  hora: { type: String, required: true }, // Hora de la cita
  motivo: { type: String, required: true, enum: ['consulta', 'vacunacion', 'cirugia', 'urgencia', 'chequeo'] }, // Tipo de cita
  estado: { type: String, enum: ['pendiente', 'confirmada', 'completada', 'cancelada'], default: 'pendiente' }, // Estado de la cita
}, { timestamps: true });

// Crear modelos
const User = mongoose.model('User', userSchema);
const Cita = mongoose.model('Cita', citaSchema);

// Clave secreta para firmar tokens JWT
const SECRET = 'vetcare_secret_key_2024';

// ==================== MIDDLEWARES ====================

// Middleware de autenticación - protege rutas privadas
const auth = (req, res, next) => {
  // Obtener token del header: "Bearer token..."
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  try {
    // Verificar si el token es válido
    req.user = jwt.verify(token, SECRET);
    next(); // Continuar si el token es válido
  } catch (e) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.code === 11000) return res.status(400).json({ error: 'Email ya registrado' });
  res.status(500).json({ error: 'Error del servidor' });
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registrar nuevo usuario
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || nombre.length < 2) return res.status(400).json({ error: 'Nombre debe tener al menos 2 caracteres' });
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email inválido' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Contraseña debe tener al menos 6 caracteres' });
    
    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);
    
    // Crear usuario en la base de datos
    const user = await User.create({ nombre, email, password: hashed });
    
    // Generar token JWT
    const token = jwt.sign({ id: user._id, rol: user.rol }, SECRET, { expiresIn: '7d' });
    
    // Devolver token y datos del usuario
    res.json({ token, user: { id: user._id, nombre: user.nombre, rol: user.rol } });
  } catch (e) { next(e); }
});

// Iniciar sesión
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    
    // Verificar credenciales
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar token
    const token = jwt.sign({ id: user._id, rol: user.rol }, SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, nombre: user.nombre, rol: user.rol } });
  } catch (e) { next(e); }
});

// Registrar admin (con clave secreta)
app.post('/api/auth/register-admin', async (req, res, next) => {
  try {
    const { nombre, email, password, adminKey } = req.body;
    
    // Verificar clave secreta
    if (adminKey !== 'vetcare-admin-2024') {
      return res.status(403).json({ error: 'Clave de admin inválida' });
    }
    
    // Validaciones
    if (!nombre || nombre.length < 2) return res.status(400).json({ error: 'Nombre muy corto' });
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email inválido' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Contraseña muy corta' });
    
    // Verificar si ya existe
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Email ya registrado' });
    
    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);
    
    // Crear usuario admin
    const user = await User.create({ nombre, email, password: hashed, rol: 'admin' });
    
    // Generar token
    const token = jwt.sign({ id: user._id, rol: user.rol }, SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, nombre: user.nombre, rol: user.rol } });
  } catch (e) { next(e); }
});

// Obtener datos del usuario actual
app.get('/api/auth/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (e) { next(e); }
});

// ==================== RUTAS DE CITAS ====================

// Obtener todas las citas (con paginación y filtros)
app.get('/api/citas', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, fecha, busqueda } = req.query;
    const skip = (page - 1) * limit;
    
    // Si es admin, puede ver todas las citas
    let filtro = req.user.rol === 'admin' ? {} : { usuario: req.user.id };
    
    // Filtros adicionales
    if (estado) filtro.estado = estado;
    if (fecha) filtro.fecha = fecha;
    if (busqueda) {
      filtro.$or = [
        { nombrePerro: { $regex: busqueda, $options: 'i' } },
        { nombreDueno: { $regex: busqueda, $options: 'i' } }
      ];
    }
    
    // Obtener citas con paginación
    const citas = await Cita.find(filtro).populate('usuario', 'nombre').skip(skip).limit(Number(limit));
    const total = await Cita.countDocuments(filtro);
    
    res.json({
      data: citas,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (e) { next(e); }
});

// Obtener una cita específica
app.get('/api/citas/:id', auth, async (req, res, next) => {
  try {
    const cita = await Cita.findById(req.params.id).populate('usuario', 'nombre');
    if (!cita) return res.status(404).json({ error: 'No encontrada' });
    
    // Solo el creador o admin pueden ver la cita
    if (req.user.rol !== 'admin' && cita.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    res.json(cita);
  } catch (e) { next(e); }
});

// Crear nueva cita
app.post('/api/citas', auth, async (req, res, next) => {
  try {
    const { nombreDueno, nombrePerro, raza, fecha, hora, motivo } = req.body;
    if (!nombreDueno || !nombrePerro || !raza || !fecha || !hora || !motivo) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Crear cita vinculada al usuario actual
    const cita = await Cita.create({ ...req.body, usuario: req.user.id });
    res.json(cita);
  } catch (e) { next(e); }
});

// Actualizar cita
app.put('/api/citas/:id', auth, async (req, res, next) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ error: 'No encontrada' });
    
    // Solo el creador o admin pueden editar
    if (req.user.rol !== 'admin' && cita.usuario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    Object.assign(cita, req.body);
    await cita.save();
    res.json(cita);
  } catch (e) { next(e); }
});

// Eliminar cita
app.delete('/api/citas/:id', auth, async (req, res, next) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ error: 'No encontrada' });
    
    // Solo el creador o admin pueden eliminar
    if (req.user.rol !== 'admin' && cita.usuario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await cita.deleteOne();
    res.json({ mensaje: 'Eliminada' });
  } catch (e) { next(e); }
});

// Cambiar estado de una cita (solo admin)
app.patch('/api/citas/:id/status', auth, async (req, res, next) => {
  try {
    // Solo admin puede cambiar estado
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
    
    const { estado } = req.body;
    if (!['pendiente', 'confirmada', 'completada', 'cancelada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    const cita = await Cita.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    res.json(cita);
  } catch (e) { next(e); }
});

// Usar el middleware de errores
app.use(errorHandler);

// ==================== RUTA DE DEBUG (solo para desarrollo) ====================

// Ver todos los usuarios
app.get('/debug/usuarios', async (req, res) => {
  const usuarios = await User.find().select('-password');
  res.json({ total: usuarios.length, usuarios });
});

// Ver todas las citas
app.get('/debug/citas', async (req, res) => {
  const citas = await Cita.find().populate('usuario', 'nombre email');
  res.json({ total: citas.length, citas });
});

// ==================== INICIAR SERVIDOR ====================

if (require.main === module) {
  app.listen(5000, () => console.log('Servidor en puerto 5000'));
}

module.exports = app;
