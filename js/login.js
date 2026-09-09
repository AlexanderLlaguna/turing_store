import { auth, db } from "./config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const formIngreso =
    document.querySelector("#formIngreso");

const formRegistro =
    document.querySelector("#formRegistro");

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
            "El acceso con correo y contraseña no está habilitado.",
    };

    return (
        mensajes[codigo] ||
        "No fue posible completar la operación."
    );
}

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
            boton.textContent = "Creando cuenta...";

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
                    fechaRegistro: serverTimestamp(),
                }
            );

            window.location.href = "perfil.html";
        } catch (error) {
            console.error(
                "Error al registrar:",
                error.code,
                error.message,
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(error.code)
            );

            boton.disabled = false;
            boton.textContent = "Registrarme";
        }
    }
);

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
            boton.textContent = "Ingresando...";

            await signInWithEmailAndPassword(
                auth,
                correo,
                clave
            );

            window.location.href = "perfil.html";
        } catch (error) {
            console.error(
                "Error al iniciar sesión:",
                error.code,
                error.message,
                error
            );

            window.mostrarMensaje(
                obtenerMensajeError(error.code)
            );

            boton.disabled = false;
            boton.textContent = "Ingresar";
        }
    }
);