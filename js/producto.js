const contenedorDetalle =
  document.querySelector("#detalle-producto");

const parametrosURL =
  new URLSearchParams(window.location.search);

const idProducto = parametrosURL.get("id");

const productoSeleccionado = productos.find(
  (producto) => producto.id === idProducto
);

if (productoSeleccionado) {

  contenedorDetalle.innerHTML = `
    <div class="row align-items-center g-5">

      <div class="col-lg-6">
        <div class="product-image rounded">
          <img
            src="${productoSeleccionado.imagen}"
            alt="${productoSeleccionado.nombre}"
            class="img-fluid"
          >
        </div>
      </div>

      <div class="col-lg-6">

        <span class="eyebrow">
          ${productoSeleccionado.categoria}
        </span>

        <h1 class="display-5 fw-bold mt-2">
          ${productoSeleccionado.nombre}
        </h1>

        <p class="lead text-secondary">
          ${productoSeleccionado.descripcion}
        </p>

        <p>
          <strong>
            Stock disponible: ${productoSeleccionado.stock}
          </strong>
        </p>

        <p class="display-6 fw-bold">
          $ ${productoSeleccionado.precio}
        </p>

        <div class="d-flex flex-wrap gap-2">

          <button
            class="btn btn-primary"
            id="agregar-carrito"
            type="button"
          >
            Agregar al carrito
          </button>

          <a
            class="btn btn-outline-primary"
            href="catalogo.html"
          >
            Volver al catálogo
          </a>

        </div>

      </div>

    </div>
  `;

  const botonAgregar =
    contenedorDetalle.querySelector("#agregar-carrito");

  botonAgregar.addEventListener("click", () => {

    const resultado = agregarAlCarrito(
      productoSeleccionado.id
    );

    window.mostrarMensaje?.(resultado.mensaje);

  });

} else {

  contenedorDetalle.innerHTML = `
    <div
      class="alert alert-warning text-center"
      role="alert"
    >
      <h1 class="h4">
        Producto no encontrado
      </h1>

      <p>
        El producto solicitado no existe o el enlace es incorrecto.
      </p>

      <a
        class="btn btn-primary"
        href="catalogo.html"
      >
        Volver al catálogo
      </a>
    </div>
  `;

}