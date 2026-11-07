from datetime import datetime

from app import db

# Solo dos roles en SINU
ROLES = {"admin": "Administrador", "mesero": "Mesero"}


class Usuario(db.Model):
    """Usuario del gastrobar (Administrador o Mesero)."""

    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False, server_default="mesero")
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "usuario": self.usuario,
            "nombre": self.nombre,
            "rol": self.rol,
            "rol_nombre": ROLES.get(self.rol, self.rol),
        }
