import { auth, db } from "./config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const formIngreso =
    document.querySelector("#formIngreso");

const botonRecuperarClave =
    document.querySelector("#btnRecuperarClave");

const formRegistro =
    document.querySelector("#formRegistro");

const botonGoogle =
    document.querySelector("#btnGoogle");

function obtenerMensajeError(codigo) {
    const mensajes = {
        "auth/email-already-in-use":
            "Este correo ya está registrado.",

        "auth/invalid-email":
            "El correo electrónico no es válido.",

        "auth/weak-password":
            "La contraseña debe tener al menos 6 caracteres.",

        "auth/invalid-credential":
            "El correo o la contraseña son incorrectos.",

        "auth/missing-password":
            "Debes escribir una contraseña.",

        "auth/unauthorized-domain":
            "Este dominio no está autorizado en Firebase.",

        "auth/network-request-failed":
            "No fue posible conectarse con Firebase.",

        "auth/operation-not-allowed":
            "Este método de acceso no está habilitado.",

        "auth/popup-closed-by-user":
            "Cerraste la ventana de Google antes de completar el acceso.",

        "auth/popup-blocked":
            "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes.",

        "auth/cancelled-popup-request":
            "La solicitud de acceso con Google fue cancelada.",

        "auth/account-exists-with-different-credential":
            "Ya existe una cuenta con este correo utilizando otro método de acceso.",
    };

    return (
        mensajes[codigo] ||
        "No fue posible completar la operación."
    );
}

// Registrar usuario con correo y contraseña
formRegistro?.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const nombre =
            document
                .querySelector("#nombreRegistro")
                .value
                .trim();

        const correo =
            document
                .querySelector("#correoRegistro")
                .value
                .trim();

        const clave =
            document
                .querySelector("#claveRegistro")
                .value;

        const boton =
            formRegistro.querySelector(
                'button[type="submit"]'
            );

        try {
            boton.disabled = true;
            boton.textContent =
                "Creando cuenta...";

            const credenciales =
                await createUserWithEmailAndPassword(
                    auth,
                    correo,
                    clave
                );

            await updateProfile(
                credenciales.user,
                {
                    displayName: nombre,
                }
            );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    credenciales.user.uid
                ),
                {
                    nombre: nombre,
                    correo: correo,
                    rol: "cliente",
                    fechaRegistro:
                        serverTimestamp(),
                }
            );

            window.location.href =
                "perfil.html";
        } catch (error) {
            console.error(
                "Error al registrar:",
                error.code,
                error.message,
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(
                    error.code
                )
            );

            boton.disabled = false;
            boton.textContent =
                "Registrarme";
        }
    }
);

// Iniciar sesión con correo y contraseña
formIngreso?.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const correo =
            document
                .querySelector("#correoIngreso")
                .value
                .trim();

        const clave =
            document
                .querySelector("#claveIngreso")
                .value;

        const boton =
            formIngreso.querySelector(
                'button[type="submit"]'
            );

        try {
            boton.disabled = true;
            boton.textContent =
                "Ingresando...";

            await signInWithEmailAndPassword(
                auth,
                correo,
                clave
            );

            window.location.href =
                "perfil.html";
        } catch (error) {
            console.error(
                "Error al iniciar sesión:",
                error.code,
                error.message,
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(
                    error.code
                )
            );

            boton.disabled = false;
            boton.textContent =
                "Ingresar";
        }
    }
);

// Iniciar sesión con Google
const proveedorGoogle =
    new GoogleAuthProvider();

proveedorGoogle.setCustomParameters({
    prompt: "select_account",
});

botonGoogle?.addEventListener(
    "click",
    async () => {
        const contenidoOriginal =
            botonGoogle.innerHTML;

        try {
            botonGoogle.disabled = true;
            botonGoogle.textContent =
                "Conectando con Google...";

            const credenciales =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );

            const usuario =
                credenciales.user;

            const referenciaUsuario =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            const documentoUsuario =
                await getDoc(
                    referenciaUsuario
                );

            if (!documentoUsuario.exists()) {
                await setDoc(
                    referenciaUsuario,
                    {
                        nombre:
                            usuario.displayName ||
                            "Usuario",

                        correo:
                            usuario.email,

                        fotoGoogle:
                            usuario.photoURL ||
                            "",

                        rol:
                            "cliente",

                        fechaRegistro:
                            serverTimestamp(),

                        ultimoAcceso:
                            serverTimestamp(),
                    }
                );
            } else {
                await setDoc(
                    referenciaUsuario,
                    {
                        correo:
                            usuario.email,

                        fotoGoogle:
                            usuario.photoURL ||
                            "",

                        ultimoAcceso:
                            serverTimestamp(),
                    },
                    {
                        merge: true,
                    }
                );
            }

            window.location.href =
                "perfil.html";
        } catch (error) {
            console.error(
                "Error al ingresar con Google:",
                error.code,
                error.message,
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(
                    error.code
                )
            );

            botonGoogle.disabled = false;
            botonGoogle.innerHTML =
                contenidoOriginal;
        }
    }
);

// Recuperar la contraseña
botonRecuperarClave?.addEventListener(
    "click",
    async () => {
        const correo =
            document
                .querySelector("#correoIngreso")
                .value
                .trim();

        if (!correo) {
            window.mostrarMensaje(
                "Escribí tu correo electrónico para recuperar la contraseña."
            );

            return;
        }

        try {
            await sendPasswordResetEmail(
                auth,
                correo
            );

            window.mostrarMensaje(
                "Te enviamos un correo para restablecer tu contraseña. Revisá también el spam."
            );
        } catch (error) {
            console.error(
                "Error al recuperar la contraseña:",
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(
                    error.code
                )
            );
        }
    }
);