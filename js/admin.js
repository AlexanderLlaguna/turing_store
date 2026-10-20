import { auth, db } from "./config.js";

import {
  cargarProductosIniciales,
  obtenerProductos
} from "./productos-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargando = document.querySelector("#cargandoAdmin");
const accesoDenegado = document.querySelector("#accesoDenegado");
const contenido = document.querySelector("#contenidoAdmin");
const botonCargar = document.querySelector("#btnCargarProductos");
const tablaPedidos = document.querySelector("#tablaPedidos");
const tablaProductos = document.querySelector("#tablaProductos");

const formulario = document.querySelector("#formProducto");
const campos = document.querySelector("#camposProducto");
const mensaje = document.querySelector("#mensajeProducto");
const tituloFormulario = document.querySelector("#tituloFormularioProducto");
const botonGuardar = document.querySelector("#btnGuardarProducto");
const botonCancelar = document.querySelector("#btnCancelarEdicion");

const productoId = document.querySelector("#productoId");
const nombre = document.querySelector("#productoNombre");
const categoria = document.querySelector("#productoCategoria");
const precio = document.querySelector("#productoPrecio");
const stock = document.querySelector("#productoStock");
const descripcion = document.querySelector("#productoDescripcion");
const imagen = document.querySelector("#productoImagen");

const categoriasPermitidas = [
  "Periféricos",
  "Audio",
  "Almacenamiento",
  "Conectividad"
];

let productosActuales = [];
let administrador = false;
let guardando = false;

// Conserva el mismo identificador si falla una creación y se reintenta.
let referenciaNueva = null;

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-UY", {
    style: "currency",
    currency: "UYU"
  });
}

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = String(texto ?? "");
  return elemento.innerHTML;
}

function mostrarAviso(texto, tipo = "success") {
  mensaje.className = `alert alert-${tipo}`;
  mensaje.textContent = texto;
}

function limpiarFormulario() {
  formulario.reset();
  productoId.value = "";
  referenciaNueva = null;
  tituloFormulario.textContent = "Crear producto";
  botonGuardar.textContent = "Crear producto";
  botonCancelar.hidden = true;
}

function mostrarProductos(productos) {
  // Los valores se agregan como texto para evitar interpretar HTML.
  tablaProductos.replaceChildren();

  if (!productos.length) {
    const fila = tablaProductos.insertRow();
    const celda = fila.insertCell();
    celda.colSpan = 6;
    celda.className = "text-center text-secondary py-4";
    celda.textContent = "No hay productos registrados.";
    return;
  }

  productos.forEach((producto) => {
    const fila = tablaProductos.insertRow();

    [
      producto.nombre,
      producto.categoria,
      formatearPrecio(producto.precio),
      producto.stock,
      producto.disponible && producto.stock > 0
        ? "Disponible"
        : "No disponible"
    ].forEach((valor) => {
      fila.insertCell().textContent = String(valor ?? "");
    });

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-outline-primary btn-sm";
    boton.textContent = "Editar";
    boton.disabled = guardando;
    boton.addEventListener("click", () => editarProducto(producto.id));

    fila.insertCell().append(boton);
  });
}

async function actualizarProductos() {
  productosActuales = await obtenerProductos();

  document.querySelector("#totalProductos").textContent =
    productosActuales.length;

  botonCargar.classList.toggle(
    "d-none",
    productosActuales.length > 0
  );

  mostrarProductos(productosActuales);
}

async function actualizarPedidos() {
  const respuesta = await getDocs(collection(db, "pedidos"));

  const pedidos = respuesta.docs
    .map((documento) => ({
      ...documento.data(),
      id: documento.id
    }))
    .sort(
      (a, b) =>
        (b.fecha?.toMillis?.() || 0) -
        (a.fecha?.toMillis?.() || 0)
    );

  document.querySelector("#totalPedidos").textContent = pedidos.length;

  tablaPedidos.innerHTML = pedidos.length
    ? pedidos.map((pedido) => `
        <tr>
          <td>
            <small>
              ${escaparHTML(pedido.numeroPedido || pedido.id)}
            </small>
          </td>
          <td>
            ${escaparHTML(pedido.usuarioCorreo || pedido.usuarioId)}
          </td>
          <td>
            ${escaparHTML(
      pedido.fecha?.toDate?.().toLocaleString("es-UY") ||
      "Pendiente"
    )}
          </td>
          <td>
            <span class="badge text-bg-success text-capitalize">
              ${escaparHTML(pedido.estado)}
            </span>
          </td>
          <td>
            <strong>${formatearPrecio(pedido.total)}</strong>
          </td>
        </tr>
      `).join("")
    : `
        <tr>
          <td colspan="5" class="text-center text-secondary py-4">
            No hay pedidos registrados.
          </td>
        </tr>
      `;
}

function editarProducto(id) {
  if (!administrador || guardando) return;

  const producto = productosActuales.find((item) => item.id === id);
  if (!producto) return;

  referenciaNueva = null;
  productoId.value = producto.id;
  nombre.value = producto.nombre || "";
  categoria.value = producto.categoria || "";
  precio.value = producto.precio ?? "";
  stock.value = producto.stock ?? 0;
  descripcion.value = producto.descripcion || "";
  imagen.value = producto.imagen || "";

  tituloFormulario.textContent = "Editar producto";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mensaje.className = "alert d-none";
  mensaje.textContent = "";

  formulario.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  nombre.focus({ preventScroll: true });
}

function obtenerDatosValidados() {
  const nombreIngresado = nombre.value.trim();
  const categoriaIngresada = categoria.value;
  const precioIngresado = Number(precio.value);
  const stockIngresado = Number(stock.value);
  const descripcionIngresada = descripcion.value.trim();
  const imagenIngresada = imagen.value.trim();

  if (nombreIngresado.length < 2 || nombreIngresado.length > 100) {
    throw new Error("El nombre debe tener entre 2 y 100 caracteres.");
  }

  if (!categoriasPermitidas.includes(categoriaIngresada)) {
    throw new Error("Seleccioná una categoría válida.");
  }

  if (!Number.isFinite(precioIngresado) || precioIngresado <= 0) {
    throw new Error("El precio debe ser mayor que cero.");
  }

  if (
    stock.value.trim() === "" ||
    !Number.isSafeInteger(stockIngresado) ||
    stockIngresado < 0
  ) {
    throw new Error("El stock debe ser un número entero igual o mayor que cero.");
  }

  if (!descripcionIngresada || descripcionIngresada.length > 1000) {
    throw new Error("Ingresá una descripción de hasta 1000 caracteres.");
  }

  let imagenValida = false;

  // Permite archivos dentro de assets, sin salir de esa carpeta.
  if (/^\.\.\/assets\/[^?#]+$/i.test(imagenIngresada)) {
    const segmentos = imagenIngresada.slice(10).split("/");
    imagenValida = segmentos.every(
      (segmento) =>
        segmento &&
        segmento !== "." &&
        segmento !== ".." &&
        !segmento.includes("\\") &&
        !segmento.includes("%")
    );
  } else {
    try {
      const enlace = new URL(imagenIngresada);
      imagenValida =
        enlace.protocol === "https:" &&
        !enlace.username &&
        !enlace.password;
    } catch {
      imagenValida = false;
    }
  }

  if (!imagenValida || imagenIngresada.length > 2000) {
    throw new Error("Usá una ruta ../assets/archivo.jpg o un enlace HTTPS válido.");
  }

  return {
    nombre: nombreIngresado,
    categoria: categoriaIngresada,
    precio: precioIngresado,
    stock: stockIngresado,
    descripcion: descripcionIngresada,
    imagen: imagenIngresada,
    disponible: stockIngresado > 0,
    actualizadoEn: serverTimestamp()
  };
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!administrador || guardando) return;
  if (!formulario.reportValidity()) return;

  let datos;

  try {
    datos = obtenerDatosValidados();
  } catch (error) {
    mostrarAviso(error.message, "danger");
    return;
  }

  const id = productoId.value;
  const esEdicion = Boolean(id);
  let guardado = false;

  guardando = true;
  campos.disabled = true;
  botonCargar.disabled = true;
  botonGuardar.textContent = "Guardando...";

  tablaProductos.querySelectorAll("button").forEach((boton) => {
    boton.disabled = true;
  });

  try {
    if (esEdicion) {
      await updateDoc(doc(db, "productos", id), datos);
    } else {
      referenciaNueva ??= doc(collection(db, "productos"));
      await setDoc(referenciaNueva, datos);
    }

    guardado = true;
    limpiarFormulario();

    mostrarAviso(
      esEdicion
        ? "Producto actualizado correctamente."
        : "Producto creado correctamente."
    );

    await actualizarProductos();
  } catch (error) {
    console.error("Error al guardar o actualizar el listado:", error);

    mostrarAviso(
      guardado
        ? "El producto se guardó, pero no se pudo actualizar el listado. Recargá la página."
        : "No se pudo guardar el producto. Revisá tu conexión, el rol admin y las reglas de Firestore.",
      guardado ? "warning" : "danger"
    );
  } finally {
    guardando = false;
    campos.disabled = !administrador;
    botonCargar.disabled = !administrador;

    botonGuardar.textContent = productoId.value
      ? "Guardar cambios"
      : "Crear producto";

    tablaProductos.querySelectorAll("button").forEach((boton) => {
      boton.disabled = !administrador;
    });
  }
});

botonCancelar.addEventListener("click", () => {
  if (guardando) return;
  limpiarFormulario();
  mensaje.className = "alert d-none";
  mensaje.textContent = "";
});

onAuthStateChanged(auth, async (usuario) => {
  administrador = false;
  campos.disabled = true;
  contenido.classList.add("d-none");

  if (!usuario) {
    window.location.replace("login.html");
    return;
  }

  try {
    const perfil = await getDoc(doc(db, "usuarios", usuario.uid));

    // Evita mostrar el panel si la sesión cambió durante la consulta.
    if (auth.currentUser?.uid !== usuario.uid) return;

    administrador =
      perfil.exists() &&
      perfil.data().rol === "admin";

    if (!administrador) {
      accesoDenegado.textContent =
        "No tienes permisos para ingresar al panel administrativo. " +
        "Serás redirigido al inicio.";

      accesoDenegado.classList.remove("d-none");

      setTimeout(() => {
        window.location.replace("../index.html");
      }, 2500);

      return;
    }

    accesoDenegado.classList.add("d-none");
    contenido.classList.remove("d-none");
    campos.disabled = false;

    // Un error en pedidos no impide cargar los productos.
    const resultados = await Promise.allSettled([
      actualizarProductos(),
      actualizarPedidos()
    ]);

    resultados.forEach((resultado, indice) => {
      if (resultado.status === "rejected") {
        console.error(
          indice === 0
            ? "Error al cargar productos:"
            : "Error al cargar pedidos:",
          resultado.reason
        );
      }
    });

    if (resultados.some((resultado) => resultado.status === "rejected")) {
      mostrarAviso(
        "No se pudo cargar toda la información del panel. Revisá la conexión y los permisos de Firestore.",
        "warning"
      );
    }
  } catch (error) {
    console.error("Error al comprobar permisos:", error);

    administrador = false;
    contenido.classList.add("d-none");
    accesoDenegado.textContent =
      "No fue posible comprobar los permisos de administración.";
    accesoDenegado.classList.remove("d-none");
  } finally {
    cargando.classList.add("d-none");
  }
});

botonCargar.addEventListener("click", async () => {
  if (!administrador || guardando) return;

  const textoOriginal = botonCargar.textContent;

  guardando = true;
  botonCargar.disabled = true;
  campos.disabled = true;
  botonCargar.textContent = "Cargando...";

  tablaProductos.querySelectorAll("button").forEach((boton) => {
    boton.disabled = true;
  });

  let cargaCompletada = false;

  try {
    const cantidad = await cargarProductosIniciales();
    cargaCompletada = true;

    mostrarAviso(
      cantidad
        ? `${cantidad} productos fueron cargados en Firestore.`
        : "Los productos iniciales ya estaban cargados."
    );

    await actualizarProductos();
  } catch (error) {
    console.error("Error al cargar productos:", error);

    mostrarAviso(
      cargaCompletada
        ? "La carga terminó, pero no se pudo actualizar el listado. Recargá la página."
        : "No fue posible cargar los productos. Revisá las reglas y el rol admin.",
      cargaCompletada ? "warning" : "danger"
    );
  } finally {
    guardando = false;
    botonCargar.disabled = !administrador;
    campos.disabled = !administrador;
    botonCargar.textContent = textoOriginal;

    tablaProductos.querySelectorAll("button").forEach((boton) => {
      boton.disabled = !administrador;
    });
  }
});