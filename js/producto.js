import { agregarAlCarrito } from "./carrito.js";
import { obtenerProducto } from "./productos-firestore.js";
import {
  calcularResumen,
  crearEstrellas,
  guardarValoracion,
  obtenerValoracionesProducto,
} from "./valoraciones.js";

const contenedorDetalle = document.querySelector("#detalle-producto");
const idProducto = new URLSearchParams(window.location.search).get("id");
let productoSeleccionado;
let puntuacionSeleccionada = 0;

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = texto || "";
  return elemento.innerHTML;
}

function formatearFecha(fecha) {
  return fecha?.toDate?.().toLocaleDateString("es-UY") || "Recién publicada";
}

function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

function crearTextoValoracion(resumen) {
  const promedio = resumen.promedio.toFixed(1).replace(".", ",");
  return `${promedio} (${resumen.cantidad} ${
    resumen.cantidad === 1 ? "valoración" : "valoraciones"
  })`;
}

function renderizarDetalle(valoraciones) {
  const resumen = calcularResumen(valoraciones);
  const disponible = productoSeleccionado.disponible !== false
    && Number(productoSeleccionado.stock) > 0;

  contenedorDetalle.innerHTML = `
    <div class="row align-items-center g-5">
      <div class="col-lg-6">
        <div class="product-image rounded">
          <img src="${productoSeleccionado.imagen}" alt="${productoSeleccionado.nombre}"
            class="img-fluid">
        </div>
      </div>
      <div class="col-lg-6">
        <span class="eyebrow">${productoSeleccionado.categoria}</span>
        <h1 class="display-5 fw-bold mt-2">${productoSeleccionado.nombre}</h1>
        <p class="lead text-secondary">${productoSeleccionado.descripcion}</p>
        <div class="valoracion-resumen mb-3">
          ${crearEstrellas(resumen.promedio)}
          <span class="valoracion-texto">${crearTextoValoracion(resumen)}</span>
        </div>
        <p><strong>Stock disponible: ${productoSeleccionado.stock}</strong></p>
        <p class="display-6 fw-bold">${formatearPrecio(productoSeleccionado.precio)}</p>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary" id="agregar-carrito" type="button"
            ${disponible ? "" : "disabled"}>
            ${disponible ? "Agregar al carrito" : "Sin stock"}
          </button>
          <a class="btn btn-outline-primary" href="catalogo.html">Volver al catálogo</a>
        </div>
      </div>
    </div>

    <section class="valoraciones-firestore mt-5" aria-labelledby="titulo-opiniones">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card shadow-sm h-100"><div class="card-body p-4">
            <h2 class="h4" id="titulo-opiniones">Escribe tu opinión</h2>
            <p class="text-secondary small">Debes iniciar sesión. Tu nueva opinión reemplazará la anterior.</p>
            <form id="form-valoracion">
              <fieldset class="border-0 p-0 mb-3">
                <legend class="h6">Puntuación</legend>
                <div class="estrellas-interactivas" id="estrellas-interactivas">
                  ${[1, 2, 3, 4, 5].map((valor) => `
                    <button class="estrella-boton" type="button" data-valor="${valor}"
                      aria-label="${valor} de 5 estrellas" aria-pressed="false">★</button>
                  `).join("")}
                </div>
              </fieldset>
              <label class="form-label" for="comentario-valoracion">Comentario</label>
              <textarea class="form-control" id="comentario-valoracion" rows="4"
                minlength="3" maxlength="300" required></textarea>
              <div class="form-text"><span id="contador-comentario">0</span>/300 caracteres</div>
              <button class="btn btn-primary mt-3" type="submit">Publicar valoración</button>
            </form>
          </div></div>
        </div>
        <div class="col-lg-7">
          <h2 class="h4 mb-3">Opiniones de usuarios</h2>
          <div id="lista-valoraciones">
            ${valoraciones.length ? valoraciones.map((valoracion) => `
              <article class="card mb-3"><div class="card-body">
                <div class="d-flex justify-content-between gap-3 flex-wrap">
                  <strong>${escaparHTML(valoracion.usuarioNombre)}</strong>
                  <small class="text-secondary">${formatearFecha(valoracion.fecha)}</small>
                </div>
                <div class="my-2">${crearEstrellas(Number(valoracion.puntuacion))}</div>
                <p class="mb-0">${escaparHTML(valoracion.comentario)}</p>
              </div></article>
            `).join("") : `
              <div class="alert alert-info">Todavía no hay opiniones para este producto.</div>
            `}
          </div>
        </div>
      </div>
    </section>
  `;

  contenedorDetalle.querySelector("#agregar-carrito")?.addEventListener("click", () => {
    window.mostrarMensaje?.(agregarAlCarrito(productoSeleccionado).mensaje);
  });

  const botonesEstrella = contenedorDetalle.querySelectorAll(".estrella-boton");
  botonesEstrella.forEach((boton) => {
    boton.addEventListener("click", () => {
      puntuacionSeleccionada = Number(boton.dataset.valor);
      botonesEstrella.forEach((actual) => {
        const seleccionada = Number(actual.dataset.valor) <= puntuacionSeleccionada;
        actual.classList.toggle("seleccionada", seleccionada);
        actual.setAttribute("aria-pressed", seleccionada ? "true" : "false");
      });
    });
  });

  const comentario = contenedorDetalle.querySelector("#comentario-valoracion");
  comentario.addEventListener("input", () => {
    contenedorDetalle.querySelector("#contador-comentario").textContent = comentario.value.length;
  });

  contenedorDetalle.querySelector("#form-valoracion").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = evento.submitter;
    boton.disabled = true;
    boton.textContent = "Publicando...";

    try {
      await guardarValoracion(productoSeleccionado.id, puntuacionSeleccionada, comentario.value);
      window.mostrarMensaje?.("Tu valoración fue guardada correctamente.");
      puntuacionSeleccionada = 0;
      renderizarDetalle(await obtenerValoracionesProducto(productoSeleccionado.id));
    } catch (error) {
      window.mostrarMensaje?.(error.message || "No fue posible guardar la valoración.");
    } finally {
      if (boton.isConnected) {
        boton.disabled = false;
        boton.textContent = "Publicar valoración";
      }
    }
  });
}

async function cargarDetalle() {
  if (!idProducto) {
    contenedorDetalle.innerHTML = `<div class="alert alert-warning">Producto no encontrado.</div>`;
    return;
  }

  try {
    const [producto, valoraciones] = await Promise.all([
      obtenerProducto(idProducto),
      obtenerValoracionesProducto(idProducto),
    ]);
    productoSeleccionado = producto;

    if (!productoSeleccionado) {
      contenedorDetalle.innerHTML = `
        <div class="alert alert-warning text-center" role="alert">
          <h1 class="h4">Producto no encontrado</h1>
          <a class="btn btn-primary" href="catalogo.html">Volver al catálogo</a>
        </div>`;
      return;
    }

    renderizarDetalle(valoraciones);
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    contenedorDetalle.innerHTML = `
      <div class="alert alert-danger">No fue posible consultar el producto en Firestore.</div>`;
  }
}

cargarDetalle();
