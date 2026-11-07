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
        return {"status": "ok", "service": "sinu-api", "version": API_VERSION}, 200

    prefijo = f"/api/{API_VERSION}"

    # Importar modelos para que Flask-Migrate los detecte
    from app.dominios.alertas import modelos as _alertas  # noqa: F401
    from app.dominios.inventario import modelos as _inventario  # noqa: F401
    from app.dominios.pedidos import modelos as _pedidos  # noqa: F401
    from app.dominios.platos import modelos as _platos  # noqa: F401
    from app.dominios.usuarios import modelos as _usuarios  # noqa: F401

    # Servicios: se crean una sola vez y se inyectan en los controladores
    from app.dominios.alertas.servicios import AlertaServicio
    from app.dominios.inventario.servicios import InventarioServicio
    from app.dominios.pedidos.servicios import PedidoServicio
    from app.dominios.platos.servicios import PlatoServicio
    from app.dominios.tablero.servicios import TableroServicio
    from app.dominios.usuarios.servicios import UsuarioServicio

    inventario = InventarioServicio(app.config["DIAS_ALERTA_DEFECTO"])
    platos = PlatoServicio(inventario)
    pedidos = PedidoServicio(inventario, platos)
    alertas = AlertaServicio(inventario, platos)
    tablero = TableroServicio(inventario, platos, pedidos, alertas)
    app.extensions["sinu_servicios"] = {"inventario": inventario, "platos": platos}

    # Registrar blueprint de usuarios
    from app.dominios.usuarios import controladores as usuarios_ctrl

    usuarios_ctrl.usuario_servicio = UsuarioServicio(
        secret_key=app.config["SECRET_KEY"],
        jwt_exp_minutes=app.config.get("JWT_EXP_MINUTES", 480),
    )
    app.register_blueprint(usuarios_ctrl.usuarios_bp, url_prefix=f"{prefijo}/usuarios")

    # Registrar blueprint de inventario (insumos y lotes)
    from app.dominios.inventario import controladores as inventario_ctrl

    inventario_ctrl.inventario_servicio = inventario
    app.register_blueprint(inventario_ctrl.inventario_bp, url_prefix=prefijo)

    # Registrar blueprint de platos
    from app.dominios.platos import controladores as platos_ctrl

    platos_ctrl.plato_servicio = platos
    app.register_blueprint(platos_ctrl.platos_bp, url_prefix=f"{prefijo}/platos")

    # Registrar blueprints de pedidos y mesas
    from app.dominios.pedidos import controladores as pedidos_ctrl

    pedidos_ctrl.pedido_servicio = pedidos
    app.register_blueprint(pedidos_ctrl.pedidos_bp, url_prefix=f"{prefijo}/pedidos")
    app.register_blueprint(pedidos_ctrl.mesas_bp, url_prefix=f"{prefijo}/mesas")

    # Registrar blueprint de alertas
    from app.dominios.alertas import controladores as alertas_ctrl

    alertas_ctrl.alerta_servicio = alertas
    app.register_blueprint(alertas_ctrl.alertas_bp, url_prefix=f"{prefijo}/alertas")

    # Registrar blueprint del tablero
    from app.dominios.tablero import controladores as tablero_ctrl

    tablero_ctrl.tablero_servicio = tablero
    app.register_blueprint(tablero_ctrl.tablero_bp, url_prefix=f"{prefijo}/tablero")

    # Manejadores globales de error
    @app.errorhandler(404)
    def recurso_no_encontrado(error):
        return {"success": False, "error": {"message": "Recurso no encontrado"}}, 404

    @app.errorhandler(500)
    def error_interno(error):
        return {"success": False, "error": {"message": "Error interno del servidor"}}, 500

    # Un solo manejador para todas las excepciones de dominio (ver app/errores.py)
    from app.errores import DatosInvalidosError, ErrorDominio

    @app.errorhandler(ErrorDominio)
    def error_de_dominio(error):
        cuerpo = {"message": str(error)}
        if isinstance(error, DatosInvalidosError):
            cuerpo["details"] = error.details
        return {"success": False, "error": cuerpo}, error.codigo_http

    return app
