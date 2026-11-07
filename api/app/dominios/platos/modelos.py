from app import db


class Plato(db.Model):
    """Plato del menu; su disponibilidad depende del stock de los insumos de la receta."""

    __tablename__ = "platos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    precio = db.Column(db.Integer, nullable=False)  # COP, sin decimales
    activo = db.Column(db.Boolean, nullable=False, default=True)

    receta = db.relationship(
        "RecetaItem",
        backref="plato",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": self.precio,
            "activo": self.activo,
            "receta": [item.to_dict() for item in self.receta],
        }


class RecetaItem(db.Model):
    """Cantidad de un insumo que consume UNA unidad del plato."""

    __tablename__ = "receta_items"
    __table_args__ = (db.UniqueConstraint("plato_id", "insumo_id", name="uq_receta_plato_insumo"),)

    id = db.Column(db.Integer, primary_key=True)
    plato_id = db.Column(db.Integer, db.ForeignKey("platos.id"), nullable=False)
    insumo_id = db.Column(db.Integer, db.ForeignKey("insumos.id"), nullable=False)
    cantidad = db.Column(db.Float, nullable=False)

    insumo = db.relationship("Insumo", lazy="joined")

    def to_dict(self):
        return {
            "insumo_id": self.insumo_id,
            "insumo": self.insumo.nombre if self.insumo else None,
            "unidad": self.insumo.unidad if self.insumo else None,
            "cantidad": self.cantidad,
        }
