from marshmallow import Schema, fields, validate


class CrearComodidadDTO(Schema):
    """DTO para validar creacion de comodidad."""

    nombre = fields.String(required=True, validate=validate.Length(min=1))


class AsignarComodidadesDTO(Schema):
    """DTO para validar asignacion de comodidades a un alojamiento."""

    comodidades_ids = fields.List(
        fields.Integer(),
        required=True,
    )
