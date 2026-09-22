const CLAVE_ESCALA_VISUAL = "turingStoreEscalaVisual";
const ESCALA_MINIMA = 100;
const ESCALA_MAXIMA = 200;
const PASO_ESCALA = 25;

function limitarEscala(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return ESCALA_MINIMA;
  }

  const escalaAjustada =
    Math.round(numero / PASO_ESCALA) * PASO_ESCALA;

  return Math.min(
    ESCALA_MAXIMA,
    Math.max(ESCALA_MINIMA, escalaAjustada)
  );
}

function obtenerEscalaGuardada() {
  try {
    const escalaGuardada = localStorage.getItem(
      CLAVE_ESCALA_VISUAL
    );

    return escalaGuardada
      ? limitarEscala(escalaGuardada)
      : ESCALA_MINIMA;
  } catch (error) {
    return ESCALA_MINIMA;
  }
}

function aplicarEscalaVisual(valor) {
  const escala = limitarEscala(valor);

  document.documentElement.style.fontSize =
    `${escala}%`;

  document.documentElement.dataset.escalaVisual =
    escala;

  return escala;
}

function guardarEscalaVisual(valor) {
  const escala = aplicarEscalaVisual(valor);

  try {
    localStorage.setItem(
      CLAVE_ESCALA_VISUAL,
      escala.toString()
    );
  } catch (error) {
    console.warn(
      "No fue posible guardar la escala visual.",
      error
    );
  }

  return escala;
}

// Aplica la preferencia antes de crear el control.
let escalaVisualActual = aplicarEscalaVisual(
  obtenerEscalaGuardada()
);

function crearControlAccesibilidad() {
  const contenedor = document.createElement("div");

  contenedor.className =
    "dropdown control-accesibilidad";

  contenedor.innerHTML = `
    <button
      class="btn btn-outline-light btn-sm boton-accesibilidad"
      id="btnAccesibilidad"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="false"
      aria-label="Abrir opciones de accesibilidad visual"
      title="Accesibilidad visual"
    >
      <span aria-hidden="true">A±</span>
    </button>

    <div
      class="dropdown-menu dropdown-menu-end panel-accesibilidad"
      aria-labelledby="btnAccesibilidad"
    >
      <div class="accesibilidad-encabezado">
        <div>
          <strong>Accesibilidad visual</strong>

          <small>
            Aumentá el tamaño del contenido
          </small>
        </div>

        <span
          class="escala-actual"
          id="valorEscalaVisual"
          aria-live="polite"
        >
          ${escalaVisualActual}%
        </span>
      </div>

      <div class="control-escala">
        <button
          class="btn btn-escala"
          id="btnDisminuirEscala"
          type="button"
          aria-label="Disminuir tamaño"
        >
          A−
        </button>

        <input
          class="form-range"
          id="controlEscalaVisual"
          type="range"
          min="${ESCALA_MINIMA}"
          max="${ESCALA_MAXIMA}"
          step="${PASO_ESCALA}"
          value="${escalaVisualActual}"
          aria-label="Tamaño del contenido"
          aria-valuetext="${escalaVisualActual} por ciento"
        />

        <button
          class="btn btn-escala"
          id="btnAumentarEscala"
          type="button"
          aria-label="Aumentar tamaño"
        >
          A+
        </button>
      </div>

      <div class="marcas-escala" aria-hidden="true">
        <span>100%</span>
        <span>150%</span>
        <span>200%</span>
      </div>

      <button
        class="btn btn-restablecer-escala w-100"
        id="btnRestablecerEscala"
        type="button"
      >
        Restablecer tamaño
      </button>
    </div>
  `;

  const controlEscala = contenedor.querySelector(
    "#controlEscalaVisual"
  );

  const valorEscala = contenedor.querySelector(
    "#valorEscalaVisual"
  );

  const botonDisminuir = contenedor.querySelector(
    "#btnDisminuirEscala"
  );

  const botonAumentar = contenedor.querySelector(
    "#btnAumentarEscala"
  );

  const botonRestablecer = contenedor.querySelector(
    "#btnRestablecerEscala"
  );

  function actualizarControl(valor) {
    escalaVisualActual = guardarEscalaVisual(valor);

    controlEscala.value = escalaVisualActual;

    controlEscala.setAttribute(
      "aria-valuetext",
      `${escalaVisualActual} por ciento`
    );

    valorEscala.textContent =
      `${escalaVisualActual}%`;

    botonDisminuir.disabled =
      escalaVisualActual <= ESCALA_MINIMA;

    botonAumentar.disabled =
      escalaVisualActual >= ESCALA_MAXIMA;
  }

  controlEscala.addEventListener(
    "input",
    () => {
      actualizarControl(controlEscala.value);
    }
  );

  botonDisminuir.addEventListener(
    "click",
    () => {
      actualizarControl(
        escalaVisualActual - PASO_ESCALA
      );
    }
  );

  botonAumentar.addEventListener(
    "click",
    () => {
      actualizarControl(
        escalaVisualActual + PASO_ESCALA
      );
    }
  );

  botonRestablecer.addEventListener(
    "click",
    () => {
      actualizarControl(ESCALA_MINIMA);
    }
  );

  actualizarControl(escalaVisualActual);

  return contenedor;
}

document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = document.body.dataset.page;

  document.querySelectorAll("[data-page]").forEach(
    (enlace) => {
      enlace.classList.toggle(
        "active",
        enlace.dataset.page === paginaActual
      );
    }
  );

  const enlaceCarrito = document.querySelector(
    'a[data-page="carrito"]'
  );

  const botonIngresar = document.querySelector(
    "#btnLoginPlaceholder, #btnCerrarSesion"
  );
  const nombreUsuarioNavbar = document.querySelector(
    "#nombreUsuarioNavbar"
  );

  if (enlaceCarrito && botonIngresar) {
    const itemCarrito =
      enlaceCarrito.closest(".nav-item");

    const contenedorNavegacion =
      botonIngresar.parentElement;

    const contenedorAcciones =
      document.createElement("div");

    contenedorAcciones.className =
      "d-flex align-items-center gap-3 mt-3 mt-lg-0";

    contenedorNavegacion.insertBefore(
      contenedorAcciones,
      botonIngresar
    );

    enlaceCarrito.className =
      paginaActual === "carrito"
        ? "btn btn-light btn-sm d-flex align-items-center gap-2"
        : "btn btn-outline-light btn-sm d-flex align-items-center gap-2";

    enlaceCarrito.setAttribute(
      "aria-label",
      "Abrir carrito de compras"
    );

    enlaceCarrito.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1
          .485.379L2.89 3H14.5a.5.5 0 0 1
          .491.592l-1.5 8A.5.5 0 0 1 13
          12H4a.5.5 0 0 1-.491-.408L1.61
          2H.5a.5.5 0 0 1-.5-.5zM5
          13a1 1 0 1 0 0 2 1 1 0 0 0
          0-2zm7 0a1 1 0 1 0 0 2 1 1
          0 0 0 0-2z"
        />
      </svg>

      <span id="contadorCarrito">0</span>
    `;

    contenedorAcciones.appendChild(
      crearControlAccesibilidad()
    );

    contenedorAcciones.appendChild(enlaceCarrito);

    if (nombreUsuarioNavbar) {
      nombreUsuarioNavbar.classList.remove(
        "me-lg-3",
        "mt-2",
        "mt-lg-0"
      );

      contenedorAcciones.appendChild(
        nombreUsuarioNavbar
      );
    }

    contenedorAcciones.appendChild(botonIngresar);

    itemCarrito?.remove();
  } else {
    const contenedorNavegacion =
      document.querySelector(".navbar-collapse");

    if (contenedorNavegacion) {
      const controlAccesibilidad =
        crearControlAccesibilidad();

      controlAccesibilidad.classList.add(
        "mt-3",
        "mt-lg-0",
        "ms-lg-auto"
      );

      contenedorNavegacion.appendChild(
        controlAccesibilidad
      );
    }
  }

  function actualizarContadorCarrito() {
    const contador = document.querySelector(
      "#contadorCarrito"
    );

    if (!contador) {
      return;
    }

    let carrito = [];

    try {
      carrito =
        JSON.parse(
          localStorage.getItem(
            "turingStoreCarrito"
          )
        ) || [];
    } catch (error) {
      carrito = [];
    }

    const cantidadTotal = carrito.reduce(
      (total, producto) =>
        total + producto.cantidad,
      0
    );

    contador.textContent = cantidadTotal;
  }

  window.actualizarContadorCarrito =
    actualizarContadorCarrito;

  actualizarContadorCarrito();

  const toastElement =
    document.querySelector("#appToast");

  const toastMessage =
    document.querySelector("#toastMessage");

  window.mostrarMensaje = (mensaje) => {
    if (!toastElement || !toastMessage) {
      return;
    }

    toastMessage.textContent = mensaje;

    bootstrap.Toast
      .getOrCreateInstance(toastElement)
      .show();
  };
});

function crearBotonWhatsApp() {
  if (
    document.querySelector(
      ".whatsapp-flotante"
    )
  ) {
    return;
  }

  const numeroWhatsApp = "59898291052";

  let mensaje =
    "Hola, quisiera realizar una consulta sobre Turing Store.";

  const idProducto =
    new URLSearchParams(
      window.location.search
    ).get("id");

  if (
    idProducto &&
    typeof productos !== "undefined"
  ) {
    const productoSeleccionado =
      productos.find(
        (producto) =>
          producto.id === idProducto
      );

    if (productoSeleccionado) {
      mensaje =
        `Hola, quisiera consultar por el producto: ` +
        `${productoSeleccionado.nombre}.`;
    }
  }

  const enlaceWhatsApp =
    document.createElement("a");

  enlaceWhatsApp.className =
    "whatsapp-flotante";

  enlaceWhatsApp.href =
    `https://wa.me/${numeroWhatsApp}` +
    `?text=${encodeURIComponent(mensaje)}`;

  enlaceWhatsApp.target = "_blank";
  enlaceWhatsApp.rel = "noopener noreferrer";

  enlaceWhatsApp.setAttribute(
    "aria-label",
    "Consultar por WhatsApp"
  );

  enlaceWhatsApp.innerHTML = `
    <span class="whatsapp-icono" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M21 11.5a8.4 8.4 0 0 1-9 8.5
             9.5 9.5 0 0 1-4-.9L3 21l1.7-4.6
             A8.5 8.5 0 1 1 21 11.5Z"
        ></path>

        <path
          d="M8.5 8.5c.5 3 2 4.5 5 5"
        ></path>
      </svg>
    </span>

    <span class="whatsapp-texto">
      <strong>¿Necesitás ayuda?</strong>
      <small>Escribinos por WhatsApp</small>
    </span>
  `;

  document.body.appendChild(enlaceWhatsApp);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    crearBotonWhatsApp
  );
} else {
  crearBotonWhatsApp();
}