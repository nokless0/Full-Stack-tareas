const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");

const verificarSesion = require("./middleware/auth");

const app = express();

// =========================
// CONFIG
// =========================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secreto_super_seguro",
  resave: false,
  saveUninitialized: false
}));

// =========================
// CONEXION MONGO
// =========================
mongoose.connect("mongodb://127.0.0.1:27017/veterinaria")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// =========================
// MODELO CITA
// =========================
const citaSchema = new mongoose.Schema({
  mascota: String,
  propietario: String,
  telefono: String,
  fecha: String,
  motivo: String
});

const Cita = mongoose.model("Cita", citaSchema);

// =========================
// LOGIN
// =========================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const usuarios = JSON.parse(
    fs.readFileSync("./usuarios.json", "utf-8")
  );

  const usuario = usuarios.find(
    u => u.username === username && u.password === password
  );

  if (!usuario) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  req.session.usuario = usuario;
  res.json({ mensaje: "Login exitoso", usuario });
});

// =========================
// LOGOUT
// =========================
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ mensaje: "Sesión cerrada" });
});

// =========================
// RUTAS PROTEGIDAS
// =========================

// GET
app.get("/api/citas", verificarSesion, async (req, res) => {
  const citas = await Cita.find();
  res.json(citas);
});

// POST
app.post("/api/citas", verificarSesion, async (req, res) => {
  const nueva = new Cita(req.body);
  await nueva.save();
  res.json(nueva);
});

// PUT
app.put("/api/citas/:id", verificarSesion, async (req, res) => {
  await Cita.findByIdAndUpdate(req.params.id, req.body);
  res.json({ mensaje: "Actualizada" });
});

// DELETE
app.delete("/api/citas/:id", verificarSesion, async (req, res) => {
  await Cita.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Eliminada" });
});

// =========================
app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});
