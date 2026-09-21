import { auth, db } from "./config.js";

import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargandoPerfil =
    document.querySelector("#cargandoPerfil");

const contenidoPerfil =
    document.querySelector("#contenidoPerfil");

const nombreUsuario =
    document.querySelector("#nombreUsuario");

const nombreUsuarioNavbar =
    document.querySelector("#nombreUsuarioNavbar");

const correoUsuario =
    document.querySelector("#correoUsuario");

const rolUsuario =
    document.querySelector("#rolUsuario");

const listaPedidos =
    document.querySelector("#listaPedidos");

const cantidadPedidos =
    document.querySelector("#cantidadPedidos");

const botonesCerrarSesion =
    document.querySelectorAll(
        "#btnCerrarSesion, #btnCerrarSesionPrincipal"
    );

function formatearPrecio(valor) {
    return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = texto || "";
    return elemento.innerHTML;
}

function actualizarNombreNavbar(nombreCompleto) {
    const nombre =
        nombreCompleto || "Usuario";

    nombreUsuarioNavbar.textContent =
        `Hola, ${nombre.trim().split(/\s+/)[0]}`;

    nombreUsuarioNavbar.title =
        `Sesión iniciada como ${nombre}`;
}

async function cargarPedidos(usuarioId) {
    try {
        const consulta = query(
            collection(db, "pedidos"),
            where("usuarioId", "==", usuarioId)
        );
        const respuesta = await getDocs(consulta);
        const pedidos = respuesta.docs
            .map((documento) => ({ id: documento.id, ...documento.data() }))
            .sort((a, b) => {
                const fechaA = a.fecha?.toMillis?.() || 0;
                const fechaB = b.fecha?.toMillis?.() || 0;
                return fechaB - fechaA;
            });

        cantidadPedidos.textContent = `${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"
            }`;

        if (!pedidos.length) {
            listaPedidos.innerHTML = `
                <div class="alert alert-info">
                    Todavía no tienes compras registradas.
                </div>`;
            return;
        }

        listaPedidos.innerHTML = pedidos.map((pedido) => {
            const fecha = pedido.fecha?.toDate?.().toLocaleString("es-UY")
                || "Fecha pendiente";

            const numeroVisible = pedido.numeroPedido
                || `TS-${pedido.id.slice(0, 6).toUpperCase()}`;

            const productosPedido = Array.isArray(pedido.productos)
                ? pedido.productos
                : [];

            return `
                <article class="card shadow-sm mb-3">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between gap-3 flex-wrap mb-3">
                            <div>
                                <strong>Pedido ${escaparHTML(numeroVisible)}</strong>
                                <div class="small text-secondary">${fecha}</div>
                            </div>
                            <span class="badge text-bg-success text-capitalize">
                                ${escaparHTML(pedido.estado || "confirmado")}
                            </span>
                        </div>
                        <ul class="list-group list-group-flush mb-3">
                            ${productosPedido.map((producto) => `
                                <li class="list-group-item px-0 d-flex justify-content-between gap-3">
                                    <span>${producto.cantidad} × ${escaparHTML(producto.nombre)}</span>
                                    <strong>${formatearPrecio(producto.subtotal)}</strong>
                                </li>
                            `).join("")}
                        </ul>
                        <div class="text-end">
                            <span class="me-2">Total:</span>
                            <strong class="h5">${formatearPrecio(pedido.total)}</strong>
                        </div>
                    </div>
                </article>`;
        }).join("");
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        listaPedidos.innerHTML = `
            <div class="alert alert-danger">
                No fue posible consultar el historial de pedidos.
            </div>`;
    }
}

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        nombreUsuario.textContent =
            usuario.displayName || "Usuario";

        actualizarNombreNavbar(
            usuario.displayName ||
            usuario.email?.split("@")[0]
        );

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

                actualizarNombreNavbar(
                    datosUsuario.nombre ||
                    usuario.displayName ||
                    usuario.email?.split("@")[0]
                );

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

        await cargarPedidos(usuario.uid);
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
