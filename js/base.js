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
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.601 2.326A7.854 7.854 0 0 0
        7.994 0C3.627 0 .068 3.558.064 7.926c0
        1.399.366 2.76 1.057 3.965L0 16l4.204-1.102
        a7.933 7.933 0 0 0 3.79.965h.004c4.368
        0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0
        -2.327-5.607zm-5.607 12.2a6.6 6.6 0 0 1
        -3.356-.92l-.24-.144-2.493.653.666-2.433
        -.156-.251a6.56 6.56 0 0 1-1.007-3.505
        c0-3.642 2.964-6.606 6.61-6.606a6.566
        6.566 0 0 1 4.673 1.94 6.56 6.56 0 0 1
        1.93 4.677c-.004 3.643-2.968 6.59-6.627
        6.59"
      />

      <path
        d="M11.62 9.81c-.2-.1-1.174-.578-1.355
        -.644-.182-.066-.314-.1-.445.1-.132.2
        -.513.644-.629.775-.115.132-.23.148-.43
        .05-.2-.1-.84-.31-1.6-.99-.59-.525-.99
        -1.176-1.105-1.376-.116-.2-.013-.307.087
        -.407.09-.09.2-.23.3-.345.1-.116.132-.2
        .2-.33.066-.132.033-.248-.017-.347-.05
        -.1-.445-1.076-.61-1.47-.16-.389-.323
        -.336-.445-.342-.115-.006-.247-.007-.379
        -.007a.729.729 0 0 0-.529.248c-.182.198
        -.695.68-.695 1.657s.712 1.92.81 2.052
        c.1.132 1.4 2.137 3.393 2.997.474.205.845
        .328 1.132.42.476.151.91.13 1.252.079
        .382-.057 1.174-.48 1.34-.943.165-.462
        .165-.858.116-.943-.05-.084-.182-.132
        -.38-.23"
      />
    </svg>
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