# Tutorial — Sprint 2: Usuarios y autenticación

---

## 1. Título del tutorial

**Sprint 2 — Usuarios y autenticación**

---

## 2. Objetivo

Construir el dominio de usuarios del proyecto **alojamientos**: crear los primeros modelos de base de datos (`Usuario` y `PerfilUsuario`), generar la primera migración real con Flask-Migrate, implementar registro de usuarios con hash de contraseñas, login con generación de tokens JWT, protección de rutas mediante decorador, y endpoints de consulta y actualización parcial del perfil.

Al final de este tutorial tendrás cuatro endpoints funcionando:
- `POST /api/v1/usuarios/registro`
- `POST /api/v1/usuarios/login`
- `GET /api/v1/usuarios/perfil`
- `PATCH /api/v1/usuarios/perfil`

---

## 3. Qué vas a construir

- Nuevas dependencias en `requirements.txt` (PyJWT, marshmallow, pytest).
- La estructura del dominio de usuarios bajo `app/dominios/usuarios/` con 6 archivos: modelos, DTOs, repositorio, servicio, controladores y `__init__.py`.
- `app/seguridad.py` con el decorador `requiere_token`.
- El blueprint `usuarios_bp` registrado en el app factory con sus manejadores de error.
- La primera migración real: `flask db migrate` y `flask db upgrade`.
- `pytest.ini`, `tests/conftest.py` y `tests/test_usuarios.py` con 11 pruebas de integración.
- Commit y push a GitHub.

---

## 4. Prerrequisitos

Antes de empezar, debes tener:

| Requisito | Cómo verificar |
|---|---|
| Sprint 1 completado y funcionando | `GET /health` responde 200 |
| Entorno virtual activo | `(venv)` en el prompt |
| MySQL corriendo con `alojamientos_db` creada | Servicio activo |
| Flask-Migrate inicializado | Carpeta `migrations/` existe |
| Repositorio Git con al menos un commit | `git log --oneline` muestra commits |
| `.env` y `.env.example` configurados con `DB_*` y `JWT_EXP_MINUTES` | Archivos presentes en la raíz |

Si no tienes todo esto, completa primero el Sprint 1.

---

## 5. Estructura final esperada

Los archivos nuevos y modificados serán:

```
alojamientos/
├── app.py
├── app/
│   ├── __init__.py               (actualizado: + usuarios_bp + error handlers)
│   ├── config.py                 (sin cambios respecto a Sprint 1)
│   ├── migrate.py
│   ├── seguridad.py              [NUEVO]
│   └── dominios/
│       └── usuarios/             [NUEVO - carpeta completa]
│           ├── __init__.py
│           ├── modelos.py
│           ├── dtos.py
│           ├── repositorios.py
│           ├── servicios.py
│           └── controladores.py
├── migrations/
│   └── versions/
│       └── <hash>_crear_tablas_usuarios_y_perfiles.py  [NUEVO]
├── pytest.ini                    [NUEVO]
├── requirements.txt              (actualizado: + PyJWT, marshmallow, pytest)
└── tests/
    ├── conftest.py               [NUEVO]
    └── test_usuarios.py          [NUEVO]
```

> **Nota:** `.env` y `.env.example` no se modifican en este sprint. La configuración de base de datos (`DB_*`) y JWT (`JWT_EXP_MINUTES`) ya quedó consolidada en Sprint 1.

---

## 6. Paso a paso completo

### Paso 1 — Actualizar `requirements.txt`

Añade las tres nuevas dependencias al archivo `requirements.txt`. El archivo debe quedar así:

```
Flask==3.1.3
Flask-SQLAlchemy==3.1.1
Flask-CORS==6.0.2
Flask-Migrate==4.1.0
PyMySQL[rsa]==1.1.2
python-dotenv==1.2.2
SQLAlchemy==2.0.49
Werkzeug==3.1.8
marshmallow==3.23.2
pytest==9.0.3
PyJWT==2.10.1
```

**¿Qué incluye cada paquete nuevo?**

| Paquete | Para qué sirve en Sprint 2 |
|---|---|
| PyJWT | Generar y decodificar tokens JWT para autenticación sin estado |
| marshmallow | Validar los datos de entrada (DTOs) antes de que lleguen al servicio |
| pytest | Framework de pruebas; validaremos registro, login y perfil |

---

### Paso 2 — Instalar las nuevas dependencias

Con el entorno virtual activado:

```bash
pip install -r requirements.txt
```

**Resultado esperado:** `Successfully installed PyJWT-2.10.1 marshmallow-3.23.2 pytest-9.0.3 ...`

**Validación:**

```bash
pip list
```

Debes ver los 3 nuevos paquetes en la lista.

---

### Paso 3 — Crear la estructura del dominio de usuarios

Crea la carpeta del dominio y su paquete Python:

```bash
# Windows CMD
mkdir app\dominios
mkdir app\dominios\usuarios
type nul > app\dominios\usuarios\__init__.py

# Linux / Mac
mkdir -p app/dominios/usuarios
touch app/dominios/usuarios/__init__.py
```

**¿Qué es `__init__.py`?** Marca la carpeta como un paquete Python importable. Déjalo vacío por ahora.

---

### Paso 4 — Crear `app/dominios/usuarios/modelos.py`

Crea el archivo `app/dominios/usuarios/modelos.py`:

```python
from datetime import datetime
from app import db


class Usuario(db.Model):
    """Modelo de usuario de la plataforma."""
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    rol = db.Column(db.String(20), nullable=False, server_default='usuario')

    # Relacion one-to-one con PerfilUsuario
    perfil = db.relationship(
        'PerfilUsuario',
        back_populates='usuario',
        uselist=False,
        cascade='all, delete-orphan',
        lazy='select'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'correo': self.correo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'rol': self.rol,
        }


class PerfilUsuario(db.Model):
    """Perfil complementario del usuario."""
    __tablename__ = 'perfiles'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    apellido = db.Column(db.String(50))
    telefono = db.Column(db.String(20))
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), unique=True)
    
    usuario = db.relationship('Usuario', back_populates='perfil')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'telefono': self.telefono,
            'usuario_id': self.usuario_id,
        }
```

**¿Qué hace cada parte?**

| Elemento | Explicación |
|---|---|
| `Usuario` | Entidad principal: correo único, contraseña hasheada, fecha de creación, rol (por defecto `'usuario'`) |
| `rol` | Se almacena con valor por defecto pero **NO se usa para autorización en este sprint**. Su uso corresponde al Sprint 3. |
| `perfil` | Relación one-to-one con `PerfilUsuario`. `uselist=False` indica que cada usuario tiene un solo perfil. |
| `PerfilUsuario` | Datos complementarios: nombre, apellido, teléfono. `usuario_id` es clave foránea única hacia `usuarios.id`. |
| `to_dict()` | Convierte el modelo a diccionario para la respuesta JSON. No incluye `contrasena`. |

---

### Paso 5 — Crear `app/dominios/usuarios/dtos.py`

Crea `app/dominios/usuarios/dtos.py`:

```python
from marshmallow import Schema, fields, validate, ValidationError


class RegistroUsuarioDTO(Schema):
    """DTO para validar registro de usuario."""
    correo = fields.Email(required=True)
    contrasena = fields.String(
        required=True,
        validate=validate.Length(min=6),
    )


class ActualizarPerfilDTO(Schema):
    """DTO para validar actualizacion parcial de perfil."""
    nombre = fields.String(load_default=None, validate=validate.Length(max=50), allow_none=True)
    apellido = fields.String(load_default=None, validate=validate.Length(max=50), allow_none=True)
    telefono = fields.String(load_default=None, validate=validate.Length(max=20), allow_none=True)
```

**¿Qué hace?**
- `RegistroUsuarioDTO`: valida que el correo sea un email válido y la contraseña tenga al menos 6 caracteres.
- `ActualizarPerfilDTO`: valida que nombre, apellido y teléfono (todos opcionales) no excedan su longitud máxima. `load_default=None` significa que si no se envían, el valor será `None`.

---

### Paso 6 — Crear `app/dominios/usuarios/repositorios.py`

Crea `app/dominios/usuarios/repositorios.py`:

```python
from app import db
from app.dominios.usuarios.modelos import Usuario, PerfilUsuario


class UsuarioRepositorio:
    """Capa de acceso a datos para usuarios y perfiles."""

    @staticmethod
    def guardar_usuario(usuario):
        """Inserta o actualiza un usuario en la BD."""
        db.session.add(usuario)
        db.session.commit()
        return usuario

    @staticmethod
    def obtener_por_correo(correo):
        """Busca un usuario por su correo."""
        return db.session.query(Usuario).filter_by(correo=correo).first()

    @staticmethod
    def obtener_por_id(usuario_id):
        """Busca un usuario por su ID."""
        return db.session.get(Usuario, usuario_id)

    @staticmethod
    def obtener_perfil_por_usuario_id(usuario_id):
        """Busca el perfil de un usuario."""
        return db.session.query(PerfilUsuario).filter_by(usuario_id=usuario_id).first()

    @staticmethod
    def guardar_perfil(perfil):
        """Inserta o actualiza un perfil."""
        db.session.add(perfil)
        db.session.commit()
        return perfil
```

**¿Qué es un repositorio?** Es la capa que encapsula todas las consultas a la base de datos. El servicio no usa `db.session` directamente; delega al repositorio. Esto mantiene la separación de responsabilidades.

---

### Paso 7 — Crear `app/dominios/usuarios/servicios.py`

Crea `app/dominios/usuarios/servicios.py`:

```python
from datetime import datetime, timedelta, timezone

import jwt
from werkzeug.security import generate_password_hash, check_password_hash

from app import db
from app.dominios.usuarios.modelos import Usuario, PerfilUsuario
from app.dominios.usuarios.repositorios import UsuarioRepositorio


# --- Excepciones de dominio ---

class CorreoYaRegistradoError(Exception):
    pass


class CredencialesInvalidasError(Exception):
    pass


class UsuarioNoEncontradoError(Exception):
    pass


# --- Funciones auxiliares de JWT ---

def _generar_access_token(usuario, secret_key, exp_minutes):
    """Genera un JWT de acceso con claims basicos."""
    ahora = datetime.now(timezone.utc)
    payload = {
        'sub': str(usuario.id),
        'iat': ahora,
        'exp': ahora + timedelta(minutes=exp_minutes),
    }
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token


# --- Servicio de usuarios ---

class UsuarioServicio:
    """Logica de negocio para registro, login y perfil."""

    def __init__(self, secret_key, jwt_exp_minutes):
        self.secret_key = secret_key
        self.jwt_exp_minutes = jwt_exp_minutes

    def registrar_usuario(self, datos):
        """Registra un nuevo usuario con correo y contrasena hasheada."""
        correo = datos['correo']
        existente = UsuarioRepositorio.obtener_por_correo(correo)
        if existente:
            raise CorreoYaRegistradoError(f'El correo {correo} ya esta registrado.')

        contrasena_hash = generate_password_hash(datos['contrasena'])
        usuario = Usuario(correo=correo, contrasena=contrasena_hash)
        UsuarioRepositorio.guardar_usuario(usuario)

        # Crear perfil vacio
        perfil = PerfilUsuario(usuario_id=usuario.id)
        UsuarioRepositorio.guardar_perfil(perfil)

        return usuario

    def iniciar_sesion(self, datos):
        """Valida credenciales y genera un JWT de acceso."""
        correo = datos.get('correo')
        contrasena = datos.get('contrasena')

        if not correo or not contrasena:
            raise CredencialesInvalidasError('Correo y contrasena son obligatorios.')

        usuario = UsuarioRepositorio.obtener_por_correo(correo)
        if not usuario or not check_password_hash(usuario.contrasena, contrasena):
            raise CredencialesInvalidasError('Credenciales invalidas.')

        access_token = _generar_access_token(
            usuario, self.secret_key, self.jwt_exp_minutes
        )

        return {
            'access_token': access_token,
            'usuario': usuario.to_dict(),
        }

    def obtener_perfil(self, usuario_id):
        """Obtiene el perfil de un usuario."""
        perfil = UsuarioRepositorio.obtener_perfil_por_usuario_id(usuario_id)
        if not perfil:
            return None
        return perfil.to_dict()

    def actualizar_perfil(self, usuario_id, datos):
        """Actualiza parcialmente el perfil de un usuario."""
        perfil = UsuarioRepositorio.obtener_perfil_por_usuario_id(usuario_id)

        if not perfil:
            perfil = PerfilUsuario(usuario_id=usuario_id)

        # Solo actualiza campos no None
        if datos.get('nombre') is not None:
            perfil.nombre = datos['nombre']
        if datos.get('apellido') is not None:
            perfil.apellido = datos['apellido']
        if datos.get('telefono') is not None:
            perfil.telefono = datos['telefono']

        UsuarioRepositorio.guardar_perfil(perfil)
        return perfil.to_dict()
```

**¿Qué hace cada parte?**

| Sección | Explicación |
|---|---|
| **Excepciones** | `CorreoYaRegistradoError`, `CredencialesInvalidasError`, `UsuarioNoEncontradoError` — errores de negocio que el controlador traduce a respuestas HTTP |
| `_generar_access_token` | Crea un JWT con 3 claims: `sub` (usuario_id como string), `iat` (hora actual), `exp` (hora actual + minutos configurados). **Nota importante:** `sub` debe ser string porque PyJWT 2.x exige que el subject sea un string. |
| `registrar_usuario` | Verifica duplicado → hashea contraseña con `generate_password_hash` → guarda usuario → crea perfil vacío |
| `iniciar_sesion` | Valida credenciales con `check_password_hash` → genera JWT → devuelve token + datos del usuario |
| `obtener_perfil` | Busca el perfil por `usuario_id` y lo devuelve como diccionario |
| `actualizar_perfil` | Actualización parcial: solo modifica los campos que no son `None` |

**Importante sobre seguridad de contraseñas:** Nunca se almacena la contraseña en texto plano. `generate_password_hash` aplica el algoritmo `scrypt` por defecto, y `check_password_hash` compara el hash sin exponer la contraseña original.

---

### Paso 8 — Crear `app/seguridad.py`

Crea `app/seguridad.py`:

```python
from functools import wraps

import jwt
from flask import request, jsonify, current_app


def requiere_token(f):
    """Decorador que exige un token JWT valido en el header Authorization.

    Inyecta `usuario_id` como argumento en la funcion decorada.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({
                'success': False,
                'error': {'message': 'Token no proporcionado.'}
            }), 401

        # Formato esperado: "Bearer <token>"
        partes = auth_header.split()
        if len(partes) != 2 or partes[0].lower() != 'bearer':
            return jsonify({
                'success': False,
                'error': {'message': 'Formato de token invalido. Use: Bearer <token>'}
            }), 401

        token = partes[1]

        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256'],
            )
            usuario_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': {'message': 'Token expirado.'}
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': {'message': 'Token invalido.'}
            }), 401

        return f(*args, usuario_id=usuario_id, **kwargs)
    return wrapper
```

**¿Qué hace?**
1. Extrae el header `Authorization`.
2. Valida que tenga el formato `Bearer <token>`.
3. Decodifica el JWT usando la `SECRET_KEY` de la configuración.
4. Si el token expiró o es inválido, responde con 401.
5. Si es válido, inyecta `usuario_id` como argumento en la función decorada.

**¿Por qué está fuera del dominio `usuarios`?** Porque es una utilidad transversal que otros dominios futuros (alojamientos, reservas) también necesitarán.

---

### Paso 9 — Crear `app/dominios/usuarios/controladores.py`

Crea `app/dominios/usuarios/controladores.py`:

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.dominios.usuarios.dtos import RegistroUsuarioDTO, ActualizarPerfilDTO
from app.seguridad import requiere_token

usuarios_bp = Blueprint('usuarios', __name__)

# Variable global que el app factory asignara al crear la app
usuario_servicio = None


@usuarios_bp.route('/registro', methods=['POST'])
def registro():
    """Registrar un nuevo usuario."""
    datos = request.get_json(silent=True) or {}

    dto = RegistroUsuarioDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    usuario = usuario_servicio.registrar_usuario(datos_validados)

    return jsonify({
        'success': True,
        'message': 'Usuario creado con exito.',
        'data': {'id': usuario.id, 'correo': usuario.correo},
    }), 201


@usuarios_bp.route('/login', methods=['POST'])
def login():
    """Iniciar sesion y obtener un token JWT."""
    datos = request.get_json(silent=True) or {}

    if not datos.get('correo') or not datos.get('contrasena'):
        return jsonify({
            'success': False,
            'error': {'message': 'Correo y contrasena son obligatorios.'}
        }), 400

    resultado = usuario_servicio.iniciar_sesion(datos)

    return jsonify({
        'success': True,
        'message': 'Inicio de sesion exitoso.',
        'data': resultado,
    }), 200


@usuarios_bp.route('/perfil', methods=['GET'])
@requiere_token
def obtener_perfil(usuario_id):
    """Obtener el perfil del usuario autenticado."""
    perfil = usuario_servicio.obtener_perfil(usuario_id)

    if not perfil:
        return jsonify({
            'success': False,
            'error': {'message': 'Perfil no encontrado.'}
        }), 404

    return jsonify({
        'success': True,
        'message': 'Perfil obtenido.',
        'data': perfil,
    }), 200


@usuarios_bp.route('/perfil', methods=['PATCH'])
@requiere_token
def actualizar_perfil(usuario_id):
    """Actualizar parcialmente el perfil del usuario autenticado."""
    datos = request.get_json(silent=True) or {}

    dto = ActualizarPerfilDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    perfil = usuario_servicio.actualizar_perfil(usuario_id, datos_validados)

    return jsonify({
        'success': True,
        'message': 'Perfil actualizado.',
        'data': perfil,
    }), 200
```

**¿Qué hace cada endpoint?**

| Endpoint | Auth | Flujo |
|---|---|---|
| `POST /registro` | No | Valida DTO → llama servicio → guarda usuario + perfil vacío → 201 |
| `POST /login` | No | Valida campos → llama servicio → genera JWT → 200 |
| `GET /perfil` | `@requiere_token` | Obtiene `usuario_id` del decorador → devuelve perfil → 200 |
| `PATCH /perfil` | `@requiere_token` | Valida DTO parcial → actualiza solo campos enviados → 200 |

**¿Por qué `usuario_servicio` es una variable global?** Porque la instancia real de `UsuarioServicio` necesita la `SECRET_KEY` y `JWT_EXP_MINUTES` de la configuración de la app, que solo están disponibles dentro del app factory. El factory inyecta la instancia correcta al crear la app.

---

### Paso 10 — Actualizar `app/__init__.py`

Abre `app/__init__.py` y **actualiza** el contenido para registrar el blueprint de usuarios y sus manejadores de error. El archivo debe quedar así:

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate

from app.config import Config

# Version de la API
API_VERSION = 'v1'

# Instancia de SQLAlchemy (se inicializa dentro del factory)
db = SQLAlchemy()

# Instancia de Flask-Migrate (se inicializa dentro del factory)
migrate = Migrate()


def create_app():
    """App factory: crea y configura la instancia de Flask."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ALLOWED_ORIGINS'])

    # Endpoint de salud (publico, sin auth)
    @app.route('/health', methods=['GET'])
    def health():
        return {
            "status": "ok",
            "service": "alojamientos-api",
            "version": API_VERSION
        }, 200

    # Registrar blueprint de usuarios
    from app.dominios.usuarios.controladores import usuarios_bp
    from app.dominios.usuarios.servicios import UsuarioServicio
    from app.dominios.usuarios import controladores as usuarios_ctrl

    # Inyectar el servicio con la config correcta
    usuarios_ctrl.usuario_servicio = UsuarioServicio(
        secret_key=app.config['SECRET_KEY'],
        jwt_exp_minutes=app.config.get('JWT_EXP_MINUTES', 15),
    )

    app.register_blueprint(usuarios_bp, url_prefix=f'/api/{API_VERSION}/usuarios')

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

    return app
```

**¿Qué cambió respecto al Sprint 1?**
1. Se importa y registra el blueprint `usuarios_bp` con prefijo `/api/v1/usuarios`.
2. Se crea e inyecta la instancia de `UsuarioServicio` con `SECRET_KEY` y `JWT_EXP_MINUTES` (ya configurados en Sprint 1).
3. Se registran los manejadores de error de dominio para que las excepciones del servicio se traduzcan a respuestas HTTP consistentes.

---

### Paso 11 — Generar la primera migración real

Con el entorno virtual activado y genera la migración:


```bash
python -m flask db migrate -m "crear tablas usuarios y perfiles"
```

**Resultado esperado:**

```
INFO  [alembic.autogenerate.compare.tables] Detected added table 'usuarios'
INFO  [alembic.autogenerate.compare.tables] Detected added table 'perfiles'
Generating .../migrations/versions/<hash>_crear_tablas_usuarios_y_perfiles.py ...  done
```

Aplica la migración:

```bash
python -m flask db upgrade
```

**Resultado esperado:**

```
INFO  [alembic.runtime.migration] Running upgrade  -> <hash>, crear tablas usuarios y perfiles
```

**Validación:** Verifica que las tablas existen en tu base de datos MySQL.

---

### Paso 12 — Crear `pytest.ini`

Crea `pytest.ini` en la raíz del proyecto:

```ini
[pytest]
testpaths = tests
pythonpath = .
filterwarnings =
    ignore::DeprecationWarning
```

**¿Qué hace?**
- `testpaths = tests` — le dice a pytest que busque pruebas en la carpeta `tests/`.
- `pythonpath = .` — permite que pytest importe módulos del proyecto (como `app`).
- `filterwarnings = .` — definir reglas de filtrado de warnings. 
filterwarnings → lista de reglas
ignore → acción: ignorar
DeprecationWarning → categoría del warning que aparece cuando usas algo que todavía funciona, pero está obsoleto y podría eliminarse en el futuro.

---

### Paso 13 — Crear `tests/conftest.py`

Crea `tests/conftest.py`:

```python
"""
Configuracion de pruebas y fixtures compartidos.

IMPORTANTE: Las variables de entorno de testing se definen ANTES de
importar la app para evitar que `load_dotenv()` en `app/config.py`
cargue credenciales de MySQL del `.env` del desarrollador.
"""
import os

# -- Variables de testing ANTES de cualquier import de la app --
os.environ['FLASK_TESTING'] = 'true'
os.environ['SECRET_KEY'] = 'test-key-for-pytest'
os.environ['JWT_EXP_MINUTES'] = '15'

# -- Imports de la app (ahora usaran la config de testing) --
import pytest
import json

from app import create_app, db as _db


@pytest.fixture(scope='session')
def app():
    """Crea la app Flask en modo testing con SQLite en memoria."""
    app = create_app()

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
    email = f'auth-{uuid.uuid4().hex[:8]}@ejemplo.com'

    client.post('/api/v1/usuarios/registro', json={
        'correo': email,
        'contrasena': '123456',
    })

    resp = client.post('/api/v1/usuarios/login', json={
        'correo': email,
        'contrasena': '123456',
    })
    datos = json.loads(resp.data)
    token = datos['data']['access_token']

    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
```

**¿Por que las variables de entorno van antes de los imports?**

En `app/config.py`, la funcion `load_dotenv()` se ejecuta en el momento en que Python importa el modulo `config` (que ocurre cuando haces `from app import crear_app`). Si el archivo `.env` del desarrollador tiene credenciales de MySQL, `load_dotenv()` las cargara en `os.environ` **antes** de que puedas cambiarlas desde el codigo.

Al definir `FLASK_TESTING=true` **antes** de importar la app, nos aseguramos de que cuando `config.py` evalúe `is_testing`, ya tenga el valor correcto y **active automaticamente** SQLite en memoria (y `SECRET_KEY` de testing). La variable `FLASK_TESTING` es la clave que dispara el cambio de modo; no hace falta definir `SQLALCHEMY_DATABASE_URI` manualmente.

> **Nota:** En `config.py`, el bloque `else: SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"` se ejecuta automaticamente cuando `FLASK_TESTING=true`. Por eso con solo esa variable basta.

**¿Qué hace cada fixture?**

| Fixture | Propósito |
|---|---|
| `app` | Crea la app con `FLASK_TESTING=true`, lo que activa SQLite en memoria. Crea las tablas al inicio y las elimina al final. |
| `client` | Devuelve un cliente HTTP de Flask para simular peticiones. |
| `db` | Expone el objeto `db` para operaciones directas si hacen falta. |
| `usuario_auth` | Crea un usuario con email **unico** (usando `uuid`), hace login y devuelve los headers listos para usar en endpoints protegidos. Cada prueba que usa este fixture obtiene su propio usuario, evitando conflictos de email duplicado. |

**¿Por qué `app` tiene `scope='session'`?** Porque crear la app Flask es costoso y no cambia entre tests. La base de datos en memoria se crea una sola vez. Cada prueba que necesita un usuario lo crea por su cuenta, asegurando independencia.

---

### Paso 14 — Crear `tests/test_usuarios.py`

Crea `tests/test_usuarios.py`:

```python
import json


class TestRegistroUsuario:
    """Pruebas de integracion para registro de usuarios."""

    def test_registro_exitoso(self, client):
        """Registro con datos validos debe crear usuario y responder 201."""
        resp = client.post('/api/v1/usuarios/registro', json={
            'correo': 'nuevo@ejemplo.com',
            'contrasena': '123456',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos['success'] is True
        assert datos['data']['correo'] == 'nuevo@ejemplo.com'

    def test_email_duplicado(self, client):
        """Registrar dos veces el mismo email debe responder 400."""
        client.post('/api/v1/usuarios/registro', json={
            'correo': 'duplicado@ejemplo.com',
            'contrasena': '123456',
        })
        resp = client.post('/api/v1/usuarios/registro', json={
            'correo': 'duplicado@ejemplo.com',
            'contrasena': '123456',
        })
        assert resp.status_code == 400

    def test_contrasena_corta(self, client):
        """Contraseña menor a 6 caracteres debe responder 400."""
        resp = client.post('/api/v1/usuarios/registro', json={
            'correo': 'corta@ejemplo.com',
            'contrasena': '123',
        })
        assert resp.status_code == 400

    def test_email_invalido(self, client):
        """Email sin formato valido debe responder 400."""
        resp = client.post('/api/v1/usuarios/registro', json={
            'correo': 'no-es-email',
            'contrasena': '123456',
        })
        assert resp.status_code == 400


class TestLogin:
    """Pruebas de integracion para login."""

    def test_login_exitoso(self, client):
        """Login con credenciales validas debe devolver token y responder 200."""
        # Primero registrar
        client.post('/api/v1/usuarios/registro', json={
            'correo': 'login@ejemplo.com',
            'contrasena': '123456',
        })
        resp = client.post('/api/v1/usuarios/login', json={
            'correo': 'login@ejemplo.com',
            'contrasena': '123456',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert 'access_token' in datos['data']

    def test_credenciales_invalidas(self, client):
        """Login con contraseña incorrecta debe responder 401."""
        client.post('/api/v1/usuarios/registro', json={
            'correo': 'wrong@ejemplo.com',
            'contrasena': '123456',
        })
        resp = client.post('/api/v1/usuarios/login', json={
            'correo': 'wrong@ejemplo.com',
            'contrasena': 'incorrecta',
        })
        assert resp.status_code == 401

    def test_usuario_no_existente(self, client):
        """Login con usuario que no existe debe responder 401."""
        resp = client.post('/api/v1/usuarios/login', json={
            'correo': 'fantasma@ejemplo.com',
            'contrasena': '123456',
        })
        assert resp.status_code == 401


class TestPerfil:
    """Pruebas de integracion para consulta y actualizacion de perfil."""

    def test_perfil_sin_token(self, client):
        """GET /perfil sin token debe responder 401."""
        resp = client.get('/api/v1/usuarios/perfil')
        assert resp.status_code == 401

    def test_perfil_con_token(self, client, usuario_auth):
        """GET /perfil con token valido debe responder 200."""
        resp = client.get('/api/v1/usuarios/perfil', headers=usuario_auth)
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert 'data' in datos

    def test_actualizar_perfil(self, client, usuario_auth):
        """PATCH /perfil con datos validos debe responder 200."""
        resp = client.patch('/api/v1/usuarios/perfil', headers=usuario_auth, json={
            'nombre': 'Maria',
            'apellido': 'Lopez',
            'telefono': '+34600111222',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['data']['nombre'] == 'Maria'
        assert datos['data']['apellido'] == 'Lopez'

    def test_actualizacion_parcial(self, client, usuario_auth):
        """PATCH /perfil con un solo campo debe actualizar solo ese campo."""
        # Establecer estado inicial dentro del propio test
        r1 = client.patch('/api/v1/usuarios/perfil', headers=usuario_auth, json={
            'nombre': 'Ana',
            'apellido': 'Garcia',
        })
        assert r1.status_code == 200

        # Actualizar solo el telefono
        resp = client.patch('/api/v1/usuarios/perfil', headers=usuario_auth, json={
            'telefono': '+34600333444',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['data']['telefono'] == '+34600333444'
        # Los campos establecidos antes no se borran
        assert datos['data']['nombre'] == 'Ana'
        assert datos['data']['apellido'] == 'Garcia'
```

**¿Qué cubren estos tests?**

| Clase | Tests | Qué prueban |
|---|---|---|
| `TestRegistroUsuario` | 4 | Registro exitoso, email duplicado (400), contraseña corta (400), email inválido (400) |
| `TestLogin` | 3 | Login exitoso (200 + token), credenciales incorrectas (401), usuario no existente (401) |
| `TestPerfil` | 4 | Perfil sin token (401), perfil con token (200), actualización completa (200), actualización parcial (200) |

---

### Paso 15 — Ejecutar las pruebas

Ejecuta la suite completa:

```bash
pytest tests/ -v
```

**Resultado esperado:** 11 tests pasando.

```
tests/test_usuarios.py::TestRegistroUsuario::test_registro_exitoso PASSED
tests/test_usuarios.py::TestRegistroUsuario::test_email_duplicado PASSED
tests/test_usuarios.py::TestRegistroUsuario::test_contrasena_corta PASSED
tests/test_usuarios.py::TestRegistroUsuario::test_email_invalido PASSED
tests/test_usuarios.py::TestLogin::test_login_exitoso PASSED
tests/test_usuarios.py::TestLogin::test_credenciales_invalidas PASSED
tests/test_usuarios.py::TestLogin::test_usuario_no_existente PASSED
tests/test_usuarios.py::TestPerfil::test_perfil_sin_token PASSED
tests/test_usuarios.py::TestPerfil::test_perfil_con_token PASSED
tests/test_usuarios.py::TestPerfil::test_actualizar_perfil PASSED
tests/test_usuarios.py::TestPerfil::test_actualizacion_parcial PASSED

========================= 11 passed in X.XXs ==========================
```

---

## 7. Cómo probar que funciona

### Verificación manual rápida

Levanta el servidor:

```bash
python app.py
```

En otra terminal:

```bash
# 1. Registrar un usuario
curl -X POST http://127.0.0.1:5000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"demo@ejemplo.com\",\"contrasena\":\"123456\"}"

# 2. Iniciar sesión y obtener token
curl -X POST http://127.0.0.1:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"demo@ejemplo.com\",\"contrasena\":\"123456\"}"

# Copia el access_token de la respuesta

# 3. Consultar perfil (requiere token)
curl http://127.0.0.1:5000/api/v1/usuarios/perfil \
  -H "Authorization: Bearer <TU_TOKEN>"

# 4. Actualizar perfil
curl -X PATCH http://127.0.0.1:5000/api/v1/usuarios/perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -d "{\"nombre\":\"Demo\",\"apellido\":\"Usuario\",\"telefono\":\"555-1234\"}"
```

---

## 8. Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `ModuleNotFoundError: No module named 'jwt'` | PyJWT no está instalado | Ejecuta `pip install -r requirements.txt` |
| `ModuleNotFoundError: No module named 'marshmallow'` | marshmallow no está instalado | Ejecuta `pip install -r requirements.txt` |
| `ModuleNotFoundError: No module named 'pytest'` | pytest no está instalado | Ejecuta `pip install -r requirements.txt` |
| `Token invalido` al probar perfil | Token mal formado o expirado | Verifica el formato `Bearer <token>` y que el token no haya expirado (15 min por defecto) |
| `401 Token no proporcionado` | No se envía header `Authorization` | Incluye el header correctamente: `-H "Authorization: Bearer <token>"` |
| `400 Datos de entrada invalidos` | DTO de marshmallow rechazó los datos | Revisa los `details` en la respuesta para ver qué campo falló |
| `Correo ya registrado` al registrar | El email ya existe en la BD | Usa un email diferente o elimina el usuario existente |
| `flask db migrate` no detecta tablas | Los modelos no se importan en el factory | Verifica que `Usuario` y `PerfilUsuario` están importados indirectamente a través del blueprint registrado |

---

## 9. Cierre con Git y GitHub

### Hacer el commit del Sprint 2

Verifica qué archivos se van a commitear:

```bash
git status
```

Agrega todo y commitea:

```bash
git add .
git commit -m "feat: dominio usuarios con registro, login JWT y perfil

- Modelos Usuario y PerfilUsuario
- DTOs con Marshmallow para validación
- Servicio con hash de contraseñas y generación JWT
- Decorador requiere_token en seguridad.py
- Blueprint usuarios_bp con 4 endpoints
- Primera migración real (usuarios y perfiles)
- 11 tests de integración con pytest"
git push
```

### Resultado final del Sprint 2

Si seguiste todos los pasos, ahora tienes:

- ✅ Un dominio completo de usuarios con modelos, DTOs, repositorio, servicio y controladores.
- ✅ Autenticación JWT funcional con registro, login y protección de rutas.
- ✅ Perfil de usuario consultable y actualizable.
- ✅ Primera migración real aplicada en MySQL.
- ✅ 11 tests de integración pasando.
- ✅ Manejo centralizado de errores de dominio.
- ✅ Código commiteado y subido a GitHub.

**Próximo paso:** En el Sprint 3 construirás la autorización por roles (`requiere_admin`) y el endpoint de administración.
