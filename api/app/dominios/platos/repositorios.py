from app import db
from app.dominios.inventario.repositorios import clave_orden
from app.dominios.platos.modelos import Plato


class PlatoRepositorio:
    """Capa de acceso a datos para platos y recetas."""

    @staticmethod
    def guardar(plato):
        db.session.add(plato)
        db.session.commit()
        return plato

    @staticmethod
    def obtener_por_id(plato_id):
        return db.session.get(Plato, plato_id)

    @staticmethod
    def obtener_por_nombre(nombre):
        return db.session.query(Plato).filter(db.func.lower(Plato.nombre) == nombre.lower()).first()

    @staticmethod
    def listar():
        return sorted(db.session.query(Plato).all(), key=lambda p: clave_orden(p.nombre))

    @staticmethod
    def eliminar(plato):
        db.session.delete(plato)
        db.session.commit()
