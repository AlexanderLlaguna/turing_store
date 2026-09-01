const contenedorDetalle =
  document.querySelector("#detalle-producto");

const parametrosURL =
  new URLSearchParams(window.location.search);

const idProducto =
  parametrosURL.get("id");

const productoSeleccionado =
  productos.find(
    (producto) =>
      producto.id === idProducto
  );

function crearTextoValoracion(resumen) {
  const promedio =
    resumen.promedio
      .toFixed(1)
      .replace(".", ",");

  const palabra =
    resumen.cantidad === 1
      ? "valoración"
      : "valoraciones";

  return (
    `${promedio} ` +
    `(${resumen.cantidad} ${palabra})`
  );
}

if (productoSeleccionado) {
  const resumenValoracion =
    obtenerResumenValoracion(
      productoSeleccionado
    );

  contenedorDetalle.innerHTML = /* html */ `
    <div class="row align-items-center g-5">
      <div class="col-lg-6">
        <div class="product-image rounded">
          <img
            src="${productoSeleccionado.imagen}"
            alt="${productoSeleccionado.nombre}"
            class="img-fluid"
          />
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

        <section
          class="valoracion-detalle"
          aria-labelledby="titulo-valoracion"
        >
          <div
            class="valoracion-resumen"
            id="resumen-valoracion"
          >
            <span id="estrellas-promedio">
              ${crearEstrellas(
    resumenValoracion.promedio
  )}
            </span>

            <span
              class="valoracion-texto"
              id="texto-valoracion"
            >
              ${crearTextoValoracion(
    resumenValoracion
  )}
            </span>
          </div>

          <p
            class="titulo-calificacion"
            id="titulo-valoracion"
          >
            Calificá este producto
          </p>

          <div
            class="estrellas-interactivas"
            id="estrellas-interactivas"
            role="group"
            aria-label="Seleccionar una calificación"
          >
            ${[1, 2, 3, 4, 5]
      .map(
        (valor) => `
                  <button
                    class="estrella-boton"
                    type="button"
                    data-valor="${valor}"
                    aria-label="${valor} de 5 estrellas"
                    aria-pressed="false"
                    title="${valor} de 5"
                  >
                    ★
                  </button>
                `
      )
      .join("")}
          </div>

          <small
            class="mensaje-valoracion"
            id="mensaje-valoracion"
          >
            Seleccioná entre 1 y 5 estrellas.
          </small>
        </section>

        <p>
          <strong>
            Stock disponible:
            ${productoSeleccionado.stock}
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
    contenedorDetalle.querySelector(
      "#agregar-carrito"
    );

  const estrellasPromedio =
    contenedorDetalle.querySelector(
      "#estrellas-promedio"
    );

  const textoValoracion =
    contenedorDetalle.querySelector(
      "#texto-valoracion"
    );

  const contenedorEstrellas =
    contenedorDetalle.querySelector(
      "#estrellas-interactivas"
    );

  const mensajeValoracion =
    contenedorDetalle.querySelector(
      "#mensaje-valoracion"
    );

  const botonesEstrella =
    contenedorDetalle.querySelectorAll(
      ".estrella-boton"
    );

  function actualizarValoracionDetalle() {
    const resumen =
      obtenerResumenValoracion(
        productoSeleccionado
      );

    estrellasPromedio.innerHTML =
      crearEstrellas(resumen.promedio);

    textoValoracion.textContent =
      crearTextoValoracion(resumen);

    botonesEstrella.forEach((boton) => {
      const valor =
        Number(boton.dataset.valor);

      boton.classList.toggle(
        "seleccionada",
        valor <= resumen.valorUsuario
      );

      boton.setAttribute(
        "aria-pressed",
        valor === resumen.valorUsuario
          ? "true"
          : "false"
      );
    });

    mensajeValoracion.textContent =
      resumen.valorUsuario > 0
        ? `Tu calificación: ${resumen.valorUsuario} de 5 estrellas.`
        : "Seleccioná entre 1 y 5 estrellas.";
  }

  botonAgregar.addEventListener(
    "click",
    () => {
      const resultado =
        agregarAlCarrito(
          productoSeleccionado.id
        );

      window.mostrarMensaje?.(
        resultado.mensaje
      );
    }
  );

  contenedorEstrellas.addEventListener(
    "click",
    (evento) => {
      const boton =
        evento.target.closest(
          ".estrella-boton"
        );

      if (!boton) {
        return;
      }

      const valor =
        Number(boton.dataset.valor);

      guardarValoracion(
        productoSeleccionado.id,
        valor
      );

      actualizarValoracionDetalle();

      window.mostrarMensaje?.(
        "¡Gracias por tu valoración!"
      );
    }
  );

  actualizarValoracionDetalle();
} else {
  contenedorDetalle.innerHTML = /* html */ `
    <div
      class="alert alert-warning text-center"
      role="alert"
    >
      <h1 class="h4">
        Producto no encontrado
      </h1>

      <p>
        El producto solicitado no existe
        o el enlace es incorrecto.
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