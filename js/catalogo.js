const contenedorProductos = document.querySelector("#lista-productos");
const campoBusqueda = document.querySelector("#buscarProducto");
const filtroCategoria = document.querySelector("#filtroCategoria");
const botonLimpiar = document.querySelector("#limpiarFiltros");
const cantidadResultados = document.querySelector("#cantidadResultados");

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
    contenedorProductos.innerHTML += `
      <div class="col-md-6 col-xl-3">
        <article class="product-card">
          <div class="product-image">
            <img
              src="${producto.imagen}"
              alt="${producto.nombre}"
            >
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

            <p class="small">
              Stock disponible: ${producto.stock}
            </p>

            <div
              class="mt-auto d-flex justify-content-between align-items-center gap-2"
            >
              <strong class="price">
                $ ${producto.precio}
              </strong>

              <a
                class="btn btn-primary btn-sm"
                href="producto.html?id=${producto.id}"
              >
                Ver producto
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  const palabraProducto =
    listaProductos.length === 1 ? "producto encontrado" : "productos encontrados";

  cantidadResultados.textContent =
    `${listaProductos.length} ${palabraProducto}`;
}

function aplicarFiltros() {
  const textoBuscado = normalizarTexto(campoBusqueda.value.trim());
  const categoriaSeleccionada = filtroCategoria.value;

  const productosFiltrados = productos.filter((producto) => {
    const nombre = normalizarTexto(producto.nombre);
    const descripcion = normalizarTexto(producto.descripcion);

    const coincideBusqueda =
      nombre.includes(textoBuscado) ||
      descripcion.includes(textoBuscado);

    const coincideCategoria =
      categoriaSeleccionada === "todas" ||
      producto.categoria === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  mostrarProductos(productosFiltrados);
}

campoBusqueda.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);

botonLimpiar.addEventListener("click", () => {
  campoBusqueda.value = "";
  filtroCategoria.value = "todas";
  aplicarFiltros();
});

mostrarProductos(productos);