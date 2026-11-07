from app import db
from app.dominios.comodidades.modelos import Comodidad


class ComodidadRepositorio:
    """Capa de acceso a datos para comodidades."""

    @staticmethod
    def guardar(comodidad):
        """Inserta o actualiza una comodidad en la BD."""
        db.session.add(comodidad)
        db.session.commit()
        return comodidad

    @staticmethod
    def obtener_por_id(comodidad_id):
        """Busca una comodidad por su ID."""
        return db.session.get(Comodidad, comodidad_id)

    @staticmethod
    def obtener_todos():
        """Devuelve todas las comodidades."""
        return db.session.query(Comodidad).all()

    @staticmethod
    def obtener_por_ids(comodidad_ids):
        """Devuelve las comodidades cuyos IDs estan en la lista."""
        return db.session.query(Comodidad).filter(Comodidad.id.in_(comodidad_ids)).all()
