import { auth, db } from "./config.js";
import { obtenerProductos } from "./productos-firestore.js";

import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const CLAVE_CARRITO = "turingStoreCarrito";

export function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
  } catch (error) {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  window.actualizarContadorCarrito?.();
}

export function agregarAlCarrito(producto) {
  if (!producto || producto.disponible === false || Number(producto.stock) < 1) {
    return { exito: false, mensaje: "El producto no está disponible." };
  }

  const carrito = obtenerCarrito();
  const item = carrito.find((productoCarrito) => productoCarrito.id === producto.id);

  if (item) {
    if (item.cantidad >= Number(producto.stock)) {
      return { exito: false, mensaje: "No hay más unidades disponibles." };
    }
    item.cantidad++;
  } else {
    carrito.push({ id: producto.id, cantidad: 1 });
  }

  guardarCarrito(carrito);
  return { exito: true, mensaje: `${producto.nombre} fue agregado al carrito.` };
}

const listaCarrito = document.querySelector("#lista-carrito");
const carritoVacio = document.querySelector("#carrito-vacio");
const contenidoCarrito = document.querySelector("#contenido-carrito");
const totalCarrito = document.querySelector("#total-carrito");
const botonConfirmarCompra = document.querySelector("#confirmar-compra");
const elementoModalCompra = document.querySelector("#modal-confirmar-compra");
const botonFinalizarCompra = document.querySelector("#finalizar-compra");
const totalModalCompra = document.querySelector("#total-modal-compra");

let productosDisponibles = [];
let modalCompra;

function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

function calcularTotal(carrito) {
  return carrito.reduce((total, item) => {
    const producto = productosDisponibles.find((actual) => actual.id === item.id);
    return total + (producto ? Number(producto.precio) * item.cantidad : 0);
  }, 0);
}

function mostrarCarrito() {
  if (!listaCarrito) return;

  const carrito = obtenerCarrito();
  listaCarrito.innerHTML = "";

  if (!carrito.length) {
    carritoVacio.hidden = false;
    contenidoCarrito.hidden = true;
    return;
  }

  carritoVacio.hidden = true;
  contenidoCarrito.hidden = false;

  carrito.forEach((item) => {
    const producto = productosDisponibles.find((actual) => actual.id === item.id);
    if (!producto) return;

    const subtotal = Number(producto.precio) * item.cantidad;
    listaCarrito.insertAdjacentHTML("beforeend", `
      <article class="card border-0 shadow-sm carrito-item">
        <div class="card-body">
          <div class="row align-items-center g-3">
            <div class="col-md-3">
              <img src="${producto.imagen}" alt="${producto.nombre}"
                class="img-fluid rounded carrito-imagen">
            </div>
            <div class="col-md-5">
              <span class="eyebrow">${producto.categoria}</span>
              <h2 class="h5 mt-2">${producto.nombre}</h2>
              <p class="text-secondary mb-0">Precio unitario: ${formatearPrecio(producto.precio)}</p>
            </div>
            <div class="col-md-2">
              <span class="cantidad-etiqueta">Cantidad</span>
              <div class="selector-cantidad" role="group"
                aria-label="Modificar cantidad de ${producto.nombre}">
                <button class="cantidad-boton" type="button" data-accion="disminuir"
                  data-id="${producto.id}" aria-label="Disminuir cantidad">−</button>
                <span class="cantidad-valor" aria-live="polite">${item.cantidad}</span>
                <button class="cantidad-boton" type="button" data-accion="aumentar"
                  data-id="${producto.id}" aria-label="Aumentar cantidad">+</button>
              </div>
              <small class="cantidad-stock">Stock máximo: ${producto.stock}</small>
              <button class="btn-eliminar-carrito" type="button" data-accion="eliminar"
                data-id="${producto.id}"><span aria-hidden="true">×</span> Eliminar</button>
            </div>
            <div class="col-md-2 text-md-end">
              <p class="mb-1">Subtotal</p>
              <strong>${formatearPrecio(subtotal)}</strong>
            </div>
          </div>
        </div>
      </article>
    `);
  });

  totalCarrito.textContent = formatearPrecio(calcularTotal(carrito));
}

function cambiarCantidad(idProducto, cambio) {
  const carrito = obtenerCarrito();
  const item = carrito.find((actual) => actual.id === idProducto);
  const producto = productosDisponibles.find((actual) => actual.id === idProducto);
  if (!item || !producto) return;

  const nuevaCantidad = item.cantidad + cambio;
  if (nuevaCantidad < 1) {
    window.mostrarMensaje?.("La cantidad mínima es 1. Puedes eliminar el producto.");
    return;
  }
  if (nuevaCantidad > Number(producto.stock)) {
    window.mostrarMensaje?.("No hay más unidades disponibles.");
    return;
  }

  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  mostrarCarrito();
}

function eliminarDelCarrito(idProducto) {
  guardarCarrito(obtenerCarrito().filter((item) => item.id !== idProducto));
  mostrarCarrito();
  window.mostrarMensaje?.("El producto fue eliminado del carrito.");
}

function generarNumeroPedido() {
  const ahora = new Date();

  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const codigo = String(Date.now()).slice(-6);

  return `TS-${anio}${mes}${dia}-${codigo}`;
}

async function registrarCompra() {
  const usuario = auth.currentUser;
  const carrito = obtenerCarrito();

  if (!usuario) {
    throw new Error("Debes iniciar sesión antes de confirmar la compra.");
  }
  if (!carrito.length) {
    throw new Error("El carrito está vacío.");
  }

  const numeroPedido = generarNumeroPedido();
  const referenciaPedido = doc(collection(db, "pedidos"));

  await runTransaction(db, async (transaccion) => {
    const detalles = [];
    let total = 0;

    // En una transacción todas las lecturas se realizan antes de las escrituras.
    for (const item of carrito) {
      const referenciaProducto = doc(db, "productos", item.id);
      const documentoProducto = await transaccion.get(referenciaProducto);

      if (!documentoProducto.exists()) {
        throw new Error("Uno de los productos ya no existe.");
      }

      const producto = documentoProducto.data();
      const stockActual = Number(producto.stock);

      if (producto.disponible === false || stockActual < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}.`);
      }

      const precio = Number(producto.precio);
      const subtotal = precio * item.cantidad;
      total += subtotal;
      detalles.push({
        productoId: item.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio,
        subtotal,
        stockActual,
      });
    }

    detalles.forEach((detalle) => {
      const nuevoStock = detalle.stockActual - detalle.cantidad;
      transaccion.update(doc(db, "productos", detalle.productoId), {
        stock: nuevoStock,
        disponible: nuevoStock > 0,
        actualizadoEn: serverTimestamp(),
      });
    });

    transaccion.set(referenciaPedido, {
      numeroPedido,
      usuarioId: usuario.uid,
      usuarioCorreo: usuario.email,
      productos: detalles.map(({ stockActual, ...detalle }) => detalle),
      total,
      fecha: serverTimestamp(),
      estado: "confirmado",
    });
  });

  return numeroPedido;
}

async function iniciarPaginaCarrito() {
  if (!listaCarrito) return;

  try {
    productosDisponibles = await obtenerProductos();
    mostrarCarrito();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    window.mostrarMensaje?.("No fue posible consultar los productos de Firestore.");
  }

  listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;

    if (boton.dataset.accion === "aumentar") cambiarCantidad(boton.dataset.id, 1);
    if (boton.dataset.accion === "disminuir") cambiarCantidad(boton.dataset.id, -1);
    if (boton.dataset.accion === "eliminar") eliminarDelCarrito(boton.dataset.id);
  });

  if (elementoModalCompra && totalModalCompra) {
    modalCompra = new bootstrap.Modal(elementoModalCompra);
  }

  botonConfirmarCompra?.addEventListener("click", () => {
    if (!auth.currentUser) {
      window.mostrarMensaje?.("Debes iniciar sesión para comprar.");
      setTimeout(() => { window.location.href = "login.html"; }, 1200);
      return;
    }

    if (!obtenerCarrito().length) {
      window.mostrarMensaje?.("El carrito está vacío.");
      return;
    }

    totalModalCompra.textContent = totalCarrito.textContent;
    modalCompra.show();
  });

  botonFinalizarCompra?.addEventListener("click", async () => {
    const textoOriginal = botonFinalizarCompra.textContent;
    botonFinalizarCompra.disabled = true;
    botonFinalizarCompra.textContent = "Procesando...";

    try {
      const pedidoId = await registrarCompra();
      guardarCarrito([]);
      modalCompra.hide();
      productosDisponibles = await obtenerProductos();
      mostrarCarrito();
      window.mostrarMensaje?.(`Compra confirmada. Pedido: ${pedidoId}`);
    } catch (error) {
      console.error("Error al confirmar la compra:", error);
      window.mostrarMensaje?.(error.message || "No fue posible confirmar la compra.");
    } finally {
      botonFinalizarCompra.disabled = false;
      botonFinalizarCompra.textContent = textoOriginal;
    }
  });
}

iniciarPaginaCarrito();
