const mongoose = require("mongoose");

const citaSchema = new mongoose.Schema({
  mascota: { type: String, required: true },
  propietario: { type: String, required: true },
  telefono: { type: String, required: true },
  fecha: { type: String, required: true },
  motivo: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Cita", citaSchema);
