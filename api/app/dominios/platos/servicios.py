import math

from app.dominios.inventario.repositorios import InventarioRepositorio
from app.dominios.platos.modelos import Plato, RecetaItem
from app.dominios.platos.repositorios import PlatoRepositorio
from app.errores import ConflictoError, DatosInvalidosError, NoEncontradoError
from app.utilidades import r3

EPS = 1e-9


class PlatoServicio:
    """Platos, recetas y disponibilidad segun stock (equivale a Recetas en SINU)."""

    def __init__(self, inventario_servicio):
        self.inventario = inventario_servicio

    def obtener(self, plato_id):
        plato = PlatoRepositorio.obtener_por_id(plato_id)
        if not plato:
            raise NoEncontradoError(f"Plato con id {plato_id} no encontrado.")
        return plato

    def listar(self):
        return PlatoRepositorio.listar()

    def guardar(self, datos, plato_id=None):
        """Crea o actualiza un plato y reemplaza su receta completa."""
        nombre = datos["nombre"].strip()
        duplicado = PlatoRepositorio.obtener_por_nombre(nombre)
        if duplicado and duplicado.id != plato_id:
            raise ConflictoError("Ya existe un plato con ese nombre.")

        for item in datos["receta"]:
            if not InventarioRepositorio.obtener_insumo(item["insumo_id"]):
                raise DatosInvalidosError({"receta": ["Hay un insumo no válido en la receta."]})

        plato = self.obtener(plato_id) if plato_id else Plato()
        plato.nombre = nombre
        plato.precio = datos["precio"]
        plato.activo = datos["activo"]
        plato.receta = [
            RecetaItem(insumo_id=item["insumo_id"], cantidad=r3(item["cantidad"]))
            for item in datos["receta"]
        ]
        return PlatoRepositorio.guardar(plato)

    def eliminar(self, plato_id):
        """Elimina plato y receta. Los pedidos guardan copia de nombre y precio."""
        PlatoRepositorio.eliminar(self.obtener(plato_id))

    # ---------------- Disponibilidad ----------------

    def _posibles_por_item(self, item):
        disponible = self.inventario.stock_disponible(item.insumo)
        return math.floor(disponible / item.cantidad + EPS)

    def platos_posibles(self, plato):
        """Platos posibles = minimo(stock disponible / cantidad por receta)."""
        if not plato.receta:
            return 0
        return min(self._posibles_por_item(item) for item in plato.receta)

    def insumo_limitante(self, plato):
        if not plato.receta:
            return None
        peor = min(plato.receta, key=self._posibles_por_item)
        return peor.insumo

    def tiene_insumo_por_vencer(self, plato):
        return any(self.inventario.proximo_a_vencer(item.insumo) for item in plato.receta)

    def disponibilidad(self):
        filas = []
        for plato in self.listar():
            posibles = self.platos_posibles(plato) if plato.activo else 0
            limitante = self.insumo_limitante(plato)
            filas.append(
                {
                    "plato": plato.to_dict(),
                    "posibles": posibles,
                    "disponible": plato.activo and posibles > 0,
                    "limitante": limitante.nombre if limitante else None,
                }
            )
        return filas

    def no_disponibles(self):
        return [
            fila["plato"]
            for fila in self.disponibilidad()
            if fila["plato"]["activo"] and not fila["disponible"]
        ]

    def requerimientos(self, items):
        """Suma por insumo lo que exige una lista de items {plato, cantidad}."""
        requeridos = {}
        for plato, cantidad in items:
            for item in plato.receta:
                requeridos[item.insumo_id] = r3(
                    requeridos.get(item.insumo_id, 0) + item.cantidad * cantidad
                )
        return requeridos
