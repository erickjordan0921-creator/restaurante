import { escapeHtml, formatCurrency, formatNumber, formatTime } from '../../utils/formatters.js';
import { empty, tag, tagPedido } from '../../utils/ui.js';

const TAG_MESA = { libre: 'ok', ocupada: 'warn', lista: 'info' };

export function PanelPedidoTitulo(mesa) {
  return `Mesa ${escapeHtml(mesa.numero)} ${tag(mesa.estado_nombre, TAG_MESA[mesa.estado])}`;
}

function PedidosDeMesa(mesa) {
  if (!mesa.pedidos.length) {
    return '';
  }

  return `
    <section class="panel-sec"><h3>Pedidos de la mesa</h3>
      ${mesa.pedidos
        .map(
          (p) => `
        <div class="pedido-mesa">
          <div class="pm-cab"><span><b>${p.codigo}</b> · ${formatTime(p.fecha)}</span>${tagPedido(p.estado)}</div>
          <ul>${p.items.map((it) => `<li>${it.cantidad} × ${escapeHtml(it.nombre)}</li>`).join('')}</ul>
          <div class="acciones">
            ${p.estado === 'listo' ? `<button class="btn btn-sinu sm" type="button" data-accion="entregar" data-id="${p.id}">Marcar entregado</button>` : ''}
            ${['pendiente', 'en preparación'].includes(p.estado) ? `<button class="btn btn-sinu sm peligro" type="button" data-accion="cancelar" data-id="${p.id}">Cancelar pedido</button>` : ''}
          </div>
        </div>`,
        )
        .join('')}
      <button class="btn btn-sinu w-100" type="button" data-accion="liberar"
        ${mesa.puede_liberar ? '' : 'disabled title="Disponible cuando todos los pedidos de la mesa estén entregados"'}>
        Liberar mesa
      </button>
    </section>
  `;
}

function Menu(menu, carrito) {
  const enCarrito = (id) => carrito.find((c) => c.plato_id === id)?.cantidad ?? 0;

  if (!menu.length) {
    return empty('No hay platos activos en el menú.');
  }

  return `<ul class="menu-lista">${menu
    .map((d) => {
      const c = enCarrito(d.plato.id);
      const puedeMas = d.disponible && c < d.posibles;
      const nombre = escapeHtml(d.plato.nombre);
      return `
        <li class="menu-fila ${d.disponible ? '' : 'agotado'}">
          <div class="mf-info">
            <b>${nombre}</b><span class="precio">${formatCurrency(d.plato.precio)}</span>
            ${d.disponible ? `<small>Disponibles: ${d.posibles}</small>` : `<span>${tag('No disponible', 'danger')}</span>`}
          </div>
          <div class="qty">
            <button type="button" data-accion="menos" data-id="${d.plato.id}" aria-label="Quitar uno de ${nombre}"
              ${c > 0 ? '' : 'disabled title="No hay unidades para quitar"'}>−</button>
            <span aria-live="polite">${c}</span>
            <button type="button" data-accion="mas" data-id="${d.plato.id}" aria-label="Agregar uno de ${nombre}"
              ${puedeMas ? '' : 'disabled title="Sin existencias suficientes para más unidades"'}>+</button>
          </div>
        </li>`;
    })
    .join('')}</ul>`;
}

/** Cuerpo del panel: pedidos de la mesa, menú con cantidades y resumen del borrador. */
export function PanelPedidoCuerpo(mesa, menu, carrito) {
  const plato = (id) => menu.find((d) => d.plato.id === id)?.plato;

  return `
    ${PedidosDeMesa(mesa)}
    <section class="panel-sec">
      <h3>${mesa.pedidos.length ? 'Agregar otro pedido' : 'Nuevo pedido'} · Menú</h3>
      ${Menu(menu, carrito)}
    </section>
    <section class="panel-sec"><h3>Resumen del pedido</h3>
      ${
        carrito.length
          ? `<ul class="resumen">${carrito
              .map((c) => {
                const p = plato(c.plato_id);
                return `<li><span>${c.cantidad} × ${escapeHtml(p.nombre)}</span><b>${formatCurrency(p.precio * c.cantidad)}</b></li>`;
              })
              .join('')}</ul>`
          : empty('Agregue platos con el botón +.')
      }
      <div id="peValidacion" class="mt-2"></div>
    </section>
  `;
}

export function PanelPedidoPie(total, hayItems) {
  const sinItems = hayItems ? '' : 'disabled title="Agregue al menos un plato"';
  return `
    <div class="total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    <div class="fila-botones">
      <button class="btn btn-sinu" type="button" data-accion="validar" ${sinItems}>Validar existencias</button>
      <button class="btn btn-sinu" type="button" data-accion="vaciar" ${sinItems}>Vaciar</button>
    </div>
    <button class="btn btn-sinu xl w-100" type="button" data-accion="confirmar" ${sinItems}>Confirmar pedido</button>
  `;
}

export function ResultadoValidacion(v) {
  if (v.ok) {
    return `<p>${tag('✓ Existencias suficientes', 'ok')}</p>`;
  }
  return `
    <div class="alerta danger"><div class="cuerpo"><b>${escapeHtml(v.mensaje)}</b>
      ${v.faltantes
        .map((f) => `<br />${escapeHtml(f.insumo)}: requiere ${formatNumber(f.requerido)} ${f.unidad}, hay ${formatNumber(f.disponible)}`)
        .join('')}
    </div></div>`;
}
