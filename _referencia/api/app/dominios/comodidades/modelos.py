from app import db

# Tabla de asociacion para relacion N:M entre Alojamientos y Comodidades
alojamiento_comodidad = db.Table(
    "alojamiento_comodidad",
    db.Column("alojamiento_id", db.Integer, db.ForeignKey("alojamientos.id"), primary_key=True),
    db.Column("comodidad_id", db.Integer, db.ForeignKey("comodidades.id"), primary_key=True),
)


class Comodidad(db.Model):
    """Modelo de comodidad de la plataforma."""

    __tablename__ = "comodidades"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)

    # Relacion N:M con Alojamiento
    alojamientos = db.relationship(
        "Alojamiento",
        secondary=alojamiento_comodidad,
        back_populates="comodidades",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
        }
