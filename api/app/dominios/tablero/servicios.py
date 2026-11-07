from app.utilidades import dias_hasta, hoy

DIAS_HORIZONTE_VENCIMIENTO = 7


class TableroServicio:
    """Resumen del dia para el Administrador (solo lectura)."""

    def __init__(self, inventario_servicio, plato_servicio, pedido_servicio, alerta_servicio):
        self.inventario = inventario_servicio
        self.platos = plato_servicio
        self.pedidos = pedido_servicio
        self.alertas = alerta_servicio

    def resumen(self):
        ventas = self.pedidos.ventas_del_dia()
        cola = self.pedidos.cola_cocina()
        existencias = self.inventario.resumen()
        menu = [fila for fila in self.platos.disponibilidad() if fila["plato"]["activo"]]

        por_vencer = [
            lote.to_dict()
            for lote in self.inventario.listar_lotes(solo_con_stock=True)
            if lote.estado == "activo"
            and dias_hasta(lote.fecha_vencimiento) <= DIAS_HORIZONTE_VENCIMIENTO
        ]

        return {
            "fecha": hoy().isoformat(),
            "ventas_hoy": {"total": sum(p.total for p in ventas), "cantidad": len(ventas)},
            "pedidos_en_cocina": sum(1 for c in cola if c["pedido"]["estado"] != "listo"),
            "alertas_activas": self.alertas.contador(),
            "stock_bajo": [fila for fila in existencias if fila["estado"] != "ok"],
            "por_vencer": por_vencer,
            "platos": menu,
            "platos_no_disponibles": sum(1 for fila in menu if not fila["disponible"]),
        }
