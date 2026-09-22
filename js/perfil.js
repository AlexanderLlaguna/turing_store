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

// ELEMENTOS DEL PERFIL

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

const botonEditarPerfil =
    document.querySelector("#btnEditarPerfil");

const formEditarPerfil =
    document.querySelector("#formEditarPerfil");

const campoNombrePerfil =
    document.querySelector("#nombrePerfil");

const botonCancelarEdicion =
    document.querySelector("#btnCancelarEdicion");

const botonGuardarPerfil =
    document.querySelector("#btnGuardarPerfil");

const listaPedidos =
    document.querySelector("#listaPedidos");

const cantidadPedidos =
    document.querySelector("#cantidadPedidos");

// ELEMENTOS DE LA FOTO

const imagenPerfil =
    document.querySelector("#fotoPerfil");

const inputFotoPerfil =
    document.querySelector("#inputFotoPerfil");

const botonGuardarFoto =
    document.querySelector("#btnGuardarFoto");

const botonEliminarFoto =
    document.querySelector("#btnEliminarFoto");

// BOTONES PARA CERRAR SESIÓN

const botonesCerrarSesion =
    document.querySelectorAll(
        "#btnCerrarSesion, #btnCerrarSesionPrincipal"
    );

// IMAGEN PREDETERMINADA

const FOTO_PREDETERMINADA =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="320"
            height="320"
            viewBox="0 0 320 320"
        >
            <rect
                width="320"
                height="320"
                fill="#e9ecef"
            />

            <circle
                cx="160"
                cy="120"
                r="58"
                fill="#6c757d"
            />

            <path
                d="M55 300c10-74 49-111 105-111s95 37 105 111"
                fill="#6c757d"
            />
        </svg>
    `);

// VARIABLES DEL PERFIL

let nombreActual = "";

let fotoGuardadaActual = "";

let fotoAlternativaActual =
    FOTO_PREDETERMINADA;

let fotoPendiente = "";

// FORMATEAR PRECIOS

function formatearPrecio(valor) {
    return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

// EVITAR CÓDIGO HTML DESDE FIRESTORE

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        texto || "";

    return elemento.innerHTML;
}

// ACTUALIZAR NOMBRE EN LA BARRA

function actualizarNombreNavbar(nombreCompleto) {
    const nombre =
        nombreCompleto || "Usuario";

    nombreUsuarioNavbar.textContent =
        `Hola, ${nombre.trim().split(/\s+/)[0]}`;

    nombreUsuarioNavbar.title =
        `Sesión iniciada como ${nombre}`;
}

// MOSTRAR NOMBRE DEL USUARIO

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

// MOSTRAR FOTO DEL USUARIO

function mostrarFotoPerfil(foto) {
    imagenPerfil.src =
        foto || FOTO_PREDETERMINADA;
}

// ACTUALIZAR BOTONES DE LA FOTO

function actualizarBotonesFoto() {
    botonGuardarFoto.disabled =
        !fotoPendiente;

    botonEliminarFoto.disabled =
        !fotoGuardadaActual &&
        !fotoPendiente;
}

// COMPRIMIR Y RECORTAR LA IMAGEN

function procesarImagen(archivo) {
    return new Promise(
        (resolve, reject) => {
            const formatosPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            if (
                !formatosPermitidos.includes(
                    archivo.type
                )
            ) {
                reject(
                    new Error(
                        "Selecciona una imagen JPG, PNG o WebP."
                    )
                );

                return;
            }

            const limite =
                5 * 1024 * 1024;

            if (archivo.size > limite) {
                reject(
                    new Error(
                        "La imagen no puede superar los 5 MB."
                    )
                );

                return;
            }

            const lector =
                new FileReader();

            lector.onload = () => {
                const imagen =
                    new Image();

                imagen.onload = () => {
                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    const contexto =
                        canvas.getContext("2d");

                    const medida = 320;

                    canvas.width =
                        medida;

                    canvas.height =
                        medida;

                    const lado =
                        Math.min(
                            imagen.width,
                            imagen.height
                        );

                    const origenX =
                        (imagen.width - lado) / 2;

                    const origenY =
                        (imagen.height - lado) / 2;

                    contexto.drawImage(
                        imagen,
                        origenX,
                        origenY,
                        lado,
                        lado,
                        0,
                        0,
                        medida,
                        medida
                    );

                    const imagenComprimida =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.78
                        );

                    if (
                        imagenComprimida.length >
                        700000
                    ) {
                        reject(
                            new Error(
                                "La imagen resultante continúa siendo demasiado grande."
                            )
                        );

                        return;
                    }

                    resolve(
                        imagenComprimida
                    );
                };

                imagen.onerror = () => {
                    reject(
                        new Error(
                            "No fue posible leer la imagen."
                        )
                    );
                };

                imagen.src =
                    lector.result;
            };

            lector.onerror = () => {
                reject(
                    new Error(
                        "No fue posible abrir el archivo."
                    )
                );
            };

            lector.readAsDataURL(
                archivo
            );
        }
    );
}

// SELECCIONAR Y PREVISUALIZAR UNA FOTO

inputFotoPerfil.addEventListener(
    "change",
    async () => {
        const archivo =
            inputFotoPerfil.files[0];

        fotoPendiente = "";

        actualizarBotonesFoto();

        if (!archivo) {
            mostrarFotoPerfil(
                fotoGuardadaActual ||
                fotoAlternativaActual
            );

            return;
        }

        try {
            fotoPendiente =
                await procesarImagen(
                    archivo
                );

            mostrarFotoPerfil(
                fotoPendiente
            );

            actualizarBotonesFoto();
        } catch (error) {
            console.error(
                "Error al procesar la imagen:",
                error
            );

            inputFotoPerfil.value =
                "";

            mostrarFotoPerfil(
                fotoGuardadaActual ||
                fotoAlternativaActual
            );

            window.mostrarMensaje?.(
                error.message
            );
        }
    }
);

// GUARDAR LA FOTO EN FIRESTORE

botonGuardarFoto.addEventListener(
    "click",
    async () => {
        const usuario =
            auth.currentUser;

        if (!usuario) {
            window.mostrarMensaje?.(
                "La sesión finalizó. Debes ingresar nuevamente."
            );

            return;
        }

        if (!fotoPendiente) {
            window.mostrarMensaje?.(
                "Selecciona una foto antes de guardarla."
            );

            return;
        }

        const textoOriginal =
            botonGuardarFoto.textContent;

        botonGuardarFoto.disabled =
            true;

        botonGuardarFoto.textContent =
            "Guardando...";

        try {
            await setDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                ),
                {
                    fotoPerfil:
                        fotoPendiente,

                    actualizadoEn:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            fotoGuardadaActual =
                fotoPendiente;

            fotoPendiente =
                "";

            inputFotoPerfil.value =
                "";

            mostrarFotoPerfil(
                fotoGuardadaActual
            );

            actualizarBotonesFoto();

            window.mostrarMensaje?.(
                "La foto de perfil fue actualizada correctamente."
            );
        } catch (error) {
            console.error(
                "Error al guardar la foto:",
                error
            );

            window.mostrarMensaje?.(
                "No fue posible guardar la foto de perfil."
            );
        } finally {
            botonGuardarFoto.disabled =
                !fotoPendiente;

            botonGuardarFoto.textContent =
                textoOriginal;
        }
    }
);

// ELIMINAR LA FOTO PERSONALIZADA

botonEliminarFoto.addEventListener(
    "click",
    async () => {
        const usuario =
            auth.currentUser;

        if (!usuario) {
            window.mostrarMensaje?.(
                "La sesión finalizó. Debes ingresar nuevamente."
            );

            return;
        }

        const textoOriginal =
            botonEliminarFoto.textContent;

        botonEliminarFoto.disabled =
            true;

        botonEliminarFoto.textContent =
            "Eliminando...";

        try {
            await setDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                ),
                {
                    fotoPerfil: "",

                    actualizadoEn:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            fotoGuardadaActual =
                "";

            fotoPendiente =
                "";

            inputFotoPerfil.value =
                "";

            mostrarFotoPerfil(
                fotoAlternativaActual
            );

            actualizarBotonesFoto();

            window.mostrarMensaje?.(
                "La foto personalizada fue eliminada."
            );
        } catch (error) {
            console.error(
                "Error al eliminar la foto:",
                error
            );

            window.mostrarMensaje?.(
                "No fue posible eliminar la foto de perfil."
            );
        } finally {
            botonEliminarFoto.textContent =
                textoOriginal;

            actualizarBotonesFoto();
        }
    }
);

// OCULTAR EL FORMULARIO DE EDICIÓN

function ocultarFormularioEdicion() {
    formEditarPerfil.classList.add(
        "d-none"
    );

    botonEditarPerfil.classList.remove(
        "d-none"
    );
}

// CARGAR PEDIDOS DEL CLIENTE

async function cargarPedidos(usuarioId) {
    try {
        const consulta = query(
            collection(db, "pedidos"),
            where(
                "usuarioId",
                "==",
                usuarioId
            )
        );

        const respuesta =
            await getDocs(consulta);

        const pedidos =
            respuesta.docs
                .map(
                    (documento) => ({
                        id: documento.id,
                        ...documento.data(),
                    })
                )
                .sort(
                    (a, b) => {
                        const fechaA =
                            a.fecha
                                ?.toMillis?.() ||
                            0;

                        const fechaB =
                            b.fecha
                                ?.toMillis?.() ||
                            0;

                        return fechaB - fechaA;
                    }
                );

        cantidadPedidos.textContent =
            `${pedidos.length} ${pedidos.length === 1
                ? "pedido"
                : "pedidos"
            }`;

        if (!pedidos.length) {
            listaPedidos.innerHTML = `
                <div class="alert alert-info">
                    Todavía no tienes compras registradas.
                </div>
            `;

            return;
        }

        listaPedidos.innerHTML =
            pedidos
                .map(
                    (pedido) => {
                        const fecha =
                            pedido.fecha
                                ?.toDate?.()
                                .toLocaleString(
                                    "es-UY"
                                ) ||
                            "Fecha pendiente";

                        const numeroVisible =
                            pedido.numeroPedido ||
                            `TS-${pedido.id
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
                            pedido.estado ||
                            "confirmado"
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
        if (!usuario) {
            window.location.href =
                "login.html";

            return;
        }

        mostrarNombreUsuario(
            usuario.displayName ||
            usuario.email?.split("@")[0] ||
            "Usuario"
        );

        correoUsuario.textContent =
            usuario.email ||
            "Correo no disponible";

        fotoAlternativaActual =
            usuario.photoURL ||
            FOTO_PREDETERMINADA;

        mostrarFotoPerfil(
            fotoAlternativaActual
        );

        try {
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

            if (documentoUsuario.exists()) {
                const datosUsuario =
                    documentoUsuario.data();

                mostrarNombreUsuario(
                    datosUsuario.nombre ||
                    usuario.displayName ||
                    usuario.email?.split("@")[0] ||
                    "Usuario"
                );

                correoUsuario.textContent =
                    datosUsuario.correo ||
                    usuario.email ||
                    "Correo no disponible";

                rolUsuario.textContent =
                    datosUsuario.rol ||
                    "cliente";

                fotoGuardadaActual =
                    datosUsuario.fotoPerfil ||
                    "";

                fotoAlternativaActual =
                    datosUsuario.fotoGoogle ||
                    usuario.photoURL ||
                    FOTO_PREDETERMINADA;

                mostrarFotoPerfil(
                    fotoGuardadaActual ||
                    fotoAlternativaActual
                );
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

        actualizarBotonesFoto();

        cargandoPerfil.classList.add(
            "d-none"
        );

        contenidoPerfil.classList.remove(
            "d-none"
        );

        await cargarPedidos(
            usuario.uid
        );
    }
);

// MOSTRAR FORMULARIO DE EDICIÓN

botonEditarPerfil.addEventListener(
    "click",
    () => {
        campoNombrePerfil.value =
            nombreActual;

        botonEditarPerfil.classList.add(
            "d-none"
        );

        formEditarPerfil.classList.remove(
            "d-none"
        );

        campoNombrePerfil.focus();
    }
);

// CANCELAR EDICIÓN

botonCancelarEdicion.addEventListener(
    "click",
    () => {
        campoNombrePerfil.value =
            nombreActual;

        ocultarFormularioEdicion();
    }
);

// GUARDAR CAMBIOS DEL NOMBRE

formEditarPerfil.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const usuario =
            auth.currentUser;

        if (!usuario) {
            window.mostrarMensaje?.(
                "La sesión finalizó. Debes ingresar nuevamente."
            );

            return;
        }

        const nuevoNombre =
            campoNombrePerfil.value.trim();

        if (nuevoNombre.length < 2) {
            window.mostrarMensaje?.(
                "El nombre debe tener al menos 2 caracteres."
            );

            campoNombrePerfil.focus();

            return;
        }

        const textoOriginal =
            botonGuardarPerfil.textContent;

        botonGuardarPerfil.disabled =
            true;

        botonGuardarPerfil.textContent =
            "Guardando...";

        try {
            await updateProfile(
                usuario,
                {
                    displayName:
                        nuevoNombre,
                }
            );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                ),
                {
                    nombre:
                        nuevoNombre,

                    actualizadoEn:
                        serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            mostrarNombreUsuario(
                nuevoNombre
            );

            ocultarFormularioEdicion();

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

botonesCerrarSesion.forEach(
    (boton) => {
        boton.addEventListener(
            "click",
            cerrarSesion
        );
    }
);