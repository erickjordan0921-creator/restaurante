import unicodedata

from app import db
from app.dominios.inventario.modelos import Insumo, Lote


def clave_orden(texto):
    """Orden alfabetico en espanol ignorando tildes (Arroz, Calamar, Camaron...)."""
    return unicodedata.normalize("NFD", texto.lower()).encode("ascii", "ignore").decode()


class InventarioRepositorio:
    """Capa de acceso a datos para insumos, lotes y movimientos."""

    @staticmethod
    def guardar(entidad):
        db.session.add(entidad)
        db.session.commit()
        return entidad

    @staticmethod
    def obtener_insumo(insumo_id):
        return db.session.get(Insumo, insumo_id)

    @staticmethod
    def obtener_insumo_por_nombre(nombre):
        return (
            db.session.query(Insumo)
            .filter(db.func.lower(Insumo.nombre) == nombre.lower())
            .first()
        )

    @staticmethod
    def listar_insumos():
        return sorted(db.session.query(Insumo).all(), key=lambda i: clave_orden(i.nombre))

    @staticmethod
    def listar_lotes():
        return db.session.query(Lote).all()

    @staticmethod
    def obtener_lote(lote_id):
        return db.session.get(Lote, lote_id)

    @staticmethod
    def agregar(entidad):
        """Agrega sin hacer commit: forma parte de la transaccion del llamador."""
        db.session.add(entidad)

    @staticmethod
    def eliminar(entidad):
        db.session.delete(entidad)
        db.session.commit()
