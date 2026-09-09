import { auth, db } from "./config.js";

import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const botonSesion =
    document.querySelector("#btnLoginPlaceholder");

const enlacePerfil =
    document.querySelector(
        'a[data-page="perfil"]'
    );

const enlaceAdministracion =
    document.querySelector(
        'a[data-page="admin"]'
    );

const estaEnPages =
    window.location.pathname.includes("/pages/");

const rutaLogin =
    estaEnPages
        ? "login.html"
        : "pages/login.html";

const rutaInicio =
    estaEnPages
        ? "../index.html"
        : "index.html";

function mostrarElemento(enlace, mostrar) {
    const elemento =
        enlace?.closest(".nav-item");

    if (elemento) {
        elemento.classList.toggle(
            "d-none",
            !mostrar
        );
    }
}

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            mostrarElemento(enlacePerfil, false);
            mostrarElemento(
                enlaceAdministracion,
                false
            );

            if (botonSesion) {
                botonSesion.textContent =
                    "Ingresar";

                botonSesion.onclick = () => {
                    window.location.href =
                        rutaLogin;
                };
            }

            return;
        }

        mostrarElemento(enlacePerfil, true);
        mostrarElemento(
            enlaceAdministracion,
            false
        );

        try {
            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            const documento =
                await getDoc(referencia);

            if (
                documento.exists() &&
                documento.data().rol === "admin"
            ) {
                mostrarElemento(
                    enlaceAdministracion,
                    true
                );
            }
        } catch (error) {
            console.error(
                "Error al consultar el rol:",
                error
            );
        }

        if (botonSesion) {
            botonSesion.textContent =
                "Cerrar sesión";

            botonSesion.onclick =
                async () => {
                    await signOut(auth);

                    window.location.href =
                        rutaInicio;
                };
        }
    }
);