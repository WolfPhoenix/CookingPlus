import { Firebase } from './firebase.js';
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Inicializar Firebase
const firebaseInstance = new Firebase();
const app = firebaseInstance.getApp();
const storage = getStorage(app);
const db = getDatabase(app);

// Referencias a la base de datos
const usuRef = ref(db, "usuarios/" + sessionStorage.getItem("usuario"));
const recetasRef = ref(db, 'recetas/');

// Detectar el idioma del navegador
const lang = navigator.language || navigator.userLanguage;
const isEnglish = lang.startsWith("en") || lang.startsWith("EN");

// Cargar el archivo JSON adecuado basado en el idioma
const recetasFile = isEnglish ? 'categorias-en.json' : 'categorias-es.json';
console.log(`Cargando archivo JSON de recetas: ${recetasFile}`);

// Cargar el archivo JSON de recetas
$.getJSON(`../json/${recetasFile}`)
    .done(function(data) {
        console.log("Datos JSON cargados:", data);

        // Comprobar que las propiedades existen en el JSON cargado
        if (!data || !data.secciones) {
            console.error("El JSON cargado no tiene la estructura esperada.");
            return;
        }

        // Cargar traducciones de títulos y recetas
        const traduccionesSecciones = data.secciones;
        const traduccionesRecetas = data; // Ajustar según la estructura actual del JSON
        const traduccionesTexto = {
            cerrarSesion: data.cerrarSesion || "Cerrar Sesión",
            iniciadoSesionComo: data.iniciadoSesionComo || "Has iniciado sesión como:",
            email: data.email || "Email:"
        };
        console.log("Traducciones de secciones:", traduccionesSecciones);
        console.log("Traducciones de recetas:", traduccionesRecetas);

        // Mostrar datos del usuario
        onValue(usuRef, (snapshot) => {
            const datosUsuario = snapshot.val();
            if (datosUsuario) {
                const usuario = datosUsuario.nombre;
                const email = datosUsuario.email;
                $("#datosUsuario").html(`${traduccionesTexto.iniciadoSesionComo} <br>${usuario}<br>${traduccionesTexto.email} <br>${email}`);
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

        $("#cerrarSesion").text(traduccionesTexto.cerrarSesion);

        $("#cerrarSesion").on("click", function () {
            sessionStorage.removeItem('usuario');
            window.location.href = "../index.html";
        });

        // Cargar y mostrar recetas
        onValue(recetasRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                console.error("No se encontraron datos en la referencia de recetas.");
                return;
            }

            let idCounter = 1;

            for (const seccionKey in data) {
                const seccion = data[seccionKey];
                const divSeccion = $("<div>")
                    .attr("id", "seccion_" + idCounter)
                    .addClass("seccion")
                    .css("cursor", "pointer");
                idCounter++;

                // Configurar la imagen de fondo si hay una
                if (seccion.Foto) {
                    const photoRef = storageRef(storage, seccion.Foto);
                    getDownloadURL(photoRef).then((url) => {
                        divSeccion.css("background-image", "url(" + url + ")");
                    }).catch((error) => {
                        console.error("Error obteniendo la URL de la imagen: ", error);
                    });
                }

                $("#logo").on("click", function () {
                    window.location.href = "./categorias.html";
                });

                // Aplicar traducción a los títulos de las secciones
                const tituloSeccion = $("<h1>")
                    .text(traduccionesSecciones[seccionKey] || seccionKey) // Traducir título de la sección
                    .addClass("titulo-seccion");
                divSeccion.append(tituloSeccion);

                const divListaRecetas = $("<div>")
                    .addClass("lista-recetas")
                    .hide();

                const listaRecetas = $("<ul>");

                for (const recetaKey in seccion) {
                    if (recetaKey !== 'Foto') {
                        const receta = seccion[recetaKey];
                        const listItem = $("<li>");
                        const enlace = $("<a>")
                            .attr("href", `receta.html#${encodeURIComponent(recetaKey)}`)
                            .addClass("iframe")
                            .attr("data-fancybox-type", "iframe")
                            .text(traduccionesRecetas[recetaKey] || recetaKey) // Traducir nombre de receta
                            .on("click", function (event) {
                                event.preventDefault();
                                const nombreReceta = recetaKey;
                                localStorage.setItem("recetaNombre", nombreReceta); // Guardar el nombre de la receta
                                localStorage.setItem("receta", JSON.stringify({
                                    ...receta,
                                    idioma: isEnglish ? 'en' : 'es' // Guardar el idioma actual
                                }));

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
                divSeccion.append(divListaRecetas);
                $("#receta").append(divSeccion);

                // Evento de clic para alternar entre mostrar el título y la lista de recetas
                divSeccion.on("click", function () {
                    $(".lista-recetas").hide();
                    $(".titulo-seccion").show();

                    tituloSeccion.hide();
                    divListaRecetas.show();
                });
            }
        });
    })
    .fail(function() {
        console.error("Error al cargar el archivo JSON de recetas.");
    });