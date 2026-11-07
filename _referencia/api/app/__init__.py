from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from app.config import Config

# Version de la API
API_VERSION = "v1"

# Instancia de SQLAlchemy (se inicializa dentro del factory)
db = SQLAlchemy()

# Instancia de Flask-Migrate (se inicializa dentro del factory)
migrate = Migrate()


def crear_app():
    """App factory: crea y configura la instancia de Flask."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config["CORS_ALLOWED_ORIGINS"])

    # Endpoint de salud (publico, sin auth)
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok", "service": "alojamientos-api", "version": API_VERSION}, 200

    # Registrar blueprint de usuarios
    from app.dominios.usuarios import controladores as usuarios_ctrl
    from app.dominios.usuarios.controladores import admin_bp, usuarios_bp
    from app.dominios.usuarios.servicios import UsuarioServicio

    # Inyectar el servicio con la config correcta
    usuarios_ctrl.usuario_servicio = UsuarioServicio(
        secret_key=app.config["SECRET_KEY"],
        jwt_exp_minutes=app.config.get("JWT_EXP_MINUTES", 15),
    )

    app.register_blueprint(usuarios_bp, url_prefix=f"/api/{API_VERSION}/usuarios")
    app.register_blueprint(admin_bp, url_prefix=f"/api/{API_VERSION}/admin")

    # Registrar blueprint de alojamientos
    from app.dominios.alojamientos import controladores as alojamientos_ctrl
    from app.dominios.alojamientos.controladores import alojamientos_bp
    from app.dominios.alojamientos.servicios import AlojamientoServicio

    alojamientos_ctrl.alojamiento_servicio = AlojamientoServicio()

    app.register_blueprint(alojamientos_bp, url_prefix=f"/api/{API_VERSION}/alojamientos")

    # Registrar blueprint de comodidades
    from app.dominios.comodidades import controladores as comodidades_ctrl
    from app.dominios.comodidades.controladores import comodidades_bp
    from app.dominios.comodidades.servicios import ComodidadServicio

    comodidades_ctrl.comodidad_servicio = ComodidadServicio()

    app.register_blueprint(comodidades_bp, url_prefix=f"/api/{API_VERSION}/comodidades")

    # Manejadores globales de error
    @app.errorhandler(404)
    def recurso_no_encontrado(error):
        return {"success": False, "error": {"message": "Recurso no encontrado"}}, 404

    @app.errorhandler(500)
    def error_interno(error):
        return {"success": False, "error": {"message": "Error interno del servidor"}}, 500

    # Manejadores de errores de dominio de usuarios
    from app.dominios.usuarios.servicios import (
        CorreoYaRegistradoError,
        CredencialesInvalidasError,
        PermisoDenegadoError,
        UsuarioNoEncontradoError,
    )

    @app.errorhandler(CorreoYaRegistradoError)
    def correo_duplicado(error):
        return {"success": False, "error": {"message": str(error)}}, 400

    @app.errorhandler(CredencialesInvalidasError)
    def credenciales_invalidadas(error):
        return {"success": False, "error": {"message": str(error)}}, 401

    @app.errorhandler(UsuarioNoEncontradoError)
    def usuario_no_encontrado(error):
        return {"success": False, "error": {"message": str(error)}}, 404

    @app.errorhandler(PermisoDenegadoError)
    def permiso_denegado(error):
        return {"success": False, "error": {"message": str(error)}}, 403

    # Manejadores de errores de dominio de alojamientos
    from app.dominios.alojamientos.servicios import (
        AlojamientoNoEncontradoError,
        ComodidadesInvalidasError,
    )
    from app.dominios.comodidades.servicios import (
        ComodidadNoEncontradaError,
        ComodidadYaExisteError,
    )

    @app.errorhandler(AlojamientoNoEncontradoError)
    def alojamiento_no_encontrado(error):
        return {"success": False, "error": {"message": str(error)}}, 404

    @app.errorhandler(ComodidadesInvalidasError)
    def comodidades_invalidas(error):
        return {"success": False, "error": {"message": str(error)}}, 400

    @app.errorhandler(ComodidadNoEncontradaError)
    def comodidad_no_encontrada(error):
        return {"success": False, "error": {"message": str(error)}}, 404

    @app.errorhandler(ComodidadYaExisteError)
    def comodidad_ya_existe(error):
        return {"success": False, "error": {"message": str(error)}}, 400

    return app
