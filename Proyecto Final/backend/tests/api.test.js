/**
 * Pruebas de API para VetCare
 * ============================
 * Este archivo contiene pruebas automatizadas (Jest + Supertest) para verificar
 * el funcionamiento correcto de los endpoints del backend.
 * 
 * Estructura de las pruebas:
 * - beforeAll: Se ejecuta una vez antes de todas las pruebas (conectar a MongoDB)
 * - afterAll: Se ejecuta después de todas las pruebas (limpiar y cerrar conexión)
 * - beforeEach: Se ejecuta antes de cada prueba (limpiar colecciones)
 * - describe: Agrupa pruebas relacionadas (Autenticación y Citas)
 * - test: Cada prueba individual
 */

const request = require('supertest');    // Librería para hacer peticiones HTTP al servidor
const mongoose = require('mongoose');     // ODM de MongoDB
const bcrypt = require('bcryptjs');       // Para encriptar contraseñas
const jwt = require('jsonwebtoken');      // Para generar tokens de autenticación

let app;       // Servidor Express
let User;      // Modelo de Usuario
let Cita;      // Modelo de Cita

/**
 * beforeAll: Se ejecuta ANTES de todas las pruebas
 * - Conecta a la base de datos de prueba MongoDB
 * - Carga el servidor Express
 * - Obtiene referencias a los modelos de Mongoose
 */
beforeAll(async () => {
  // Determina el host de MongoDB (variable de entorno o valor por defecto)
  // En Docker: 'mongodb' (nombre del servicio)
  // En host local: 'host.docker.internal' o 'localhost'
  const mongoHost = process.env.MONGO_HOST || 'mongodb';
  const mongoUser = process.env.MONGO_USER || 'root';
  const mongoPass = process.env.MONGO_PASS || 'root123';
  await mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/vetcare_test`);
  
  app = require('../server');  // Carga el servidor Express
  User = mongoose.model('User');   // Obtiene el modelo de Usuario
  Cita = mongoose.model('Cita');   // Obtiene el modelo de Cita
}, 30000);

/**
 * afterAll: Se ejecuta DESPUÉS de todas las pruebas
 * - Elimina la base de datos de prueba
 * - Cierra la conexión a MongoDB
 */
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();  // Elimina todos los datos de prueba
    await mongoose.connection.close();           // Cierra la conexión
  }
}, 30000);

/**
 * beforeEach: Se ejecuta ANTES de cada prueba
 * - Limpia las colecciones de usuarios y citas
 * - Asegura que cada prueba comece con datos frescos
 */
beforeEach(async () => {
  await User.deleteMany({});  // Elimina todos los usuarios
  await Cita.deleteMany({});  // Elimina todas las citas
});

/**
 * ===================================================================
 * PRUEBAS DE AUTENTICACIÓN
 * ===================================================================
 * Verifica el funcionamiento de login y registro de usuarios
 */
describe('API de Autenticación', () => {
  
  /**
   * Prueba 1: Login exitoso
   * ------------------------
   * Crea un usuario en la base de datos, luego intenta iniciar sesión
   * con las credenciales correctas. Verifica que retorne token y datos del usuario.
   */
  test('1. Login exitoso', async () => {
    // 1. Crear usuario con contraseña encriptada
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({ nombre: 'Test User', email: 'test@test.com', password: hashed });
    
    // 2. Hacer petición POST a /api/auth/login
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });
    
    // 3. Verificar resultados esperados
    expect(res.status).toBe(200);                    // Código 200 = éxito
    expect(res.body.token).toBeDefined();            // Token debe existir
    expect(res.body.user.nombre).toBe('Test User'); // Nombre correcto
  });

  /**
   * Prueba 2: Login fallido - contraseña incorrecta
   * -----------------------------------------------
   * Intenta iniciar sesión con una contraseña incorrecta.
   * Debe retornar error 400 con mensaje de credenciales incorrectas.
   */
  test('2. Login fallido - contraseña incorrecta', async () => {
    // 1. Crear usuario
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({ nombre: 'Test User', email: 'test@test.com', password: hashed });
    
    // 2. Intentar login con contraseña incorrecta
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });
    
    // 3. Verificar que sea error
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Credenciales incorrectas');
  });

  /**
   * Prueba 3: Registro exitoso
   * --------------------------
   * Crea un nuevo usuario mediante el endpoint de registro.
   * Debe retornar token y el usuario creado con rol 'user' por defecto.
   */
  test('3. Registro exitoso', async () => {
    // 1. Hacer petición POST a /api/auth/register
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Nuevo Usuario', email: 'nuevo@test.com', password: 'password123' });
    
    // 2. Verificar resultados
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.rol).toBe('user');  // Rol por defecto es 'user'
  });
});

/**
 * ===================================================================
 * PRUEBAS DE CITAS (Citas Veterinarias)
 * ===================================================================
 * Verifica el CRUD de citas, paginación y control de acceso por roles
 */
describe('API de Citas', () => {
  let token;       // Token de usuario normal
  let adminToken;  // Token de administrador
  let userId;      // ID del usuario de prueba

  /**
   * beforeEach: Se ejecuta antes de cada prueba de citas
   * - Crea un usuario normal y genera su token
   * - Crea un administrador y genera su token
   */
  beforeEach(async () => {
    // Crear usuario normal
    const user = await User.create({ 
      nombre: 'Usuario', 
      email: 'user@test.com', 
      password: await bcrypt.hash('pass123', 10) 
    });
    userId = user._id;
    // Generar token JWT para el usuario
    token = jwt.sign({ id: user._id, rol: 'user' }, 'vetcare_secret_key_2024');
    
    // Crear administrador
    const admin = await User.create({ 
      nombre: 'Admin', 
      email: 'admin@test.com', 
      password: await bcrypt.hash('admin123', 10), 
      rol: 'admin'  // Rol de administrador
    });
    // Generar token JWT para el admin
    adminToken = jwt.sign({ id: admin._id, rol: 'admin' }, 'vetcare_secret_key_2024');
  });

  /**
   * Prueba 4: Crear cita
   * --------------------
   * Un usuario autenticado crea una nueva cita veterinaria.
   * Verifica que se guarde correctamente en la base de datos.
   */
  test('4. Crear cita', async () => {
    // 1. Hacer petición POST a /api/citas con token de autenticación
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token}`)  // Header con token JWT
      .send({
        nombreDueno: 'Juan',
        nombrePerro: 'Max',
        raza: 'Golden',
        fecha: '2024-12-20',
        hora: '10:00',
        motivo: 'consulta'
      });
    
    // 2. Verificar resultados
    expect(res.status).toBe(200);
    expect(res.body.nombrePerro).toBe('Max');
  });

  /**
   * Prueba 5: Listar citas
   * ----------------------
   * Un usuario autenticado lista sus citas.
   * Debe retornar solo las citas del usuario actual.
   */
  test('5. Listar citas', async () => {
    // 1. Crear una cita para el usuario
    await Cita.create({ 
      usuario: userId, 
      nombreDueno: 'Juan', 
      nombrePerro: 'Max', 
      raza: 'Golden', 
      fecha: '2024-12-20', 
      hora: '10:00', 
      motivo: 'consulta' 
    });
    
    // 2. Listar citas del usuario
    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${token}`);
    
    // 3. Verificar resultados
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);  // Solo 1 cita del usuario
  });

  /**
   * Prueba 6: Admin puede ver todas las citas
   * ------------------------------------------
   * Un administrador puede ver TODAS las citas de todos los usuarios.
   * Esto verifica el control de acceso basado en roles (RBAC).
   */
  test('6. Acceso permitido - admin puede ver todas las citas', async () => {
    // 1. Crear otro usuario con una cita
    const otherUser = await User.create({ 
      nombre: 'Otro', 
      email: 'otro@test.com', 
      password: await bcrypt.hash('pass', 10) 
    });
    await Cita.create({ 
      usuario: otherUser._id, 
      nombreDueno: 'Pedro', 
      nombrePerro: 'Luna', 
      raza: 'Labrador', 
      fecha: '2024-12-21', 
      hora: '11:00', 
      motivo: 'vacunacion' 
    });
    
    // 2. Admin lista todas las citas
    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${adminToken}`);
    
    // 3. Verificar que admin ve todas las citas
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);  // Admin ve la cita del otro usuario
  });

  /**
   * Prueba 7: User no puede cambiar estado de citas
   * -------------------------------------------------
   * Un usuario normal NO puede cambiar el estado de una cita.
   * Solo el administrador tiene este privilegio.
   */
  test('7. Acceso denegado - user no puede cambiar estado', async () => {
    // 1. Crear una cita
    const cita = await Cita.create({ 
      usuario: userId, 
      nombreDueno: 'Juan', 
      nombrePerro: 'Max', 
      raza: 'Golden', 
      fecha: '2024-12-20', 
      hora: '10:00', 
      motivo: 'consulta' 
    });
    
    // 2. Intentar cambiar estado con token de usuario normal
    const res = await request(app)
      .patch(`/api/citas/${cita._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'confirmada' });
    
    // 3. Verificar que se deniega el acceso
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Solo admin');
  });

  /**
   * Prueba 8: Paginación
   * ---------------------
   * Verifica que el endpoint de listar citas soporte paginación.
   * Crea 15 citas y verifica que retorna 10 por página.
   */
  test('8. Paginación', async () => {
    // 1. Crear 15 citas
    for (let i = 0; i < 15; i++) {
      await Cita.create({ 
        usuario: userId, 
        nombreDueno: 'Juan', 
        nombrePerro: `Perro${i}`, 
        raza: 'Golden', 
        fecha: '2024-12-20', 
        hora: '10:00', 
        motivo: 'consulta' 
      });
    }
    
    // 2. Solicitar página 1 con límite de 10
    const res = await request(app)
      .get('/api/citas?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    
    // 3. Verificar paginación
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(10);   // 10 citas por página
    expect(res.body.pagination.pages).toBe(2); // 15 / 10 = 2 páginas
  });

  /**
   * Prueba 9: Validación - crear cita sin datos
   * --------------------------------------------
   * Verifica que el endpoint rechaza solicitudes con datos incompletos.
   * Debe retornar error 400 si faltan campos requeridos.
   */
  test('9. Validación fallida - crear cita sin datos', async () => {
    // 1. Intentar crear cita con solo nombreDueno
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombreDueno: 'Juan' });  // Faltan: nombrePerro, fecha, hora, motivo
    
    // 2. Verificar que se rechaza
    expect(res.status).toBe(400);  // Error de validación
  });
});
