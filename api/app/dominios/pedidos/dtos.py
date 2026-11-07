from marshmallow import Schema, fields, validate

TOTAL_MESAS = 9


class ItemPedidoDTO(Schema):
    plato_id = fields.Integer(required=True)
    cantidad = fields.Integer(required=True, validate=validate.Range(min=1))


class ItemsPedidoDTO(Schema):
    """Solo los items (para validar existencias antes de confirmar)."""

    items = fields.List(
        fields.Nested(ItemPedidoDTO),
        required=True,
        validate=validate.Length(min=1, error="El pedido no tiene platos."),
    )


class CrearPedidoDTO(ItemsPedidoDTO):
    """DTO para crear un pedido en una de las 9 mesas."""

    mesa = fields.String(
        required=True,
        validate=validate.OneOf([str(n) for n in range(1, TOTAL_MESAS + 1)]),
    )
