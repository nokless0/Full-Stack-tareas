import { useState } from "react";
import { crearCita } from "../services/citasService";

const Formulario = ({ actualizarLista }) => {
  const [form, setForm] = useState({
    mascota: "",
    dueño: "",
    telefono: "",
    fecha: "",
    motivo: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearCita(form);
    actualizarLista();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="mascota" placeholder="Mascota" onChange={handleChange} />
      <input name="dueño" placeholder="Dueño" onChange={handleChange} />
      <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
      <input type="date" name="fecha" onChange={handleChange} />
      <input name="motivo" placeholder="Motivo" onChange={handleChange} />
      <button type="submit">Agregar Cita</button>
    </form>
  );
};

export default Formulario;
