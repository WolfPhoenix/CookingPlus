import { Firebase } from './firebase.js';
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseInstance = new Firebase();
const app = firebaseInstance.getApp();
const storage = getStorage(app);
const db = getDatabase(app);

// Obtener la referencia del usuario
const usuRef = ref(db, "usuarios/" + sessionStorage.getItem("usuario"));

// Creamos una referencia a la ubicación de las recetas en la base de datos
const recetasRef = ref(db, 'recetas/');

// Utilizando onValue para obtener los datos
onValue(usuRef, (snapshot) => {

  const datosUsuario = snapshot.val();

  if (datosUsuario) {
    const usuario = datosUsuario.nombre;
    const email = datosUsuario.email;
    $("#datosUsuario").html(`Has iniciado sesión como: <br>${usuario}<br>Email: <br>${email}`);
  } else {
    console.log('No hay datos en la referencia.');
  }
}, (error) => {
  console.error('Error al obtener datos del usuario:', error);
});

// Mostrar y ocultar información de usuario
let pulsado = true;
$("#user").on("click", function () {
  if (pulsado) {
    $("#informacion").slideDown(400);
    $(this).attr("id", "userActive");
  } else {
    $("#informacion").slideUp(400);
    $("#userActive").attr("id", "user");
  }
  pulsado = !pulsado;
});

// Cerrar sesión
$("#cerrarSesion").on("click", function () {
  sessionStorage.removeItem('usuario');
  window.location.href = "../index.html";
});

// Observamos los cambios en la referencia de las recetas en la base de datos
onValue(recetasRef, (snapshot) => {
  // Obtenemos los datos de las recetas
  const data = snapshot.val();
  let idCounter = 1;

  // Iteramos sobre cada sección de recetas
  for (const seccionKey in data) {
    const seccion = data[seccionKey];

    // Creamos un elemento <div> para la sección de recetas
    const divSeccion = document.createElement("div");

    // Asignamos un ID único al elemento <div> de la sección de recetas
    divSeccion.id = "seccion_" + idCounter;
    idCounter++;

    // Verificamos si la sección de recetas tiene una foto asociada
    if (seccion.Foto) {
      // Obtenemos la URL de descarga de la foto desde el servicio de almacenamiento
      getDownloadURL(storageRef(storage, seccion.Foto)).then((url) => {
        // Establecemos la imagen de fondo del elemento <div> de la sección de recetas
        divSeccion.style.backgroundImage = "url(" + url + ")";
      }).catch((error) => {
        console.error("Error obteniendo la URL de la imagen: ", error);
      });
    }

    //cuando pulsemos el logo de la página, volveremos al inicio
    document.getElementById("logo").addEventListener("click", function () {
      window.location.href = "./categorias.html"
    });

    // Agregamos el nombre de la sección como título dentro del elemento <div> de la sección de recetas
    divSeccion.innerHTML += "<h1>" + seccionKey + "</h1>";

    // Obtenemos el contenedor principal de las recetas en el HTML
    const contenedorPrincipal = document.getElementById("receta");

    // Agregamos el elemento <div> de la sección de recetas al contenedor principal
    contenedorPrincipal.appendChild(divSeccion);

    // Creamos un elemento <div> para la lista de recetas de la sección
    const divListaRecetas = document.createElement("div");

    // Asignamos un ID único al elemento <div> de la lista de recetas de la sección
    divListaRecetas.id = "lista_recetas_seccion_" + idCounter;

    // Añadimos la clase "lista-recetas" al elemento <div> de la lista de recetas
    divListaRecetas.classList.add("lista-recetas");

    // Verificamos si la sección de recetas está activa en la URL actual
    if ("#" + divSeccion.id === window.location.hash) {

      // Mosstramos la lista de recetas si la sección de recetas está activa
      divListaRecetas.style.display = "block";
      divSeccion.style.display = "none";

    } else {
      // Ocultamos la lista de recetas si la sección de recetas no está activa
      divListaRecetas.style.display = "none";
    }

    // Creamos una lista de recetas dentro del elemento <ul>
    const listaRecetas = document.createElement("ul");

    // Iteramos sobre cada receta en la sección de recetas
    for (const recetaKey in seccion) {

      if (recetaKey !== 'Foto') {

        // Creamos un elemento <li> para cada receta
        const listItem = document.createElement("li");

        // Creamos un enlace <a> para cada receta
        const enlace = document.createElement("a");

        // Establecemos el href del enlace con el nombre de la receta como parte del hash
        enlace.href = `receta.html#${encodeURIComponent(recetaKey)}`;

        // Establecemos el texto del enlace con el nombre de la receta
        enlace.textContent = recetaKey;

        // Agregamos un evento de escucha para el clic en el enlace de la receta
        enlace.addEventListener("click", (event) => {
          event.preventDefault();

          // Obtenemos el nombre de la receta al hacer clic en el enlace
          const nombreReceta = recetaKey;

          // Obtenemos los detalles de la receta
          var miSeccion = seccion[recetaKey];

          // Almacenamos los datos de la receta en el almacenamiento local
          localStorage.setItem("receta", JSON.stringify(miSeccion));

          // Redirigimos a la página de la receta seleccionada
          window.location.href = `receta.html#${encodeURIComponent(nombreReceta)}`;
        });

        // Agregamos el enlace al elemento <li>
        listItem.appendChild(enlace);

        // Agregamos el elemento <li> a la lista de recetas
        listaRecetas.appendChild(listItem);
      }
    }

    // Agregamos la lista de recetas al elemento <div> de la lista de recetas de la sección
    divListaRecetas.appendChild(listaRecetas);

    // Agregamos el elemento <div> de la lista de recetas al contenedor principal
    contenedorPrincipal.appendChild(divListaRecetas);

    // Agregamos un event listener para el clic en la sección de recetas
    divSeccion.addEventListener("click", () => {

      // Establecemos el hash de la URL con el ID de la sección de recetas
      window.location.hash = "#" + divSeccion.id;

      // Recargamos la página para actualizar la visualización de las recetas
      window.location.reload();
    });
  }
});
