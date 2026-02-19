import { useEffect, useState } from "react";
import { obtenerCitas, eliminarCita } from "../services/citasService";

const ListaCitas = () => {
  const [citas, setCitas] = useState([]);

  const cargarCitas = async () => {
    const data = await obtenerCitas();
    setCitas(data);
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const handleEliminar = async (id) => {
    await eliminarCita(id);
    cargarCitas();
  };

  return (
    <div>
      <h2>Lista de Citas</h2>
      {citas.map((cita) => (
        <div key={cita._id}>
          <p><strong>Mascota:</strong> {cita.mascota}</p>
          <p><strong>Dueño:</strong> {cita.dueño}</p>
          <button onClick={() => handleEliminar(cita._id)}>
            Eliminar
          </button>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ListaCitas;
