from datetime import UTC, datetime, timedelta

import jwt
from werkzeug.security import check_password_hash

from app.dominios.usuarios.repositorios import UsuarioRepositorio
from app.errores import CredencialesInvalidasError, NoEncontradoError


def _generar_access_token(usuario, secret_key, exp_minutes):
    """Genera un JWT de acceso con claims basicos (el rol se consulta en BD)."""
    ahora = datetime.now(UTC)
    payload = {
        "sub": str(usuario.id),
        "rol": usuario.rol,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=exp_minutes),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


class UsuarioServicio:
    """Logica de negocio para login y sesion."""

    def __init__(self, secret_key, jwt_exp_minutes):
        self.secret_key = secret_key
        self.jwt_exp_minutes = jwt_exp_minutes

    def iniciar_sesion(self, datos):
        """Valida usuario/contrasena y genera un JWT de acceso."""
        usuario = UsuarioRepositorio.obtener_por_usuario(datos["usuario"].strip().lower())
        if not usuario or not check_password_hash(usuario.contrasena, datos["contrasena"]):
            raise CredencialesInvalidasError("Usuario o contraseña incorrectos.")

        return {
            "access_token": _generar_access_token(
                usuario, self.secret_key, self.jwt_exp_minutes
            ),
            "usuario": usuario.to_dict(),
        }

    def obtener_actual(self, usuario_id):
        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        if not usuario:
            raise NoEncontradoError("Usuario no encontrado.")
        return usuario.to_dict()
