from flask import Blueprint, request

from app.dominios.inventario.dtos import InsumoDTO, LoteDTO
from app.dominios.usuarios.repositorios import UsuarioRepositorio
from app.respuestas import ok, validar
from app.seguridad import requiere_admin

inventario_bp = Blueprint("inventario", __name__)

# Variable global que el app factory asignara al crear la app
inventario_servicio = None


def _nombre_usuario(usuario_id):
    usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
    return usuario.nombre if usuario else "Sistema"


# ---------------- Insumos (solo Administrador) ----------------


@inventario_bp.route("/insumos", methods=["GET"])
@requiere_admin
def listar_insumos(usuario_id):
    """Existencias por insumo (disponible, vencido, estado)."""
    return ok(inventario_servicio.resumen(), "Existencias por insumo.")


@inventario_bp.route("/insumos", methods=["POST"])
@requiere_admin
def crear_insumo(usuario_id):
    insumo = inventario_servicio.guardar_insumo(validar(InsumoDTO()))
    return ok(insumo.to_dict(), "Insumo agregado.", 201)


@inventario_bp.route("/insumos/<int:insumo_id>", methods=["PUT"])
@requiere_admin
def actualizar_insumo(usuario_id, insumo_id):
    insumo = inventario_servicio.guardar_insumo(validar(InsumoDTO()), insumo_id)
    return ok(insumo.to_dict(), "Insumo actualizado.")


@inventario_bp.route("/insumos/<int:insumo_id>", methods=["DELETE"])
@requiere_admin
def eliminar_insumo(usuario_id, insumo_id):
    inventario_servicio.eliminar_insumo(insumo_id)
    return "", 204


# ---------------- Lotes (solo Administrador) ----------------


@inventario_bp.route("/lotes", methods=["GET"])
@requiere_admin
def listar_lotes(usuario_id):
    """Lotes en orden FEFO. ?todos=1 incluye agotados y dados de baja."""
    solo_con_stock = request.args.get("todos") not in ("1", "true")
    lotes = inventario_servicio.listar_lotes(solo_con_stock)
    return ok([lote.to_dict() for lote in lotes], "Lotes en orden FEFO.")


@inventario_bp.route("/lotes", methods=["POST"])
@requiere_admin
def ingresar_lote(usuario_id):
    lote = inventario_servicio.ingresar_lote(validar(LoteDTO()), _nombre_usuario(usuario_id))
    return ok(lote.to_dict(), "Lote registrado.", 201)
