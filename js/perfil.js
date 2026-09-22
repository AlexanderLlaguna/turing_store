import { auth, db } from "./config.js";

import {
    onAuthStateChanged,
    signOut,
    updateProfile,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Indicador de carga.
const cargandoPerfil =
    document.querySelector("#cargandoPerfil");

// Contenido principal del perfil.
const contenidoPerfil =
    document.querySelector("#contenidoPerfil");

// Nombre mostrado en la tarjeta.
const nombreUsuario =
    document.querySelector("#nombreUsuario");

// Nombre mostrado en la barra de navegación.
const nombreUsuarioNavbar =
    document.querySelector("#nombreUsuarioNavbar");

// Correo electrónico mostrado en el perfil.
const correoUsuario =
    document.querySelector("#correoUsuario");

// Rol del usuario.
const rolUsuario =
    document.querySelector("#rolUsuario");

// Botón que muestra el formulario de edición.
const botonEditarPerfil =
    document.querySelector("#btnEditarPerfil");

// Formulario para modificar el nombre.
const formEditarPerfil =
    document.querySelector("#formEditarPerfil");

// Campo donde el usuario escribe su nuevo nombre.
const campoNombrePerfil =
    document.querySelector("#nombrePerfil");

// Botón para cancelar la edición.
const botonCancelarEdicion =
    document.querySelector("#btnCancelarEdicion");

// Botón para guardar los cambios.
const botonGuardarPerfil =
    document.querySelector("#btnGuardarPerfil");

// Contenedor donde se mostrarán los pedidos.
const listaPedidos =
    document.querySelector("#listaPedidos");

// Indicador de cantidad de pedidos.
const cantidadPedidos =
    document.querySelector("#cantidadPedidos");

// BOTONES PARA CERRAR SESIÓN

const botonesCerrarSesion =
    document.querySelectorAll(
        "#btnCerrarSesion, #btnCerrarSesionPrincipal"
    );

// Guardará el nombre actual del usuario.
let nombreActual = "";

// Formatea los precios utilizando el formato de Uruguay.
function formatearPrecio(valor) {
    return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

// Evita que se inserte código HTML desde Firestore.
function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        texto || "";

    return elemento.innerHTML;
}


// Actualiza el saludo de la barra de navegación.
function actualizarNombreNavbar(nombreCompleto) {
    const nombre =
        nombreCompleto || "Usuario";

    // Mostramos solamente el primer nombre.
    nombreUsuarioNavbar.textContent =
        `Hola, ${nombre.trim().split(/\s+/)[0]}`;

    // Mostramos el nombre completo al pasar el mouse.
    nombreUsuarioNavbar.title =
        `Sesión iniciada como ${nombre}`;
}


// Actualiza visualmente el nombre en toda la página.
function mostrarNombreUsuario(nombre) {
    nombreActual =
        nombre || "Usuario";

    nombreUsuario.textContent =
        nombreActual;

    actualizarNombreNavbar(
        nombreActual
    );

    campoNombrePerfil.value =
        nombreActual;
}


// Oculta el formulario y vuelve a mostrar
// el botón "Editar perfil".
function ocultarFormularioEdicion() {
    formEditarPerfil.classList.add(
        "d-none"
    );

    botonEditarPerfil.classList.remove(
        "d-none"
    );
}

// CARGAR LOS PEDIDOS DEL CLIENTE

async function cargarPedidos(usuarioId) {
    try {
        // Buscamos únicamente los pedidos
        // pertenecientes al usuario autenticado.
        const consulta = query(
            collection(db, "pedidos"),
            where("usuarioId", "==", usuarioId)
        );

        const respuesta =
            await getDocs(consulta);

        // Convertimos los documentos en objetos
        // y los ordenamos del más reciente al más antiguo.
        const pedidos = respuesta.docs
            .map(
                (documento) => ({
                    id: documento.id,
                    ...documento.data(),
                })
            )
            .sort(
                (a, b) => {
                    const fechaA =
                        a.fecha?.toMillis?.() || 0;

                    const fechaB =
                        b.fecha?.toMillis?.() || 0;

                    return fechaB - fechaA;
                }
            );

        // Actualizamos la cantidad de pedidos.
        cantidadPedidos.textContent =
            `${pedidos.length} ${pedidos.length === 1
                ? "pedido"
                : "pedidos"
            }`;

        // Mensaje cuando el cliente todavía
        // no realizó ninguna compra.
        if (!pedidos.length) {
            listaPedidos.innerHTML = `
                <div class="alert alert-info">
                    Todavía no tienes compras registradas.
                </div>
            `;

            return;
        }

        // Generamos una tarjeta para cada pedido.
        listaPedidos.innerHTML =
            pedidos
                .map(
                    (pedido) => {
                        const fecha =
                            pedido.fecha
                                ?.toDate?.()
                                .toLocaleString("es-UY")
                            || "Fecha pendiente";

                        // Los pedidos nuevos tienen numeroPedido.
                        // Para los anteriores usamos una versión
                        // corta del identificador de Firestore.
                        const numeroVisible =
                            pedido.numeroPedido
                            || `TS-${pedido.id
                                .slice(0, 6)
                                .toUpperCase()}`;

                        const productosPedido =
                            Array.isArray(
                                pedido.productos
                            )
                                ? pedido.productos
                                : [];

                        return `
                            <article class="card shadow-sm mb-3">
                                <div class="card-body p-4">
                                    <div
                                        class="d-flex justify-content-between gap-3 flex-wrap mb-3"
                                    >
                                        <div>
                                            <strong>
                                                Pedido ${escaparHTML(
                            numeroVisible
                        )}
                                            </strong>

                                            <div class="small text-secondary">
                                                ${fecha}
                                            </div>
                                        </div>

                                        <span
                                            class="badge text-bg-success text-capitalize"
                                        >
                                            ${escaparHTML(
                            pedido.estado
                            || "confirmado"
                        )}
                                        </span>
                                    </div>

                                    <ul
                                        class="list-group list-group-flush mb-3"
                                    >
                                        ${productosPedido
                                .map(
                                    (producto) => `
                                                    <li
                                                        class="list-group-item px-0 d-flex justify-content-between gap-3"
                                                    >
                                                        <span>
                                                            ${producto.cantidad}
                                                            ×
                                                            ${escaparHTML(
                                        producto.nombre
                                    )}
                                                        </span>

                                                        <strong>
                                                            ${formatearPrecio(
                                        producto.subtotal
                                    )}
                                                        </strong>
                                                    </li>
                                                `
                                )
                                .join("")}
                                    </ul>

                                    <div class="text-end">
                                        <span class="me-2">
                                            Total:
                                        </span>

                                        <strong class="h5">
                                            ${formatearPrecio(
                                    pedido.total
                                )}
                                        </strong>
                                    </div>
                                </div>
                            </article>
                        `;
                    }
                )
                .join("");
    } catch (error) {
        console.error(
            "Error al cargar pedidos:",
            error
        );

        listaPedidos.innerHTML = `
            <div class="alert alert-danger">
                No fue posible consultar el historial de pedidos.
            </div>
        `;
    }
}

// COMPROBAR LA SESIÓN Y CARGAR EL PERFIL

onAuthStateChanged(
    auth,
    async (usuario) => {
        // Si no existe una sesión activa,
        // redirigimos al inicio de sesión.
        if (!usuario) {
            window.location.href =
                "login.html";

            return;
        }

        // Primero mostramos los datos disponibles
        // en Firebase Authentication.
        mostrarNombreUsuario(
            usuario.displayName
            || usuario.email?.split("@")[0]
            || "Usuario"
        );

        correoUsuario.textContent =
            usuario.email
            || "Correo no disponible";

        try {
            // Referencia al documento personal del usuario.
            const referenciaUsuario =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            // Consultamos los datos guardados en Firestore.
            const documentoUsuario =
                await getDoc(
                    referenciaUsuario
                );

            if (documentoUsuario.exists()) {
                const datosUsuario =
                    documentoUsuario.data();

                // Mostramos el nombre guardado en Firestore.
                mostrarNombreUsuario(
                    datosUsuario.nombre
                    || usuario.displayName
                    || usuario.email?.split("@")[0]
                    || "Usuario"
                );

                // Mostramos el correo.
                correoUsuario.textContent =
                    datosUsuario.correo
                    || usuario.email
                    || "Correo no disponible";

                // Mostramos el rol.
                rolUsuario.textContent =
                    datosUsuario.rol
                    || "cliente";
            } else {
                // Si no existe el documento,
                // utilizamos cliente como rol predeterminado.
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

        // Ocultamos el indicador de carga.
        cargandoPerfil.classList.add(
            "d-none"
        );

        // Mostramos el contenido del perfil.
        contenidoPerfil.classList.remove(
            "d-none"
        );

        // Cargamos el historial de pedidos.
        await cargarPedidos(
            usuario.uid
        );
    }
);


// MOSTRAR EL FORMULARIO DE EDICIÓN

botonEditarPerfil.addEventListener(
    "click",
    () => {
        // Colocamos el nombre actual dentro del campo.
        campoNombrePerfil.value =
            nombreActual;

        // Ocultamos el botón de editar.
        botonEditarPerfil.classList.add(
            "d-none"
        );

        // Mostramos el formulario.
        formEditarPerfil.classList.remove(
            "d-none"
        );

        // Colocamos el cursor en el campo.
        campoNombrePerfil.focus();
    }
);


// CANCELAR LA EDICIÓN

botonCancelarEdicion.addEventListener(
    "click",
    () => {
        // Restauramos el nombre anterior.
        campoNombrePerfil.value =
            nombreActual;

        // Ocultamos el formulario.
        ocultarFormularioEdicion();
    }
);


// GUARDAR LOS CAMBIOS DEL PERFIL

formEditarPerfil.addEventListener(
    "submit",
    async (evento) => {
        // Evitamos que la página se recargue.
        evento.preventDefault();

        const usuario =
            auth.currentUser;

        // Comprobamos que continúe autenticado.
        if (!usuario) {
            window.mostrarMensaje?.(
                "La sesión finalizó. Debes ingresar nuevamente."
            );

            return;
        }

        // Eliminamos espacios innecesarios.
        const nuevoNombre =
            campoNombrePerfil.value.trim();

        // Validación del nombre.
        if (nuevoNombre.length < 2) {
            window.mostrarMensaje?.(
                "El nombre debe tener al menos 2 caracteres."
            );

            campoNombrePerfil.focus();

            return;
        }

        // Guardamos el texto original del botón.
        const textoOriginal =
            botonGuardarPerfil.textContent;

        // Desactivamos el botón mientras se guarda.
        botonGuardarPerfil.disabled =
            true;

        botonGuardarPerfil.textContent =
            "Guardando...";

        try {
            // Actualizamos el nombre visible
            // en Firebase Authentication.
            await updateProfile(
                usuario,
                {
                    displayName: nuevoNombre,
                }
            );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                ),
                {
                    nombre: nuevoNombre,
                    actualizadoEn:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            // Actualizamos la interfaz sin recargar.
            mostrarNombreUsuario(
                nuevoNombre
            );

            // Ocultamos nuevamente el formulario.
            ocultarFormularioEdicion();

            // Mostramos la confirmación.
            window.mostrarMensaje?.(
                "El perfil fue actualizado correctamente."
            );
        } catch (error) {
            console.error(
                "Error al actualizar el perfil:",
                error
            );

            window.mostrarMensaje?.(
                "No fue posible actualizar el perfil."
            );
        } finally {
            // Reactivamos el botón.
            botonGuardarPerfil.disabled =
                false;

            botonGuardarPerfil.textContent =
                textoOriginal;
        }
    }
);

// CERRAR SESIÓN

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

        window.mostrarMensaje?.(
            "No fue posible cerrar la sesión."
        );
    }
}


// Aplicamos la misma función a los dos
// botones disponibles para cerrar sesión.
botonesCerrarSesion.forEach(
    (boton) => {
        boton.addEventListener(
            "click",
            cerrarSesion
        );
    }
);