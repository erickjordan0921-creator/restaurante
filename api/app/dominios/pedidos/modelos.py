from app import db

ESTADOS = {
    "pendiente": "Pendiente",
    "en preparación": "En preparación",
    "listo": "Listo",
    "entregado": "Entregado",
    "cancelado": "Cancelado",
}
# Flujo del pedido: pendiente -> en preparacion -> listo -> entregado
SIGUIENTE = {"pendiente": "en preparación", "en preparación": "listo", "listo": "entregado"}


class Pedido(db.Model):
    """Pedido de una mesa. Al crearse descuenta insumos por FEFO y registra la venta."""

    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True)
    mesa = db.Column(db.String(10), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="pendiente")
    total = db.Column(db.Integer, nullable=False, default=0)
    fecha = db.Column(db.DateTime, nullable=False)
    fecha_en_preparacion = db.Column(db.DateTime, nullable=True)
    fecha_listo = db.Column(db.DateTime, nullable=True)
    fecha_entregado = db.Column(db.DateTime, nullable=True)
    # La mesa se libera cerrando sus pedidos entregados
    cerrado = db.Column(db.Boolean, nullable=False, default=False)
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    # Solo se devuelve stock si se cancela antes de empezar a prepararlo
    stock_devuelto = db.Column(db.Boolean, nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)

    items = db.relationship("PedidoItem", cascade="all, delete-orphan", lazy=True)
    consumos = db.relationship("Consumo", cascade="all, delete-orphan", lazy=True)

    @property
    def codigo(self):
        return f"PED-{self.id}"

    def to_dict(self):
        def iso(valor):
            return valor.isoformat() if valor else None

        return {
            "id": self.id,
            "codigo": self.codigo,
            "mesa": self.mesa,
            "estado": self.estado,
            "estado_nombre": ESTADOS.get(self.estado, self.estado),
            "total": self.total,
            "fecha": iso(self.fecha),
            "fecha_en_preparacion": iso(self.fecha_en_preparacion),
            "fecha_listo": iso(self.fecha_listo),
            "fecha_entregado": iso(self.fecha_entregado),
            "stock_devuelto": self.stock_devuelto,
            "items": [item.to_dict() for item in self.items],
        }


class PedidoItem(db.Model):
    """Linea del pedido. Guarda copia de nombre y precio por si el plato cambia o se borra."""

    __tablename__ = "pedido_items"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    plato_id = db.Column(db.Integer, nullable=True)  # sin FK: el plato puede eliminarse
    nombre = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "plato_id": self.plato_id,
            "nombre": self.nombre,
            "precio": self.precio,
            "cantidad": self.cantidad,
        }


class Consumo(db.Model):
    """Cantidad tomada de cada lote por el pedido (permite devolverla al cancelar)."""

    __tablename__ = "consumos"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    insumo_id = db.Column(db.Integer, nullable=False)
    lote_id = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Float, nullable=False)
