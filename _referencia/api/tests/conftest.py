"""
Configuracion de pruebas y fixtures compartidos.

IMPORTANTE: Las variables de entorno de testing se definen ANTES de
importar la app para evitar que `load_dotenv()` en `app/config.py`
cargue credenciales de MySQL del `.env` del desarrollador.
"""

import os

# ── Variables de testing ANTES de cualquier import de la app ─────────
os.environ["FLASK_TESTING"] = "true"
os.environ["SECRET_KEY"] = "test-key-for-pytest"
os.environ["JWT_EXP_MINUTES"] = "15"

# ── Imports de la app (ahora usaran la config de testing) ────────────
import json

import pytest

from app import crear_app
from app import db as _db


@pytest.fixture(scope="session")
def app():
    """Crea la app Flask en modo testing con SQLite en memoria."""
    app = crear_app()

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def client(app):
    """Cliente HTTP para pruebas."""
    return app.test_client()


@pytest.fixture
def db(app):
    """Sesion de base de datos para pruebas."""
    return _db


@pytest.fixture
def usuario_auth(client):
    """Crea un usuario unico y devuelve headers con token valido.

    Cada prueba que use este fixture obtiene su propio usuario,
    evitando conflictos de email duplicado entre tests.
    """
    import uuid

    email = f"auth-{uuid.uuid4().hex[:8]}@ejemplo.com"

    client.post(
        "/api/v1/usuarios/registro",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )

    resp = client.post(
        "/api/v1/usuarios/login",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )
    datos = json.loads(resp.data)
    token = datos["data"]["access_token"]

    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def admin_auth(client):
    """Crea un usuario, lo promueve a admin y devuelve headers con token valido.

    Promueve via servicio directo (UsuarioServicio.promover_a_admin),
    coherente con la arquitectura del proyecto.
    """
    import uuid

    from app.dominios.usuarios.servicios import UsuarioServicio

    email = f"admin-{uuid.uuid4().hex[:8]}@ejemplo.com"

    # Registrar usuario normal
    client.post(
        "/api/v1/usuarios/registro",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )

    # Promover a admin via servicio (no via modelo directo)
    servicio = UsuarioServicio(
        secret_key=client.application.config["SECRET_KEY"],
        jwt_exp_minutes=client.application.config.get("JWT_EXP_MINUTES", 15),
    )
    servicio.promover_a_admin(email)

    # Login con usuario admin
    resp = client.post(
        "/api/v1/usuarios/login",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )
    datos = json.loads(resp.data)
    token = datos["data"]["access_token"]

    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def usuario_auth2(client):
    """Crea un segundo usuario unico y devuelve headers con token valido.

    Se usa para pruebas de autorizacion donde se necesitan dos usuarios distintos.
    """
    import uuid

    email = f"user2-{uuid.uuid4().hex[:8]}@ejemplo.com"

    client.post(
        "/api/v1/usuarios/registro",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )

    resp = client.post(
        "/api/v1/usuarios/login",
        json={
            "correo": email,
            "contrasena": "123456",
        },
    )
    datos = json.loads(resp.data)
    token = datos["data"]["access_token"]

    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
