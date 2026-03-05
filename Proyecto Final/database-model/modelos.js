/**
 * =====================================================
 * MODELO DE DATOS - VETCARE
 * =====================================================
 * Este archivo es solo documentación de la estructura
 * de la base de datos. No es código ejecutable.
 * 
 * Los modelos reales están en: backend/server.js
 * =====================================================
 */

// ==================== COLECCIÓN: USERS ====================
/**
 * users
 * -----
 * | Campo     | Tipo          | Requerido | Descripción                    |
 * |-----------|---------------|-----------|--------------------------------|
 * | _id       | ObjectId      | Auto      | ID único                      |
 * | nombre    | String(2-50)  | Sí       | Nombre del usuario             |
 * | email     | String        | Sí       | Email único                   |
 * | password  | String        | Sí       | Contraseña encriptada         |
 * | rol       | String        | Sí       | 'user' o 'admin'             |
 * | createdAt | Date          | Auto      | Fecha creación                |
 * | updatedAt | Date          | Auto      | Fecha actualización           |
 */

// ==================== COLECCIÓN: CITAS ====================
/**
 * citas
 * -----
 * | Campo      | Tipo          | Requerido | Descripción                    |
 * |------------|---------------|-----------|--------------------------------|
 * | _id        | ObjectId      | Auto      | ID único                      |
 * | usuario    | ObjectId      | Sí       | Referencia a users            |
 * | nombreDueno| String        | Sí       | Nombre del dueño              |
 * | nombrePerro| String       | Sí       | Nombre de la mascota          |
 * | raza       | String        | Sí       | Raza del perro                |
 * | fecha      | String        | Sí       | Fecha de la cita             |
 * | hora       | String        | Sí       | Hora de la cita              |
 * | motivo     | String        | Sí       | consulta/vacunacion/etc      |
 * | estado     | String        | No        | pendiente/confirmada/etc     |
 * | createdAt  | Date         | Auto      | Fecha creación                |
 * | updatedAt  | Date         | Auto      | Fecha actualización           |
 */

// ==================== RELACIONES ====================
/**
 * Un usuario puede tener muchas citas
 * 
 * users (1) ----< (N) citas
 *   └─ _id    ───> usuario
 */

// ==================== EJEMPLO DE DOCUMENTO ====================
/**
 * Ejemplo de usuario:
 * {
 *   _id: ObjectId("..."),
 *   nombre: "Juan Pérez",
 *   email: "juan@email.com",
 *   password: "$2a$10$hash...",
 *   rol: "user",
 *   createdAt: ISODate("2024-01-01"),
 *   updatedAt: ISODate("2024-01-01")
 * }
 * 
 * Ejemplo de cita:
 * {
 *   _id: ObjectId("..."),
 *   usuario: ObjectId("..."),
 *   nombreDueno: "Juan Pérez",
 *   nombrePerro: "Max",
 *   raza: "Golden Retriever",
 *   fecha: "2024-12-20",
 *   hora: "10:00",
 *   motivo: "consulta",
 *   estado: "pendiente",
 *   createdAt: ISODate("2024-01-01"),
 *   updatedAt: ISODate("2024-01-01")
 * }
 */
