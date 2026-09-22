// Configuración de Firebase.
import { auth, db } from "./config.js";

// Función para consultar los productos almacenados en Firestore.
import {
  obtenerProductos,
} from "./productos-firestore.js";

// Funciones de Cloud Firestore.
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// CONFIGURACIÓN DEL CARRITO
// ======================================================

// Nombre utilizado para guardar el carrito en LocalStorage.
const CLAVE_CARRITO =
  "turingStoreCarrito";


// Recupera el carrito desde LocalStorage.
export function obtenerCarrito() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(CLAVE_CARRITO)
      ) || []
    );
  } catch (error) {
    console.error(
      "Error al recuperar el carrito:",
      error
    );

    return [];
  }
}


// Guarda el carrito y actualiza su contador.
export function guardarCarrito(carrito) {
  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify(carrito)
  );

  window.actualizarContadorCarrito?.();
}


// Agrega un producto al carrito.
export function agregarAlCarrito(producto) {
  // Comprobamos que el producto exista y tenga stock.
  if (
    !producto
    || producto.disponible === false
    || Number(producto.stock) < 1
  ) {
    return {
      exito: false,
      mensaje: "El producto no está disponible.",
    };
  }

  const carrito =
    obtenerCarrito();

  const item = carrito.find(
    (productoCarrito) =>
      productoCarrito.id === producto.id
  );

  // Si ya existe, aumentamos la cantidad.
  if (item) {
    if (
      item.cantidad >= Number(producto.stock)
    ) {
      return {
        exito: false,
        mensaje: "No hay más unidades disponibles.",
      };
    }

    item.cantidad++;
  } else {
    // Si no existe, lo incorporamos.
    carrito.push({
      id: producto.id,
      cantidad: 1,
    });
  }

  guardarCarrito(carrito);

  return {
    exito: true,
    mensaje:
      `${producto.nombre} fue agregado al carrito.`,
  };
}


// ======================================================
// ELEMENTOS DEL CARRITO
// ======================================================

const listaCarrito =
  document.querySelector("#lista-carrito");

const carritoVacio =
  document.querySelector("#carrito-vacio");

const contenidoCarrito =
  document.querySelector("#contenido-carrito");

const totalCarrito =
  document.querySelector("#total-carrito");

const botonConfirmarCompra =
  document.querySelector("#confirmar-compra");

const elementoModalCompra =
  document.querySelector(
    "#modal-confirmar-compra"
  );

const botonFinalizarCompra =
  document.querySelector("#finalizar-compra");

const totalModalCompra =
  document.querySelector("#total-modal-compra");


// ======================================================
// ELEMENTOS DE LA FORMA DE PAGO
// ======================================================

// Opciones: tarjeta, transferencia o efectivo.
const opcionesFormaPago =
  document.querySelectorAll(
    'input[name="formaPago"]'
  );

// Secciones que cambian según la forma de pago.
const datosTarjeta =
  document.querySelector("#datos-tarjeta");

const datosTransferencia =
  document.querySelector(
    "#datos-transferencia"
  );

const datosEfectivo =
  document.querySelector("#datos-efectivo");

// Campos de la tarjeta simulada.
const campoTitularTarjeta =
  document.querySelector("#titular-tarjeta");

const campoNumeroTarjeta =
  document.querySelector("#numero-tarjeta");

const campoVencimientoTarjeta =
  document.querySelector(
    "#vencimiento-tarjeta"
  );

const campoCodigoTarjeta =
  document.querySelector("#codigo-tarjeta");


// Lista de productos consultada desde Firestore.
let productosDisponibles = [];

// Instancia del modal de Bootstrap.
let modalCompra;


// ======================================================
// FUNCIONES GENERALES
// ======================================================

// Formatea precios en español de Uruguay.
function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString(
    "es-UY"
  )}`;
}


// Calcula el total actual del carrito.
function calcularTotal(carrito) {
  return carrito.reduce(
    (total, item) => {
      const producto =
        productosDisponibles.find(
          (actual) =>
            actual.id === item.id
        );

      return (
        total
        + (
          producto
            ? Number(producto.precio)
            * item.cantidad
            : 0
        )
      );
    },
    0
  );
}


// ======================================================
// MOSTRAR EL CARRITO
// ======================================================

function mostrarCarrito() {
  // Esta función solo continúa si estamos
  // dentro de carrito.html.
  if (!listaCarrito) {
    return;
  }

  const carrito =
    obtenerCarrito();

  listaCarrito.innerHTML = "";

  // Mostramos el aviso si no existen productos.
  if (!carrito.length) {
    carritoVacio.hidden = false;
    contenidoCarrito.hidden = true;

    return;
  }

  carritoVacio.hidden = true;
  contenidoCarrito.hidden = false;

  // Creamos una tarjeta por cada producto.
  carrito.forEach(
    (item) => {
      const producto =
        productosDisponibles.find(
          (actual) =>
            actual.id === item.id
        );

      if (!producto) {
        return;
      }

      const subtotal =
        Number(producto.precio)
        * item.cantidad;

      listaCarrito.insertAdjacentHTML(
        "beforeend",
        `
          <article
            class="card border-0 shadow-sm carrito-item"
          >
            <div class="card-body">
              <div
                class="row align-items-center g-3"
              >
                <div class="col-md-3">
                  <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    class="img-fluid rounded carrito-imagen"
                  />
                </div>

                <div class="col-md-5">
                  <span class="eyebrow">
                    ${producto.categoria}
                  </span>

                  <h2 class="h5 mt-2">
                    ${producto.nombre}
                  </h2>

                  <p class="text-secondary mb-0">
                    Precio unitario:
                    ${formatearPrecio(
          producto.precio
        )}
                  </p>
                </div>

                <div class="col-md-2">
                  <span class="cantidad-etiqueta">
                    Cantidad
                  </span>

                  <div
                    class="selector-cantidad"
                    role="group"
                    aria-label="Modificar cantidad de ${producto.nombre}"
                  >
                    <button
                      class="cantidad-boton"
                      type="button"
                      data-accion="disminuir"
                      data-id="${producto.id}"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>

                    <span
                      class="cantidad-valor"
                      aria-live="polite"
                    >
                      ${item.cantidad}
                    </span>

                    <button
                      class="cantidad-boton"
                      type="button"
                      data-accion="aumentar"
                      data-id="${producto.id}"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <small class="cantidad-stock">
                    Stock máximo:
                    ${producto.stock}
                  </small>

                  <button
                    class="btn-eliminar-carrito"
                    type="button"
                    data-accion="eliminar"
                    data-id="${producto.id}"
                  >
                    <span aria-hidden="true">
                      ×
                    </span>

                    Eliminar
                  </button>
                </div>

                <div
                  class="col-md-2 text-md-end"
                >
                  <p class="mb-1">
                    Subtotal
                  </p>

                  <strong>
                    ${formatearPrecio(subtotal)}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        `
      );
    }
  );

  // Actualizamos el total general.
  totalCarrito.textContent =
    formatearPrecio(
      calcularTotal(carrito)
    );
}


// ======================================================
// MODIFICAR CANTIDADES
// ======================================================

function cambiarCantidad(
  idProducto,
  cambio
) {
  const carrito =
    obtenerCarrito();

  const item = carrito.find(
    (actual) =>
      actual.id === idProducto
  );

  const producto =
    productosDisponibles.find(
      (actual) =>
        actual.id === idProducto
    );

  if (!item || !producto) {
    return;
  }

  const nuevaCantidad =
    item.cantidad + cambio;

  // La cantidad mínima permitida es 1.
  if (nuevaCantidad < 1) {
    window.mostrarMensaje?.(
      "La cantidad mínima es 1. Puedes eliminar el producto."
    );

    return;
  }

  // La cantidad no puede superar el stock.
  if (
    nuevaCantidad
    > Number(producto.stock)
  ) {
    window.mostrarMensaje?.(
      "No hay más unidades disponibles."
    );

    return;
  }

  item.cantidad =
    nuevaCantidad;

  guardarCarrito(carrito);
  mostrarCarrito();
}


// Elimina un producto del carrito.
function eliminarDelCarrito(idProducto) {
  const carritoActualizado =
    obtenerCarrito().filter(
      (item) =>
        item.id !== idProducto
    );

  guardarCarrito(
    carritoActualizado
  );

  mostrarCarrito();

  window.mostrarMensaje?.(
    "El producto fue eliminado del carrito."
  );
}


// ======================================================
// NÚMERO DEL PEDIDO
// ======================================================

// Genera un número de pedido más legible.
function generarNumeroPedido() {
  const ahora =
    new Date();

  const anio =
    ahora.getFullYear();

  const mes =
    String(
      ahora.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      ahora.getDate()
    ).padStart(2, "0");

  const codigo =
    String(
      Date.now()
    ).slice(-6);

  return (
    `TS-${anio}${mes}${dia}-${codigo}`
  );
}


// Genera una referencia para el pago simulado.
function generarReferenciaPago() {
  const codigo =
    String(
      Date.now()
    ).slice(-8);

  return `PAGO-${codigo}`;
}


// ======================================================
// FORMA DE PAGO
// ======================================================

// Obtiene la opción de pago seleccionada.
function obtenerFormaPagoSeleccionada() {
  return (
    document.querySelector(
      'input[name="formaPago"]:checked'
    )?.value || ""
  );
}


// Muestra los campos correspondientes
// a la forma de pago seleccionada.
function actualizarFormaPago() {
  const formaPago =
    obtenerFormaPagoSeleccionada();

  datosTarjeta?.classList.toggle(
    "d-none",
    formaPago !== "tarjeta"
  );

  datosTransferencia?.classList.toggle(
    "d-none",
    formaPago !== "transferencia"
  );

  datosEfectivo?.classList.toggle(
    "d-none",
    formaPago !== "efectivo"
  );
}


// Valida los datos de la tarjeta simulada.
function validarTarjeta() {
  const titular =
    campoTitularTarjeta.value.trim();

  const numero =
    campoNumeroTarjeta.value.replace(
      /\D/g,
      ""
    );

  const vencimiento =
    campoVencimientoTarjeta.value.trim();

  const codigo =
    campoCodigoTarjeta.value.replace(
      /\D/g,
      ""
    );

  if (titular.length < 3) {
    return {
      valido: false,
      mensaje:
        "Escribe el nombre del titular de la tarjeta.",
      campo: campoTitularTarjeta,
    };
  }

  // Para esta simulación usamos 16 dígitos.
  if (numero.length !== 16) {
    return {
      valido: false,
      mensaje:
        "El número de tarjeta debe tener 16 dígitos.",
      campo: campoNumeroTarjeta,
    };
  }

  // Formato esperado: MM/AA.
  if (
    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
      vencimiento
    )
  ) {
    return {
      valido: false,
      mensaje:
        "El vencimiento debe tener el formato MM/AA.",
      campo:
        campoVencimientoTarjeta,
    };
  }

  // Comprobamos que la tarjeta no esté vencida.
  const [
    mes,
    anioCorto,
  ] = vencimiento
    .split("/")
    .map(Number);

  const anio =
    2000 + anioCorto;

  const ultimoDiaDelMes =
    new Date(
      anio,
      mes,
      0,
      23,
      59,
      59
    );

  if (
    ultimoDiaDelMes
    < new Date()
  ) {
    return {
      valido: false,
      mensaje:
        "La tarjeta ingresada está vencida.",
      campo:
        campoVencimientoTarjeta,
    };
  }

  if (
    codigo.length < 3
    || codigo.length > 4
  ) {
    return {
      valido: false,
      mensaje:
        "El código de seguridad debe tener 3 o 4 dígitos.",
      campo: campoCodigoTarjeta,
    };
  }

  return {
    valido: true,
  };
}


// Valida la forma de pago seleccionada.
function validarFormaPago() {
  const formaPago =
    obtenerFormaPagoSeleccionada();

  if (!formaPago) {
    return {
      valido: false,
      mensaje:
        "Selecciona una forma de pago.",
    };
  }

  // Solamente la tarjeta necesita
  // validación de campos.
  if (formaPago === "tarjeta") {
    return validarTarjeta();
  }

  return {
    valido: true,
  };
}


// Prepara la información que se guardará en Firestore.
// Nunca se guardan el número, vencimiento o CVV.
function crearDatosPago() {
  const metodo =
    obtenerFormaPagoSeleccionada();

  let estado =
    "pendiente";

  // En la simulación, una tarjeta válida
  // se considera aprobada inmediatamente.
  if (metodo === "tarjeta") {
    estado = "aprobado";
  }

  return {
    metodo,
    estado,
    referencia:
      generarReferenciaPago(),
  };
}


// Devuelve un nombre más claro para mostrar.
function obtenerNombreFormaPago(metodo) {
  const nombres = {
    tarjeta:
      "Tarjeta de crédito o débito",
    transferencia:
      "Transferencia bancaria",
    efectivo:
      "Efectivo al retirar",
  };

  return (
    nombres[metodo]
    || "Forma de pago"
  );
}


// Limpia el formulario de pago.
function limpiarFormularioPago() {
  // Volvemos a seleccionar tarjeta.
  const opcionTarjeta =
    document.querySelector(
      "#pagoTarjeta"
    );

  if (opcionTarjeta) {
    opcionTarjeta.checked = true;
  }

  if (campoTitularTarjeta) {
    campoTitularTarjeta.value = "";
  }

  if (campoNumeroTarjeta) {
    campoNumeroTarjeta.value = "";
  }

  if (campoVencimientoTarjeta) {
    campoVencimientoTarjeta.value = "";
  }

  if (campoCodigoTarjeta) {
    campoCodigoTarjeta.value = "";
  }

  actualizarFormaPago();
}


// ======================================================
// REGISTRAR LA COMPRA EN FIRESTORE
// ======================================================

async function registrarCompra(datosPago) {
  const usuario =
    auth.currentUser;

  const carrito =
    obtenerCarrito();

  if (!usuario) {
    throw new Error(
      "Debes iniciar sesión antes de confirmar la compra."
    );
  }

  if (!carrito.length) {
    throw new Error(
      "El carrito está vacío."
    );
  }

  const numeroPedido =
    generarNumeroPedido();

  const referenciaPedido =
    doc(
      collection(db, "pedidos")
    );

  // La transacción comprueba nuevamente
  // los productos y actualiza su stock.
  await runTransaction(
    db,
    async (transaccion) => {
      const detalles = [];
      let total = 0;

      // En una transacción se realizan
      // todas las lecturas antes de escribir.
      for (const item of carrito) {
        const referenciaProducto =
          doc(
            db,
            "productos",
            item.id
          );

        const documentoProducto =
          await transaccion.get(
            referenciaProducto
          );

        if (
          !documentoProducto.exists()
        ) {
          throw new Error(
            "Uno de los productos ya no existe."
          );
        }

        const producto =
          documentoProducto.data();

        const stockActual =
          Number(producto.stock);

        if (
          producto.disponible === false
          || stockActual < item.cantidad
        ) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}.`
          );
        }

        const precio =
          Number(producto.precio);

        const subtotal =
          precio * item.cantidad;

        total += subtotal;

        detalles.push({
          productoId: item.id,
          nombre: producto.nombre,
          cantidad: item.cantidad,
          precio,
          subtotal,
          stockActual,
        });
      }

      // Actualizamos el stock.
      detalles.forEach(
        (detalle) => {
          const nuevoStock =
            detalle.stockActual
            - detalle.cantidad;

          transaccion.update(
            doc(
              db,
              "productos",
              detalle.productoId
            ),
            {
              stock: nuevoStock,
              disponible:
                nuevoStock > 0,
              actualizadoEn:
                serverTimestamp(),
            }
          );
        }
      );

      // Creamos el pedido.
      transaccion.set(
        referenciaPedido,
        {
          numeroPedido,
          usuarioId:
            usuario.uid,
          usuarioCorreo:
            usuario.email,

          productos:
            detalles.map(
              ({
                stockActual,
                ...detalle
              }) => detalle
            ),

          total,
          fecha:
            serverTimestamp(),
          estado:
            "confirmado",

          // Información no sensible
          // del pago simulado.
          pago: {
            metodo:
              datosPago.metodo,
            nombreMetodo:
              obtenerNombreFormaPago(
                datosPago.metodo
              ),
            estado:
              datosPago.estado,
            referencia:
              datosPago.referencia,
          },
        }
      );
    }
  );

  return numeroPedido;
}


// ======================================================
// INICIAR LA PÁGINA DEL CARRITO
// ======================================================

async function iniciarPaginaCarrito() {
  // Si el archivo se importa desde otra página,
  // no ejecutamos la interfaz del carrito.
  if (!listaCarrito) {
    return;
  }

  // Consultamos los productos desde Firestore.
  try {
    productosDisponibles =
      await obtenerProductos();

    mostrarCarrito();
  } catch (error) {
    console.error(
      "Error al cargar productos:",
      error
    );

    window.mostrarMensaje?.(
      "No fue posible consultar los productos de Firestore."
    );
  }

  // Control de los botones de cantidad
  // y eliminación del carrito.
  listaCarrito.addEventListener(
    "click",
    (evento) => {
      const boton =
        evento.target.closest(
          "[data-accion]"
        );

      if (!boton) {
        return;
      }

      if (
        boton.dataset.accion
        === "aumentar"
      ) {
        cambiarCantidad(
          boton.dataset.id,
          1
        );
      }

      if (
        boton.dataset.accion
        === "disminuir"
      ) {
        cambiarCantidad(
          boton.dataset.id,
          -1
        );
      }

      if (
        boton.dataset.accion
        === "eliminar"
      ) {
        eliminarDelCarrito(
          boton.dataset.id
        );
      }
    }
  );

  // Creamos el modal de Bootstrap.
  if (
    elementoModalCompra
    && totalModalCompra
  ) {
    modalCompra =
      new bootstrap.Modal(
        elementoModalCompra
      );
  }

  // Cambiamos los campos cuando el usuario
  // selecciona otra forma de pago.
  opcionesFormaPago.forEach(
    (opcion) => {
      opcion.addEventListener(
        "change",
        actualizarFormaPago
      );
    }
  );

  // Formateamos automáticamente
  // el número de tarjeta.
  campoNumeroTarjeta?.addEventListener(
    "input",
    () => {
      const numeros =
        campoNumeroTarjeta.value
          .replace(/\D/g, "")
          .slice(0, 16);

      campoNumeroTarjeta.value =
        numeros
          .replace(
            /(\d{4})(?=\d)/g,
            "$1 "
          );
    }
  );

  // Formateamos automáticamente
  // el vencimiento como MM/AA.
  campoVencimientoTarjeta
    ?.addEventListener(
      "input",
      () => {
        const numeros =
          campoVencimientoTarjeta.value
            .replace(/\D/g, "")
            .slice(0, 4);

        campoVencimientoTarjeta.value =
          numeros.length > 2
            ? `${numeros.slice(
              0,
              2
            )}/${numeros.slice(2)}`
            : numeros;
      }
    );

  // Permitimos solamente números en el CVV.
  campoCodigoTarjeta
    ?.addEventListener(
      "input",
      () => {
        campoCodigoTarjeta.value =
          campoCodigoTarjeta.value
            .replace(/\D/g, "")
            .slice(0, 4);
      }
    );

  // Mostramos la ventana de pago.
  botonConfirmarCompra
    ?.addEventListener(
      "click",
      () => {
        if (!auth.currentUser) {
          window.mostrarMensaje?.(
            "Debes iniciar sesión para comprar."
          );

          setTimeout(
            () => {
              window.location.href =
                "login.html";
            },
            1200
          );

          return;
        }

        if (
          !obtenerCarrito().length
        ) {
          window.mostrarMensaje?.(
            "El carrito está vacío."
          );

          return;
        }

        limpiarFormularioPago();

        totalModalCompra.textContent =
          totalCarrito.textContent;

        modalCompra.show();
      }
    );

  // Finalizamos la compra.
  botonFinalizarCompra
    ?.addEventListener(
      "click",
      async () => {
        // Validamos la forma de pago.
        const validacion =
          validarFormaPago();

        if (!validacion.valido) {
          window.mostrarMensaje?.(
            validacion.mensaje
          );

          validacion.campo?.focus();

          return;
        }

        // Preparamos únicamente datos
        // no sensibles del pago.
        const datosPago =
          crearDatosPago();

        const textoOriginal =
          botonFinalizarCompra.textContent;

        botonFinalizarCompra.disabled =
          true;

        botonFinalizarCompra.textContent =
          "Procesando...";

        try {
          const pedidoId =
            await registrarCompra(
              datosPago
            );

          // Vaciamos el carrito solamente
          // después de una compra correcta.
          guardarCarrito([]);

          modalCompra.hide();

          productosDisponibles =
            await obtenerProductos();

          mostrarCarrito();

          limpiarFormularioPago();

          const metodoVisible =
            obtenerNombreFormaPago(
              datosPago.metodo
            );

          window.mostrarMensaje?.(
            `Compra confirmada. Pedido: ${pedidoId}. Pago: ${metodoVisible}.`
          );
        } catch (error) {
          console.error(
            "Error al confirmar la compra:",
            error
          );

          window.mostrarMensaje?.(
            error.message
            || "No fue posible confirmar la compra."
          );
        } finally {
          botonFinalizarCompra.disabled =
            false;

          botonFinalizarCompra.textContent =
            textoOriginal;
        }
      }
    );

  // Mostramos correctamente la opción
  // seleccionada al abrir la página.
  actualizarFormaPago();
}


// Iniciamos la página.
iniciarPaginaCarrito();