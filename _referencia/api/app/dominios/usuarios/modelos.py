from datetime import datetime

from app import db


class Usuario(db.Model):
    """Modelo de usuario de la plataforma."""

    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    rol = db.Column(db.String(20), nullable=False, server_default="usuario")

    # Relacion one-to-one con PerfilUsuario
    perfil = db.relationship(
        "PerfilUsuario",
        backref=db.backref("usuario", uselist=False),
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "correo": self.correo,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "rol": self.rol,
        }


class PerfilUsuario(db.Model):
    """Perfil complementario del usuario."""

    __tablename__ = "perfiles"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    apellido = db.Column(db.String(50))
    telefono = db.Column(db.String(20))
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "telefono": self.telefono,
            "usuario_id": self.usuario_id,
        }
