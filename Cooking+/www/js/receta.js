import { Firebase } from './firebase.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

$(document).ready(function() {
    const firebaseInstance = new Firebase();
    const app = firebaseInstance.getApp();
    const db = getDatabase(app);

    // Creamos una referencia a la ubicación de las recetas en la base de datos
    const recetasRef = ref(db, 'recetas/');

    // Cerrar sesión con el usuario
    $("#cerrarSesion").on("click", function() {
        sessionStorage.removeItem('usuario');
        document.location.href = "./index.html";
    });

    // Toda la parte de información de usuarios
    let pulsado = true;
    $("#user").on("click", function() {
        if (pulsado) {
            $("#informacion").css("display", "flex");
            $("#user").attr("id", "userActive");
        } else {
            $("#informacion").css("display", "none");
            $("#userActive").attr("id", "user");
        }
        pulsado = !pulsado; // Cambia el estado en cada clic
    });

    const usuRef = ref(db, 'usuarios/' + sessionStorage.getItem('usuario'));

    // Utilizando onValue para obtener los datos
    onValue(usuRef, function(snapshot) {
        // Obtener el objeto completo de la referencia
        var datosUsuario = snapshot.val();

        // Verificar si hay datos (puede ser null si no hay datos en esa referencia)
        if (datosUsuario) {
            // Extraer propiedades específicas
            let usuario = datosUsuario.nombre;
            let email = datosUsuario.email;

            // Actualizar la interfaz de usuario después de obtener los datos
            $("#userData").html("Has iniciado sesión como: <br>" + usuario + "<br> Email: <br>" + email);
        } else {
            console.log('No hay datos en la referencia.');
        }
    });

    // Cuando pulsemos el logo de la página, volveremos al inicio
    $("#logo").on("click", function() {
        window.location.href = "./categorias.html";
    });
});
