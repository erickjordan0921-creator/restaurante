from app import db
from app.dominios.inventario.repositorios import InventarioRepositorio
from app.dominios.pedidos.dtos import TOTAL_MESAS
from app.dominios.pedidos.modelos import SIGUIENTE, Consumo, Pedido, PedidoItem
from app.dominios.pedidos.repositorios import PedidoRepositorio
from app.dominios.platos.repositorios import PlatoRepositorio
from app.errores import ConflictoError, NoEncontradoError, PermisoDenegadoError
from app.utilidades import ahora

EPS = 1e-9
ESTADOS_MESA = {"libre": "Libre", "ocupada": "Ocupada", "lista": "Lista para entregar"}


class PedidoServicio:
    """Pedidos, cola de cocina y mesas (equivale a Pedidos + Mesas en SINU)."""

    def __init__(self, inventario_servicio, plato_servicio):
        self.inventario = inventario_servicio
        self.platos = plato_servicio

    def obtener(self, pedido_id):
        pedido = PedidoRepositorio.obtener_por_id(pedido_id)
        if not pedido:
            raise NoEncontradoError(f"Pedido con id {pedido_id} no encontrado.")
        return pedido

    # ---------------- Validacion y creacion ----------------

    def _resolver_items(self, items):
        """Convierte [{plato_id, cantidad}] en [(Plato, cantidad)] validando cada plato."""
        resueltos = []
        for item in items:
            plato = PlatoRepositorio.obtener_por_id(item["plato_id"])
            if not plato or not plato.activo:
                raise ConflictoError("Hay un plato inactivo o inexistente.")
            if not plato.receta:
                raise ConflictoError(f"{plato.nombre} no tiene receta.")
            resueltos.append((plato, item["cantidad"]))
        return resueltos

    def validar(self, items):
        """Comprueba existencias sin descontar nada (boton 'Validar existencias')."""
        faltantes = []
        for insumo_id, requerido in self.platos.requerimientos(self._resolver_items(items)).items():
            insumo = InventarioRepositorio.obtener_insumo(insumo_id)
            disponible = self.inventario.stock_disponible(insumo)
            if requerido > disponible + EPS:
                faltantes.append(
                    {
                        "insumo": insumo.nombre,
                        "unidad": insumo.unidad,
                        "requerido": requerido,
                        "disponible": disponible,
                    }
                )
        return {
            "ok": not faltantes,
            "faltantes": faltantes,
            "mensaje": "Existencias insuficientes." if faltantes else "Existencias suficientes.",
        }

    def crear(self, mesa, items, usuario):
        """Crea el pedido y descuenta los insumos por FEFO en una sola transaccion."""
        resueltos = self._resolver_items(items)
        validacion = self.validar(items)
        if not validacion["ok"]:
            nombres = ", ".join(f["insumo"] for f in validacion["faltantes"])
            raise ConflictoError(f"Existencias insuficientes. Falta: {nombres}")

        pedido = Pedido(mesa=str(mesa), estado="pendiente", fecha=ahora(), usuario_id=usuario.id)
        pedido.items = [
            PedidoItem(plato_id=p.id, nombre=p.nombre, precio=p.precio, cantidad=c)
            for p, c in resueltos
        ]
        pedido.total = sum(p.precio * c for p, c in resueltos)
        db.session.add(pedido)
        db.session.flush()  # asigna id para la nota de los movimientos

        try:
            nota = f"Pedido {pedido.codigo} · Mesa {mesa}"
            for insumo_id, cantidad in self.platos.requerimientos(resueltos).items():
                insumo = InventarioRepositorio.obtener_insumo(insumo_id)
                for lote, toma in self.inventario.consumir_fefo(
                    insumo, cantidad, nota, usuario.nombre
                ):
                    pedido.consumos.append(
                        Consumo(insumo_id=insumo_id, lote_id=lote.id, cantidad=toma)
                    )
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
        return pedido

    # ---------------- Flujo de estados ----------------

    def avanzar(self, pedido_id, usuario):
        """pendiente -> en preparacion -> listo -> entregado.

        El mesero solo puede marcar como entregado un pedido listo; la cocina
        (Administrador) mueve el resto de estados.
        """
        pedido = self.obtener(pedido_id)
        siguiente = SIGUIENTE.get(pedido.estado)
        if not siguiente:
            raise ConflictoError("El pedido no puede avanzar.")
        if usuario.rol != "admin" and pedido.estado != "listo":
            raise PermisoDenegadoError("El mesero solo puede marcar como entregado un pedido listo.")

        pedido.estado = siguiente
        setattr(pedido, "fecha_" + siguiente.replace("ó", "o").replace(" ", "_"), ahora())
        db.session.commit()
        return pedido

    def cancelar(self, pedido_id, usuario):
        """Cancela y anula la venta; devuelve el stock solo si aun estaba pendiente."""
        pedido = self.obtener(pedido_id)
        if pedido.estado not in ("pendiente", "en preparación"):
            raise ConflictoError("Solo se cancelan pedidos pendientes o en preparación.")

        devuelve = pedido.estado == "pendiente"
        if devuelve:
            self.inventario.devolver(
                pedido.consumos, f"Devolución por cancelación {pedido.codigo}", usuario.nombre
            )
        pedido.estado = "cancelado"
        pedido.stock_devuelto = devuelve
        db.session.commit()
        return pedido

    # ---------------- Cocina ----------------

    def cola_cocina(self):
        """Pedidos activos por orden de llegada; prioridad si usan insumos por vencer."""
        cola = []
        for pedido in PedidoRepositorio.listar_por_estados(["pendiente", "en preparación", "listo"]):
            por_vencer = []
            for item in pedido.items:
                plato = PlatoRepositorio.obtener_por_id(item.plato_id) if item.plato_id else None
                if plato and self.platos.tiene_insumo_por_vencer(plato):
                    por_vencer.append(item.plato_id)
            cola.append(
                {"pedido": pedido.to_dict(), "prioridad": bool(por_vencer), "por_vencer": por_vencer}
            )
        return cola

    # ---------------- Mesas ----------------

    @staticmethod
    def _estado_mesa(pedidos):
        if not pedidos:
            return "libre"
        return "lista" if any(p.estado == "listo" for p in pedidos) else "ocupada"

    def mesas(self):
        """Estado de las 9 mesas derivado de sus pedidos abiertos."""
        resultado = []
        for numero in range(1, TOTAL_MESAS + 1):
            pedidos = PedidoRepositorio.abiertos_de_mesa(numero)
            estado = self._estado_mesa(pedidos)
            resultado.append(
                {
                    "numero": str(numero),
                    "estado": estado,
                    "estado_nombre": ESTADOS_MESA[estado],
                    "platos": sum(i.cantidad for p in pedidos for i in p.items),
                    "puede_liberar": bool(pedidos) and all(p.estado == "entregado" for p in pedidos),
                    "pedidos": [p.to_dict() for p in pedidos],
                }
            )
        return resultado

    def liberar_mesa(self, mesa):
        pedidos = PedidoRepositorio.abiertos_de_mesa(mesa)
        if not pedidos or not all(p.estado == "entregado" for p in pedidos):
            raise ConflictoError("La mesa se libera cuando todos sus pedidos están entregados.")
        momento = ahora()
        for pedido in pedidos:
            pedido.cerrado = True
            pedido.fecha_cierre = momento
        db.session.commit()

    # ---------------- Ventas ----------------

    @staticmethod
    def ventas_del_dia(fecha=None):
        """Pedidos del dia no cancelados (cada pedido confirmado es una venta)."""
        return [p for p in PedidoRepositorio.del_dia(fecha) if p.estado != "cancelado"]

