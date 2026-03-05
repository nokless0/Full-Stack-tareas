# VetCare - Diagrama del Modelo de Datos

## Colecciones MongoDB

### users
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Auto | ID único |
| nombre | String(2-50) | Sí | Nombre del usuario |
| email | String | Sí | Email único |
| password | String | Sí | Contraseña encriptada |
| rol | String | Sí | 'user' o 'admin' |
| createdAt | Date | Auto | Fecha creación |
| updatedAt | Date | Auto | Fecha actualización |

### citas
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Auto | ID único |
| usuario | ObjectId | Sí | Ref a users |
| nombreDueno | String | Sí | Nombre del dueño |
| nombrePerro | String | Sí | Nombre del perro |
| raza | String | Sí | Raza del perro |
| fecha | String | Sí | Fecha de cita |
| hora | String | Sí | Hora de cita |
| motivo | String | Sí | consulta/vacunacion/cirugia/urgencia/chequeo |
| estado | String | No | pendiente/confirmada/completada/cancelada |
| observaciones | String | No | Notas adicionales |
| createdAt | Date | Auto | Fecha creación |
| updatedAt | Date | Auto | Fecha actualización |

## Relaciones
```
users (1) ----< (N) citas
```
