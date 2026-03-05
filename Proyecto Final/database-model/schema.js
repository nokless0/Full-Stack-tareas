/**
 * =====================================================
 * SCRIPT DE BASE DE DATOS - VETCARE
 * =====================================================
 * 
 * Este archivo contiene comandos para MongoDB Shell.
 * Para ejecutarlo, usa:
 * 
 *   mongosh vetcare < schema.js
 * 
 * O simplemente ejecuta el backend que creará
 * las colecciones automáticamente.
 * =====================================================
 */

// ==================== CREAR COLECCIONES ====================

use vetcare;

db.createCollection("users");
db.createCollection("citas");

// ==================== ÍNDICES ====================

// Índice único para email (evita emails duplicados)
db.users.createIndex({ "email": 1 }, { unique: true });

// Índices para optimizar búsquedas en citas
db.citas.createIndex({ "usuario": 1 });
db.citas.createIndex({ "fecha": 1 });
db.citas.createIndex({ "estado": 1 });

// ==================== USUARIOS DE PRUEBA ====================

// Insertar usuario normal de prueba
db.users.insertOne({
  nombre: "Usuario Prueba",
  email: "test@vetcare.com",
  password: "$2a$10$ EJEMPLO HASH NO USAR",  // bcrypt de "password123"
  rol: "user",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insertar admin de prueba
db.users.insertOne({
  nombre: "Administrador",
  email: "admin@vetcare.com", 
  password: "$2a$10$ EJEMPLO HASH NO USAR",  // bcrypt de "admin123"
  rol: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

// ==================== VERIFICAR ====================

print("========================================");
print("✓ Base de datos configurada");
print("✓ Colecciones: users, citas");
print("✓ Índices creados");
print("========================================");

// Ver colecciones
db.getCollectionNames();

// Ver un usuario
db.users.findOne();
