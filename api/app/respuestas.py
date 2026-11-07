"""Ayudas para responder con el contrato {success, message, data} de la API."""

from flask import jsonify, request
from marshmallow import ValidationError

from app.errores import DatosInvalidosError


def ok(data=None, message="OK", status=200):
    return jsonify({"success": True, "message": message, "data": data}), status


def validar(dto, datos=None):
    """Valida el JSON de la peticion con un DTO de marshmallow."""
    if datos is None:
        datos = request.get_json(silent=True) or {}
    try:
        return dto.load(datos)
    except ValidationError as err:
        raise DatosInvalidosError(err.messages) from err
