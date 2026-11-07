from flask import Blueprint

from app.respuestas import ok
from app.seguridad import requiere_admin

tablero_bp = Blueprint("tablero", __name__)

# Variable global que el app factory asignara al crear la app
tablero_servicio = None


@tablero_bp.route("/resumen", methods=["GET"])
@requiere_admin
def resumen(usuario_id):
    """Ventas del dia, stock bajo, lotes por vencer y platos posibles."""
    return ok(tablero_servicio.resumen(), "Resumen del tablero.")
