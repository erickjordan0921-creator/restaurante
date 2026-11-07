from flask import Blueprint

from app.dominios.usuarios.dtos import LoginDTO
from app.respuestas import ok, validar
from app.seguridad import requiere_token

usuarios_bp = Blueprint("usuarios", __name__)

# Variable global que el app factory asignara al crear la app
usuario_servicio = None


@usuarios_bp.route("/login", methods=["POST"])
def login():
    """Iniciar sesion con usuario y contrasena; devuelve token JWT y rol."""
    datos = validar(LoginDTO())
    return ok(usuario_servicio.iniciar_sesion(datos), "Inicio de sesion exitoso.")


@usuarios_bp.route("/yo", methods=["GET"])
@requiere_token
def usuario_actual(usuario_id):
    """Datos del usuario autenticado (para revalidar la sesion guardada)."""
    return ok(usuario_servicio.obtener_actual(usuario_id), "Usuario autenticado.")
