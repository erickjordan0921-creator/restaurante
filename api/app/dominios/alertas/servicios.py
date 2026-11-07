from app import db
from app.dominios.alertas.modelos import TIPOS, Alerta
from app.dominios.alertas.repositorios import AlertaRepositorio
from app.errores import NoEncontradoError
from app.utilidades import ahora, dias_hasta, fmt_fecha, fmt_num

ORDEN_SEVERIDAD = {"danger": 0, "warn": 1, "info": 2}


def _texto_dias(dias):
    if dias == 0:
        return "HOY"
    if dias == 1:
        return "mañana"
    return f"en {dias} días"


class AlertaServicio:
    """Alertas de stock, vencimiento y platos no disponibles (portado de SINU)."""

    def __init__(self, inventario_servicio, plato_servicio):
        self.inventario = inventario_servicio
        self.platos = plato_servicio

    def _condiciones_actuales(self):
        """Calcula las alertas que deberian existir ahora: {clave: datos}."""
        nuevas = {}

        def agregar(clave, tipo, mensaje, **ref):
            nuevas[clave] = {"tipo": tipo, "mensaje": mensaje, **ref}

        for insumo in self.inventario.listar_insumos():
            disponible = self.inventario.stock_disponible(insumo)
            if disponible <= 0:
                agregar(
                    f"agotado:{insumo.id}",
                    "agotado",
                    f"{insumo.nombre} está agotado (sin stock utilizable).",
                    insumo_id=insumo.id,
                )
            elif disponible <= insumo.stock_minimo:
                agregar(
                    f"bajo:{insumo.id}",
                    "stock-bajo",
                    f"{insumo.nombre}: quedan {fmt_num(disponible)} {insumo.unidad} "
                    f"(mínimo {fmt_num(insumo.stock_minimo)}).",
                    insumo_id=insumo.id,
                )

            limite = self.inventario.dias_alerta(insumo)
            sugerido = False
            for lote in self.inventario.lotes_de(insumo):
                ref = {"insumo_id": insumo.id, "lote_id": lote.id}
                cantidad = f"{fmt_num(lote.cantidad_actual)} {insumo.unidad}"
                if lote.estado == "vencido":
                    agregar(
                        f"vencido:{lote.id}",
                        "lote-vencido",
                        f"Lote {lote.codigo} de {insumo.nombre} venció el "
                        f"{fmt_fecha(lote.fecha_vencimiento)} ({cantidad}). Registrar merma.",
                        **ref,
                    )
                elif lote.estado == "activo":
                    dias = dias_hasta(lote.fecha_vencimiento)
                    if dias <= limite:
                        agregar(
                            f"porvencer:{lote.id}",
                            "por-vencer",
                            f"Lote {lote.codigo} de {insumo.nombre} vence {_texto_dias(dias)} "
                            f"({cantidad}).",
                            **ref,
                        )
                        if not sugerido:
                            agregar(
                                f"usar:{insumo.id}",
                                "usar-primero",
                                f"Usar primero {insumo.nombre} del lote {lote.codigo}. "
                                "Priorice platos que lo usen.",
                                **ref,
                            )
                            sugerido = True

        for plato in self.platos.no_disponibles():
            agregar(
                f"plato:{plato['id']}",
                "plato-no-disponible",
                f"{plato['nombre']} ya no se puede preparar con las existencias actuales.",
                plato_id=plato["id"],
            )
        return nuevas

    def recalcular(self):
        """Sincroniza la tabla de alertas con el inventario.

        Conserva el estado 'atendida' mientras la condicion siga vigente; borra
        las alertas cuya condicion desaparecio y crea las nuevas.
        """
        nuevas = self._condiciones_actuales()
        previas = {a.clave: a for a in AlertaRepositorio.listar()}

        for clave, alerta in previas.items():
            if clave not in nuevas:
                db.session.delete(alerta)
        for clave, datos in nuevas.items():
            if clave in previas:
                previas[clave].mensaje = datos["mensaje"]
            else:
                db.session.add(Alerta(clave=clave, fecha=ahora(), estado="activa", **datos))
        db.session.commit()

    def listar(self, filtro="activa"):
        self.recalcular()
        alertas = [
            a for a in AlertaRepositorio.listar() if filtro in (None, "todas") or a.estado == filtro
        ]
        alertas.sort(
            key=lambda a: (
                a.estado != "activa",
                ORDEN_SEVERIDAD[TIPOS[a.tipo]["severidad"]],
                a.id,
            )
        )
        return [a.to_dict() for a in alertas]

    def contador(self):
        self.recalcular()
        return AlertaRepositorio.contar_activas()

    def cambiar_estado(self, alerta_id, estado):
        alerta = AlertaRepositorio.obtener_por_id(alerta_id)
        if not alerta:
            raise NoEncontradoError(f"Alerta con id {alerta_id} no encontrada.")
        alerta.estado = estado
        db.session.commit()
        return alerta.to_dict()
