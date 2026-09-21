import { auth, db } from "./config.js";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

export function crearEstrellas(promedio) {
  const porcentaje = Math.max(0, Math.min(100, (promedio / 5) * 100));

  return `
    <span class="estrellas" style="--relleno-estrellas: ${porcentaje}%"
      aria-label="${promedio.toFixed(1)} de 5 estrellas">
      <span class="estrellas-base" aria-hidden="true">★★★★★</span>
      <span class="estrellas-relleno" aria-hidden="true">★★★★★</span>
    </span>
  `;
}

export function calcularResumen(valoraciones) {
  const cantidad = valoraciones.length;
  const suma = valoraciones.reduce(
    (total, valoracion) => total + Number(valoracion.puntuacion || 0),
    0
  );

  return {
    promedio: cantidad ? suma / cantidad : 0,
    cantidad,
  };
}

export async function obtenerTodasLasValoraciones() {
  const respuesta = await getDocs(collection(db, "valoraciones"));
  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function obtenerValoracionesProducto(idProducto) {
  const consulta = query(
    collection(db, "valoraciones"),
    where("productoId", "==", idProducto)
  );

  const respuesta = await getDocs(consulta);
  return respuesta.docs
    .map((documento) => ({ id: documento.id, ...documento.data() }))
    .sort((a, b) => {
      const fechaA = a.fecha?.toMillis?.() || 0;
      const fechaB = b.fecha?.toMillis?.() || 0;
      return fechaB - fechaA;
    });
}

export async function guardarValoracion(idProducto, puntuacion, comentario) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para publicar una valoración.");
  }

  const puntaje = Number(puntuacion);
  const texto = comentario.trim();

  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    throw new Error("Selecciona una puntuación entre 1 y 5 estrellas.");
  }

  if (texto.length < 3 || texto.length > 300) {
    throw new Error("El comentario debe tener entre 3 y 300 caracteres.");
  }

  // Un documento por usuario y producto: una nueva opinión actualiza la anterior.
  const idValoracion = `${usuario.uid}_${idProducto}`;

  await setDoc(doc(db, "valoraciones", idValoracion), {
    usuarioId: usuario.uid,
    usuarioNombre: usuario.displayName || usuario.email || "Usuario",
    productoId: idProducto,
    puntuacion: puntaje,
    comentario: texto,
    fecha: serverTimestamp(),
  });
}
