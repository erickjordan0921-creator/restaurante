from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.dominios.comodidades.dtos import CrearComodidadDTO
from app.seguridad import requiere_admin

comodidades_bp = Blueprint("comodidades", __name__)

# Variable global que el app factory asignara al crear la app
comodidad_servicio = None


@comodidades_bp.route("", methods=["POST"])
@requiere_admin
def crear_comodidad(usuario_id):
    """Crear una nueva comodidad (solo admin)."""
    datos = request.get_json(silent=True) or {}

    dto = CrearComodidadDTO()
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

    comodidad = comodidad_servicio.crear_comodidad(datos_validados)

    return (
        jsonify(
            {
                "success": True,
                "message": "Comodidad creada con exito.",
                "data": comodidad.to_dict(),
            }
        ),
        201,
    )


@comodidades_bp.route("", methods=["GET"])
def listar_comodidades():
    """Listar todas las comodidades (publico)."""
    lista = comodidad_servicio.listar_todos()
    return (
        jsonify(
            {
                "success": True,
                "message": "Lista de comodidades.",
                "data": lista,
            }
        ),
        200,
    )


@comodidades_bp.route("/<int:comodidad_id>", methods=["GET"])
def obtener_detalle(comodidad_id):
    """Ver detalle de una comodidad (publico)."""
    detalle = comodidad_servicio.obtener_detalle(comodidad_id)
    return (
        jsonify(
            {
                "success": True,
                "message": "Detalle de comodidad.",
                "data": detalle,
            }
        ),
        200,
    )
