from flask import Blueprint, request

from app.respuestas import ok
from app.seguridad import requiere_admin, requiere_rol

alertas_bp = Blueprint("alertas", __name__)

# Variable global que el app factory asignara al crear la app
alerta_servicio = None


@alertas_bp.route("", methods=["GET"])
@requiere_rol("admin", "mesero")
def listar_alertas(usuario_id):
    """Alertas recalculadas al vuelo. ?estado=activa|atendida|todas (por defecto activa)."""
    filtro = request.args.get("estado", "activa")
    return ok(alerta_servicio.listar(filtro), "Alertas.")


@alertas_bp.route("/contador", methods=["GET"])
@requiere_rol("admin", "mesero")
def contador_alertas(usuario_id):
    """Numero de alertas activas (badge del menu de usuario)."""
    return ok({"activas": alerta_servicio.contador()}, "Contador de alertas.")


@alertas_bp.route("/<int:alerta_id>/atender", methods=["PATCH"])
@requiere_admin
def atender_alerta(usuario_id, alerta_id):
    return ok(alerta_servicio.cambiar_estado(alerta_id, "atendida"), "Alerta atendida.")


@alertas_bp.route("/<int:alerta_id>/reactivar", methods=["PATCH"])
@requiere_admin
def reactivar_alerta(usuario_id, alerta_id):
    return ok(alerta_servicio.cambiar_estado(alerta_id, "activa"), "Alerta reactivada.")
