import { auth, db } from "./config.js";
import { cargarProductosIniciales, obtenerProductos } from "./productos-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargando = document.querySelector("#cargandoAdmin");
const accesoDenegado = document.querySelector("#accesoDenegado");
const contenido = document.querySelector("#contenidoAdmin");
const botonCargar = document.querySelector("#btnCargarProductos");
const tablaPedidos = document.querySelector("#tablaPedidos");

function formatearPrecio(valor) {
  return `$ ${Number(valor).toLocaleString("es-UY")}`;
}

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = texto || "";
  return elemento.innerHTML;
}

async function actualizarPanel() {
  const [productos, respuestaPedidos] = await Promise.all([
    obtenerProductos(),
    getDocs(collection(db, "pedidos")),
  ]);

  const pedidos = respuestaPedidos.docs
    .map((documento) => ({ id: documento.id, ...documento.data() }))
    .sort((a, b) => (b.fecha?.toMillis?.() || 0) - (a.fecha?.toMillis?.() || 0));

  document.querySelector("#totalProductos").textContent = productos.length;
  document.querySelector("#totalPedidos").textContent = pedidos.length;

  tablaPedidos.innerHTML = pedidos.length
    ? pedidos.map((pedido) => `
        <tr>
          <td><small>${pedido.id}</small></td>
          <td>${escaparHTML(pedido.usuarioCorreo || pedido.usuarioId)}</td>
          <td>${pedido.fecha?.toDate?.().toLocaleString("es-UY") || "Pendiente"}</td>
          <td><span class="badge text-bg-success text-capitalize">${escaparHTML(pedido.estado)}</span></td>
          <td><strong>${formatearPrecio(pedido.total)}</strong></td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="text-center text-secondary py-4">No hay pedidos registrados.</td></tr>`;
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  try {
    const perfil = await getDoc(doc(db, "usuarios", usuario.uid));
    const esAdmin = perfil.exists() && perfil.data().rol === "admin";

    cargando.classList.add("d-none");
    if (!esAdmin) {
      accesoDenegado.classList.remove("d-none");
      return;
    }

    contenido.classList.remove("d-none");
    await actualizarPanel();
  } catch (error) {
    console.error("Error al abrir administración:", error);
    cargando.classList.add("d-none");
    accesoDenegado.textContent = "No fue posible comprobar los permisos de administración.";
    accesoDenegado.classList.remove("d-none");
  }
});

botonCargar.addEventListener("click", async () => {
  const textoOriginal = botonCargar.textContent;
  botonCargar.disabled = true;
  botonCargar.textContent = "Cargando...";

  try {
    const cantidad = await cargarProductosIniciales();
    window.mostrarMensaje?.(
      cantidad
        ? `${cantidad} productos fueron cargados en Firestore.`
        : "Los productos iniciales ya estaban cargados."
    );
    await actualizarPanel();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    window.mostrarMensaje?.("No fue posible cargar los productos. Revisa las reglas y el rol admin.");
  } finally {
    botonCargar.disabled = false;
    botonCargar.textContent = textoOriginal;
  }
});
