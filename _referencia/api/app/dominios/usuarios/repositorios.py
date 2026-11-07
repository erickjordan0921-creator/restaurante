from app import db
from app.dominios.usuarios.modelos import PerfilUsuario, Usuario


class UsuarioRepositorio:
    """Capa de acceso a datos para usuarios y perfiles."""

    @staticmethod
    def guardar_usuario(usuario):
        """Inserta o actualiza un usuario en la BD."""
        db.session.add(usuario)
        db.session.commit()
        return usuario

    @staticmethod
    def obtener_por_correo(correo):
        """Busca un usuario por su correo."""
        return db.session.query(Usuario).filter_by(correo=correo).first()

    @staticmethod
    def obtener_por_id(usuario_id):
        """Busca un usuario por su ID."""
        return db.session.get(Usuario, usuario_id)

    @staticmethod
    def obtener_perfil_por_usuario_id(usuario_id):
        """Busca el perfil de un usuario."""
        return db.session.query(PerfilUsuario).filter_by(usuario_id=usuario_id).first()

    @staticmethod
    def guardar_perfil(perfil):
        """Inserta o actualiza un perfil."""
        db.session.add(perfil)
        db.session.commit()
        return perfil
