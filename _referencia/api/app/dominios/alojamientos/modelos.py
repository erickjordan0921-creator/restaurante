from datetime import datetime

from app import db

# Importar la tabla de asociacion para definir la relacion N:M
# (se importa desde comodidades para evitar import circular)
from app.dominios.comodidades.modelos import alojamiento_comodidad


class Alojamiento(db.Model):
    """Modelo de alojamiento de la plataforma."""

    __tablename__ = "alojamientos"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    precio_noche = db.Column(db.Numeric(10, 2), nullable=False)
    ciudad = db.Column(db.String(100), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacion many-to-one con Usuario
    usuario = db.relationship(
        "Usuario",
        backref=db.backref("alojamientos", lazy=True),
        lazy=True,
    )

    # Relacion many-to-many con Comodidad
    comodidades = db.relationship(
        "Comodidad",
        secondary=alojamiento_comodidad,
        back_populates="alojamientos",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "precio_noche": float(self.precio_noche),
            "ciudad": self.ciudad,
            "usuario_id": self.usuario_id,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "comodidades": [c.to_dict() for c in self.comodidades],
        }
