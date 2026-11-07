import { atenderAlerta, getAlertas, reactivarAlerta } from '../api/alertas.api.js';
import { escapeHtml } from '../utils/formatters.js';
import { empty, loading, showApiError } from '../utils/ui.js';

const FILTROS = { activa: 'Activas', atendida: 'Atendidas', todas: 'Todas' };

/** Centro de alertas del Administrador: puede marcarlas como atendidas o reactivarlas. */
export function AlertasPage() {
  return `
    <section class="contenedor">
      <div class="cabecera-vista"><h2>Alertas</h2>
        <div class="acciones" id="alertasFiltros">
          ${Object.entries(FILTROS)
            .map(([valor, texto]) => `<button class="btn btn-sinu sm" type="button" data-filtro="${valor}">${texto}</button>`)
            .join('')}
        </div>
      </div>
      <p class="muted">Se recalculan con cada consulta. Una alerta atendida desaparece sola cuando su causa se corrige.</p>
      <div id="alertasLista">${loading('Cargando alertas…')}</div>
    </section>
  `;
}

export function mountAlertasPage({ refreshAlertCount } = {}) {
  const lista = document.querySelector('#alertasLista');
  const filtros = document.querySelector('#alertasFiltros');
  let filtro = 'activa';

  async function cargar() {
    filtros.querySelectorAll('[data-filtro]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro));
      b.style.outline = b.dataset.filtro === filtro ? '3px solid var(--dorado-hover)' : '';
    });
    try {
      const alertas = (await getAlertas(filtro)).data;
      lista.innerHTML = alertas.length
        ? alertas
            .map(
              (a) => `
          <div class="alerta ${a.severidad} ${a.estado === 'atendida' ? 'atendida' : ''}">
            <div class="ico">${a.icono}</div>
            <div class="cuerpo"><b>${escapeHtml(a.titulo)}</b><br />${escapeHtml(a.mensaje)}</div>
            ${
              a.estado === 'activa'
                ? `<button class="btn btn-sinu sm" type="button" data-atender="${a.id}">Atendida</button>`
                : `<button class="btn btn-sinu sm" type="button" data-reactivar="${a.id}">Reactivar</button>`
            }
          </div>`,
            )
            .join('')
        : empty('✅ No hay alertas en esta categoría.');
    } catch (error) {
      showApiError(error, 'No fue posible cargar las alertas.');
    }
  }

  filtros.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-filtro]');
    if (boton) {
      filtro = boton.dataset.filtro;
      cargar();
    }
  });

  lista.addEventListener('click', async (event) => {
    const atender = event.target.closest('[data-atender]');
    const reactivar = event.target.closest('[data-reactivar]');
    try {
      if (atender) {
        await atenderAlerta(atender.dataset.atender);
      } else if (reactivar) {
        await reactivarAlerta(reactivar.dataset.reactivar);
      } else {
        return;
      }
      await cargar();
      refreshAlertCount?.();
    } catch (error) {
      showApiError(error);
    }
  });

  cargar();
}
