from marshmallow import Schema, ValidationError, fields, validate, validates


class RecetaItemDTO(Schema):
    insumo_id = fields.Integer(required=True)
    cantidad = fields.Float(required=True, validate=validate.Range(min=0, min_inclusive=False))


class PlatoDTO(Schema):
    """DTO para crear o editar un plato junto con su receta."""

    nombre = fields.String(required=True, validate=validate.Length(min=1, max=120))
    precio = fields.Integer(required=True, validate=validate.Range(min=1))
    activo = fields.Boolean(load_default=True)
    receta = fields.List(
        fields.Nested(RecetaItemDTO),
        required=True,
        validate=validate.Length(min=1, error="La receta debe tener al menos un insumo."),
    )

    @validates("receta")
    def sin_repetidos(self, receta, **kwargs):
        ids = [item["insumo_id"] for item in receta]
        if len(ids) != len(set(ids)):
            raise ValidationError("Un insumo está repetido en la receta.")
