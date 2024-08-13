import { Firebase } from './firebase.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

$(function() {  // Esta es la forma abreviada de $(document).ready()
    const firebaseInstance = new Firebase();
    const app = firebaseInstance.getApp();
    const db = getDatabase(app);
    const storage = getStorage(app);

    const recetasRef = ref(db, 'recetas/');

    $("#cerrarSesion").on("click", function() {
        sessionStorage.removeItem('usuario');
        document.location.href = "./index.html";
    });

    let pulsado = true;
    $("#user").on("click", function() {
        if (pulsado) {
            $("#informacion").css("display", "flex");
            $(this).attr("id", "userActive");
        } else {
            $("#informacion").css("display", "none");
            $(this).attr("id", "user");
        }
        pulsado = !pulsado;
    });

    const usuRef = ref(db, 'usuarios/' + sessionStorage.getItem('usuario'));

    onValue(usuRef, function(snapshot) {
        var datosUsuario = snapshot.val();

        if (datosUsuario) {
            let usuario = datosUsuario.nombre;
            let email = datosUsuario.email;
            $("#userData").html("Has iniciado sesión como: <br>" + usuario + "<br> Email: <br>" + email);
        } else {
            console.log('No hay datos en la referencia.');
        }
    });

    $("#logo").on("click", function() {
        window.location.href = "./categorias.html";
    });

    var miReceta = JSON.parse(localStorage.getItem("receta"));
    const URLfoto = miReceta.Foto;
    const contenedorFoto = $(".foto");
    const imageRef = storageRef(storage, URLfoto);

    getDownloadURL(imageRef).then(function(url) {
        const img = $("<img>").attr("src", url).addClass("imagen-receta");
        contenedorFoto.append(img);
    }).catch(function(error) {
        console.error("Error obteniendo la URL de la imagen: ", error);
    });

    const parrafoDescripcion = $("<p>").text(miReceta.Descripción);
    $("#contenedorDescripcion").append(parrafoDescripcion);

    const pasosElaboracion = miReceta.Elaboración;
    const contenedorElaboracion = $("#contenedorElaboracion");

    $.each(pasosElaboracion, function(index, paso) {
        const pasoElaboracion = $("<div>").html(`<p><strong>Paso ${index + 1}:</strong> ${paso}</p>`);
        contenedorElaboracion.append(pasoElaboracion);
    });

    const ingredientes = miReceta.Ingredientes;
    const contenedorIngredientes = $("#contenedorIngredientes");
    const tablaIngredientes = $("<table>").addClass("tabla-ingredientes");

    $.each(ingredientes, function(ingrediente, cantidad) {
        const fila = $("<tr>");
        const celdaNombre = $("<td>").text(ingrediente);
        const celdaCantidad = $("<td>").text(cantidad);
        fila.append(celdaNombre).append(celdaCantidad);
        tablaIngredientes.append(fila);
    });

    contenedorIngredientes.append(tablaIngredientes);
});




