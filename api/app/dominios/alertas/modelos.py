from app import db

# Tipos de alerta de SINU: titulo, severidad (danger/warn/info) e icono
TIPOS = {
    "agotado": {"titulo": "Agotado", "severidad": "danger", "icono": "⛔"},
    "stock-bajo": {"titulo": "Stock bajo", "severidad": "warn", "icono": "📉"},
    "lote-vencido": {"titulo": "Lote vencido", "severidad": "danger", "icono": "☠️"},
    "por-vencer": {"titulo": "Lote por vencer", "severidad": "warn", "icono": "⏳"},
    "plato-no-disponible": {"titulo": "Plato no disponible", "severidad": "danger", "icono": "🍽️"},
    "usar-primero": {"titulo": "Sugerencia: usar primero", "severidad": "info", "icono": "💡"},
}


class Alerta(db.Model):
    """Alerta derivada del inventario. `clave` identifica la condicion que la origina."""

    __tablename__ = "alertas"

    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(60), unique=True, nullable=False)
    tipo = db.Column(db.String(30), nullable=False)
    mensaje = db.Column(db.String(255), nullable=False)
    insumo_id = db.Column(db.Integer, nullable=True)
    lote_id = db.Column(db.Integer, nullable=True)
    plato_id = db.Column(db.Integer, nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="activa")  # activa | atendida
    fecha = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        tipo = TIPOS.get(self.tipo, {})
        return {
            "id": self.id,
            "tipo": self.tipo,
            "titulo": tipo.get("titulo", self.tipo),
            "severidad": tipo.get("severidad", "info"),
            "icono": tipo.get("icono", ""),
            "mensaje": self.mensaje,
            "insumo_id": self.insumo_id,
            "lote_id": self.lote_id,
            "plato_id": self.plato_id,
            "estado": self.estado,
            "fecha": self.fecha.isoformat(),
        }
