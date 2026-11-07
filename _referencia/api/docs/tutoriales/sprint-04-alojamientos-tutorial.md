# Tutorial — Sprint 4: Alojamientos

---

## 1. Título del tutorial

**Sprint 4 — Alojamientos**

---

## 2. Objetivo

Construir el dominio de alojamientos del proyecto: crear el modelo `Alojamiento` con sus campos base, generar la migración correspondiente, implementar la arquitectura completa del dominio (DTOs, repositorio, servicio, controladores) con un CRUD funcional, establecer la relación de propiedad con `Usuario`, aplicar reglas de autorización (el propietario edita/elimina lo suyo, el admin puede gestionar todo), y añadir pruebas de integración del nuevo dominio.

Al final de este tutorial tendrás cinco endpoints funcionando:
- `POST /api/v1/alojamientos` — crear alojamiento (auth requerido)
- `GET /api/v1/alojamientos` — listar todos (público)
- `GET /api/v1/alojamientos/<id>` — ver detalle (público)
- `PATCH /api/v1/alojamientos/<id>` — actualizar (propietario o admin)
- `DELETE /api/v1/alojamientos/<id>` — eliminar (propietario o admin, responde 204)

---

## 3. Qué vas a construir

- La estructura del dominio bajo `app/dominios/alojamientos/` con 6 archivos.
- El modelo `Alojamiento` con relación a `Usuario`.
- DTOs Marshmallow para crear y actualizar alojamientos.
- Repositorio con operaciones CRUD básicas.
- Servicio con lógica de negocio y verificación de "propietario o admin".
- Controladores con blueprint `alojamientos_bp` y 5 endpoints.
- Generación y aplicación de la migración (solo tabla `alojamientos`).
- Registro del blueprint y error handler en el app factory.
- 11 tests de integración para alojamientos.
- Commit y push.

---

## 4. Prerrequisitos

Antes de empezar, debes tener:

| Requisito | Cómo verificar |
|---|---|
| Sprint 3 completado y funcionando | 14 tests pasan con `pytest tests/ -v` |
| Entorno virtual activo | `(venv)` en el prompt |
| MySQL corriendo con `alojamientos_db` y migraciones aplicadas | `GET /health` responde 200 |
| Repositorio Git con commits de Sprints 1-3 | `git log --oneline` muestra commits |

Si no tienes todo esto, completa primero los Sprints anteriores.

---

## 5. Estructura final esperada

Los archivos nuevos y modificados serán:

```
alojamientos/
├── app/
│   ├── __init__.py               (actualizado: + alojamientos_bp + error handler)
│   └── dominios/
│       ├── usuarios/
│       └── alojamientos/         [NUEVO - carpeta completa]
│           ├── __init__.py
│           ├── modelos.py
│           ├── dtos.py
│           ├── repositorios.py
│           ├── servicios.py
│           └── controladores.py
├── migrations/
│   └── versions/
│       └── <hash>_crear_tabla_alojamientos.py  [NUEVO]
└── tests/
    ├── conftest.py               (actualizado: + usuario_auth2)
    └── test_alojamientos.py      [NUEVO]
```

---

## 6. Paso a paso completo

### Paso 1 — Crear la estructura del dominio

Crea la carpeta del dominio y su paquete Python:

```bash
# Windows CMD
mkdir app\dominios\alojamientos
type nul > app\dominios\alojamientos\__init__.py

# Linux / Mac
mkdir -p app/dominios/alojamientos
touch app/dominios/alojamientos/__init__.py
```

**¿Qué es `__init__.py`?** Marca la carpeta como un paquete Python importable. Déjalo vacío.

---

### Paso 2 — Crear `app/dominios/alojamientos/modelos.py`

Crea el archivo `app/dominios/alojamientos/modelos.py`:

```python
from datetime import datetime
from app import db


class Alojamiento(db.Model):
    """Modelo de alojamiento de la plataforma."""
    __tablename__ = 'alojamientos'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    precio_noche = db.Column(db.Numeric(10, 2), nullable=False)
    ciudad = db.Column(db.String(100), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacion many-to-one con Usuario (se usa string para evitar import circular)
    usuario = db.relationship(
        'Usuario',
        backref=db.backref('alojamientos', lazy=True),
        lazy=True,
    )

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'precio_noche': float(self.precio_noche),
            'ciudad': self.ciudad,
            'usuario_id': self.usuario_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }
```

**¿Qué hace cada parte?**

| Elemento | Explicación |
|---|---|
| `usuario_id` | Clave foránea a `usuarios.id`. Cada alojamiento tiene un propietario. |
| `usuario = db.relationship('Usuario', ...)` | Relación inversa. Se usa string `'Usuario'` en lugar de importar la clase para evitar import circular. |
| `backref=db.backref('alojamientos', lazy=True)` | Crea automáticamente `usuario.alojamientos` para acceder a los alojamientos de un usuario. |
| `to_dict()` | Convierte el modelo a diccionario para la respuesta JSON. Usa `float(self.precio_noche)` para serializar el `Decimal` a numero JSON. |

> **Nota sobre `Numeric(10, 2)` para dinero:** No se usa `db.Float` para `precio_noche` porque el tipo `Float` usa aritmetica de punto flotante binario (IEEE 754), que no puede representar exactamente muchos valores decimales comunes. Por ejemplo, en Python `0.1 + 0.2` produce `0.30000000000000004`. Para un prototipo funciona, pero en produccion es un riesgo financiero. `Numeric(10, 2)` almacena el valor como decimal exacto en la base de datos (columna `DECIMAL(10,2)` en MySQL) y en Python se mapea como `decimal.Decimal`, sin errores de redondeo. La conversion `float()` en `to_dict()` es segura porque el valor ya tiene exactamente 2 decimales.

---

### Paso 3 — Crear `app/dominios/alojamientos/dtos.py`

Crea `app/dominios/alojamientos/dtos.py`:

```python
from decimal import Decimal

from marshmallow import Schema, fields, validate


class CrearAlojamientoDTO(Schema):
    """DTO para validar creacion de alojamiento."""
    titulo = fields.String(required=True, validate=validate.Length(min=1))
    descripcion = fields.String(required=True, validate=validate.Length(min=1))
    precio_noche = fields.Decimal(
        required=True,
        validate=validate.Range(min=Decimal("0.01")),
    )
    ciudad = fields.String(required=True, validate=validate.Length(min=1))


class ActualizarAlojamientoDTO(Schema):
    """DTO para validar actualizacion parcial de alojamiento."""
    titulo = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
    descripcion = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
    precio_noche = fields.Decimal(load_default=None, validate=validate.Range(min=Decimal("0.01")), allow_none=True)
    ciudad = fields.String(load_default=None, validate=validate.Length(min=1), allow_none=True)
```

**¿Qué hace?**
- `CrearAlojamientoDTO`: todos los campos son requeridos. `precio_noche` debe ser mayor que 0 (`Range(min=Decimal("0.01"))`).
- `ActualizarAlojamientoDTO`: mismos campos pero opcionales (`load_default=None`, `allow_none=True`). Permite actualizar solo uno de los campos.

---

### Paso 4 — Crear `app/dominios/alojamientos/repositorios.py`

Crea `app/dominios/alojamientos/repositorios.py`:

```python
from app import db
from app.dominios.alojamientos.modelos import Alojamiento


class AlojamientoRepositorio:
    """Capa de acceso a datos para alojamientos."""

    @staticmethod
    def guardar(alojamiento):
        """Inserta o actualiza un alojamiento en la BD."""
        db.session.add(alojamiento)
        db.session.commit()
        return alojamiento

    @staticmethod
    def obtener_por_id(alojamiento_id):
        """Busca un alojamiento por su ID."""
        return db.session.get(Alojamiento, alojamiento_id)

    @staticmethod
    def obtener_todos():
        """Devuelve todos los alojamientos."""
        return db.session.query(Alojamiento).all()

    @staticmethod
    def obtener_por_usuario_id(usuario_id):
        """Devuelve los alojamientos de un usuario."""
        return db.session.query(Alojamiento).filter_by(usuario_id=usuario_id).all()

    @staticmethod
    def eliminar(alojamiento):
        """Elimina un alojamiento de la BD."""
        db.session.delete(alojamiento)
        db.session.commit()
```

**¿Qué es un repositorio?** Encapsula todas las consultas a la base de datos para alojamientos. El servicio delega aquí en lugar de usar `db.session` directamente.

---

### Paso 5 — Crear `app/dominios/alojamientos/servicios.py`

Crea `app/dominios/alojamientos/servicios.py`:

```python
from app import db
from app.dominios.alojamientos.modelos import Alojamiento
from app.dominios.alojamientos.repositorios import AlojamientoRepositorio
from app.dominios.usuarios.servicios import PermisoDenegadoError


# --- Excepciones de dominio ---

class AlojamientoNoEncontradoError(Exception):
    pass


# --- Servicio de alojamientos ---

class AlojamientoServicio:
    """Logica de negocio para alojamientos."""

    def crear_alojamiento(self, datos, usuario_id):
        """Crea un nuevo alojamiento asignado al usuario autenticado."""
        alojamiento = Alojamiento(
            titulo=datos['titulo'],
            descripcion=datos['descripcion'],
            precio_noche=datos['precio_noche'],
            ciudad=datos['ciudad'],
            usuario_id=usuario_id,
        )
        AlojamientoRepositorio.guardar(alojamiento)
        return alojamiento

    def listar_todos(self):
        """Devuelve lista de todos los alojamientos (publico)."""
        alojamientos = AlojamientoRepositorio.obtener_todos()
        return [a.to_dict() for a in alojamientos]

    def obtener_detalle(self, alojamiento_id):
        """Obtiene el detalle de un alojamiento (publico)."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f'Alojamiento con id {alojamiento_id} no encontrado.'
            )
        return alojamiento.to_dict()

    def actualizar_alojamiento(self, alojamiento_id, usuario_id, datos):
        """Actualiza parcialmente un alojamiento. Solo propietario o admin."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f'Alojamiento con id {alojamiento_id} no encontrado.'
            )

        # Consultar rol del usuario para verificar permiso
        from app.dominios.usuarios.repositorios import UsuarioRepositorio
        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == 'admin'

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                'Permiso denegado. Solo el propietario o un administrador pueden editar este alojamiento.'
            )

        if datos.get('titulo') is not None:
            alojamiento.titulo = datos['titulo']
        if datos.get('descripcion') is not None:
            alojamiento.descripcion = datos['descripcion']
        if datos.get('precio_noche') is not None:
            alojamiento.precio_noche = datos['precio_noche']
        if datos.get('ciudad') is not None:
            alojamiento.ciudad = datos['ciudad']

        AlojamientoRepositorio.guardar(alojamiento)
        return alojamiento.to_dict()

    def eliminar_alojamiento(self, alojamiento_id, usuario_id):
        """Elimina un alojamiento. Solo propietario o admin."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f'Alojamiento con id {alojamiento_id} no encontrado.'
            )

        # Consultar rol del usuario para verificar permiso
        from app.dominios.usuarios.repositorios import UsuarioRepositorio
        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == 'admin'

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                'Permiso denegado. Solo el propietario o un administrador pueden eliminar este alojamiento.'
            )

        AlojamientoRepositorio.eliminar(alojamiento)
```

**¿Qué hace cada parte?**

| Sección | Explicación |
|---|---|
| **`AlojamientoNoEncontradoError`** | Excepción de dominio para alojamiento inexistente. El error handler global en `app/__init__.py` la traduce a 404. |
| **`PermisoDenegadoError`** | Reutilizada del dominio de usuarios. El error handler global la traduce a 403. |
| **`crear_alojamiento`** | Crea el alojamiento asignando `usuario_id` del usuario autenticado. |
| **`listar_todos` / `obtener_detalle`** | Públicos. `obtener_detalle` lanza `AlojamientoNoEncontradoError` si no existe. |
| **`actualizar_alojamiento`** | Consulta el rol del usuario. Si no es admin ni propietario → lanza `PermisoDenegadoError`. Actualización parcial: solo campos no `None`. |
| **`eliminar_alojamiento`** | Misma lógica de autorización. Elimina el alojamiento si tiene permiso. |

**Importante:** Toda la lógica de autorización ("propietario o admin") vive **dentro del servicio**. El controlador no calcula `es_admin`; solo delega al servicio.

---

### Paso 6 — Crear `app/dominios/alojamientos/controladores.py`

Crea `app/dominios/alojamientos/controladores.py`:

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.dominios.alojamientos.dtos import CrearAlojamientoDTO, ActualizarAlojamientoDTO
from app.seguridad import requiere_token

alojamientos_bp = Blueprint('alojamientos', __name__)

# Variable global que el app factory asignara al crear la app
alojamiento_servicio = None


@alojamientos_bp.route('', methods=['POST'])
@requiere_token
def crear_alojamiento(usuario_id):
    """Crear un nuevo alojamiento (requiere autenticacion)."""
    datos = request.get_json(silent=True) or {}

    dto = CrearAlojamientoDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    alojamiento = alojamiento_servicio.crear_alojamiento(datos_validados, usuario_id)

    return jsonify({
        'success': True,
        'message': 'Alojamiento creado con exito.',
        'data': alojamiento.to_dict(),
    }), 201


@alojamientos_bp.route('', methods=['GET'])
def listar_alojamientos():
    """Listar todos los alojamientos (publico)."""
    lista = alojamiento_servicio.listar_todos()
    return jsonify({
        'success': True,
        'message': 'Lista de alojamientos.',
        'data': lista,
    }), 200


@alojamientos_bp.route('/<int:alojamiento_id>', methods=['GET'])
def obtener_detalle(alojamiento_id):
    """Ver detalle de un alojamiento (publico)."""
    detalle = alojamiento_servicio.obtener_detalle(alojamiento_id)
    return jsonify({
        'success': True,
        'message': 'Detalle de alojamiento.',
        'data': detalle,
    }), 200


@alojamientos_bp.route('/<int:alojamiento_id>', methods=['PATCH'])
@requiere_token
def actualizar_alojamiento(usuario_id, alojamiento_id):
    """Actualizar parcialmente un alojamiento (propietario o admin)."""
    datos = request.get_json(silent=True) or {}

    dto = ActualizarAlojamientoDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    resultado = alojamiento_servicio.actualizar_alojamiento(
        alojamiento_id, usuario_id, datos_validados
    )

    return jsonify({
        'success': True,
        'message': 'Alojamiento actualizado.',
        'data': resultado,
    }), 200


@alojamientos_bp.route('/<int:alojamiento_id>', methods=['DELETE'])
@requiere_token
def eliminar_alojamiento(usuario_id, alojamiento_id):
    """Eliminar un alojamiento (propietario o admin)."""
    alojamiento_servicio.eliminar_alojamiento(alojamiento_id, usuario_id)
    return '', 204
```

**¿Qué hace cada endpoint?**

| Endpoint | Auth | Flujo |
|---|---|---|
| `POST` | `@requiere_token` | Valida DTO → crea alojamiento con `usuario_id` → 201 |
| `GET /` | Público | Lista todos → 200 |
| `GET /<id>` | Público | Detalle → 200 o lanza `AlojamientoNoEncontradoError` → 404 |
| `PATCH /<id>` | `@requiere_token` | Valida DTO parcial → servicio verifica permiso → 200 o 403 o 404 |
| `DELETE /<id>` | `@requiere_token` | Servicio verifica permiso → elimina → 204 o 403 o 404 |

**¿Por qué no hay `try/except` para excepciones de dominio?** Porque el proyecto ya consolidó la regla: el servicio lanza excepciones y el error handler global en `app/__init__.py` las convierte a respuestas HTTP. El controlador solo valida DTOs (`ValidationError`) y delega al servicio.

---

### Paso 7 — Actualizar `app/__init__.py`

Abre `app/__init__.py`.

#### 7a. Registrar `alojamientos_bp`

Busca donde se registran los blueprints (después de `admin_bp`) y añade el registro de alojamientos:

```python
    # Registrar blueprint de alojamientos
    from app.dominios.alojamientos.controladores import alojamientos_bp
    from app.dominios.alojamientos.servicios import AlojamientoServicio
    from app.dominios.alojamientos import controladores as alojamientos_ctrl

    alojamientos_ctrl.alojamiento_servicio = AlojamientoServicio()

    app.register_blueprint(alojamientos_bp, url_prefix=f'/api/{API_VERSION}/alojamientos')
```

#### 7b. Registrar error handler de `AlojamientoNoEncontradoError`

Busca la sección de manejadores de errores (después de los de usuarios y alojamientos) y añade:

```python
    # Manejadores de errores de dominio de alojamientos
    from app.dominios.alojamientos.servicios import AlojamientoNoEncontradoError

    @app.errorhandler(AlojamientoNoEncontradoError)
    def alojamiento_no_encontrado(error):
        return {"success": False, "error": {"message": str(error)}}, 404
```

**¿Qué hace?** Cuando el servicio lanza `AlojamientoNoEncontradoError`, este handler captura la excepción y devuelve una respuesta JSON con status 404.

---

### Paso 8 — Generar y aplicar la migración

Con el entorno virtual activado, configura `FLASK_APP` y genera la migración:

```bash
# Windows CMD
set FLASK_APP=app:crear_app

# Windows PowerShell
$env:FLASK_APP = "app:crear_app"

# Linux / Mac
export FLASK_APP=app:crear_app
```

Genera la migración:

```bash
python -m flask db migrate -m "crear tabla alojamientos"
```

**Resultado esperado:**

```
INFO  [alembic.autogenerate.compare.tables] Detected added table 'alojamientos'
Generating .../migrations/versions/<hash>_crear_tabla_alojamientos.py ...  done
```

Esta migración **solo crea la tabla `alojamientos`**. No recrea tablas de sprints anteriores (`usuarios`, `perfiles`) porque ya existen de migraciones previas.

Aplica la migración:

```bash
python -m flask db upgrade
```

**Resultado esperado:**

```
INFO  [alembic.runtime.migration] Running upgrade <hash_anterior> -> <hash_nuevo>, crear tabla alojamientos
```

---

### Paso 9 — Actualizar `tests/conftest.py`

Abre `tests/conftest.py` (el mismo archivo que creaste en el Sprint 2).

> **Recordatorio:** La seccion de imports y variables de entorno de testing ya esta configurada desde el Sprint 2 (con `os.environ` antes de `from app import crear_app`). No toques esa parte. En este paso solo vas a **añadir** un nuevo fixture al final del archivo.

Debes añadir un **nuevo fixture** llamado `usuario_auth2`. Este fixture crea un **segundo usuario autenticado** diferente al que produce `usuario_auth`. Se usa en las pruebas de autorización donde necesitas dos usuarios distintos: uno crea un alojamiento y otro intenta modificarlo o eliminarlo.

Al final del archivo, después del fixture `admin_auth`, añade:

```python
@pytest.fixture
def usuario_auth2(client):
    """Crea un segundo usuario unico y devuelve headers con token valido.

    Se usa para pruebas de autorizacion donde se necesitan dos usuarios distintos.
    """
    import uuid
    email = f'user2-{uuid.uuid4().hex[:8]}@ejemplo.com'

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

**¿Por qué hace falta `usuario_auth2` en Sprint 4?** Porque las pruebas de "actualizar/eliminar alojamiento ajeno" necesitan dos usuarios distintos: uno que crea el alojamiento y otro que intenta modificarlo. Sin `usuario_auth2`, los tests no tendrían un segundo usuario con identidad única para validar la regla de "propietario o admin".

Ahora `tests/conftest.py` tiene estos fixtures relevantes:

| Fixture | Para qué sirve en Sprint 4 |
|---|---|
| `usuario_auth` | Primer usuario autenticado (crea alojamientos propios) |
| `usuario_auth2` | Segundo usuario autenticado (intenta acceder a alojamientos ajenos → 403) |
| `admin_auth` | Usuario con rol admin (puede editar/eliminar cualquier alojamiento) |

---

### Paso 10 — Crear `tests/test_alojamientos.py`

Crea `tests/test_alojamientos.py`:

```python
import json


class TestAlojamientos:
    """Pruebas de integracion para el dominio de alojamientos."""

    def test_crear_alojamiento_con_auth(self, client, usuario_auth):
        """Crear alojamiento con usuario autenticado debe responder 201."""
        resp = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Cabaña Andina',
            'descripcion': 'Vista al volcan',
            'precio_noche': 85.50,
            'ciudad': 'Quito',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos['success'] is True
        assert datos['data']['titulo'] == 'Cabaña Andina'
        assert datos['data']['ciudad'] == 'Quito'

    def test_crear_alojamiento_sin_token(self, client):
        """Crear alojamiento sin token debe responder 401."""
        resp = client.post('/api/v1/alojamientos', json={
            'titulo': 'Cabaña Andina',
            'descripcion': 'Vista al volcan',
            'precio_noche': 85.50,
            'ciudad': 'Quito',
        })
        assert resp.status_code == 401

    def test_listar_alojamientos_sin_auth(self, client):
        """Listar alojamientos sin auth debe responder 200."""
        resp = client.get('/api/v1/alojamientos')
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert isinstance(datos['data'], list)

    def test_detalle_alojamiento_sin_auth(self, client, usuario_auth):
        """Ver detalle sin auth debe responder 200."""
        # Primero crear un alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Detalle Test',
            'descripcion': 'Para prueba',
            'precio_noche': 50.0,
            'ciudad': 'Lima',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        resp = client.get(f'/api/v1/alojamientos/{alojamiento_id}')
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert datos['data']['titulo'] == 'Detalle Test'

    def test_detalle_inexistente(self, client):
        """Detalle de alojamiento inexistente debe responder 404."""
        resp = client.get('/api/v1/alojamientos/99999')
        datos = json.loads(resp.data)

        assert resp.status_code == 404
        assert datos['success'] is False

    def test_actualizar_ajeno_usuario_normal(self, client, usuario_auth, usuario_auth2):
        """Actualizar alojamiento ajeno con usuario normal debe responder 403."""
        # Primer usuario crea alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Propiedad Ajena',
            'descripcion': 'No tocar',
            'precio_noche': 100.0,
            'ciudad': 'Bogota',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Segundo usuario intenta actualizar
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}', headers=usuario_auth2, json={
            'titulo': 'Hackeado',
        })
        assert resp.status_code == 403

    def test_eliminar_ajeno_usuario_normal(self, client, usuario_auth, usuario_auth2):
        """Eliminar alojamiento ajeno con usuario normal debe responder 403."""
        # Primer usuario crea alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Propiedad Ajena 2',
            'descripcion': 'No eliminar',
            'precio_noche': 75.0,
            'ciudad': 'Medellin',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Segundo usuario intenta eliminar
        resp = client.delete(f'/api/v1/alojamientos/{alojamiento_id}', headers=usuario_auth2)
        assert resp.status_code == 403

    def test_actualizar_propio(self, client, usuario_auth):
        """Actualizar alojamiento propio debe responder 200."""
        # Crear alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Mi Alojamiento',
            'descripcion': 'Original',
            'precio_noche': 60.0,
            'ciudad': 'Santiago',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Actualizar
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}', headers=usuario_auth, json={
            'titulo': 'Mi Alojamiento Editado',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['data']['titulo'] == 'Mi Alojamiento Editado'
        assert datos['data']['descripcion'] == 'Original'

    def test_eliminar_propio(self, client, usuario_auth):
        """Eliminar alojamiento propio debe responder 204."""
        # Crear alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Para Eliminar',
            'descripcion': 'Temporal',
            'precio_noche': 40.0,
            'ciudad': 'Buenos Aires',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Eliminar
        resp = client.delete(f'/api/v1/alojamientos/{alojamiento_id}', headers=usuario_auth)
        assert resp.status_code == 204

        # Verificar que ya no existe
        resp2 = client.get(f'/api/v1/alojamientos/{alojamiento_id}')
        assert resp2.status_code == 404

    def test_admin_actualiza_ajeno(self, client, admin_auth, usuario_auth):
        """Admin puede actualizar alojamiento ajeno → 200."""
        # Usuario normal crea alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Propiedad de Usuario',
            'descripcion': 'Admin va a editar',
            'precio_noche': 90.0,
            'ciudad': 'Caracas',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Admin edita
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}', headers=admin_auth, json={
            'titulo': 'Editado por Admin',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['data']['titulo'] == 'Editado por Admin'

    def test_admin_elimina_ajeno(self, client, admin_auth, usuario_auth):
        """Admin puede eliminar alojamiento ajeno → 204."""
        # Usuario normal crea alojamiento
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Propiedad para Eliminar',
            'descripcion': 'Admin va a eliminar',
            'precio_noche': 120.0,
            'ciudad': 'Panama',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Admin elimina
        resp = client.delete(f'/api/v1/alojamientos/{alojamiento_id}', headers=admin_auth)
        assert resp.status_code == 204

        # Verificar que ya no existe
        resp2 = client.get(f'/api/v1/alojamientos/{alojamiento_id}')
        assert resp2.status_code == 404
```

**Resumen de las 11 pruebas:**

| # | Test | Qué valida |
|---|---|---|
| 1 | crear con auth → 201 | Usuario autenticado crea alojamiento |
| 2 | crear sin token → 401 | No autenticado no puede crear |
| 3 | listar sin auth → 200 | Listado es público |
| 4 | detalle sin auth → 200 | Detalle es público |
| 5 | detalle inexistente → 404 | Alojamiento no encontrado |
| 6 | actualizar ajeno (normal) → 403 | Usuario normal no edita ajeno |
| 7 | eliminar ajeno (normal) → 403 | Usuario normal no elimina ajeno |
| 8 | actualizar propio → 200 | Propietario edita lo suyo |
| 9 | eliminar propio → 204 | Propietario elimina lo suyo |
| 10 | admin actualiza ajeno → 200 | Admin edita cualquier alojamiento |
| 11 | admin elimina ajeno → 204 | Admin elimina cualquier alojamiento |

---

### Paso 11 — Ejecutar la suite completa de pruebas

```bash
pytest tests/ -v
```

**Resultado esperado:**

```
tests/test_alojamientos.py::TestAlojamientos::test_crear_alojamiento_con_auth PASSED
tests/test_alojamientos.py::TestAlojamientos::test_crear_alojamiento_sin_token PASSED
tests/test_alojamientos.py::TestAlojamientos::test_listar_alojamientos_sin_auth PASSED
tests/test_alojamientos.py::TestAlojamientos::test_detalle_alojamiento_sin_auth PASSED
tests/test_alojamientos.py::TestAlojamientos::test_detalle_inexistente PASSED
tests/test_alojamientos.py::TestAlojamientos::test_actualizar_ajeno_usuario_normal PASSED
tests/test_alojamientos.py::TestAlojamientos::test_eliminar_ajeno_usuario_normal PASSED
tests/test_alojamientos.py::TestAlojamientos::test_actualizar_propio PASSED
tests/test_alojamientos.py::TestAlojamientos::test_eliminar_propio PASSED
tests/test_alojamientos.py::TestAlojamientos::test_admin_actualiza_ajeno PASSED
tests/test_alojamientos.py::TestAlojamientos::test_admin_elimina_ajeno PASSED
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
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_sin_token PASSED
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_con_usuario_normal PASSED
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_con_admin PASSED

========================= 25 passed in X.XXs ==========================
```

---

## 7. Cómo probar que funciona

### Validación manual de endpoints

Levanta el servidor:

```bash
python app.py
```

En otra terminal, primero necesitas un usuario autenticado:

```bash
# 1. Registrar un usuario
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"host@demo.com\",\"contrasena\":\"123456\"}"
```

```bash
# 2. Hacer login y guardar el token
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"host@demo.com\",\"contrasena\":\"123456\"}"
```

Copia el `access_token` de la respuesta y úsalo en los siguientes comandos.

```bash
# 3. Crear alojamiento
curl -s -X POST http://127.0.0.1:5000/api/v1/alojamientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -d "{\"titulo\":\"Casa de Playa\",\"descripcion\":\"Vista al mar\",\"precio_noche\":100.0,\"ciudad\":\"Cartagena\"}"
```

**Resultado esperado:** `201` con datos del alojamiento.

```bash
# 4. Listar alojamientos (público, sin token)
curl -s http://127.0.0.1:5000/api/v1/alojamientos
```

**Resultado esperado:** `200` con lista de alojamientos.

```bash
# 5. Ver detalle (público, sin token)
curl -s http://127.0.0.1:5000/api/v1/alojamientos/1
```

**Resultado esperado:** `200` con detalle del alojamiento.

### Probar las reglas de acceso

| Qué probar | Comando | Resultado |
|---|---|---|
| Crear sin token | `curl -s -X POST http://127.0.0.1:5000/api/v1/alojamientos -H "Content-Type: application/json" -d "{\"titulo\":\"X\",\"descripcion\":\"X\",\"precio_noche\":10.0,\"ciudad\":\"X\"}"` | 401 |
| Detalle inexistente | `curl -s http://127.0.0.1:5000/api/v1/alojamientos/99999` | 404 |
| Eliminar propio | `curl -s -X DELETE http://127.0.0.1:5000/api/v1/alojamientos/<ID>` con token del propietario | 204 |

---

## 8. Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `ImportError: cannot import name 'PermisoDenegadoError'` | Import circular entre dominios | Importar desde `app.dominios.usuarios.servicios` dentro del servicio de alojamientos. Es dependencia unidireccional: alojamientos depende de usuarios, no al revés. |
| `flask db migrate` no detecta el modelo | `Alojamiento` no importa `db` correctamente | Verifica `from app import db` al inicio de `modelos.py`. |
| `PATCH` devuelve 500 en vez de 403 | Handler de `PermisoDenegadoError` no registrado | Verifica `@app.errorhandler(PermisoDenegadoError)` en `crear_app()`. |
| `DELETE` devuelve 200 en vez de 204 | El controlador no devuelve código explícito | Verifica `return '', 204` en el endpoint de eliminación. |
| Test de autorización falla | Fixture `usuario_auth2` no existe | Asegúrate de añadir `usuario_auth2` en `tests/conftest.py` (creado en Sprint 4). |
| `ModuleNotFoundError: No module named 'app'` en tests | Falta `pythonpath = .` en `pytest.ini` | Verifica `pytest.ini` desde Sprint 2. |

---

## 9. Cierre con Git y GitHub

### Hacer el commit del Sprint 4

Verifica qué archivos se van a commitear:

```bash
git status
```

Agrega todo y commitea:

```bash
git add .
git commit -m "feat: dominio alojamientos con CRUD base y autorizacion por propietario o admin

- Modelos: Alojamiento con relacion a Usuario
- DTOs: CrearAlojamientoDTO, ActualizarAlojamientoDTO con validacion
- Repositorio: AlojamientoRepositorio con CRUD basico
- Servicio: AlojamientoServicio con verificacion de propietario o admin
- Controlador: blueprint alojamientos_bp con 5 endpoints
- Migracion: crear tabla alojamientos
- Tests: 11 tests de integracion para alojamientos
- 25 tests en total pasando (14 anteriores + 11 nuevos)"
```

### Hacer push a GitHub

```bash
git push
```

**Validación:** Visita tu repositorio en GitHub y verifica que los nuevos archivos aparecen listados.

---

## 10. Resultado final del Sprint 4

Si seguiste todos los pasos, ahora tienes:

- ✅ Modelo `Alojamiento` con relación a `Usuario` (un usuario tiene muchos alojamientos).
- ✅ Migración limpia que solo crea la tabla `alojamientos` (no recrea tablas anteriores).
- ✅ 5 endpoints CRUD funcionando: crear, listar, detalle, actualizar, eliminar.
- ✅ Autorización por "propietario o admin" concentrada en el servicio.
- ✅ `DELETE` responde 204 (convención REST correcta).
- ✅ Excepciones de dominio manejadas exclusivamente por handlers globales.
- ✅ 11 tests de integración para alojamientos.
- ✅ 25 tests en total pasando (14 de Sprints 2+3 + 11 de Sprint 4).
- ✅ Código versionado en Git y subido a GitHub.

**Próximo paso:** En el Sprint 5 construirás comodidades con relación N:M entre alojamientos y comodidades.
