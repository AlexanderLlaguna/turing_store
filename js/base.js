document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = document.body.dataset.page;

  document.querySelectorAll("[data-page]").forEach((enlace) => {
    enlace.classList.toggle(
      "active",
      enlace.dataset.page === paginaActual
    );
  });

  const enlaceCarrito = document.querySelector(
    'a[data-page="carrito"]'
  );

  const botonIngresar = document.querySelector(
    "#btnLoginPlaceholder"
  );

  if (enlaceCarrito && botonIngresar) {
    const itemCarrito = enlaceCarrito.closest(".nav-item");
    const contenedorNavegacion = botonIngresar.parentElement;

    const contenedorAcciones = document.createElement("div");

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

    contenedorAcciones.appendChild(enlaceCarrito);
    contenedorAcciones.appendChild(botonIngresar);

    itemCarrito?.remove();
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
          localStorage.getItem("turingStoreCarrito")
        ) || [];
    } catch (error) {
      carrito = [];
    }

    const cantidadTotal = carrito.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );

    contador.textContent = cantidadTotal;
  }

  window.actualizarContadorCarrito =
    actualizarContadorCarrito;

  actualizarContadorCarrito();

  const toastElement = document.querySelector("#appToast");
  const toastMessage = document.querySelector("#toastMessage");

  window.mostrarMensaje = (mensaje) => {
    if (!toastElement || !toastMessage) {
      return;
    }

    toastMessage.textContent = mensaje;

    bootstrap.Toast
      .getOrCreateInstance(toastElement)
      .show();
  };

  botonIngresar?.addEventListener("click", () => {
    window.mostrarMensaje(
      "El inicio de sesión será desarrollado en el Sprint 3."
    );
  });
});