import { avanzarPedido, getColaCocina } from '../api/pedidos.api.js';
import { Ticket, tickCronos } from '../components/cocina/Ticket.js';
import { empty, loading, showApiError, tag, toast } from '../utils/ui.js';

const REFRESCO_MS = 10000;

export function CocinaPage() {
  return `
    <section class="contenedor">
      <div class="cabecera-vista"><h2>Cola de cocina</h2><div class="acciones" id="cocinaConteo"></div></div>
      <p class="muted">Ordenada por hora de llegada. Los tickets con borde rojo usan insumos próximos a vencer: <b>prepárelos primero</b>.</p>
      <div id="cocinaCola">${loading('Cargando pedidos…')}</div>
    </section>
  `;
}

export function mountCocinaPage({ refreshAlertCount } = {}) {
  const colaRoot = document.querySelector('#cocinaCola');
  const conteo = document.querySelector('#cocinaConteo');
  let ocupado = false;

  async function cargar() {
    try {
      const cola = (await getColaCocina()).data;
      const n = (estado) => cola.filter((c) => c.pedido.estado === estado).length;
      conteo.innerHTML = `${tag(`${n('pendiente')} pendientes`, 'warn')} ${tag(`${n('en preparación')} en preparación`, 'info')} ${tag(`${n('listo')} listos`, 'ok')}`;
      colaRoot.innerHTML = cola.length
        ? `<div class="cola">${cola.map(Ticket).join('')}</div>`
        : empty('🍽️ No hay platos en cola.');
      tickCronos(colaRoot);
    } catch (error) {
      showApiError(error, 'No fue posible cargar la cola de cocina.');
    }
  }

  colaRoot.addEventListener('click', async (event) => {
    const boton = event.target.closest('[data-avanzar]');
    if (!boton || ocupado) {
      return;
    }
    ocupado = true;
    boton.disabled = true;
    try {
      const resp = await avanzarPedido(boton.dataset.avanzar);
      toast(resp.message, 'ok');
      await cargar();
      refreshAlertCount?.();
    } catch (error) {
      showApiError(error);
      boton.disabled = false;
    } finally {
      ocupado = false;
    }
  });

  cargar();
  const reloj = setInterval(() => tickCronos(colaRoot), 1000);
  // Nuevos pedidos de los meseros aparecen sin recargar la página
  const refresco = setInterval(() => !ocupado && cargar(), REFRESCO_MS);

  return () => {
    clearInterval(reloj);
    clearInterval(refresco);
  };
}
