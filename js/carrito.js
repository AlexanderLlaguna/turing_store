const CLAVE_CARRITO = "turingStoreCarrito";

function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);

  if (!carritoGuardado) {
    return [];
  }

  try {
    return JSON.parse(carritoGuardado);
  } catch (error) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify(carrito)
  );

  window.actualizarContadorCarrito?.();
}

function agregarAlCarrito(idProducto) {
  const productoSeleccionado = productos.find(
    (producto) => producto.id === idProducto
  );

  if (!productoSeleccionado) {
    return {
      exito: false,
      mensaje: "El producto no existe.",
    };
  }

  const carrito = obtenerCarrito();

  const productoEnCarrito = carrito.find(
    (item) => item.id === idProducto
  );

  if (productoEnCarrito) {
    if (productoEnCarrito.cantidad >= productoSeleccionado.stock) {
      return {
        exito: false,
        mensaje: "No hay más unidades disponibles.",
      };
    }

    productoEnCarrito.cantidad++;
  } else {
    carrito.push({
      id: idProducto,
      cantidad: 1,
    });
  }

  guardarCarrito(carrito);

  return {
    exito: true,
    mensaje: `${productoSeleccionado.nombre} fue agregado al carrito.`,
  };
}