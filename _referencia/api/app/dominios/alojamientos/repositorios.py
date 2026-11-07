from app import db
from app.dominios.alojamientos.modelos import Alojamiento


class AlojamientoRepositorio:
    """Capa de acceso a datos para alojamientos."""

    @staticmethod
    def guardar(alojamiento):
        """Inserta o actualiza un alojamiento en la BD."""
        db.session.add(alojamiento)
        db.session.commit()
        return alojamiento

    @staticmethod
    def obtener_por_id(alojamiento_id):
        """Busca un alojamiento por su ID."""
        return db.session.get(Alojamiento, alojamiento_id)

    @staticmethod
    def obtener_todos():
        """Devuelve todos los alojamientos."""
        return db.session.query(Alojamiento).all()

    @staticmethod
    def obtener_por_usuario_id(usuario_id):
        """Devuelve los alojamientos de un usuario."""
        return db.session.query(Alojamiento).filter_by(usuario_id=usuario_id).all()

    @staticmethod
    def eliminar(alojamiento):
        """Elimina un alojamiento de la BD."""
        db.session.delete(alojamiento)
        db.session.commit()

    @staticmethod
    def obtener_por_id_con_comodidades(alojamiento_id):
        """Busca un alojamiento por su ID cargando sus comodidades (eager loading)."""
        return (
            db.session.query(Alojamiento)
            .options(db.joinedload(Alojamiento.comodidades))
            .filter(Alojamiento.id == alojamiento_id)
            .first()
        )
