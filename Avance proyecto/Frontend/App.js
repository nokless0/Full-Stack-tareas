// ============================
// REFERENCIAS A ELEMENTOS DEL DOM
// ============================

// Botón para mostrar el formulario de nueva cita
const botonCitaNueva = document.getElementById("btnNuevaCita");

// Contenedor del formulario completo
const formCita = document.getElementById("formCita");

// Botón para cancelar la creación o edición de una cita
const btnCancel = document.getElementById("btnCancel");

// Formulario interno donde se capturan los datos
const form = document.querySelector("#formCita form");

// Contenedor donde se mostrarán todas las citas
const listaCitas = document.getElementById("listaCitas");

// URL base de la API del backend
const API_URL = "http://localhost:3000/api/citas";

// Variable que indica si se está editando una cita existente
// Si es null, se crea una nueva cita
let idEditando = null;

// ============================
// EVENTO AL CARGAR LA PÁGINA
// ============================

// Cuando la página termina de cargar:
// - Se oculta el formulario
// - Se cargan las citas desde la base de datos
window.addEventListener("DOMContentLoaded", () => {
  formCita.style.display = "none";
  cargarCitas();
});

// ============================
// MOSTRAR FORMULARIO DE NUEVA CITA
// ============================

// Al presionar el botón "Nueva cita" se muestra el formulario
botonCitaNueva.addEventListener("click", () => {
  formCita.style.display = "block";
});

// ============================
// CANCELAR OPERACIÓN
// ============================

// Limpia el formulario y lo oculta
btnCancel.addEventListener("click", () => {
  form.reset();
  formCita.style.display = "none";
  idEditando = null;
});

// ============================
// ENVÍO DEL FORMULARIO (CREATE / UPDATE)
// ============================

// Este evento se ejecuta cuando se envía el formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  // Obtención de los valores del formulario
  const nombreMascota = document.getElementById("nombre").value;
  const especie = document.getElementById("especie").value;
  const fecha = document.getElementById("fecha").value;
  const tratamiento = document.getElementById("tratamiento").value;

  // Validación básica
  if (!nombreMascota || !especie || !fecha || !tratamiento) {
    alert("Llena todos los campos");
    return;
  }

  // Objeto que se enviará al backend
  const datos = {
    nombreMascota,
    especie,
    fecha,
    tratamiento
  };

  // Si no se está editando, se crea una nueva cita
  if (idEditando === null) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
  } 
  // Si hay un id, se actualiza la cita existente
  else {
    await fetch(`${API_URL}/${idEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    idEditando = null;
  }

  // Se limpia el formulario y se actualiza la lista
  form.reset();
  formCita.style.display = "none";
  cargarCitas();
});

// ============================
// CARGAR CITAS (READ)
// ============================

// Obtiene todas las citas del backend y las muestra en pantalla
async function cargarCitas() {
  listaCitas.innerHTML = "";

  const res = await fetch(API_URL);
  const citas = await res.json();

  citas.forEach(cita => {
    const div = document.createElement("div");

    // Se genera dinámicamente el contenido HTML de cada cita
    div.innerHTML = `
      <h3>Cita programada</h3>
      <p><strong>Nombre:</strong> ${cita.nombreMascota}</p>
      <p><strong>Fecha:</strong> ${formatearFecha(cita.fecha)}</p>
      <p><strong>Especie:</strong> ${cita.especie}</p>
      <p><strong>Tratamiento:</strong> ${cita.tratamiento}</p>

      <button onclick="editarCita(${cita.id})">Editar</button>
      <button onclick="eliminarCita(${cita.id})">Eliminar</button>
      <hr>
    `;

    listaCitas.appendChild(div);
  });
}

// ============================
// EDITAR CITA (LOAD DATA)
// ============================

// Carga los datos de una cita en el formulario para editarla
async function editarCita(id) {
  const res = await fetch(API_URL);
  const citas = await res.json();

  const cita = citas.find(c => c.id === id);
  if (!cita) return;

  formCita.style.display = "block";

  document.getElementById("nombre").value = cita.nombreMascota;
  document.getElementById("especie").value = cita.especie;
  document.getElementById("fecha").value = cita.fecha;
  document.getElementById("tratamiento").value = cita.tratamiento;

  idEditando = id;
}

// ============================
// ELIMINAR CITA (DELETE)
// ============================

// Elimina una cita específica de la base de datos
async function eliminarCita(id) {
  if (!confirm("¿Eliminar esta cita?")) return;

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  cargarCitas();
}

// ============================
// FORMATEO DE FECHA
// ============================

// Convierte una fecha YYYY-MM-DD a DD/MM/YYYY
function formatearFecha(fechaISO) {
  const [a, m, d] = fechaISO.split("-");
  return `${d}/${m}/${a}`;
}
