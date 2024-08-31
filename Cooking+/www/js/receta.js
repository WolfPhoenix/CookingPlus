import { Firebase } from './firebase.js';
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

$(function () {
    $(function () {
        const firebaseInstance = new Firebase();
        const app = firebaseInstance.getApp();
        const db = getDatabase(app);
        const storage = getStorage(app);    

        var miReceta = JSON.parse(localStorage.getItem("receta"));
        var recetaNombre = localStorage.getItem("recetaNombre");

        console.log("Receta en localStorage:", miReceta);
        console.log("Nombre de la receta:", recetaNombre);

        if (!miReceta || !recetaNombre) {
            console.error("No se encontró la receta o el nombre en localStorage.");
            return;
        }

        const idiomaNavegador = navigator.language || navigator.userLanguage;
        const idiomaReceta = idiomaNavegador.startsWith('en') ? 'en' : 'es';
        const recetasFile = idiomaReceta === 'en' ? 'recetas-en.json' : 'recetas-es.json';

        $.getJSON(`../json/${recetasFile}`)
            .done(function (data) {
                const traduccionesRecetas = data.recetas;
                const descripcionTraduccion = data.descripcion;
                const ingredientesTraduccion = data.ingredientes;
                const elaboracionTraduccion = data.elaboracion;
                const pasosTraduccion = data.pasos;

                const categorias = Object.keys(traduccionesRecetas);
                console.log("Categorías en el JSON:", categorias);

                const categoria = categorias.find(cat => traduccionesRecetas[cat][recetaNombre]);
                if (!categoria) {
                    console.error(`Categoría para receta ${recetaNombre} no encontrada.`);
                    return;
                }

                console.log("Categoría encontrada:", categoria);
                const receta = traduccionesRecetas[categoria][recetaNombre];
                if (!receta) {
                    console.error(`Receta ${recetaNombre} no encontrada en la categoría ${categoria}.`);
                    return;
                }

                $("h1.descripcion").text(descripcionTraduccion);
                $("h1.elaboracion").text(elaboracionTraduccion);
                $("h1.ingredientes").text(ingredientesTraduccion);

                const URLfoto = miReceta.Foto;
                const contenedorFoto = $(".foto");
                const imageRef = storageRef(storage, URLfoto);

                getDownloadURL(imageRef).then(function (url) {
                    const img = $("<img>").attr("src", url).addClass("imagen-receta");
                    contenedorFoto.append(img);
                }).catch(function (error) {
                    console.error("Error obteniendo la URL de la imagen: ", error);
                });

                const descripcionOriginal = receta.Descripción;
                const parrafoDescripcion = $("<p>").text(descripcionOriginal);
                $("#contenedorDescripcion").append(parrafoDescripcion);

                const pasosElaboracion = receta.Elaboración;
                const contenedorElaboracion = $("#contenedorElaboracion");

                $.each(pasosElaboracion, function (index, paso) {
                    const pasoTraducido = paso;
                    const pasoElaboracion = $("<div>").html(`<p><strong>${pasosTraduccion} ${index + 1}:</strong> ${pasoTraducido}</p>`);
                    contenedorElaboracion.append(pasoElaboracion);
                });

                const ingredientes = receta.Ingredientes;
                const contenedorIngredientes = $("#contenedorIngredientes");
                const tablaIngredientes = $("<table>").addClass("tabla-ingredientes");

                $.each(ingredientes, function (ingrediente, cantidad) {
                    const ingredienteTraducido = ingrediente;
                    const fila = $("<tr>");
                    const celdaNombre = $("<td>").text(ingredienteTraducido);
                    const celdaCantidad = $("<td>").text(cantidad);
                    fila.append(celdaNombre).append(celdaCantidad);
                    tablaIngredientes.append(fila);
                });

                contenedorIngredientes.append(tablaIngredientes);
            })
            .fail(function () {
                console.error("Error al cargar el archivo JSON de recetas.");
            });

    });
});


