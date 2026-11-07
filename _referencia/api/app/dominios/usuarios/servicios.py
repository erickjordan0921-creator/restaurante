from datetime import UTC, datetime, timedelta

import jwt
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.dominios.usuarios.modelos import PerfilUsuario, Usuario
from app.dominios.usuarios.repositorios import UsuarioRepositorio

# --- Excepciones de dominio ---


class CorreoYaRegistradoError(Exception):
    pass


class CredencialesInvalidasError(Exception):
    pass


class UsuarioNoEncontradoError(Exception):
    pass


class PermisoDenegadoError(Exception):
    pass


# --- Funciones auxiliares de JWT ---


def _generar_access_token(usuario, secret_key, exp_minutes):
    """Genera un JWT de acceso con claims basicos."""
    ahora = datetime.now(UTC)
    payload = {
        "sub": str(usuario.id),
        "iat": ahora,
        "exp": ahora + timedelta(minutes=exp_minutes),
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token


# --- Servicio de usuarios ---


class UsuarioServicio:
    """Logica de negocio para registro, login y perfil."""

    def __init__(self, secret_key, jwt_exp_minutes):
        self.secret_key = secret_key
        self.jwt_exp_minutes = jwt_exp_minutes

    def registrar_usuario(self, datos):
        """Registra un nuevo usuario con correo y contrasena hasheada."""
        correo = datos["correo"]
        existente = UsuarioRepositorio.obtener_por_correo(correo)
        if existente:
            raise CorreoYaRegistradoError(f"El correo {correo} ya esta registrado.")

        contrasena_hash = generate_password_hash(datos["contrasena"])
        usuario = Usuario(correo=correo, contrasena=contrasena_hash)
        UsuarioRepositorio.guardar_usuario(usuario)

        # Crear perfil vacio
        perfil = PerfilUsuario(usuario_id=usuario.id)
        UsuarioRepositorio.guardar_perfil(perfil)

        return usuario

    def iniciar_sesion(self, datos):
        """Valida credenciales y genera un JWT de acceso."""
        correo = datos.get("correo")
        contrasena = datos.get("contrasena")

        if not correo or not contrasena:
            raise CredencialesInvalidasError("Correo y contrasena son obligatorios.")

        usuario = UsuarioRepositorio.obtener_por_correo(correo)
        if not usuario or not check_password_hash(usuario.contrasena, contrasena):
            raise CredencialesInvalidasError("Credenciales invalidas.")

        access_token = _generar_access_token(usuario, self.secret_key, self.jwt_exp_minutes)

        return {
            "access_token": access_token,
            "usuario": usuario.to_dict(),
        }

    def obtener_perfil(self, usuario_id):
        """Obtiene el perfil de un usuario."""
        perfil = UsuarioRepositorio.obtener_perfil_por_usuario_id(usuario_id)
        if not perfil:
            return None
        return perfil.to_dict()

    def actualizar_perfil(self, usuario_id, datos):
        """Actualiza parcialmente el perfil de un usuario."""
        perfil = UsuarioRepositorio.obtener_perfil_por_usuario_id(usuario_id)

        if not perfil:
            perfil = PerfilUsuario(usuario_id=usuario_id)

        # Solo actualiza campos no None
        if datos.get("nombre") is not None:
            perfil.nombre = datos["nombre"]
        if datos.get("apellido") is not None:
            perfil.apellido = datos["apellido"]
        if datos.get("telefono") is not None:
            perfil.telefono = datos["telefono"]

        UsuarioRepositorio.guardar_perfil(perfil)
        return perfil.to_dict()

    def listar_todos_los_usuarios(self):
        """Devuelve lista de todos los usuarios sin datos sensibles."""
        usuarios = db.session.query(Usuario).all()
        return [u.to_dict() for u in usuarios]

    def promover_a_admin(self, correo):
        """Promueve al usuario con el correo dado a rol admin."""
        usuario = UsuarioRepositorio.obtener_por_correo(correo)
        if not usuario:
            raise UsuarioNoEncontradoError(f"No se encontro ningun usuario con correo {correo}.")
        usuario.rol = "admin"
        db.session.commit()
        return usuario
