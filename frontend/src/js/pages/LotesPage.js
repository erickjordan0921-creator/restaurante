import { createLote, getInsumos, getLotes } from '../api/inventario.api.js';
import { escapeHtml, formatDate, formatNumber, todayIso } from '../utils/formatters.js';
import { empty, loading, showApiError, tag, toast } from '../utils/ui.js';

const TAG_LOTE = {
  activo: ['Activo', 'ok'],
  agotado: ['Agotado', 'gris'],
  vencido: ['Vencido', 'danger'],
  mermado: ['Dado de baja', 'gris'],
};
const PROXIMAMENTE = 'Función próximamente disponible';

function textoDias(d) {
  if (d < 0) return tag(`Vencido hace ${-d} d`, 'danger');
  if (d === 0) return tag('Vence hoy', 'danger');
  if (d === 1) return tag('Mañana', 'warn');
  return `${d} días`;
}

function Formulario(insumos) {
  const hoy = todayIso();
  return `
    <h3>Ingreso de lote</h3>
    <form id="formLote" novalidate>
      <div class="mb-3"><label class="form-label" for="loIns">Insumo</label>
        <select class="form-select" id="loIns"><option value="">Seleccione…</option>
          ${insumos.map((f) => `<option value="${f.insumo.id}">${escapeHtml(f.insumo.nombre)} (${f.insumo.unidad})</option>`).join('')}
        </select></div>
      <div class="mb-3"><label class="form-label" for="loCant">Cantidad</label>
        <input class="form-control" id="loCant" type="number" min="0" step="0.01" placeholder="Ej: 5" /></div>
      <div class="row g-3 mb-3">
        <div class="col-sm-6"><label class="form-label" for="loIng">Fecha de ingreso</label>
          <input class="form-control" id="loIng" type="date" value="${hoy}" max="${hoy}" /></div>
        <div class="col-sm-6"><label class="form-label" for="loVen">Fecha de vencimiento</label>
          <input class="form-control" id="loVen" type="date" min="${hoy}" /></div>
      </div>
      <div class="msg-error mb-2" id="loError"></div>
      <button class="btn btn-sinu xl w-100" type="submit">Registrar lote</button>
    </form>
  `;
}

function Tabla(lotes) {
  if (!lotes.length) {
    return empty('No hay lotes con existencias.');
  }
  return `<div class="tabla-wrap"><table>
    <thead><tr><th>Lote</th><th>Insumo</th><th class="num">Actual / Inicial</th><th>Ingreso</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
    <tbody>${lotes
      .map((l) => {
        const [texto, tono] = TAG_LOTE[l.estado];
        return `<tr>
          <td>${l.codigo}</td><td><b>${escapeHtml(l.insumo)}</b></td>
          <td class="num"><b>${formatNumber(l.cantidad_actual)}</b> / ${formatNumber(l.cantidad_inicial)} ${l.unidad}</td>
          <td>${formatDate(l.fecha_ingreso)}</td>
          <td>${formatDate(l.fecha_vencimiento)}<br /><small>${l.estado === 'activo' ? textoDias(l.dias_para_vencer) : ''}</small></td>
          <td>${tag(texto, tono)}</td>
          <td><div class="acciones">
            <button class="btn btn-sinu sm" type="button" disabled title="${PROXIMAMENTE}">Ajustar</button>
            <button class="btn btn-sinu sm" type="button" disabled title="${PROXIMAMENTE}">Merma</button>
          </div></td></tr>`;
      })
      .join('')}</tbody></table></div>`;
}

export function LotesPage() {
  return `<section class="contenedor" id="lotesRoot">${loading('Cargando lotes…')}</section>`;
}

export function mountLotesPage({ refreshAlertCount } = {}) {
  const root = document.querySelector('#lotesRoot');
  let verTodos = false;

  async function cargar() {
    try {
      const [insumos, lotes] = await Promise.all([getInsumos(), getLotes({ todos: verTodos })]);
      root.innerHTML = `
        <div class="cabecera-vista"><h2>Lotes</h2></div>
        <div class="tarjeta">${Formulario(insumos.data)}</div>
        <div class="tarjeta">
          <div class="cabecera-vista"><h3>Lotes (orden FEFO)</h3>
            <button class="btn btn-sinu sm" type="button" id="btnVerTodos">${verTodos ? 'Solo con existencias' : 'Ver todos'}</button></div>
          ${Tabla(lotes.data)}
        </div>
      `;
    } catch (error) {
      root.innerHTML = empty('No fue posible cargar los lotes.');
      showApiError(error);
    }
  }

  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    const insumoId = document.querySelector('#loIns').value;
    const error = document.querySelector('#loError');
    if (!insumoId) {
      error.textContent = 'Seleccione un insumo válido.';
      return;
    }
    try {
      await createLote({
        insumo_id: Number(insumoId),
        cantidad: Number(document.querySelector('#loCant').value),
        fecha_ingreso: document.querySelector('#loIng').value,
        fecha_vencimiento: document.querySelector('#loVen').value,
      });
      toast('Lote registrado.', 'ok');
      await cargar();
      refreshAlertCount?.();
    } catch (apiError) {
      error.textContent = showApiError(apiError);
    }
  });

  root.addEventListener('click', (event) => {
    if (event.target.closest('#btnVerTodos')) {
      verTodos = !verTodos;
      cargar();
    }
  });

  cargar();
}
