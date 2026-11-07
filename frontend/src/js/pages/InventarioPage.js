import { createInsumo, deleteInsumo, getInsumos, updateInsumo } from '../api/inventario.api.js';
import { escapeHtml, formatDate, formatNumber } from '../utils/formatters.js';
import { confirmar, empty, loading, showApiError, tag, toast } from '../utils/ui.js';

const UNIDADES = ['kg', 'g', 'l', 'unidad'];

function tagEstado(fila) {
  const base = { agotado: tag('Agotado', 'danger'), bajo: tag('Stock bajo', 'warn'), ok: tag('OK', 'ok') }[fila.estado];
  return fila.usar_primero ? `${base}<br />${tag('Usar primero', 'info')}` : base;
}

function Formulario(insumo) {
  return `
    <h3>${insumo ? 'Editar insumo' : 'Alta de insumo'}</h3>
    <form id="formInsumo" novalidate>
      <div class="mb-3"><label class="form-label" for="inNombre">Nombre</label>
        <input class="form-control" id="inNombre" value="${escapeHtml(insumo?.nombre ?? '')}" placeholder="Ej: Pargo rojo" /></div>
      <div class="row g-3 mb-3">
        <div class="col-sm-6"><label class="form-label" for="inUnidad">Unidad</label>
          <select class="form-select" id="inUnidad">${UNIDADES.map((u) => `<option ${insumo?.unidad === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
        <div class="col-sm-6"><label class="form-label" for="inMin">Stock mínimo</label>
          <input class="form-control" id="inMin" type="number" min="0" step="0.01" value="${insumo?.stock_minimo ?? ''}" /></div>
      </div>
      <div class="mb-3"><label class="form-label" for="inDias">Días de alerta de vencimiento (vacío = 3 por defecto)</label>
        <input class="form-control" id="inDias" type="number" min="0" step="1" value="${insumo?.dias_alerta ?? ''}" /></div>
      <div class="msg-error mb-2" id="inError"></div>
      <div class="d-flex gap-2 flex-wrap">
        ${insumo ? '<button class="btn btn-sinu" type="button" id="btnCancelarInsumo">Cancelar</button>' : ''}
        <button class="btn btn-sinu" type="submit">${insumo ? 'Guardar' : 'Agregar insumo'}</button>
      </div>
    </form>
  `;
}

function Tabla(filas) {
  if (!filas.length) {
    return empty('No hay insumos. Agregue el primero.');
  }
  return `<div class="tabla-wrap"><table>
    <thead><tr><th>Insumo</th><th class="num">Disponible</th><th class="num">Mínimo</th><th class="num">Vencido</th><th>Próx. venc.</th><th>Estado</th><th></th></tr></thead>
    <tbody>${filas
      .map(
        (f) => `<tr>
        <td><b>${escapeHtml(f.insumo.nombre)}</b><br /><small>${f.lotes_activos} lote(s) activo(s)</small></td>
        <td class="num"><b>${formatNumber(f.disponible)}</b> ${f.insumo.unidad}</td>
        <td class="num">${formatNumber(f.insumo.stock_minimo)}</td>
        <td class="num">${f.vencido ? `<span style="color:var(--danger)">${formatNumber(f.vencido)}</span>` : '—'}</td>
        <td>${f.proximo_vencimiento ? formatDate(f.proximo_vencimiento) : '—'}</td>
        <td>${tagEstado(f)}</td>
        <td><div class="acciones">
          <button class="btn btn-sinu sm" type="button" data-editar="${f.insumo.id}">Editar</button>
          <button class="btn btn-sinu sm peligro" type="button" data-eliminar="${f.insumo.id}" aria-label="Eliminar ${escapeHtml(f.insumo.nombre)}">✕</button>
        </div></td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

export function InventarioPage() {
  return `<section class="contenedor" id="inventarioRoot">${loading('Cargando inventario…')}</section>`;
}

export function mountInventarioPage({ refreshAlertCount } = {}) {
  const root = document.querySelector('#inventarioRoot');
  let filas = [];
  let editando = null;

  function pintar() {
    const insumo = filas.find((f) => f.insumo.id === editando)?.insumo ?? null;
    const bajos = filas.filter((f) => f.estado !== 'ok').length;
    const lotesActivos = filas.reduce((s, f) => s + f.lotes_activos, 0);
    root.innerHTML = `
      <div class="cabecera-vista"><h2>Inventario</h2></div>
      <div class="kpis">
        <div class="kpi"><div class="t">Insumos</div><div class="v">${filas.length}</div></div>
        <div class="kpi"><div class="t">Bajo mínimo o agotados</div><div class="v" style="color:var(--${bajos ? 'warn' : 'ok'})">${bajos}</div></div>
        <div class="kpi"><div class="t">Lotes activos</div><div class="v">${lotesActivos}</div></div>
      </div>
      <div class="tarjeta">${Formulario(insumo)}</div>
      <div class="tarjeta"><h3>Existencias por insumo</h3>${Tabla(filas)}</div>
    `;
  }

  async function cargar() {
    try {
      filas = (await getInsumos()).data;
      pintar();
    } catch (error) {
      root.innerHTML = empty('No fue posible cargar el inventario.');
      showApiError(error);
    }
  }

  async function guardar() {
    const minimo = document.querySelector('#inMin').value;
    const dias = document.querySelector('#inDias').value;
    const payload = {
      nombre: document.querySelector('#inNombre').value.trim(),
      unidad: document.querySelector('#inUnidad').value,
      stock_minimo: minimo === '' ? null : Number(minimo),
      dias_alerta: dias === '' ? null : Number(dias),
    };
    try {
      if (editando) {
        await updateInsumo(editando, payload);
        toast('Insumo actualizado.', 'ok');
      } else {
        await createInsumo(payload);
        toast('Insumo agregado.', 'ok');
      }
      editando = null;
      await cargar();
      refreshAlertCount?.();
    } catch (error) {
      document.querySelector('#inError').textContent = showApiError(error);
    }
  }

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    guardar();
  });

  root.addEventListener('click', async (event) => {
    const editar = event.target.closest('[data-editar]');
    const eliminar = event.target.closest('[data-eliminar]');

    if (event.target.closest('#btnCancelarInsumo')) {
      editando = null;
      pintar();
    } else if (editar) {
      editando = Number(editar.dataset.editar);
      pintar();
      root.querySelector('#inNombre').focus();
    } else if (eliminar) {
      const id = Number(eliminar.dataset.eliminar);
      const nombre = filas.find((f) => f.insumo.id === id)?.insumo.nombre ?? '';
      if (await confirmar('Eliminar insumo', `¿Eliminar <b>${escapeHtml(nombre)}</b>?`, 'Eliminar', true)) {
        try {
          await deleteInsumo(id);
          toast('Insumo eliminado.', 'ok');
          await cargar();
          refreshAlertCount?.();
        } catch (error) {
          showApiError(error);
        }
      }
    }
  });

  cargar();
}
