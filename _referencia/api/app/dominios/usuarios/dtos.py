from marshmallow import Schema, fields, validate


class RegistroUsuarioDTO(Schema):
    """DTO para validar registro de usuario."""

    correo = fields.Email(required=True)
    contrasena = fields.String(
        required=True,
        validate=validate.Length(min=6),
    )


class ActualizarPerfilDTO(Schema):
    """DTO para validar actualizacion parcial de perfil."""

    nombre = fields.String(load_default=None, validate=validate.Length(max=50), allow_none=True)
    apellido = fields.String(load_default=None, validate=validate.Length(max=50), allow_none=True)
    telefono = fields.String(load_default=None, validate=validate.Length(max=20), allow_none=True)
