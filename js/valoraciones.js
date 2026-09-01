const CLAVE_VALORACIONES =
  "turingStoreValoraciones";

function obtenerValoracionesUsuario() {
  const valoracionesGuardadas =
    localStorage.getItem(CLAVE_VALORACIONES);

  if (!valoracionesGuardadas) {
    return {};
  }

  try {
    return JSON.parse(valoracionesGuardadas);
  } catch (error) {
    return {};
  }
}

function obtenerValoracionUsuario(idProducto) {
  const valoraciones =
    obtenerValoracionesUsuario();

  return valoraciones[idProducto] || 0;
}

function guardarValoracion(
  idProducto,
  valor
) {
  const valoraciones =
    obtenerValoracionesUsuario();

  valoraciones[idProducto] = valor;

  localStorage.setItem(
    CLAVE_VALORACIONES,
    JSON.stringify(valoraciones)
  );
}

function obtenerResumenValoracion(producto) {
  const promedioInicial =
    producto.calificacion || 0;

  const cantidadInicial =
    producto.valoraciones || 0;

  const valorUsuario =
    obtenerValoracionUsuario(producto.id);

  let totalPuntos =
    promedioInicial * cantidadInicial;

  let cantidadTotal = cantidadInicial;

  if (valorUsuario > 0) {
    totalPuntos += valorUsuario;
    cantidadTotal++;
  }

  const promedio =
    cantidadTotal > 0
      ? totalPuntos / cantidadTotal
      : 0;

  return {
    promedio,
    cantidad: cantidadTotal,
    valorUsuario,
  };
}

function crearEstrellas(promedio) {
  const porcentaje = Math.max(
    0,
    Math.min(100, (promedio / 5) * 100)
  );

  return `
    <span
      class="estrellas"
      style="--relleno-estrellas: ${porcentaje}%"
      aria-label="${promedio.toFixed(1)} de 5 estrellas"
    >
      <span class="estrellas-base" aria-hidden="true">
        ★★★★★
      </span>

      <span class="estrellas-relleno" aria-hidden="true">
        ★★★★★
      </span>
    </span>
  `;
}