const ESTADOS = ['libre', 'ocupada', 'lista'];
const NOMBRES = { libre: 'Libre', ocupada: 'Ocupada', lista: 'Lista para entregar' };

/**
 * Plano del local con las 9 mesas en rejilla 3×3.
 * `borradores` = números de mesa con pedido sin confirmar en este navegador.
 */
export function MapaMesas(mesas, { abierta = null, borradores = [] } = {}) {
  const cuenta = (estado) => mesas.filter((m) => m.estado === estado).length;

  return `
    <div class="leyenda-mesas" aria-label="Leyenda de estados">
      ${ESTADOS.map((e) => `<span class="ley ley-${e}"><i></i>${NOMBRES[e]} (${cuenta(e)})</span>`).join('')}
    </div>
    <div class="plano">
      <div class="plano-zona">🍳 Cocina · Barra</div>
      <div class="mapa">
        ${mesas
          .map(
            (m) => `
          <button type="button" class="mesa mesa-${m.estado} ${abierta === m.numero ? 'seleccionada' : ''}"
            data-mesa="${m.numero}" aria-label="Mesa ${m.numero}: ${m.estado_nombre}">
            <span class="mesa-num">${m.numero}</span>
            <span class="mesa-txt">${m.estado_nombre}</span>
            ${m.platos ? `<small>${m.platos} plato(s)</small>` : ''}
            ${borradores.includes(m.numero) ? '<small>✎ pedido sin confirmar</small>' : ''}
          </button>`,
          )
          .join('')}
      </div>
      <div class="plano-zona abajo">🚪 Entrada</div>
    </div>
  `;
}
