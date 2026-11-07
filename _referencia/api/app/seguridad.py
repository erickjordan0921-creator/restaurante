from functools import wraps

import jwt
from flask import current_app, jsonify, request


def _extraer_y_validar_token():
    """Extrae el header Authorization, valida el JWT y devuelve el usuario_id."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, (
            jsonify({"success": False, "error": {"message": "Token no proporcionado."}}),
            401,
        )

    partes = auth_header.split()
    if len(partes) != 2 or partes[0].lower() != "bearer":
        return None, (
            jsonify(
                {
                    "success": False,
                    "error": {"message": "Formato de token invalido. Use: Bearer <token>"},
                }
            ),
            401,
        )

    token = partes[1]

    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"],
        )
        return int(payload["sub"]), None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"success": False, "error": {"message": "Token expirado."}}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"success": False, "error": {"message": "Token invalido."}}), 401)


def requiere_token(f):
    """Decorador que exige un token JWT valido en el header Authorization.

    Inyecta `usuario_id` como argumento en la funcion decorada.
    """

    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_id, error = _extraer_y_validar_token()
        if error:
            return error
        return f(*args, usuario_id=usuario_id, **kwargs)

    return wrapper


def requiere_admin(f):
    """Decorador que exige token valido Y rol admin.

    Primero autentica al usuario (reutiliza la validacion de token).
    Luego consulta su rol real en la base de datos.
    Si no es admin, lanza PermisoDenegadoError (manejado por el error handler global).
    """

    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_id, error = _extraer_y_validar_token()
        if error:
            return error

        # Consultar rol real en la base de datos
        from app.dominios.usuarios.repositorios import UsuarioRepositorio
        from app.dominios.usuarios.servicios import PermisoDenegadoError

        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        if not usuario or usuario.rol != "admin":
            raise PermisoDenegadoError("Permiso denegado. Se requiere rol de administrador.")

        return f(*args, usuario_id=usuario_id, **kwargs)

    return wrapper
