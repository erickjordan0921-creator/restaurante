from marshmallow import Schema, ValidationError, fields, validate, validates_schema

from app.dominios.inventario.modelos import UNIDADES
from app.utilidades import hoy


class InsumoDTO(Schema):
    """DTO para crear o editar un insumo."""

    nombre = fields.String(required=True, validate=validate.Length(min=1, max=100))
    unidad = fields.String(required=True, validate=validate.OneOf(UNIDADES))
    stock_minimo = fields.Float(required=True, validate=validate.Range(min=0))
    dias_alerta = fields.Integer(load_default=None, allow_none=True, validate=validate.Range(min=0))


class LoteDTO(Schema):
    """DTO para el ingreso de un lote."""

    insumo_id = fields.Integer(required=True)
    cantidad = fields.Float(required=True, validate=validate.Range(min=0, min_inclusive=False))
    fecha_ingreso = fields.Date(required=True)
    fecha_vencimiento = fields.Date(required=True)

    @validates_schema
    def validar_fechas(self, datos, **kwargs):
        if datos["fecha_vencimiento"] < datos["fecha_ingreso"]:
            raise ValidationError(
                "El vencimiento no puede ser anterior al ingreso.", "fecha_vencimiento"
            )
        if datos["fecha_ingreso"] > hoy():
            raise ValidationError("La fecha de ingreso no puede ser futura.", "fecha_ingreso")
