const request = require('supertest');
const app = require('../server');

describe('Pruebas de la API', () => {

  // ===== AUTENTICACIÓN =====
  describe('POST /api/auth/registrar', () => {
    const usuarioUnico = 'testuser' + Date.now();

    test('Debe registrar un usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/registrar')
        .send({ username: usuarioUnico, password: 'password123' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe(usuarioUnico);
    });

    test('Debe fallar si el usuario ya existe', async () => {
      await request(app)
        .post('/api/auth/registrar')
        .send({ username: 'testuser2', password: 'password123' });
      
      const res = await request(app)
        .post('/api/auth/registrar')
        .send({ username: 'testuser2', password: 'password123' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ya existe');
    });

    test('Debe fallar si falta username o password', async () => {
      const res = await request(app)
        .post('/api/auth/registrar')
        .send({ username: 'testuser3' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('requeridos');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Debe iniciar sesión con credenciales válidas', async () => {
      await request(app)
        .post('/api/auth/registrar')
        .send({ username: 'loginuser', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('Debe fallar con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'noexiste', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('inválidas');
    });
  });

  // ===== PRODUCTOS - RUTAS PROTEGIDAS =====
  describe('GET /api/productos', () => {
    test('Debe retornar 401 sin token', async () => {
      const res = await request(app).get('/api/productos');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/productos', () => {
    test('Debe retornar 401 sin token', async () => {
      const res = await request(app)
        .post('/api/productos')
        .send({ nombre: 'Test', descripcion: 'Desc', precio: 100, cantidad: 5 });
      expect(res.status).toBe(401);
    });
  });

  // ===== MANEJO DE ERRORES =====
  describe('Rutas inexistentes', () => {
    test('Debe retornar 404 para ruta no encontrada', async () => {
      const res = await request(app).get('/api/inexistente');
      expect(res.status).toBe(404);
    });
  });

});
