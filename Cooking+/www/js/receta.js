//Importamos la función initializeApp desde el módulo de firebase-app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

// Importamos las funciones getDatabase, ref y onValue desde el módulo de firebase-database.js
import { getDatabase, ref as databaseRef, onValue } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCikypcBz_YaTgm1JMhSokuIdMe3FrAXno",
    authDomain: "cookpad-cfdac.firebaseapp.com",
    databaseURL: "https://cookpad-cfdac-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cookpad-cfdac",
    storageBucket: "cookpad-cfdac.appspot.com",
    messagingSenderId: "354452058669",
    appId: "1:354452058669:web:1c3c4a638c4ad82fbefea4",
    measurementId: "G-EGX5HH6ZB1"
};

// Inicializamos la aplicación de Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Obtenemos una instancia de la base de datos de Firebase
const db = getDatabase(app);

// Creamos una referencia a la ubicación de las recetas en la base de datos
const recetasRef = databaseRef(db, 'recetas/');

//cerrar sesión con el usuario
document.getElementById("cerrarSesion").addEventListener("click", function () {
    sessionStorage.removeItem('usuario');
    document.location.href = "./index.html";
});

//toda la parte de infromacion de usarios
let pulsado = true;
document.getElementById("user").addEventListener("click", function () {
    if (pulsado) {
        document.getElementById("informacion").style.display = "flex";
        document.getElementById("user").id = "userActive";
    } else {
        document.getElementById("informacion").style.display = "none";
        document.getElementById("userActive").id = "user";
    }
    pulsado = !pulsado; // Cambia el estado en cada clic
});
const usuRef = databaseRef(db, 'usuarios/' + sessionStorage.getItem('usuario'));

// Utilizando onValue para obtener los datos
onValue(usuRef, function (snapshot) {
    // Obtener el objeto completo de la referencia
    var datosUsuario = snapshot.val();

    // Verificar si hay datos (puede ser null si no hay datos en esa referencia)
    if (datosUsuario) {

        // Extraer propiedades específicas
        let usuario = datosUsuario.nombre;
        let email = datosUsuario.email;

        // Actualizar la interfaz de usuario después de obtener los datos
        document.getElementById("userData").innerHTML = "Has iniciado sesion como: <br>" + usuario + "<br> Email: <br>" + email;
    } else {
        console.log('No hay datos en la referencia.');
    }
});

 //cuando pulsemos el logo de la página, volveremos al inicio
 document.getElementById("logo").addEventListener("click",function(){
    window.location.href="./categorias.html"
});