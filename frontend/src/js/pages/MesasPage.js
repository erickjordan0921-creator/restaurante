import {
  avanzarPedido,
  cancelarPedido,
  createPedido,
  getMesas,
  liberarMesa,
  validarExistencias,
} from '../api/pedidos.api.js';
import { getPlatos } from '../api/platos.api.js';
import { MapaMesas } from '../components/mesas/MapaMesas.js';
import {
  PanelPedidoCuerpo,
  PanelPedidoPie,
  PanelPedidoTitulo,
  ResultadoValidacion,
} from '../components/mesas/PanelPedido.js';
import { formatCurrency } from '../utils/formatters.js';
import { confirmar, loading, showApiError, toast } from '../utils/ui.js';

const REFRESCO_MS = 15000;

// Borradores de pedido por mesa: sobreviven al cambiar de vista (como en SINU)
const carritos = {};

export function MesasPage() {
  return `
    <section class="contenedor">
      <div class="cabecera-vista"><h2>Mesas</h2><small>Toque una mesa para tomar o revisar su pedido</small></div>
      <div id="mesasContenido">${loading('Cargando mesas…')}</div>
    </section>
    <div id="panelMesa" class="panel" aria-hidden="true">
      <div class="panel-fondo" data-accion="cerrar"></div>
      <aside class="panel-caja" role="dialog" aria-modal="true" aria-labelledby="panelTitulo">
        <div class="panel-cab">
          <h2 id="panelTitulo">Mesa</h2>
          <button class="btn btn-sinu" type="button" data-accion="cerrar" aria-label="Cerrar panel" title="Cerrar panel">✕</button>
        </div>
        <div class="panel-cuerpo" id="panelCuerpo"></div>
        <div class="panel-pie" id="panelPie"></div>
      </aside>
    </div>
  `;
}

export function mountMesasPage({ refreshAlertCount } = {}) {
  const contenido = document.querySelector('#mesasContenido');
  const panel = document.querySelector('#panelMesa');
  const cuerpo = document.querySelector('#panelCuerpo');
  let mesas = [];
  let menu = [];
  let abierta = null;
  let ocupado = false;

  const carrito = () => (carritos[abierta] ??= []);
  const mesaAbierta = () => mesas.find((m) => m.numero === abierta);

  function pintarMapa() {
    const borradores = Object.keys(carritos).filter((n) => carritos[n].length);
    contenido.innerHTML = MapaMesas(mesas, { abierta, borradores });
  }

  function pintarPanel() {
    const mesa = mesaAbierta();
    if (!mesa) {
      return;
    }
    // Quita del borrador platos que ya no existen o se desactivaron
    carritos[abierta] = carrito().filter((c) => menu.some((d) => d.plato.id === c.plato_id));
    const precio = (id) => menu.find((d) => d.plato.id === id).plato.precio;
    const total = carrito().reduce((s, c) => s + precio(c.plato_id) * c.cantidad, 0);

    const scroll = cuerpo.scrollTop;
    document.querySelector('#panelTitulo').innerHTML = PanelPedidoTitulo(mesa);
    cuerpo.innerHTML = PanelPedidoCuerpo(mesa, menu, carrito());
    document.querySelector('#panelPie').innerHTML = PanelPedidoPie(total, carrito().length > 0);
    cuerpo.scrollTop = scroll;
  }

  async function cargar() {
    try {
      const [respMesas, respPlatos] = await Promise.all([getMesas(), getPlatos()]);
      mesas = respMesas.data;
      menu = respPlatos.data.filter((d) => d.plato.activo);
      pintarMapa();
      pintarPanel();
    } catch (error) {
      showApiError(error, 'No fue posible cargar las mesas.');
    }
  }

  function abrir(numero) {
    abierta = numero;
    pintarMapa();
    pintarPanel();
    cuerpo.scrollTop = 0;
    panel.classList.add('abierto');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sin-scroll');
  }

  function cerrar() {
    abierta = null;
    panel.classList.remove('abierto');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sin-scroll');
    pintarMapa();
  }

  /** Ejecuta una acción contra la API, muestra el resultado y recarga los datos. */
  async function accion(fn, mensajeOk) {
    if (ocupado) {
      return null;
    }
    ocupado = true;
    try {
      const resp = await fn();
      toast(mensajeOk ?? resp?.message ?? 'Listo.', 'ok');
      await cargar();
      refreshAlertCount?.();
      return resp ?? true;
    } catch (error) {
      showApiError(error);
      return null;
    } finally {
      ocupado = false;
    }
  }

  function cambiarCantidad(platoId, delta) {
    const items = carrito();
    const item = items.find((c) => c.plato_id === platoId);
    if (delta > 0) {
      const posibles = menu.find((d) => d.plato.id === platoId)?.posibles ?? 0;
      if ((item?.cantidad ?? 0) + 1 > posibles) {
        toast(`Solo se pueden preparar ${posibles} de este plato.`, 'warn');
        return;
      }
      if (item) {
        item.cantidad += 1;
      } else {
        items.push({ plato_id: platoId, cantidad: 1 });
      }
    } else if (item) {
      item.cantidad -= 1;
      if (item.cantidad <= 0) {
        items.splice(items.indexOf(item), 1);
      }
    }
    pintarPanel();
  }

  async function validar() {
    const caja = document.querySelector('#peValidacion');
    try {
      const resp = await validarExistencias(carrito());
      caja.innerHTML = ResultadoValidacion(resp.data);
      caja.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return resp.data.ok;
    } catch (error) {
      showApiError(error);
      return false;
    }
  }

  async function confirmarPedido() {
    const numero = abierta;
    const items = carrito();
    if (!items.length || !(await validar())) {
      toast('No hay existencias suficientes.', 'error');
      return;
    }
    const precio = (id) => menu.find((d) => d.plato.id === id).plato.precio;
    const total = items.reduce((s, c) => s + precio(c.plato_id) * c.cantidad, 0);
    const unidades = items.reduce((s, c) => s + c.cantidad, 0);
    const ok = await confirmar(
      `Confirmar pedido · Mesa ${numero}`,
      `${unidades} plato(s) · <b>${formatCurrency(total)}</b>.<br />Se descontarán los insumos (FEFO) y el pedido pasará a cocina.`,
      'Confirmar',
    );
    if (!ok) {
      return;
    }
    const resp = await accion(() => createPedido(numero, items));
    if (resp) {
      carritos[numero] = [];
      cerrar();
    }
  }

  async function cancelar(id) {
    const pedido = mesaAbierta()?.pedidos.find((p) => p.id === id);
    const mensaje =
      pedido?.estado === 'pendiente'
        ? 'Los insumos se <b>devolverán</b> a sus lotes y la venta se anulará.'
        : 'El pedido ya está en preparación: los insumos <b>no se devuelven</b>, la venta se anulará.';
    if (await confirmar(`Cancelar pedido ${pedido?.codigo ?? ''}`, mensaje, 'Cancelar pedido', true)) {
      await accion(() => cancelarPedido(id));
    }
  }

  async function liberar() {
    const numero = abierta;
    const ok = await confirmar(
      `Liberar mesa ${numero}`,
      'Los pedidos entregados se cerrarán y la mesa quedará <b>libre</b>.',
      'Liberar',
    );
    if (ok && (await accion(() => liberarMesa(numero)))) {
      cerrar();
    }
  }

  contenido.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-mesa]');
    if (boton) {
      abrir(boton.dataset.mesa);
    }
  });

  panel.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-accion]');
    if (!boton || boton.disabled) {
      return;
    }
    const id = Number(boton.dataset.id);
    const acciones = {
      cerrar,
      mas: () => cambiarCantidad(id, 1),
      menos: () => cambiarCantidad(id, -1),
      vaciar: () => {
        carritos[abierta] = [];
        pintarPanel();
      },
      validar,
      confirmar: confirmarPedido,
      entregar: () => accion(() => avanzarPedido(id)),
      cancelar: () => cancelar(id),
      liberar,
    };
    acciones[boton.dataset.accion]?.();
  });

  const onKey = (event) => {
    if (event.key === 'Escape' && abierta && !document.querySelector('#modalRaiz .modal-fondo')) {
      cerrar();
    }
  };
  document.addEventListener('keydown', onKey);

  cargar();
  // Refresco periódico: el mesero ve cuándo la cocina marca un pedido como listo
  const timer = setInterval(() => {
    if (!ocupado) {
      cargar();
    }
  }, REFRESCO_MS);

  return () => {
    clearInterval(timer);
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('sin-scroll');
  };
}
