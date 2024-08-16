import { Firebase } from './firebase.js';
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseInstance = new Firebase();
const app = firebaseInstance.getApp();
const storage = getStorage(app);
const db = getDatabase(app);

const usuRef = ref(db, "usuarios/" + sessionStorage.getItem("usuario"));
const recetasRef = ref(db, 'recetas/');

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

$("#cerrarSesion").on("click", function () {
  sessionStorage.removeItem('usuario');
  window.location.href = "../index.html";
});

onValue(recetasRef, (snapshot) => {
  const data = snapshot.val();
  let idCounter = 1;

  for (const seccionKey in data) {
    const seccion = data[seccionKey];
    const divSeccion = $("<div>").attr("id", "seccion_" + idCounter);
    idCounter++;

    if (seccion.Foto) {
      getDownloadURL(storageRef(storage, seccion.Foto)).then((url) => {
        divSeccion.css("background-image", "url(" + url + ")");
      }).catch((error) => {
        console.error("Error obteniendo la URL de la imagen: ", error);
      });
    }

    $("#logo").on("click", function () {
      window.location.href = "./categorias.html";
    });

    divSeccion.append("<h1>" + seccionKey + "</h1>");
    $("#receta").append(divSeccion);

    const divListaRecetas = $("<div>")
      .attr("id", "lista_recetas_seccion_" + idCounter)
      .addClass("lista-recetas");

    if ("#" + divSeccion.attr("id") === window.location.hash) {
      divListaRecetas.show();
      divSeccion.hide();
    } else {
      divListaRecetas.hide();
    }

    const listaRecetas = $("<ul>");

    for (const recetaKey in seccion) {
      if (recetaKey !== 'Foto') {
        const listItem = $("<li>");
        const enlace = $("<a>")
          .attr("href", `receta.html#${encodeURIComponent(recetaKey)}`)
          .addClass("iframe")
          .attr("data-fancybox-type", "iframe") 
          .text(recetaKey)
          .on("click", function (event) {
            event.preventDefault();
            const nombreReceta = recetaKey;
            const miSeccion = seccion[recetaKey];
            localStorage.setItem("receta", JSON.stringify(miSeccion));

            $.fancybox.open({
              src: `receta.html#${encodeURIComponent(nombreReceta)}`,
              type: 'iframe',
              opts: {
                width: "100%",
                height: "100%",
                iframe: {
                  css: {
                    width: '100%',
                    height: '100%'
                  }
                },
                titlePosition: "outside",                
              }
            });
          });

        listItem.append(enlace);
        listaRecetas.append(listItem);
      }
    }

    divListaRecetas.append(listaRecetas);
    $("#receta").append(divListaRecetas);

    divSeccion.on("click", function () {
      window.location.hash = "#" + divSeccion.attr("id");
      window.location.reload();
    });
  }
});


