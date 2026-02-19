import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  const [logeado, setLogeado] = useState(false);
  const [citas, setCitas] = useState([]);
  const [form, setForm] = useState({
    mascota: "",
    propietario: "",
    telefono: "",
    fecha: "",
    motivo: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  const API = "http://localhost:3000/api/citas";

  // ============================
  // OBTENER CITAS
  // ============================
  useEffect(() => {
    if (logeado) {
      obtenerCitas();
    }
  }, [logeado]);

  const obtenerCitas = async () => {
    try {
      const res = await fetch(API, {
        method: "GET",
        credentials: "include"
      });

      if (!res.ok) {
        console.log("No autorizado o error");
        return;
      }

      const data = await res.json();
      setCitas(data);
    } catch (error) {
      console.error("Error al obtener citas:", error);
    }
  };

  // ============================
  // INPUTS
  // ============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ============================
  // CREAR O ACTUALIZAR
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await fetch(`${API}/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form)
        });

        setEditandoId(null);
      } else {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form)
        });
      }

      setForm({
        mascota: "",
        propietario: "",
        telefono: "",
        fecha: "",
        motivo: ""
      });

      obtenerCitas();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // ============================
  // ELIMINAR
  // ============================
  const eliminarCita = async (id) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      obtenerCitas();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // ============================
  // EDITAR
  // ============================
  const editarCita = (cita) => {
    setForm({
      mascota: cita.mascota,
      propietario: cita.propietario,
      telefono: cita.telefono,
      fecha: cita.fecha,
      motivo: cita.motivo
    });

    setEditandoId(cita._id);
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include"
    });

    setLogeado(false);
  };

  // ============================
  // SI NO ESTA LOGEADO
  // ============================
  if (!logeado) {
    return <Login setLogeado={setLogeado} />;
  }

  return (
    <div className="container">
      <h1>🐾 Sistema Veterinaria</h1>

      <button onClick={logout} className="logout-btn">
        Cerrar Sesión
      </button>

      <form onSubmit={handleSubmit}>
        <input
          name="mascota"
          placeholder="Mascota"
          value={form.mascota}
          onChange={handleChange}
          required
        />

        <input
          name="propietario"
          placeholder="Propietario"
          value={form.propietario}
          onChange={handleChange}
          required
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />

        <input
          name="motivo"
          placeholder="Motivo"
          value={form.motivo}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editandoId ? "Actualizar Cita" : "Agregar Cita"}
        </button>
      </form>

      <div className="grid-container">
        {citas.map((cita) => (
          <div key={cita._id} className="card">
            <h3>{cita.mascota}</h3>
            <p><strong>Dueño:</strong> {cita.propietario}</p>
            <p><strong>Tel:</strong> {cita.telefono}</p>
            <p><strong>Fecha:</strong> {cita.fecha}</p>
            <p><strong>Motivo:</strong> {cita.motivo}</p>

            <div className="card-actions">
              <button onClick={() => editarCita(cita)}>
                Editar
              </button>

              <button onClick={() => eliminarCita(cita._id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
