from flask import Blueprint

from app.dominios.platos.dtos import PlatoDTO
from app.respuestas import ok, validar
from app.seguridad import requiere_admin, requiere_rol

platos_bp = Blueprint("platos", __name__)

# Variable global que el app factory asignara al crear la app
plato_servicio = None


@platos_bp.route("", methods=["GET"])
@requiere_rol("admin", "mesero")
def listar_platos(usuario_id):
    """Menu con platos posibles segun stock (el mesero lo usa para tomar pedidos)."""
    return ok(plato_servicio.disponibilidad(), "Menú y disponibilidad.")


@platos_bp.route("", methods=["POST"])
@requiere_admin
def crear_plato(usuario_id):
    plato = plato_servicio.guardar(validar(PlatoDTO()))
    return ok(plato.to_dict(), "Plato creado.", 201)


@platos_bp.route("/<int:plato_id>", methods=["GET"])
@requiere_admin
def obtener_plato(usuario_id, plato_id):
    return ok(plato_servicio.obtener(plato_id).to_dict(), "Detalle del plato.")


@platos_bp.route("/<int:plato_id>", methods=["PUT"])
@requiere_admin
def actualizar_plato(usuario_id, plato_id):
    plato = plato_servicio.guardar(validar(PlatoDTO()), plato_id)
    return ok(plato.to_dict(), "Plato actualizado.")


@platos_bp.route("/<int:plato_id>", methods=["DELETE"])
@requiere_admin
def eliminar_plato(usuario_id, plato_id):
    plato_servicio.eliminar(plato_id)
    return "", 204
