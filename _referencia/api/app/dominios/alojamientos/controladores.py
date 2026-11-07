from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.dominios.alojamientos.dtos import ActualizarAlojamientoDTO, CrearAlojamientoDTO
from app.dominios.comodidades.dtos import AsignarComodidadesDTO
from app.seguridad import requiere_token

alojamientos_bp = Blueprint("alojamientos", __name__)

# Variable global que el app factory asignara al crear la app
alojamiento_servicio = None


@alojamientos_bp.route("", methods=["POST"])
@requiere_token
def crear_alojamiento(usuario_id):
    """Crear un nuevo alojamiento (requiere autenticacion)."""
    datos = request.get_json(silent=True) or {}

    dto = CrearAlojamientoDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return (
            jsonify(
                {
                    "success": False,
                    "error": {"message": "Datos de entrada invalidos.", "details": err.messages},
                }
            ),
            400,
        )

    alojamiento = alojamiento_servicio.crear_alojamiento(datos_validados, usuario_id)

    return (
        jsonify(
            {
                "success": True,
                "message": "Alojamiento creado con exito.",
                "data": alojamiento.to_dict(),
            }
        ),
        201,
    )


@alojamientos_bp.route("", methods=["GET"])
def listar_alojamientos():
    """Listar todos los alojamientos (publico)."""
    lista = alojamiento_servicio.listar_todos()
    return (
        jsonify(
            {
                "success": True,
                "message": "Lista de alojamientos.",
                "data": lista,
            }
        ),
        200,
    )


@alojamientos_bp.route("/<int:alojamiento_id>", methods=["GET"])
def obtener_detalle(alojamiento_id):
    """Ver detalle de un alojamiento (publico)."""
    detalle = alojamiento_servicio.obtener_detalle(alojamiento_id)
    return (
        jsonify(
            {
                "success": True,
                "message": "Detalle de alojamiento.",
                "data": detalle,
            }
        ),
        200,
    )


@alojamientos_bp.route("/<int:alojamiento_id>", methods=["PATCH"])
@requiere_token
def actualizar_alojamiento(usuario_id, alojamiento_id):
    """Actualizar parcialmente un alojamiento (propietario o admin)."""
    datos = request.get_json(silent=True) or {}

    dto = ActualizarAlojamientoDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return (
            jsonify(
                {
                    "success": False,
                    "error": {"message": "Datos de entrada invalidos.", "details": err.messages},
                }
            ),
            400,
        )

    resultado = alojamiento_servicio.actualizar_alojamiento(
        alojamiento_id, usuario_id, datos_validados
    )

    return (
        jsonify(
            {
                "success": True,
                "message": "Alojamiento actualizado.",
                "data": resultado,
            }
        ),
        200,
    )


@alojamientos_bp.route("/<int:alojamiento_id>", methods=["DELETE"])
@requiere_token
def eliminar_alojamiento(usuario_id, alojamiento_id):
    """Eliminar un alojamiento (propietario o admin)."""
    alojamiento_servicio.eliminar_alojamiento(alojamiento_id, usuario_id)
    return "", 204


@alojamientos_bp.route("/<int:alojamiento_id>/comodidades", methods=["PATCH"])
@requiere_token
def asignar_comodidades(usuario_id, alojamiento_id):
    """Asignar comodidades a un alojamiento (propietario o admin)."""
    datos = request.get_json(silent=True) or {}

    dto = AsignarComodidadesDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return (
            jsonify(
                {
                    "success": False,
                    "error": {"message": "Datos de entrada invalidos.", "details": err.messages},
                }
            ),
            400,
        )

    alojamiento = alojamiento_servicio.asignar_comodidades(
        alojamiento_id, usuario_id, datos_validados["comodidades_ids"]
    )

    return (
        jsonify(
            {
                "success": True,
                "message": "Comodidades asignadas.",
                "data": alojamiento.to_dict(),
            }
        ),
        200,
    )
