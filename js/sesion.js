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

function ocultarNombreUsuario() {
    document
        .querySelector("#nombreUsuarioNavbar")
        ?.remove();
}

function mostrarNombreUsuario(nombreCompleto) {
    if (!botonSesion || !nombreCompleto) {
        return;
    }

    const primerNombre =
        nombreCompleto.trim().split(/\s+/)[0];

    let nombreUsuario =
        document.querySelector(
            "#nombreUsuarioNavbar"
        );

    if (!nombreUsuario) {
        nombreUsuario =
            document.createElement("span");

        nombreUsuario.id =
            "nombreUsuarioNavbar";

        nombreUsuario.className =
            "navbar-text text-white fw-semibold me-lg-3 mt-2 mt-lg-0";

        botonSesion.before(nombreUsuario);
    }

    nombreUsuario.textContent =
        `Hola, ${primerNombre}`;

    nombreUsuario.title =
        `Sesión iniciada como ${nombreCompleto}`;
}

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            ocultarNombreUsuario();

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

        let nombreParaMostrar =
            usuario.displayName ||
            usuario.email?.split("@")[0] ||
            "Usuario";

        try {
            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            const documento =
                await getDoc(referencia);

            if (documento.exists()) {
                const datosUsuario =
                    documento.data();

                nombreParaMostrar =
                    datosUsuario.nombre ||
                    nombreParaMostrar;

                if (
                    datosUsuario.rol === "admin"
                ) {
                    mostrarElemento(
                        enlaceAdministracion,
                        true
                    );
                }
            }
        } catch (error) {
            console.error(
                "Error al consultar el rol:",
                error
            );
        }

        mostrarNombreUsuario(
            nombreParaMostrar
        );

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
