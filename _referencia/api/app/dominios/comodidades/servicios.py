from app.dominios.comodidades.modelos import Comodidad
from app.dominios.comodidades.repositorios import ComodidadRepositorio

# --- Excepciones de dominio ---


class ComodidadNoEncontradaError(Exception):
    pass


class ComodidadYaExisteError(Exception):
    pass


# --- Servicio de comodidades ---


class ComodidadServicio:
    """Logica de negocio para comodidades."""

    def crear_comodidad(self, datos):
        """Crea una nueva comodidad. Solo admin."""
        nombre = datos["nombre"]

        # Verificar duplicado
        comodidades_existentes = ComodidadRepositorio.obtener_todos()
        for c in comodidades_existentes:
            if c.nombre.lower() == nombre.lower():
                raise ComodidadYaExisteError(f"Ya existe una comodidad con el nombre {nombre}.")

        comodidad = Comodidad(nombre=nombre)
        ComodidadRepositorio.guardar(comodidad)
        return comodidad

    def listar_todos(self):
        """Devuelve lista de todas las comodidades (publico)."""
        comodidades = ComodidadRepositorio.obtener_todos()
        return [c.to_dict() for c in comodidades]

    def obtener_detalle(self, comodidad_id):
        """Obtiene el detalle de una comodidad (publico)."""
        comodidad = ComodidadRepositorio.obtener_por_id(comodidad_id)
        if not comodidad:
            raise ComodidadNoEncontradaError(f"Comodidad con id {comodidad_id} no encontrada.")
        return comodidad.to_dict()
