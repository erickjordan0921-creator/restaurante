import { getInsumos } from '../api/inventario.api.js';
import { createPlato, deletePlato, getPlatos, updatePlato } from '../api/platos.api.js';
import { escapeHtml, formatCurrency, formatNumber } from '../utils/formatters.js';
import { confirmar, empty, loading, showApiError, tag, toast } from '../utils/ui.js';

function opcionesInsumos(insumos, seleccionado) {
  return `<option value="">Insumo…</option>${insumos
    .map((i) => `<option value="${i.id}" ${i.id === seleccionado ? 'selected' : ''}>${escapeHtml(i.nombre)} (${i.unidad})</option>`)
    .join('')}`;
}

function FilasReceta(receta, insumos) {
  if (!receta.length) {
    return empty('Sin insumos');
  }
  return receta
    .map(
      (r, i) => `
      <div class="row g-2 align-items-end mb-2">
        <div class="col-7"><select class="form-select" data-receta-insumo="${i}" aria-label="Insumo ${i + 1}">${opcionesInsumos(insumos, r.insumo_id)}</select></div>
        <div class="col-3"><input class="form-control" data-receta-cantidad="${i}" type="number" min="0" step="0.001" placeholder="Cant." value="${r.cantidad}" aria-label="Cantidad ${i + 1}" /></div>
        <div class="col-2"><button class="btn btn-sinu sm peligro w-100" type="button" data-quitar="${i}" aria-label="Quitar insumo">✕</button></div>
      </div>`,
    )
    .join('');
}

function Formulario(plato, receta, insumos) {
  return `
    <h3>${plato ? 'Editar plato' : 'Nuevo plato'}</h3>
    <form id="formPlato" novalidate>
      <div class="mb-3"><label class="form-label" for="plNombre">Nombre</label>
        <input class="form-control" id="plNombre" value="${escapeHtml(plato?.nombre ?? '')}" placeholder="Ej: Mojarra frita" /></div>
      <div class="row g-3 mb-3 align-items-end">
        <div class="col-sm-6"><label class="form-label" for="plPrecio">Precio (COP)</label>
          <input class="form-control" id="plPrecio" type="number" min="1" step="100" value="${plato?.precio ?? ''}" /></div>
        <div class="col-sm-6"><div class="form-check">
          <input class="form-check-input" id="plActivo" type="checkbox" ${!plato || plato.activo ? 'checked' : ''} />
          <label class="form-check-label" for="plActivo">Activo en el menú</label></div></div>
      </div>
      <h3>Receta (cantidad por plato)</h3>
      <div id="recetaFilas">${FilasReceta(receta, insumos)}</div>
      <button class="btn btn-sinu w-100" type="button" id="btnAgregarInsumo">+ Agregar insumo</button>
      <div class="msg-error my-2" id="plError"></div>
      <div class="d-flex gap-2 flex-wrap">
        ${plato ? '<button class="btn btn-sinu" type="button" id="btnCancelarPlato">Cancelar edición</button>' : ''}
        <button class="btn btn-sinu" type="submit">${plato ? 'Guardar cambios' : 'Crear plato'}</button>
      </div>
    </form>
  `;
}

function Tabla(menu) {
  if (!menu.length) {
    return empty('No hay platos. Cree el primero.');
  }
  return `<div class="tabla-wrap"><table>
    <thead><tr><th>Plato</th><th class="num">Precio</th><th class="num">Posibles</th><th>Estado</th><th></th></tr></thead>
    <tbody>${menu
      .map((d) => {
        const estado = !d.plato.activo
          ? tag('Inactivo', 'gris')
          : d.disponible
            ? tag('Disponible', 'ok')
            : `${tag('No disponible', 'danger')}${d.limitante ? `<br /><small>Falta: ${escapeHtml(d.limitante)}</small>` : ''}`;
        return `<tr>
          <td><b>${escapeHtml(d.plato.nombre)}</b><br /><small>${d.plato.receta
            .map((r) => `${escapeHtml(r.insumo)} ${formatNumber(r.cantidad)} ${r.unidad}`)
            .join(' · ')}</small></td>
          <td class="num">${formatCurrency(d.plato.precio)}</td>
          <td class="num"><b>${d.posibles}</b></td>
          <td>${estado}</td>
          <td><div class="acciones">
            <button class="btn btn-sinu sm" type="button" data-editar="${d.plato.id}">Editar</button>
            <button class="btn btn-sinu sm peligro" type="button" data-eliminar="${d.plato.id}">Eliminar</button>
          </div></td></tr>`;
      })
      .join('')}</tbody></table></div>`;
}

export function PlatosPage() {
  return `<section class="contenedor" id="platosRoot">${loading('Cargando platos…')}</section>`;
}

export function mountPlatosPage({ refreshAlertCount } = {}) {
  const root = document.querySelector('#platosRoot');
  let menu = [];
  let insumos = [];
  let editando = null;
  let receta = [{ insumo_id: null, cantidad: '' }];

  const platoEditado = () => menu.find((d) => d.plato.id === editando)?.plato ?? null;

  function pintar() {
    root.innerHTML = `
      <div class="cabecera-vista"><h2>Platos y recetas</h2></div>
      <div class="tarjeta">${Formulario(platoEditado(), receta, insumos)}</div>
      <div class="tarjeta"><h3>Menú y platos posibles</h3>${Tabla(menu)}</div>
    `;
  }

  function pintarReceta() {
    root.querySelector('#recetaFilas').innerHTML = FilasReceta(receta, insumos);
  }

  function reiniciarFormulario() {
    editando = null;
    receta = [{ insumo_id: null, cantidad: '' }];
  }

  async function cargar() {
    try {
      const [respPlatos, respInsumos] = await Promise.all([getPlatos(), getInsumos()]);
      menu = respPlatos.data;
      insumos = respInsumos.data.map((f) => f.insumo);
      pintar();
    } catch (error) {
      root.innerHTML = empty('No fue posible cargar los platos.');
      showApiError(error);
    }
  }

  // Mantiene `receta` sincronizada con lo que el usuario escribe
  root.addEventListener('input', (event) => {
    const { recetaInsumo, recetaCantidad } = event.target.dataset;
    if (recetaInsumo !== undefined) {
      receta[recetaInsumo].insumo_id = event.target.value ? Number(event.target.value) : null;
    } else if (recetaCantidad !== undefined) {
      receta[recetaCantidad].cantidad = event.target.value;
    }
  });

  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    const items = receta.filter((r) => r.insumo_id || r.cantidad !== '');
    const payload = {
      nombre: root.querySelector('#plNombre').value.trim(),
      precio: Number(root.querySelector('#plPrecio').value) || null,
      activo: root.querySelector('#plActivo').checked,
      receta: items.map((r) => ({ insumo_id: r.insumo_id, cantidad: Number(r.cantidad) })),
    };
    if (items.some((r) => !r.insumo_id)) {
      root.querySelector('#plError').textContent = 'Hay un insumo no válido en la receta.';
      return;
    }
    try {
      if (editando) {
        await updatePlato(editando, payload);
        toast('Plato actualizado.', 'ok');
      } else {
        await createPlato(payload);
        toast('Plato creado.', 'ok');
      }
      reiniciarFormulario();
      await cargar();
      refreshAlertCount?.();
    } catch (error) {
      root.querySelector('#plError').textContent = showApiError(error);
    }
  });

  root.addEventListener('click', async (event) => {
    const quitar = event.target.closest('[data-quitar]');
    const editar = event.target.closest('[data-editar]');
    const eliminar = event.target.closest('[data-eliminar]');

    if (event.target.closest('#btnAgregarInsumo')) {
      receta.push({ insumo_id: null, cantidad: '' });
      pintarReceta();
    } else if (quitar) {
      receta.splice(Number(quitar.dataset.quitar), 1);
      pintarReceta();
    } else if (event.target.closest('#btnCancelarPlato')) {
      reiniciarFormulario();
      pintar();
    } else if (editar) {
      editando = Number(editar.dataset.editar);
      receta = platoEditado().receta.map((r) => ({ insumo_id: r.insumo_id, cantidad: r.cantidad }));
      pintar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (eliminar) {
      const id = Number(eliminar.dataset.eliminar);
      const nombre = menu.find((d) => d.plato.id === id)?.plato.nombre ?? '';
      const ok = await confirmar(
        'Eliminar plato',
        `¿Eliminar <b>${escapeHtml(nombre)}</b> y su receta? Los pedidos anteriores se conservan.`,
        'Eliminar',
        true,
      );
      if (!ok) {
        return;
      }
      try {
        await deletePlato(id);
        if (editando === id) {
          reiniciarFormulario();
        }
        toast('Plato eliminado.', 'ok');
        await cargar();
        refreshAlertCount?.();
      } catch (error) {
        showApiError(error);
      }
    }
  });

  cargar();
}
