import { getResumenTablero } from '../api/tablero.api.js';
import { escapeHtml, formatCurrency, formatDate, formatNumber } from '../utils/formatters.js';
import { empty, loading, showApiError, tag } from '../utils/ui.js';

function kpi(valor, texto, color = '') {
  return `<div class="kpi"><div class="t">${texto}</div><div class="v" ${color ? `style="color:var(--${color})"` : ''}>${valor}</div></div>`;
}

function textoDias(d) {
  if (d === 0) return 'hoy';
  if (d === 1) return 'mañana';
  return `en ${d} días`;
}

function PlatosPosibles(platos) {
  if (!platos.length) {
    return empty('No hay platos activos.');
  }
  const max = Math.max(1, ...platos.map((d) => d.posibles));
  return platos
    .map(
      (d) => `
      <div class="mb-2">
        <div class="d-flex justify-content-between">
          <span>${escapeHtml(d.plato.nombre)}</span>
          <b style="color:var(--${d.disponible ? 'texto' : 'danger'})">${d.disponible ? d.posibles : 'No disponible'}</b>
        </div>
        <div class="barra-h"><div style="width:${(d.posibles / max) * 100}%"></div></div>
      </div>`,
    )
    .join('');
}

function StockBajo(filas) {
  if (!filas.length) {
    return empty('✅ Todos los insumos están sobre el mínimo.');
  }
  return `<div class="tabla-wrap"><table>
    <thead><tr><th>Insumo</th><th class="num">Disponible</th><th class="num">Mínimo</th><th>Estado</th></tr></thead>
    <tbody>${filas
      .map(
        (f) => `<tr><td><b>${escapeHtml(f.insumo.nombre)}</b></td>
        <td class="num">${formatNumber(f.disponible)} ${f.insumo.unidad}</td>
        <td class="num">${formatNumber(f.insumo.stock_minimo)}</td>
        <td>${f.estado === 'agotado' ? tag('Agotado', 'danger') : tag('Stock bajo', 'warn')}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

function Vencimientos(lotes) {
  if (!lotes.length) {
    return empty('No hay lotes que venzan en los próximos 7 días.');
  }
  const porDia = {};
  lotes.forEach((l) => (porDia[l.fecha_vencimiento] ??= []).push(l));
  return Object.keys(porDia)
    .sort()
    .map((fecha) => {
      const d = porDia[fecha][0].dias_para_vencer;
      return `<div class="dia-venc" style="border-left-color:var(--${d <= 1 ? 'danger' : 'warn'})">
        <b>${formatDate(fecha)}</b> · ${textoDias(d)}<br />
        ${porDia[fecha].map((l) => `${escapeHtml(l.insumo)} (${l.codigo}): ${formatNumber(l.cantidad_actual)} ${l.unidad}`).join(' · ')}
      </div>`;
    })
    .join('');
}

export function TableroPage() {
  return `<section class="contenedor" id="tableroRoot">${loading('Cargando tablero…')}</section>`;
}

export function mountTableroPage() {
  const root = document.querySelector('#tableroRoot');

  getResumenTablero()
    .then(({ data: r }) => {
      root.innerHTML = `
        <div class="cabecera-vista"><h2>Tablero general</h2><small>${formatDate(r.fecha)}</small></div>
        <div class="kpis">
          ${kpi(formatCurrency(r.ventas_hoy.total), `Ventas de hoy (${r.ventas_hoy.cantidad})`)}
          ${kpi(r.pedidos_en_cocina, 'Pedidos en cocina')}
          ${kpi(r.alertas_activas, 'Alertas activas', 'danger')}
          ${kpi(r.stock_bajo.length, 'Insumos bajo mínimo o agotados', 'warn')}
          ${kpi(`${r.platos_no_disponibles} / ${r.platos.length}`, 'Platos no disponibles')}
        </div>
        <div class="tarjeta"><h3>Platos posibles ahora</h3>${PlatosPosibles(r.platos)}</div>
        <div class="tarjeta"><h3>Stock bajo</h3>${StockBajo(r.stock_bajo)}</div>
        <div class="tarjeta"><h3>Vencimientos de los próximos 7 días</h3>${Vencimientos(r.por_vencer)}</div>
        <div class="tarjeta">
          <h3>Más vendidos y reportes</h3>
          <button class="btn btn-sinu" type="button" disabled title="Función próximamente disponible">Ver reportes avanzados<span class="prox">Próximamente</span></button>
        </div>
      `;
    })
    .catch((error) => {
      root.innerHTML = empty('No fue posible cargar el tablero.');
      showApiError(error);
    });
}
