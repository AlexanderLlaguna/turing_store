const contenedorProductos = document.querySelector("#lista-productos");

function mostrarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    for (const producto of listaProductos) {
        contenedorProductos.innerHTML += `
      <div class="col-md-6 col-xl-3">
        <article class="product-card">
          <div class="product-image">
            <img src="${producto.imagen}" alt="${producto.nombre}">
          </div>

          <div class="p-4 d-flex flex-column flex-grow-1">
            <span class="eyebrow">${producto.categoria}</span>

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
}

mostrarProductos(productos);