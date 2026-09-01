const CLAVE_CARRITO = "turingStoreCarrito";

function obtenerCarrito() {

  const carritoGuardado =
    localStorage.getItem(CLAVE_CARRITO);

  if (!carritoGuardado) {
    return [];
  }

  try {
    return JSON.parse(carritoGuardado);
  } catch (error) {
    return [];
  }

}

function guardarCarrito(carrito) {

  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify(carrito)
  );

  window.actualizarContadorCarrito?.();

}

function agregarAlCarrito(idProducto) {

  const productoSeleccionado = productos.find(
    (producto) => producto.id === idProducto
  );

  if (!productoSeleccionado) {
    return {
      exito: false,
      mensaje: "El producto no existe.",
    };
  }

  const carrito = obtenerCarrito();

  const productoEnCarrito = carrito.find(
    (item) => item.id === idProducto
  );

  if (productoEnCarrito) {

    if (
      productoEnCarrito.cantidad >=
      productoSeleccionado.stock
    ) {
      return {
        exito: false,
        mensaje: "No hay más unidades disponibles.",
      };
    }

    productoEnCarrito.cantidad++;

  } else {

    carrito.push({
      id: idProducto,
      cantidad: 1,
    });

  }

  guardarCarrito(carrito);

  return {
    exito: true,
    mensaje:
      `${productoSeleccionado.nombre} fue agregado al carrito.`,
  };

}

const listaCarrito =
  document.querySelector("#lista-carrito");

const carritoVacio =
  document.querySelector("#carrito-vacio");

const contenidoCarrito =
  document.querySelector("#contenido-carrito");

const totalCarrito =
  document.querySelector("#total-carrito");

function mostrarCarrito() {

  // Esta parte solo se ejecuta en carrito.html.
  if (!listaCarrito) {
    return;
  }

  const carrito = obtenerCarrito();

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {

    carritoVacio.hidden = false;
    contenidoCarrito.hidden = true;

    return;

  }

  carritoVacio.hidden = true;
  contenidoCarrito.hidden = false;

  let total = 0;

  carrito.forEach((item) => {

    const producto = productos.find(
      (producto) => producto.id === item.id
    );

    if (!producto) {
      return;
    }

    const subtotal =
      producto.precio * item.cantidad;

    total += subtotal;

    listaCarrito.innerHTML += /* html */ `
      <article class="card border-0 shadow-sm carrito-item">

        <div class="card-body">

          <div class="row align-items-center g-3">

            <div class="col-md-3">
              <img
  src="${producto.imagen}"
  alt="${producto.nombre}"
  class="img-fluid rounded carrito-imagen">
            </div>

            <div class="col-md-5">

              <span class="eyebrow">
                ${producto.categoria}
              </span>

              <h2 class="h5 mt-2">
                ${producto.nombre}
              </h2>

              <p class="text-secondary mb-0">
                Precio unitario: $ ${producto.precio}
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
      title="Disminuir"
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
      title="Aumentar"
    >
      +
    </button>
  </div>

  <small class="cantidad-stock">
    Stock máximo: ${producto.stock}
  </small>

  <button
    class="btn-eliminar-carrito"
    type="button"
    data-accion="eliminar"
    data-id="${producto.id}"
  >
    <span aria-hidden="true">×</span>
    Eliminar
  </button>

</div>

  

            <div class="col-md-2 text-md-end">

              <p class="mb-1">
                Subtotal
              </p>

              <strong>
                $ ${subtotal}
              </strong>

            </div>

          </div>

        </div>

      </article>
    `;

  });

  totalCarrito.textContent = `$ ${total}`;

}

function cambiarCantidad(idProducto, cambio) {

  const carrito = obtenerCarrito();

  const item = carrito.find(
    (item) => item.id === idProducto
  );

  const producto = productos.find(
    (producto) => producto.id === idProducto
  );

  if (!item || !producto) {
    return;
  }

  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad < 1) {
    window.mostrarMensaje?.(
      "La cantidad mínima es 1. Podés eliminar el producto."
    );

    return;
  }

  if (nuevaCantidad > producto.stock) {
    window.mostrarMensaje?.(
      "No hay más unidades disponibles."
    );

    return;
  }

  item.cantidad = nuevaCantidad;

  guardarCarrito(carrito);
  mostrarCarrito();

}

function eliminarDelCarrito(idProducto) {

  const carrito = obtenerCarrito();

  const nuevoCarrito = carrito.filter(
    (item) => item.id !== idProducto
  );

  guardarCarrito(nuevoCarrito);
  mostrarCarrito();

  window.mostrarMensaje?.(
    "El producto fue eliminado del carrito."
  );

}

mostrarCarrito();

if (listaCarrito) {

  listaCarrito.addEventListener("click", (evento) => {

    const boton = evento.target.closest(
      "[data-accion]"
    );

    if (!boton) {
      return;
    }

    const idProducto = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "aumentar") {
      cambiarCantidad(idProducto, 1);
    }

    if (accion === "disminuir") {
      cambiarCantidad(idProducto, -1);
    }

    if (accion === "eliminar") {
      eliminarDelCarrito(idProducto);
    }

  });

}

const botonConfirmarCompra =
  document.querySelector("#confirmar-compra");

const elementoModalCompra =
  document.querySelector("#modal-confirmar-compra");

const botonFinalizarCompra =
  document.querySelector("#finalizar-compra");

const totalModalCompra =
  document.querySelector("#total-modal-compra");

let modalCompra;

if (
  botonConfirmarCompra &&
  elementoModalCompra &&
  totalModalCompra
) {

  modalCompra = new bootstrap.Modal(
    elementoModalCompra
  );

  botonConfirmarCompra.addEventListener(
    "click",
    () => {

      const carrito = obtenerCarrito();

      if (carrito.length === 0) {
        window.mostrarMensaje?.(
          "El carrito está vacío."
        );

        return;
      }

      totalModalCompra.textContent =
        totalCarrito.textContent;

      modalCompra.show();

    }
  );

}

if (
  botonFinalizarCompra &&
  modalCompra
) {

  botonFinalizarCompra.addEventListener(
    "click",
    () => {

      guardarCarrito([]);
      mostrarCarrito();

      modalCompra.hide();

      window.mostrarMensaje?.(
        "¡Compra confirmada correctamente!"
      );

    }
  );

}

