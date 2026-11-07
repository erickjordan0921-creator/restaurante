import os

from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo .env
# Esto debe hacerse ANTES de que se defina la clase Config
load_dotenv()

# Ruta base del proyecto (carpeta api/)
_BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    """Configuracion central de la aplicacion."""

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Clave secreta para firmar tokens y sesiones
    SECRET_KEY = os.getenv("SECRET_KEY")

    # Expiracion del token JWT en minutos
    _jwt_exp = os.getenv("JWT_EXP_MINUTES", "480")
    JWT_EXP_MINUTES = int(_jwt_exp) if _jwt_exp.isdigit() else 480

    # Dias de anticipacion por defecto para alertas de vencimiento (SINU: 3)
    _dias = os.getenv("DIAS_ALERTA_DEFECTO", "3")
    DIAS_ALERTA_DEFECTO = int(_dias) if _dias.isdigit() else 3

    # ------------------------------------------------------------------
    # Base de datos: MySQL si hay DB_USER; si no, SQLite local (demo)
    # ------------------------------------------------------------------
    _db_user = os.getenv("DB_USER", "").strip()
    _db_password = os.getenv("DB_PASSWORD", "").strip()
    _db_host = os.getenv("DB_HOST", "localhost").strip()
    _db_port = os.getenv("DB_PORT", "3306").strip()
    _db_name = os.getenv("DB_NAME", "sinu_db").strip()

    if _db_user:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{_db_user}:{_db_password}@{_db_host}:{_db_port}/{_db_name}"
        )
    else:
        os.makedirs(os.path.join(_BASE_DIR, "instance"), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(_BASE_DIR, "instance", "sinu.db")

    # ------------------------------------------------------------------
    # Validaciones obligatorias en desarrollo/produccion
    # ------------------------------------------------------------------
    is_testing = os.getenv("FLASK_TESTING", "false").lower() == "true"

    if not is_testing:
        if not SECRET_KEY:
            raise ValueError("Falta la variable SECRET_KEY en el archivo .env")
    else:
        # Valores por defecto para testing
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
        if not SECRET_KEY:
            SECRET_KEY = "test-key-for-pytest"

    # ------------------------------------------------------------------
    # CORS: origenes permitidos
    # ------------------------------------------------------------------
    _origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if _origins_env:
        CORS_ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]
    else:
        CORS_ALLOWED_ORIGINS = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5500",
            "http://localhost:8080",
        ]

    BASE_DIR = _BASE_DIR
