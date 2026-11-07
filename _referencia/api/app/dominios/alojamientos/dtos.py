from decimal import Decimal

from marshmallow import Schema, fields, validate


class CrearAlojamientoDTO(Schema):
    """DTO para validar creacion de alojamiento."""

    titulo = fields.String(required=True, validate=validate.Length(min=1))
    descripcion = fields.String(required=True, validate=validate.Length(min=1))
    precio_noche = fields.Decimal(
        required=True,
        validate=validate.Range(min=Decimal("0.01")),
    )
    ciudad = fields.String(required=True, validate=validate.Length(min=1))


class ActualizarAlojamientoDTO(Schema):
    """DTO para validar actualizacion parcial de alojamiento."""

    titulo = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
    descripcion = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
    precio_noche = fields.Decimal(
        load_default=None,
        validate=validate.Range(min=Decimal("0.01")),
        allow_none=True,
    )
    ciudad = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
