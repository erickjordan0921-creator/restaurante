from app import db
from app.dominios.alertas.modelos import Alerta


class AlertaRepositorio:
    """Capa de acceso a datos para alertas."""

    @staticmethod
    def listar():
        return db.session.query(Alerta).all()

    @staticmethod
    def obtener_por_id(alerta_id):
        return db.session.get(Alerta, alerta_id)

    @staticmethod
    def contar_activas():
        return db.session.query(Alerta).filter_by(estado="activa").count()
