from datetime import datetime, time

from app import db
from app.dominios.pedidos.modelos import Pedido
from app.utilidades import hoy


class PedidoRepositorio:
    """Capa de acceso a datos para pedidos."""

    @staticmethod
    def obtener_por_id(pedido_id):
        return db.session.get(Pedido, pedido_id)

    @staticmethod
    def listar_por_estados(estados):
        return (
            db.session.query(Pedido)
            .filter(Pedido.estado.in_(estados))
            .order_by(Pedido.fecha, Pedido.id)
            .all()
        )

    @staticmethod
    def abiertos_de_mesa(mesa):
        """Pedidos que mantienen ocupada la mesa: no cancelados ni cerrados.

        Los entregados de dias anteriores cuentan como cerrados (igual que en SINU).
        """
        inicio_hoy = datetime.combine(hoy(), time.min)
        pedidos = (
            db.session.query(Pedido)
            .filter(Pedido.mesa == str(mesa), Pedido.estado != "cancelado", ~Pedido.cerrado)
            .order_by(Pedido.fecha, Pedido.id)
            .all()
        )
        return [p for p in pedidos if not (p.estado == "entregado" and p.fecha < inicio_hoy)]

    @staticmethod
    def del_dia(fecha=None):
        dia = fecha or hoy()
        inicio = datetime.combine(dia, time.min)
        fin = datetime.combine(dia, time.max)
        return (
            db.session.query(Pedido)
            .filter(Pedido.fecha >= inicio, Pedido.fecha <= fin)
            .order_by(Pedido.fecha.desc())
            .all()
        )
