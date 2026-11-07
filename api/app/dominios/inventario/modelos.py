from datetime import datetime

from app import db
from app.utilidades import dias_hasta

UNIDADES = ["kg", "g", "l", "unidad"]
TIPOS_MOVIMIENTO = {
    "ingreso": "Ingreso",
    "consumo": "Consumo por pedido",
    "merma": "Merma",
    "ajuste": "Ajuste",
}


class Insumo(db.Model):
    """Materia prima del gastrobar (pescado, arroz, limon...)."""

    __tablename__ = "insumos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    unidad = db.Column(db.String(10), nullable=False)
    stock_minimo = db.Column(db.Float, nullable=False, default=0)
    # Dias de anticipacion para alertar vencimiento; None = usar el valor por defecto
    dias_alerta = db.Column(db.Integer, nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    lotes = db.relationship(
        "Lote",
        backref=db.backref("insumo", lazy="joined"),
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "unidad": self.unidad,
            "stock_minimo": self.stock_minimo,
            "dias_alerta": self.dias_alerta,
        }


class Lote(db.Model):
    """Ingreso de un insumo con fecha de vencimiento propia (base de la rotacion FEFO)."""

    __tablename__ = "lotes"

    id = db.Column(db.Integer, primary_key=True)
    insumo_id = db.Column(db.Integer, db.ForeignKey("insumos.id"), nullable=False)
    cantidad_inicial = db.Column(db.Float, nullable=False)
    cantidad_actual = db.Column(db.Float, nullable=False)
    fecha_ingreso = db.Column(db.Date, nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    # Dado de baja por merma (el resto de estados se derivan de cantidad y fecha)
    mermado = db.Column(db.Boolean, nullable=False, default=False)

    @property
    def codigo(self):
        return f"L-{self.id}"

    @property
    def estado(self):
        if self.mermado:
            return "mermado"
        if self.cantidad_actual <= 0:
            return "agotado"
        if dias_hasta(self.fecha_vencimiento) < 0:
            return "vencido"
        return "activo"

    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "insumo_id": self.insumo_id,
            "insumo": self.insumo.nombre if self.insumo else None,
            "unidad": self.insumo.unidad if self.insumo else None,
            "cantidad_inicial": self.cantidad_inicial,
            "cantidad_actual": self.cantidad_actual,
            "fecha_ingreso": self.fecha_ingreso.isoformat(),
            "fecha_vencimiento": self.fecha_vencimiento.isoformat(),
            "dias_para_vencer": dias_hasta(self.fecha_vencimiento),
            "estado": self.estado,
        }


class Movimiento(db.Model):
    """Bitacora de entradas y salidas de inventario (cantidad con signo)."""

    __tablename__ = "movimientos"

    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)
    # Sin FK: la bitacora se conserva aunque se elimine el insumo
    insumo_id = db.Column(db.Integer, nullable=False)
    lote_id = db.Column(db.Integer, nullable=True)
    cantidad = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, nullable=False)
    usuario = db.Column(db.String(100), nullable=False, default="Sistema")
    nota = db.Column(db.String(255), nullable=False, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "insumo_id": self.insumo_id,
            "lote_id": self.lote_id,
            "cantidad": self.cantidad,
            "fecha": self.fecha.isoformat(),
            "usuario": self.usuario,
            "nota": self.nota,
        }
