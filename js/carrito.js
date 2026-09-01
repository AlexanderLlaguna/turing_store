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

    listaCarrito.innerHTML += `
      <article class="card border-0 shadow-sm">

        <div class="card-body">

          <div class="row align-items-center g-3">

            <div class="col-md-3">
              <img
                src="${producto.imagen}"
                alt="${producto.nombre}"
                class="img-fluid rounded"
              >
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

              <p class="mb-1">
                Cantidad
              </p>

              <strong>
                ${item.cantidad}
              </strong>

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

mostrarCarrito();