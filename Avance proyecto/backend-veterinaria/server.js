

// Framework para crear el servidor y las rutas
const express = require("express");

// Librería para conectar y trabajar con MongoDB
const mongoose = require("mongoose");

// Middleware para permitir comunicación entre frontend y backend
const cors = require("cors");

// ============================
// CONFIGURACIÓN DEL SERVIDOR
// ============================

const app = express();

// Permite recibir datos en formato JSON
app.use(express.json());

// Permite peticiones desde el frontend (Live Server)
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

// Si la base de datos no existe, MongoDB la crea automáticamente
mongoose
  .connect("mongodb://127.0.0.1:27017/Veterinaria")
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error MongoDB:", err));


// Define la estructura de una cita
const CitaSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombreMascota: { type: String, required: true },
  especie: { type: String, required: true },
  fecha: { type: String, required: true },
  tratamiento: { type: String, required: true }
});

// Se asocia el esquema a la colección "citas"
const Cita = mongoose.model("Cita", CitaSchema, "citas");



// Obtener todas las citas
app.get("/api/citas", async (req, res) => {
  const citas = await Cita.find().sort({ id: 1 });
  res.json(citas);
});

// Crear una nueva cita
app.post("/api/citas", async (req, res) => {
  const { nombreMascota, especie, fecha, tratamiento } = req.body;

  const ultima = await Cita.findOne().sort({ id: -1 });
  const nuevoId = ultima ? ultima.id + 1 : 1;

  const nueva = new Cita({
    id: nuevoId,
    nombreMascota,
    especie,
    fecha,
    tratamiento
  });

  await nueva.save();
  res.status(201).json(nueva);
});

// Actualizar una cita existente
app.put("/api/citas/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombreMascota, especie, fecha, tratamiento } = req.body;

  const actualizada = await Cita.findOneAndUpdate(
    { id },
    { nombreMascota, especie, fecha, tratamiento },
    { new: true }
  );

  res.json(actualizada);
});

// Eliminar una cita
app.delete("/api/citas/:id", async (req, res) => {
  const id = Number(req.params.id);
  await Cita.findOneAndDelete({ id });
  res.sendStatus(204);
});

// ============================
// INICIO DEL SERVIDOR
// ============================

app.listen(3000, () => {
  console.log("Servidor backend activo en http://localhost:3000");
});
