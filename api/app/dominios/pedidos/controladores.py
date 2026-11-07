from flask import Blueprint

from app.dominios.pedidos.dtos import TOTAL_MESAS, CrearPedidoDTO, ItemsPedidoDTO
from app.dominios.usuarios.repositorios import UsuarioRepositorio
from app.errores import NoEncontradoError
from app.respuestas import ok, validar
from app.seguridad import requiere_admin, requiere_rol

pedidos_bp = Blueprint("pedidos", __name__)
mesas_bp = Blueprint("mesas", __name__)

# Variable global que el app factory asignara al crear la app
pedido_servicio = None


def _usuario(usuario_id):
    return UsuarioRepositorio.obtener_por_id(usuario_id)


# ---------------- Pedidos ----------------


@pedidos_bp.route("/validar", methods=["POST"])
@requiere_rol("admin", "mesero")
def validar_existencias(usuario_id):
    """Valida existencias de un borrador de pedido sin descontar stock."""
    datos = validar(ItemsPedidoDTO())
    return ok(pedido_servicio.validar(datos["items"]), "Validación de existencias.")


@pedidos_bp.route("", methods=["POST"])
@requiere_rol("admin", "mesero")
def crear_pedido(usuario_id):
    """Crea el pedido de una mesa y descuenta insumos (FEFO)."""
    datos = validar(CrearPedidoDTO())
    pedido = pedido_servicio.crear(datos["mesa"], datos["items"], _usuario(usuario_id))
    return ok(pedido.to_dict(), f"Pedido {pedido.codigo} enviado a cocina.", 201)


@pedidos_bp.route("/cocina", methods=["GET"])
@requiere_admin
def cola_cocina(usuario_id):
    return ok(pedido_servicio.cola_cocina(), "Cola de cocina.")


@pedidos_bp.route("/<int:pedido_id>/avanzar", methods=["PATCH"])
@requiere_rol("admin", "mesero")
def avanzar_pedido(usuario_id, pedido_id):
    pedido = pedido_servicio.avanzar(pedido_id, _usuario(usuario_id))
    return ok(pedido.to_dict(), f"Pedido {pedido.codigo}: {pedido.to_dict()['estado_nombre']}.")


@pedidos_bp.route("/<int:pedido_id>/cancelar", methods=["PATCH"])
@requiere_rol("admin", "mesero")
def cancelar_pedido(usuario_id, pedido_id):
    pedido = pedido_servicio.cancelar(pedido_id, _usuario(usuario_id))
    mensaje = (
        "Pedido cancelado. Los insumos volvieron a sus lotes."
        if pedido.stock_devuelto
        else "Pedido cancelado. Ya estaba en preparación: los insumos no se devuelven."
    )
    return ok(pedido.to_dict(), mensaje)


# ---------------- Mesas ----------------


@mesas_bp.route("", methods=["GET"])
@requiere_rol("admin", "mesero")
def listar_mesas(usuario_id):
    return ok(pedido_servicio.mesas(), "Estado de las mesas.")


@mesas_bp.route("/<mesa>/liberar", methods=["POST"])
@requiere_rol("admin", "mesero")
def liberar_mesa(usuario_id, mesa):
    if mesa not in [str(n) for n in range(1, TOTAL_MESAS + 1)]:
        raise NoEncontradoError(f"La mesa {mesa} no existe.")
    pedido_servicio.liberar_mesa(mesa)
    return ok(None, f"Mesa {mesa} liberada.")
