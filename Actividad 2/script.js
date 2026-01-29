const input = document.getElementById("tareaInput");
const button = document.getElementById("btnAgregar");
const lista = document.getElementById("listaTareas");
const mensaje = document.getElementById("mensaje");

//Clase para almacenar cada tarea asignarle un Id un nombre y si esta completa o no
class Tarea {
  constructor(nombre, completa = false) {
    this.id = Date.now();
    this.nombre = nombre;
    this.completa = completa;
  }

  // método para cambiar el estado SI ESTA COMPLETA O NO
  cambiarEstado() {
    this.completa = !this.completa;
  }
}

// CLASE PARA GESTIONAR LAS TAREAS ALMACENANDOLAS EN UNA LISTA
class GestorDeTareas {
  constructor() {
    this.tareas = [];
    this.cargarLocal();
  }

  // Agregar tarea al arreglo
  agregar(nombre) {
    const nueva = new Tarea(nombre);
    this.tareas.push(nueva);
    this.guardarLocal();
  }

  // Regresar todas las tareas
  obtenerTodos() {
    return this.tareas;
  }

  // Eliminar tarea por id
  eliminar(id) {
    this.tareas = this.tareas.filter((t) => t.id !== id);
    this.guardarLocal();
  }

  // Editar el nombre de la tarea se mandara a llamar con el id y el nuevo nombre
  editar(id, nuevoNombre) {
    const tarea = this.tareas.find((t) => t.id === id);
    if (tarea) {
      tarea.nombre = nuevoNombre;
      this.guardarLocal();
    }
  }

  // Marcar tarea como completa o incompleta
  completar(id) {
    const tarea = this.tareas.find((t) => t.id === id);
    if (tarea) {
      tarea.cambiarEstado();
      this.guardarLocal();
    }
  }
 //PARTE INVESITGADA PARA EL GUARDADO DE TAREAS EN LOCALSTORAGE
  // Guardar en LocalStorage para que no se borren al recargar
  guardarLocal() {
    localStorage.setItem("tareas", JSON.stringify(this.tareas));
  }

  // Cargar tareas guardadas guardandolas en el localstorage en un JSON
  cargarLocal() {
    const data = localStorage.getItem("tareas");

    if (data) {
      const tareasGuardadas = JSON.parse(data);

      // Volvemos a crear objetos tipo Tarea para que no se pierda la clase
      this.tareas = tareasGuardadas.map((t) => {
        const nueva = new Tarea(t.nombre, t.completa);
        nueva.id = t.id;
        return nueva;
      });
    }
  }
}

// Creamos el gestor
const gestor = new GestorDeTareas();

// Función para mostrar mensajes simples
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.classList.remove("oculto", "error", "exito");

  if (tipo === "error") {
    mensaje.classList.add("error");
  } else {
    mensaje.classList.add("exito");
  }

  setTimeout(() => {
    mensaje.classList.add("oculto");
  }, 1500);
}

// Render de la lista de tareas adentro del html
function renderLista() {
  lista.innerHTML = "";

  const tareas = gestor.obtenerTodos();

  // Para cada objeto de tipo tarea se guardara en la lista
  tareas.forEach((tarea) => {
    const li = document.createElement("li");

    // checkbox para marcar si esta completa o no
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = tarea.completa;

   // texto de la tarea
    const texto = document.createElement("p");
    texto.textContent = tarea.nombre;
    texto.classList.add("tarea-texto");

    // si la tarea está completa se tacha
    if (tarea.completa) {
      texto.classList.add("hecha");
    }

    // evento del checkbox para completar/incompleta
    check.addEventListener("change", () => {
      gestor.completar(tarea.id);
      renderLista();
    });

    // contenedor para los botones
    const acciones = document.createElement("div");
    acciones.classList.add("acciones");

    // boton editar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-edit");

    btnEditar.addEventListener("click", () => {
      const nuevo = prompt("Editar tarea:", tarea.nombre);
      if (nuevo === null) return;

      const limpio = nuevo.trim();

      // validación para que no se quede vacía
      if (limpio === "") {
        mostrarMensaje("No puedes dejar la tarea vacía.", "error");
        return;
      }

      gestor.editar(tarea.id, limpio);
      renderLista();
      mostrarMensaje("Tarea editada.", "exito");
    });

    // boton eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn-del");

    btnEliminar.addEventListener("click", () => {
      gestor.eliminar(tarea.id);
      renderLista();
      mostrarMensaje("Tarea eliminada.", "exito");
    });

    // armamos todo dentro del contenedor de acciones
    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    // metemos todo al lista item
    li.appendChild(check);
    li.appendChild(texto);
    li.appendChild(acciones);

    // agregamos el items a la lista
    lista.appendChild(li);
  });
}

// Evento Agregar tarea para convertir el texto del input en una nueva tarea
button.addEventListener("click", () => {
  const texto = input.value.trim();

  // validación para que no se agregue vacío
  if (texto === "") {
    mostrarMensaje("Escribe una tarea antes de agregar.", "error");
    return;
  }

  gestor.agregar(texto);
  input.value = "";
  renderLista();
  mostrarMensaje("Tarea agregada.", "exito");
});

// Enter para agregar también
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});

// render inicial para que se vean las tareas guardadas
renderLista();
