import { Firebase } from './firebase.js';

import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js"

import {
  getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword,
  updateProfile, createUserWithEmailAndPassword, OAuthProvider, signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';

import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";



document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

  const firebaseInstance = new Firebase();
  const app = firebaseInstance.getApp();
  const db = getDatabase(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  fondo_pantalla(storage);

  // Función para poner un fondo de pantalla
  function fondo_pantalla(storage) {
    getDownloadURL(storageRef(storage, "fondo_web.jpg")).then((url) => {
      // Agregar la imagen al fondo div de la sección usando jQuery
      $("#body").css("background-image", "url(" + url + ")");
    }).catch((error) => {
      console.error("Error obteniendo la URL de la imagen: ", error);
    });
  }

  // Ocultamos el formulario de registro al cargar la página
  document.getElementById("form_registro").style.display = "none";

  // Evento de escucha para mostrar el formulario de registro al hacer clic en el boton correspondiente
  $("#registro").on("click", function () {
    $("#form_inicio").fadeOut(function () {
      $("#form_registro").fadeIn();
    });
  });

  // Evento de escucha para mostrar el formulario de inicio al hacer clic en el boton correspondiente
  $("#volverInicio").on("click", function () {
    $("#form_registro").fadeOut(function () {
      $("#form_inicio").fadeIn();
    });
  });
  //======================================================================================================================
  // Eventos para la validación en tiempo real
  $("#usuario").on("input", function () {
    let usuario = $(this).val();
    if (!usuario) {
      $("#errorUsuario").html("El nombre de usuario es obligatorio.");
    } else {
      $("#errorUsuario").html("");
    }
  });

  $("#nuevoCorreo").on("input", function () {
    let email = $(this).val();
    if (!email) {
      $("#errorCorreo").html("El correo electrónico es obligatorio.");
    } else if (!validateEmail(email)) {
      $("#errorCorreo").html("Por favor introduzca un formato de email válido.");
    } else {
      $("#errorCorreo").html("");
    }
  });

  $("#nuevoPassword").on("input", function () {
    let password = $(this).val();
    if (!password) {
      $("#errorPassword").html("La contraseña es obligatoria.");
    } else if (password.length < 6 || password.length > 12) {
      $("#errorPassword").html("La contraseña tiene que tener entre 6 y 12 caracteres.");
    } else if (!/[A-Z]/.test(password)) {
      $("#errorPassword").html("La contraseña debe contener al menos una letra mayúscula.");
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      $("#errorPassword").html("La contraseña debe contener al menos un carácter especial.");
    } else {
      $("#errorPassword").html("");
    }
  });

  $("#comprobar").on("input", function () {
    let password = $("#nuevoPassword").val();
    let comprobar = $(this).val();
    if (!comprobar) {
      $("#errorComprobar").html("Confirmar contraseña es obligatorio.");
    } else if (password !== comprobar) {
      $("#errorComprobar").html("Las contraseñas no coinciden.");
    } else {
      $("#errorComprobar").html("");
    }
  });
  //=============================================REGISTRO DE USUARIO=========================================================================
  $("#registrar").on("click", function () {
    // Obtenemos los valores de los campos de entrada
    let email = $("#nuevoCorreo").val();
    let password = $("#nuevoPassword").val();
    let comprobar = $("#comprobar").val();
    let usuario = $("#usuario").val();

    // Limpiar mensajes de error anteriores
    $(".error-message").html("");

    let hasError = false;

    // Validaciones de los campos
    if (!usuario) {
      $("#errorUsuario").html("El nombre de usuario es obligatorio.");
      hasError = true;
    }

    if (!email) {
      $("#errorCorreo").html("El correo electrónico es obligatorio.");
      hasError = true;
    } else if (!validateEmail(email)) {
      $("#errorCorreo").html("Por favor introduzca un formato de email válido.");
      hasError = true;
    }

    if (!password) {
      $("#errorPassword").html("La contraseña es obligatoria.");
      hasError = true;
    } else if (password.length < 6 || password.length > 12) {
      $("#errorPassword").html("La contraseña tiene que tener entre 6 y 12 caracteres.");
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      $("#errorPassword").html("La contraseña debe contener al menos una letra mayúscula.");
      hasError = true;
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      $("#errorPassword").html("La contraseña debe contener al menos un carácter especial.");
      hasError = true;
    }

    if (!comprobar) {
      $("#errorComprobar").html("Confirmar contraseña es obligatorio.");
      hasError = true;
    } else if (password !== comprobar) {
      $("#errorComprobar").html("Las contraseñas no coinciden.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Creamos un nuevo usuario en Firebase con email y contraseña
    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        // Actualizamos el perfil del usuario con el nombre de usuario
        updateProfile(result.user, {
          displayName: usuario
        }).then(() => {
          console.log("Nombre de usuario agregado con éxito.");
          let user_info = result.user;
          console.log(user_info);

          // Obtenemos el nombre de usuario y correo electrónico del usuario
          let user = user_info.email.replace(/[.@]/g, '');
          let name = user_info.displayName;
          let root_ref = ref(db, 'usuarios/' + user);

          // Guardamos la información del usuario en la base de datos
          set(root_ref, {
            nombre: name,
            email: user_info.email
          });

          // Limpiar el formulario de registro
          $("#nuevoCorreo").val("");
          $("#nuevoPassword").val("");
          $("#comprobar").val("");
          $("#usuario").val("");

          // Redirigimos a la página de inicio
          volverInicio();
        }).catch((error) => {
          console.error("Error al actualizar el perfil:", error);
          $("#errorUsuario").html("Error al actualizar el perfil.");
        });
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
          console.error("El correo electrónico ya está registrado.");
          $("#errorCorreo").html("El correo ya está registrado.");
        } else {
          console.error("Error al registrar nuevo usuario:", errorCode, errorMessage);
          $("#errorCorreo").html("Error al registrar usuario.");
        }
      });
  });

  // Función para validar el formato del correo electrónico
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  //==============================================INICIO DE SESION CON CORREO Y CONTRASEÑA==============================================================
  // Función para iniciar sesión y almacenar el usuario en la sesión
  function iniciarSesion(nombreUsuario) {
    sessionStorage.setItem('usuario', nombreUsuario);
  }

  $("#iniciarSesion").on("click", function () {
    let email = $("#email").val();
    let password = $("#contraseña").val();

    // Limpiar mensaje de error anterior
    $("#mensaje").html("");

    // Validar campos vacíos
    if (!email || !password) {
      $("#mensaje").html("El correo electrónico y la contraseña son obligatorios.");
      return;
    }

    // Iniciar sesión con correo electrónico y contraseña
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        let user_info = result.user;
        // Creamos el identificador del usuario quitando caracteres especiales
        let user = user_info.email.replace(/[.@]/g, '');

        iniciarSesion(user);

        $("#email").val("");
        $("#contraseña").val("");

        window.location.href = "./html/categorias.html";

      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        $("#mensaje").html("Los datos no son correctos.");
      });
  });

  // Función para volver al formulario de inicio de sesión desde el formulario de registro
  function volverInicio() {

    $("#form_registro").fadeOut(function () {
      $("#form_inicio").fadeIn();
    });

  }
  //=================================================INICIO DE SESION MICROSOFT==============================================================================================
  // Agregamos un evento de clic al botón con ID 'microsoft'
  $("#microsoft").on('click', function () {
    // Creamos un proveedor de autenticación OAuth para Microsoft
    const provider = new OAuthProvider('microsoft.com');
    // Configuramos parámetros personalizados para el proveedor
    provider.setCustomParameters({
      prompt: 'consent'
    });

    // Iniciamos sesión con un popup utilizando el proveedor de autenticación de Microsoft
    signInWithPopup(auth, provider)
      .then((result) => {
        // Si la sesión se inicia correctamente, mostramos un mensaje de éxito en la consola
        console.log("Nombre de usuario agregado con éxito.");
        // Obtenemos la información del usuario autenticado
        const user_info = result.user;

        // Obtenemos el nombre de usuario y correo electrónico del usuario autenticado
        const user = user_info.email.replace(/[.@]/g, '');
        const name = user_info.displayName;
        const root_ref = ref(db, 'usuarios/' + user);

        // Llamamos a la función iniciarSesion con el nombre de usuario
        iniciarSesion(user);

        // Guardamos la información del usuario en la base de datos
        return set(root_ref, {
          nombre: name,
          email: user_info.email
        });
      })
      .then(() => {
        // Si la información del usuario se guarda correctamente en la base de datos, redirigimos al usuario a la página de categorías
        console.log("Datos del usuario guardados en la base de datos.");
        window.location.href = "./categorias.html";
      });
  });

}



