from app import db
from app.dominios.alojamientos.modelos import Alojamiento
from app.dominios.alojamientos.repositorios import AlojamientoRepositorio
from app.dominios.comodidades.repositorios import ComodidadRepositorio
from app.dominios.usuarios.servicios import PermisoDenegadoError

# --- Excepciones de dominio ---


class AlojamientoNoEncontradoError(Exception):
    pass


class ComodidadesInvalidasError(Exception):
    pass


# --- Servicio de alojamientos ---


class AlojamientoServicio:
    """Logica de negocio para alojamientos."""

    def crear_alojamiento(self, datos, usuario_id):
        """Crea un nuevo alojamiento asignado al usuario autenticado."""
        alojamiento = Alojamiento(
            titulo=datos["titulo"],
            descripcion=datos["descripcion"],
            precio_noche=datos["precio_noche"],
            ciudad=datos["ciudad"],
            usuario_id=usuario_id,
        )
        AlojamientoRepositorio.guardar(alojamiento)
        return alojamiento

    def listar_todos(self):
        """Devuelve lista de todos los alojamientos (publico)."""
        alojamientos = AlojamientoRepositorio.obtener_todos()
        return [a.to_dict() for a in alojamientos]

    def obtener_detalle(self, alojamiento_id):
        """Obtiene el detalle de un alojamiento incluyendo comodidades (publico)."""
        alojamiento = AlojamientoRepositorio.obtener_por_id_con_comodidades(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f"Alojamiento con id {alojamiento_id} no encontrado."
            )
        return alojamiento.to_dict()

    def actualizar_alojamiento(self, alojamiento_id, usuario_id, datos):
        """Actualiza parcialmente un alojamiento. Solo propietario o admin."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f"Alojamiento con id {alojamiento_id} no encontrado."
            )

        # Consultar rol del usuario para verificar permiso
        from app.dominios.usuarios.repositorios import UsuarioRepositorio

        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == "admin"

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                "Permiso denegado. Solo el propietario o un administrador pueden editar este alojamiento."
            )

        if datos.get("titulo") is not None:
            alojamiento.titulo = datos["titulo"]
        if datos.get("descripcion") is not None:
            alojamiento.descripcion = datos["descripcion"]
        if datos.get("precio_noche") is not None:
            alojamiento.precio_noche = datos["precio_noche"]
        if datos.get("ciudad") is not None:
            alojamiento.ciudad = datos["ciudad"]

        AlojamientoRepositorio.guardar(alojamiento)
        return alojamiento.to_dict()

    def eliminar_alojamiento(self, alojamiento_id, usuario_id):
        """Elimina un alojamiento. Solo propietario o admin."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f"Alojamiento con id {alojamiento_id} no encontrado."
            )

        # Consultar rol del usuario para verificar permiso
        from app.dominios.usuarios.repositorios import UsuarioRepositorio

        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == "admin"

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                "Permiso denegado. Solo el propietario o un administrador pueden eliminar este alojamiento."
            )

        AlojamientoRepositorio.eliminar(alojamiento)

    def asignar_comodidades(self, alojamiento_id, usuario_id, comodidad_ids):
        """Reemplaza la lista completa de comodidades de un alojamiento."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f"Alojamiento con id {alojamiento_id} no encontrado."
            )

        # Verificar permiso: propietario o admin
        from app.dominios.usuarios.repositorios import UsuarioRepositorio

        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == "admin"

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                "Permiso denegado. Solo el propietario o un administrador pueden modificar las comodidades de este alojamiento."
            )

        # Verificar que todas las comodidades existen
        if comodidad_ids:
            comodidades = ComodidadRepositorio.obtener_por_ids(comodidad_ids)
            if len(comodidades) != len(comodidad_ids):
                ids_encontrados = {c.id for c in comodidades}
                ids_faltantes = set(comodidad_ids) - ids_encontrados
                raise ComodidadesInvalidasError(
                    f"Las comodidades con ids {list(ids_faltantes)} no existen."
                )
            alojamiento.comodidades = comodidades
        else:
            # Lista vacia: dejar el alojamiento sin comodidades
            alojamiento.comodidades = []

        db.session.commit()
        return alojamiento
