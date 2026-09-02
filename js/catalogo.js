const contenedorProductos =
  document.querySelector("#lista-productos");

const campoBusqueda =
  document.querySelector("#buscarProducto");

const filtroCategoria =
  document.querySelector("#filtroCategoria");

const ordenProductos =
  document.querySelector("#ordenProductos");

const botonLimpiar =
  document.querySelector("#limpiarFiltros");

const cantidadResultados =
  document.querySelector("#cantidadResultados");

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mostrarProductos(listaProductos) {
  contenedorProductos.innerHTML = "";

  if (listaProductos.length === 0) {
    contenedorProductos.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning" role="alert">
          No se encontraron productos con esos filtros.
        </div>
      </div>
    `;
  }

  for (const producto of listaProductos) {
    const resumenValoracion =
      obtenerResumenValoracion(producto);

    const promedioFormateado =
      resumenValoracion.promedio
        .toFixed(1)
        .replace(".", ",");

    const palabraValoracion =
      resumenValoracion.cantidad === 1
        ? "valoración"
        : "valoraciones";

    contenedorProductos.innerHTML += /* html */ `
      <div class="col-md-6 col-xl-3">
        <article class="product-card">
          <div class="product-image">
            <img
              src="${producto.imagen}"
              alt="${producto.nombre}"
            />
          </div>

          <div class="p-4 d-flex flex-column flex-grow-1">
            <span class="eyebrow">
              ${producto.categoria}
            </span>

            <h2 class="h5 mt-2">
              ${producto.nombre}
            </h2>

            <p class="text-secondary small">
              ${producto.descripcion}
            </p>

            <div class="valoracion-resumen">
              ${crearEstrellas(
      resumenValoracion.promedio
    )}

              <span class="valoracion-texto">
                ${promedioFormateado}
                (${resumenValoracion.cantidad}
                ${palabraValoracion})
              </span>
            </div>

            <p class="small mt-3">
              Stock disponible: ${producto.stock}
            </p>

            <div class="mt-auto">
              <strong class="price">
                $ ${producto.precio}
              </strong>

              <div class="d-grid gap-2 mt-3">
                <a
                  class="btn btn-outline-primary btn-sm"
                  href="producto.html?id=${producto.id}"
                >
                  Ver producto
                </a>

                <button
                  class="btn btn-primary btn-sm btn-agregar-carrito"
                  type="button"
                  data-id="${producto.id}"
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  const palabraProducto =
    listaProductos.length === 1
      ? "producto encontrado"
      : "productos encontrados";

  cantidadResultados.textContent =
    `${listaProductos.length} ${palabraProducto}`;
}

function aplicarFiltros() {
  const textoBuscado = normalizarTexto(
    campoBusqueda.value.trim()
  );

  const categoriaSeleccionada =
    filtroCategoria.value;

  const productosFiltrados = productos.filter(
    (producto) => {
      const nombre =
        normalizarTexto(producto.nombre);

      const descripcion =
        normalizarTexto(producto.descripcion);

      const coincideBusqueda =
        nombre.includes(textoBuscado) ||
        descripcion.includes(textoBuscado);

      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        producto.categoria ===
        categoriaSeleccionada;

      return (
        coincideBusqueda &&
        coincideCategoria
      );
    }
  );

  const productosOrdenados = [
    ...productosFiltrados,
  ];

  if (ordenProductos.value === "nombre-asc") {
    productosOrdenados.sort(
      (productoA, productoB) =>
        productoA.nombre.localeCompare(
          productoB.nombre,
          "es"
        )
    );
  }

  if (ordenProductos.value === "precio-asc") {
    productosOrdenados.sort(
      (productoA, productoB) =>
        productoA.precio - productoB.precio
    );
  }

  if (ordenProductos.value === "precio-desc") {
    productosOrdenados.sort(
      (productoA, productoB) =>
        productoB.precio - productoA.precio
    );
  }

  mostrarProductos(productosOrdenados);
}

campoBusqueda.addEventListener(
  "input",
  aplicarFiltros
);

filtroCategoria.addEventListener(
  "change",
  aplicarFiltros
);

ordenProductos.addEventListener(
  "change",
  aplicarFiltros
);

botonLimpiar.addEventListener("click", () => {
  campoBusqueda.value = "";
  filtroCategoria.value = "todas";
  ordenProductos.value = "predeterminado";
  aplicarFiltros();
});

mostrarProductos(productos);

contenedorProductos.addEventListener(
  "click",
  (evento) => {
    const botonAgregar =
      evento.target.closest(
        ".btn-agregar-carrito"
      );

    if (!botonAgregar) {
      return;
    }

    const resultado = agregarAlCarrito(
      botonAgregar.dataset.id
    );

    window.mostrarMensaje?.(
      resultado.mensaje
    );
  }
);
