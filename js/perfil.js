import { auth, db } from "./config.js";

import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargandoPerfil =
    document.querySelector("#cargandoPerfil");

const contenidoPerfil =
    document.querySelector("#contenidoPerfil");

const nombreUsuario =
    document.querySelector("#nombreUsuario");

const correoUsuario =
    document.querySelector("#correoUsuario");

const rolUsuario =
    document.querySelector("#rolUsuario");

const botonesCerrarSesion =
    document.querySelectorAll(
        "#btnCerrarSesion, #btnCerrarSesionPrincipal"
    );

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        nombreUsuario.textContent =
            usuario.displayName || "Usuario";

        correoUsuario.textContent =
            usuario.email || "Correo no disponible";

        try {
            const referenciaUsuario =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            const documentoUsuario =
                await getDoc(referenciaUsuario);

            if (documentoUsuario.exists()) {
                const datosUsuario =
                    documentoUsuario.data();

                nombreUsuario.textContent =
                    datosUsuario.nombre ||
                    usuario.displayName ||
                    "Usuario";

                correoUsuario.textContent =
                    datosUsuario.correo ||
                    usuario.email ||
                    "Correo no disponible";

                rolUsuario.textContent =
                    datosUsuario.rol ||
                    "cliente";
            } else {
                rolUsuario.textContent =
                    "cliente";
            }
        } catch (error) {
            console.error(
                "Error al cargar el perfil:",
                error
            );

            rolUsuario.textContent =
                "No disponible";
        }

        cargandoPerfil.classList.add(
            "d-none"
        );

        contenidoPerfil.classList.remove(
            "d-none"
        );
    }
);

async function cerrarSesion() {
    try {
        await signOut(auth);

        window.location.href =
            "../index.html";
    } catch (error) {
        console.error(
            "Error al cerrar sesión:",
            error
        );
    }
}

botonesCerrarSesion.forEach(
    (boton) => {
        boton.addEventListener(
            "click",
            cerrarSesion
        );
    }
);