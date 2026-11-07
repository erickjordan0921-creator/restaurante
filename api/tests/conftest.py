"""
Configuracion de pruebas y fixtures compartidos.

IMPORTANTE: Las variables de entorno de testing se definen ANTES de
importar la app para evitar que `load_dotenv()` en `app/config.py`
cargue la configuracion de base de datos del `.env` del desarrollador.
"""

import os

# ── Variables de testing ANTES de cualquier import de la app ─────────
os.environ["FLASK_TESTING"] = "true"
os.environ["SECRET_KEY"] = "test-key-for-pytest"
os.environ["JWT_EXP_MINUTES"] = "15"

# ── Imports de la app (ahora usaran la config de testing) ────────────
import pytest

from app import crear_app
from app.semilla import cargar_datos_ejemplo


@pytest.fixture
def app():
    """App en modo testing (SQLite en memoria) con los datos de ejemplo de SINU."""
    app = crear_app()
    with app.app_context():
        servicios = app.extensions["sinu_servicios"]
        cargar_datos_ejemplo(servicios["inventario"], servicios["platos"])
        yield app


@pytest.fixture
def client(app):
    """Cliente HTTP para pruebas."""
    return app.test_client()


def _headers(client, usuario, contrasena):
    resp = client.post(
        "/api/v1/usuarios/login", json={"usuario": usuario, "contrasena": contrasena}
    )
    token = resp.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin(client):
    return _headers(client, "admin", "admin123")


@pytest.fixture
def mesero(client):
    return _headers(client, "mesero", "mesero123")
