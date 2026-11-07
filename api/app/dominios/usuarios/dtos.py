from marshmallow import Schema, fields, validate


class LoginDTO(Schema):
    """DTO para validar el inicio de sesion."""

    usuario = fields.String(required=True, validate=validate.Length(min=1, max=50))
    contrasena = fields.String(required=True, validate=validate.Length(min=1))
