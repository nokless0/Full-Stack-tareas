const API_URL = "http://localhost:3000/api/citas";

export const obtenerCitas = async () => {
  const response = await fetch(API_URL);
  return await response.json();
};

export const crearCita = async (cita) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cita),
  });

  return await response.json();
};

export const eliminarCita = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};
