import { db } from "./config.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Estos datos sirven únicamente para realizar la carga inicial desde el panel
// administrativo. El catálogo siempre se consulta desde Cloud Firestore.
export const productosIniciales = [
  {
    id: "p1",
    nombre: "Teclado mecánico T-80",
    descripcion: "Formato compacto, retroiluminación suave y conexión USB.",
    categoria: "Periféricos",
    precio: 2490,
    stock: 8,
    disponible: true,
    imagen: "../assets/teclado_mecanico_T_80.jpg",
  },
  {
    id: "p2",
    nombre: "Mouse gamer Flow M2",
    descripcion: "Diseño ergonómico, iluminación RGB y conexión USB.",
    categoria: "Periféricos",
    precio: 890,
    stock: 12,
    disponible: true,
    imagen: "../assets/mouse_inalambrico_flowM2.jpg",
  },
  {
    id: "p3",
    nombre: "Auriculares Pulse H7",
    descripcion: "Sonido claro, almohadillas cómodas y micrófono integrado.",
    categoria: "Audio",
    precio: 1790,
    stock: 6,
    disponible: true,
    imagen: "../assets/auriculares_pulse_H7.jpg",
  },
  {
    id: "p4",
    nombre: "Pendrive USB-C 64 GB",
    descripcion: "Compacto, resistente y compatible con USB-C y USB-A.",
    categoria: "Almacenamiento",
    precio: 690,
    stock: 15,
    disponible: true,
    imagen: "../assets/pendrive_USB_C_64_GB.jpg",
  },
  {
    id: "p5",
    nombre: "Parlantes Bluetooth JBL",
    descripcion: "Sonido estéreo, conexión Bluetooth y diseño compacto.",
    categoria: "Audio",
    precio: 1490,
    stock: 10,
    disponible: true,
    imagen: "../assets/parlantes_bluetooth_JBL.jpg",
  },
  {
    id: "p6",
    nombre: "SSD externo WD 1 TB",
    descripcion: "Almacenamiento portátil de alta velocidad con conexión USB.",
    categoria: "Almacenamiento",
    precio: 3290,
    stock: 7,
    disponible: true,
    imagen: "../assets/ssd_externo_WD_1TB.jpg",
  },
  {
    id: "p7",
    nombre: "Hub USB-C TP-Link 6 en 1",
    descripcion: "Amplía la conectividad con puertos USB, HDMI y lector de tarjetas.",
    categoria: "Conectividad",
    precio: 1890,
    stock: 9,
    disponible: true,
    imagen: "../assets/hub_USB_C_TP-Link_6_en_1.jpg",
  },
  {
    id: "p8",
    nombre: "Adaptador Wi-Fi USB TP-Link Archer T2U",
    descripcion: "Conexión inalámbrica de doble banda en un formato compacto.",
    categoria: "Conectividad",
    precio: 990,
    stock: 14,
    disponible: true,
    imagen: "../assets/adaptador_wifi_USB_TP-Link-Archer-T2U.jpg",
  },
];

function normalizarProducto(documento) {
  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function obtenerProductos() {
  const respuesta = await getDocs(collection(db, "productos"));
  return respuesta.docs
    .map(normalizarProducto)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function obtenerProducto(idProducto) {
  const respuesta = await getDoc(doc(db, "productos", idProducto));
  return respuesta.exists() ? normalizarProducto(respuesta) : null;
}

export async function cargarProductosIniciales() {
  const existentes = await getDocs(collection(db, "productos"));
  const idsExistentes = new Set(existentes.docs.map((documento) => documento.id));
  const productosNuevos = productosIniciales.filter(
    (producto) => !idsExistentes.has(producto.id)
  );
  const lote = writeBatch(db);

  productosNuevos.forEach(({ id, ...datos }) => {
    lote.set(
      doc(db, "productos", id),
      {
        ...datos,
        actualizadoEn: serverTimestamp(),
      }
    );
  });

  if (productosNuevos.length) {
    await lote.commit();
  }

  return productosNuevos.length;
}
