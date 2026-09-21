import { agregarAlCarrito } from "./carrito.js";
import { obtenerProductos } from "./productos-firestore.js";
import {
  calcularResumen,
  crearEstrellas,
  obtenerTodasLasValoraciones,
} from "./valoraciones.js";

const contenedorProductos = document.querySelector("#lista-productos");
const campoBusqueda = document.querySelector("#buscarProducto");
const filtroCategoria = document.querySelector("#filtroCategoria");
const ordenProductos = document.querySelector("#ordenProductos");
const botonLimpiar = document.querySelector("#limpiarFiltros");
const cantidadResultados = document.querySelector("#cantidadResultados");

let productos = [];
let resumenes = new Map();

function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

function mostrarProductos(listaProductos) {
  contenedorProductos.innerHTML = "";

  if (!listaProductos.length) {
    contenedorProductos.innerHTML = `
      <div class="col-12"><div class="alert alert-warning" role="alert">
        No se encontraron productos con esos filtros.
      </div></div>`;
  }

  listaProductos.forEach((producto) => {
    const resumen = resumenes.get(producto.id) || { promedio: 0, cantidad: 0 };
    const disponible = producto.disponible !== false && Number(producto.stock) > 0;

    contenedorProductos.insertAdjacentHTML("beforeend", `
      <div class="col-md-6 col-xl-3">
        <article class="product-card">
          <div class="product-image"><img src="${producto.imagen}" alt="${producto.nombre}"></div>
          <div class="p-4 d-flex flex-column flex-grow-1">
            <span class="eyebrow">${producto.categoria}</span>
            <h2 class="h5 mt-2">${producto.nombre}</h2>
            <p class="text-secondary small">${producto.descripcion}</p>
            <div class="valoracion-resumen">
              ${crearEstrellas(resumen.promedio)}
              <span class="valoracion-texto">
                ${resumen.promedio.toFixed(1).replace(".", ",")} (${resumen.cantidad})
              </span>
            </div>
            <p class="small mt-3">Stock disponible: ${producto.stock}</p>
            <div class="mt-auto">
              <strong class="price">${formatearPrecio(producto.precio)}</strong>
              <div class="d-grid gap-2 mt-3">
                <a class="btn btn-outline-primary btn-sm"
                  href="producto.html?id=${producto.id}">Ver producto</a>
                <button class="btn btn-primary btn-sm btn-agregar-carrito" type="button"
                  data-id="${producto.id}" ${disponible ? "" : "disabled"}>
                  ${disponible ? "Agregar al carrito" : "Sin stock"}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>`);
  });

  cantidadResultados.textContent = `${listaProductos.length} ${
    listaProductos.length === 1 ? "producto encontrado" : "productos encontrados"
  }`;
}

function aplicarFiltros() {
  const textoBuscado = normalizarTexto(campoBusqueda.value.trim());
  const categoriaSeleccionada = filtroCategoria.value;

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = normalizarTexto(producto.nombre).includes(textoBuscado)
      || normalizarTexto(producto.descripcion).includes(textoBuscado);
    const coincideCategoria = categoriaSeleccionada === "todas"
      || producto.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  const productosOrdenados = [...productosFiltrados];
  if (ordenProductos.value === "nombre-asc") {
    productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }
  if (ordenProductos.value === "precio-asc") {
    productosOrdenados.sort((a, b) => Number(a.precio) - Number(b.precio));
  }
  if (ordenProductos.value === "precio-desc") {
    productosOrdenados.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  mostrarProductos(productosOrdenados);
}

campoBusqueda.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);
ordenProductos.addEventListener("change", aplicarFiltros);
botonLimpiar.addEventListener("click", () => {
  campoBusqueda.value = "";
  filtroCategoria.value = "todas";
  ordenProductos.value = "predeterminado";
  aplicarFiltros();
});

contenedorProductos.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-agregar-carrito");
  if (!boton) return;
  const producto = productos.find((actual) => actual.id === boton.dataset.id);
  window.mostrarMensaje?.(agregarAlCarrito(producto).mensaje);
});

async function cargarCatalogo() {
  try {
    const [productosFirestore, valoraciones] = await Promise.all([
      obtenerProductos(),
      obtenerTodasLasValoraciones(),
    ]);

    productos = productosFirestore;
    resumenes = new Map(
      productos.map((producto) => [
        producto.id,
        calcularResumen(valoraciones.filter((item) => item.productoId === producto.id)),
      ])
    );

    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
    contenedorProductos.innerHTML = `
      <div class="col-12"><div class="alert alert-danger" role="alert">
        No fue posible cargar los productos desde Firestore.
      </div></div>`;
    cantidadResultados.textContent = "Catálogo no disponible";
  }
}

cargarCatalogo();
