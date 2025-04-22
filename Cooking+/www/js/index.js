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
  function validarInputs(traduccion) {
    $("#usuario").on("input", function () {
      let usuario = $(this).val();
      $("#errorUsuario").html(usuario ? "" : traduccion.errorUsuario);
    });

    $("#nuevoCorreo").on("input", function () {
      let email = $(this).val();
      let mensaje = "";
      if (!email) {
        mensaje = traduccion.errorCorreo.required;
      } else if (!validarEmail(email)) {
        mensaje = traduccion.errorCorreo.invalid;
      }
      $("#errorCorreo").html(mensaje);
    });

    $("#nuevoPassword").on("input", function () {
      let password = $(this).val();
      let mensaje = "";
      if (!password) {
        mensaje = traduccion.errorPassword.required;
      } else if (password.length < 6 || password.length > 12) {
        mensaje = traduccion.errorPassword.length;
      } else if (!/[A-Z]/.test(password)) {
        mensaje = traduccion.errorPassword.uppercase;
      } else if (!/[^a-zA-Z0-9]/.test(password)) {
        mensaje = traduccion.errorPassword.special;
      }
      $("#errorPassword").html(mensaje);
    });

    $("#comprobar").on("input", function () {
      let password = $("#nuevoPassword").val();
      let comprobar = $(this).val();
      let mensaje = "";
      if (!comprobar) {
        mensaje = traduccion.errorComprobar.required;
      } else if (password !== comprobar) {
        mensaje = traduccion.errorComprobar.match;
      }
      $("#errorComprobar").html(mensaje);
    });
  }

  $("#comprobar").on("input", function () {
    let password = $("#nuevoPassword").val();
    let comprobar = $(this).val();
    $("#errorComprobar").html(comprobar ? (password !== comprobar ? "Las contraseñas no coinciden." : "") : "Campo obligatorio.");
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
      $("#errorUsuario").html("Campo obligatorio.");
      hasError = true;
    }
    if (!email || !validarEmail(email)) {
      $("#errorCorreo").html(email ? "Introduzca un formato de email válido." : "Campo obligatorio.");
      hasError = true;
    }
    if (!password || password.length < 6 || password.length > 12 || !/[A-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      $("#errorPassword").html("No cumple con los requisitos.");
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
            const uid = result.user.uid;
            set(ref(db, 'usuarios/' + uid), { nombre: usuario, email: result.user.email })
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
        iniciarSesion(result.user.uid); // UID, no email modificado
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
        const uid = user_info.uid;
        const name = user_info.displayName;

        iniciarSesion(uid);

        set(ref(db, 'usuarios/' + uid), { nombre: name, email: user_info.email })
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

  function cargarTraduccion(lang) {
    return fetch(`../json/${lang}.json`)
      .then(response => response.json())
      .catch(() => fetch(`../json/en.json`).then(response => response.json()));
  }

  function traduccion(traduccion) {
    $('#iniciarSesion').text(traduccion.login);
    $('#registro').text(traduccion.register);
    $('#email').attr('placeholder', traduccion.email);
    $('#contraseña').attr('placeholder', traduccion.password);

    const textoGoogle = traduccion.google;
    $('#google').html(`<img src="./img/google-icon.png" height="25" width="25" alt="Icono de Google"> ${textoGoogle}`);

    if (!email || !contraseña) {
      $('#mensaje').text(traduccion.mensaje);
    }

    $('#volverInicio').text(traduccion.volver);
    $('#usuario').attr('placeholder', traduccion.nombreUsuario);
    $('#nuevoCorreo').attr('placeholder', traduccion.nuevoCorreo);
    $('#nuevoPassword').attr('placeholder', traduccion.nuevoPassword);
    $('#comprobar').attr('placeholder', traduccion.confirmarPassword);
    $('#registrar').text(traduccion.registrarse);

    validarInputs(traduccion);
  }


  const idiomaNavegador = navigator.language.split('-')[0];
  cargarTraduccion(idiomaNavegador).then(traduccion);

}



