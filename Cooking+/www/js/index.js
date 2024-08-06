import { Firebase } from './firebase.js';
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, updateProfile, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  const firebaseInstance = new Firebase();
  const app = firebaseInstance.getApp();
  const db = getDatabase(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  // Función para poner un fondo de pantalla
  function fondo_pantalla(storage) {
    getDownloadURL(storageRef(storage, "fondo_web.jpg")).then((url) => {
      $("#body").css("background-image", "url(" + url + ")");
    }).catch((error) => {
      console.error("Error obteniendo la URL de la imagen: ", error);
    });
  }

  fondo_pantalla(storage);

  // Ocultar y mostrar formularios
  $("#form_registro").hide();

  $("#registro").on("click", function () {
    $("#form_inicio").fadeOut(() => $("#form_registro").fadeIn());
  });

  $("#volverInicio").on("click", function () {
    $("#form_registro").fadeOut(() => $("#form_inicio").fadeIn());
  });

  // Validaciones en tiempo real
  $("#usuario").on("input", function () {
    let usuario = $(this).val();
    $("#errorUsuario").html(usuario ? "" : "El nombre de usuario es obligatorio.");
  });

  $("#nuevoCorreo").on("input", function () {
    let email = $(this).val();
    $("#errorCorreo").html(email ? (validarEmail(email) ? "" : "Por favor introduzca un formato de email válido.") : "El correo electrónico es obligatorio.");
  });

  $("#nuevoPassword").on("input", function () {
    let password = $(this).val();
    let error = "";
    if (!password) {
      error = "La contraseña es obligatoria.";
    } else if (password.length < 6 || password.length > 12) {
      error = "La contraseña tiene que tener entre 6 y 12 caracteres.";
    } else if (!/[A-Z]/.test(password)) {
      error = "La contraseña debe contener al menos una letra mayúscula.";
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      error = "La contraseña debe contener al menos un carácter especial.";
    }
    $("#errorPassword").html(error);
  });

  $("#comprobar").on("input", function () {
    let password = $("#nuevoPassword").val();
    let comprobar = $(this).val();
    $("#errorComprobar").html(comprobar ? (password !== comprobar ? "Las contraseñas no coinciden." : "") : "Confirmar contraseña es obligatorio.");
  });

  // Registro de usuario
  $("#registrar").on("click", function () {
    let email = $("#nuevoCorreo").val();
    let password = $("#nuevoPassword").val();
    let comprobar = $("#comprobar").val();
    let usuario = $("#usuario").val();

    $(".error-message").html("");

    let hasError = false;
    if (!usuario) {
      $("#errorUsuario").html("El nombre de usuario es obligatorio.");
      hasError = true;
    }
    if (!email || !validarEmail(email)) {
      $("#errorCorreo").html(email ? "Por favor introduzca un formato de email válido." : "El correo electrónico es obligatorio.");
      hasError = true;
    }
    if (!password || password.length < 6 || password.length > 12 || !/[A-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      $("#errorPassword").html("La contraseña no cumple con los requisitos.");
      hasError = true;
    }
    if (!comprobar || password !== comprobar) {
      $("#errorComprobar").html("Las contraseñas no coinciden.");
      hasError = true;
    }

    if (hasError) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        updateProfile(result.user, { displayName: usuario })
          .then(() => {
            console.log("Nombre de usuario agregado con éxito.");
            const user = email.replace(/[.@]/g, '');
            set(ref(db, 'usuarios/' + user), { nombre: usuario, email: result.user.email })
              .then(() => {
                $("#nuevoCorreo, #nuevoPassword, #comprobar, #usuario").val("");
                volverInicio();
              })
              .catch((error) => {
                console.error("Error al guardar datos en la base de datos:", error);
                $("#errorUsuario").html("Error al guardar datos del usuario.");
              });
          })
          .catch((error) => {
            console.error("Error al actualizar el perfil:", error);
            $("#errorUsuario").html("Error al actualizar el perfil.");
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        $("#errorCorreo").html(errorCode === "auth/email-already-in-use" ? "El correo ya está registrado." : "Error al registrar usuario.");
        console.error("Error al registrar nuevo usuario:", errorCode, error.message);
      });
  });

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Inicio de sesión con correo y contraseña
  function iniciarSesion(nombreUsuario) {
    sessionStorage.setItem('usuario', nombreUsuario);
  }

  $("#iniciarSesion").on("click", function () {
    let email = $("#email").val();
    let password = $("#contraseña").val();

    $("#mensaje").html("");

    if (!email || !password) {
      $("#mensaje").html("El correo electrónico y la contraseña son obligatorios.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        iniciarSesion(email.replace(/[.@]/g, ''));
        $("#email, #contraseña").val("");
        window.location.href = "./html/categorias.html";
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        $("#mensaje").html("Los datos no son correctos.");
      });
  });

  function volverInicio() {
    $("#form_registro").fadeOut(() => $("#form_inicio").fadeIn());
  }

  // Inicio de sesión con Google
  $("#google").on("click", function () {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        console.log("token", token);

        const user_info = result.user;
        const user = user_info.email.replace(/[.@]/g, '');
        const name = user_info.displayName;

        iniciarSesion(user);

        set(ref(db, 'usuarios/' + user), { nombre: name, email: user_info.email })
          .then(() => {
            window.location.href = "./html/categorias.html";
          })
          .catch((error) => {
            console.error("Error al guardar datos en la base de datos:", error);
          });
      })
      .catch((error) => {
        console.error('Error durante la autenticación o redirección:', error);
      });
  });
}



