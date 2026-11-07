# Tutorial — Sprint 5: Comodidades

---

## 1. Título del tutorial

**Sprint 5 — Comodidades**

---

## 2. Objetivo

Introducir el concepto de **relación muchos a muchos (N:M)** en el proyecto: crear el recurso `Comodidad` (catálogo global de amenities), modelar la relación N:M entre `Alojamiento` y `Comodidad` mediante una tabla de asociación, generar la migración correspondiente, y implementar los endpoints necesarios para listar comodidades, crearlas (solo admin) y asignar la lista de comodidades de un alojamiento.

Al final de este tutorial tendrás tres endpoints nuevos para comodidades y uno nuevo para alojamientos:
- `POST /api/v1/comodidades` — crear comodidad (admin)
- `GET /api/v1/comodidades` — listar todas (público)
- `GET /api/v1/comodidades/<id>` — ver detalle (público)
- `PATCH /api/v1/alojamientos/<id>/comodidades` — asignar comodidades (propietario o admin)

Además, el detalle de alojamiento (`GET /api/v1/alojamientos/<id>`) ahora incluirá las comodidades asignadas.

---

## 3. Qué va a aprender el estudiante

- Modelar una relación muchos a muchos con `db.Table` + `secondary=` en SQLAlchemy.
- Crear un dominio completo con la arquitectura por capas del proyecto.
- Gestionar la asignación de recursos relacionados mediante un endpoint que reemplaza la lista completa.
- Validar que los IDs relacionados existen antes de asignar.
- Aplicar reglas de autorización coherentes (admin para crear comodidades, propietario o admin para asignarlas).
- Actualizar la serialización (`to_dict()`) de un modelo existente para incluir una relación nueva.
- Escribir tests de integración para un dominio nuevo con relaciones.

---

## 4. Prerrequisitos

Antes de empezar, debes tener:

| Requisito | Cómo verificar |
|---|---|
| Sprint 4 completado y funcionando | 25 tests pasan con `pytest tests/ -v` |
| Entorno virtual activo | `(venv)` en el prompt |
| MySQL corriendo con `alojamientos_db` y migraciones aplicadas | `GET /health` responde 200 |
| Repositorio Git con commits de Sprints 1-4 | `git log --oneline` muestra los commits |
| Al menos un usuario admin registrado | Necesario para crear comodidades |

Si no tienes todo esto, completa primero los Sprints anteriores.

---

## 5. Estructura final esperada

Los archivos nuevos y modificados serán:

```
alojamientos/
├── app/
│   ├── __init__.py                    (actualizado: + comodidades_bp + 3 error handlers)
│   └── dominios/
│       ├── alojamientos/
│       │   ├── modelos.py             (actualizado: + relacion N:M + to_dict con comodidades)
│       │   ├── repositorios.py        (actualizado: + obtener_por_id_con_comodidades)
│       │   ├── servicios.py           (actualizado: + ComodidadesInvalidasError + asignar_comodidades)
│       │   └── controladores.py       (actualizado: + PATCH /<id>/comodidades)
│       └── comodidades/               [NUEVO - carpeta completa]
│           ├── __init__.py
│           ├── modelos.py             (Comodidad + alojamiento_comodidad)
│           ├── dtos.py                (CrearComodidadDTO + AsignarComodidadesDTO)
│           ├── repositorios.py        (ComodidadRepositorio)
│           ├── servicios.py           (ComodidadServicio + excepciones)
│           └── controladores.py       (comodidades_bp)
├── migrations/
│   └── versions/
│       └── ebb9cbe49179_crear_tabla_comodidades_y_relacion_con_.py  [NUEVO]
└── tests/
    └── test_comodidades.py            [NUEVO]
```

---

## 6. Paso a paso completo

### Paso 1 — Crear la estructura del dominio de comodidades

Crea la carpeta del dominio y su paquete Python:

```bash
# Windows CMD
mkdir app\dominios\comodidades
type nul > app\dominios\comodidades\__init__.py

# Linux / Mac
mkdir -p app/dominios/comodidades
touch app/dominios/comodidades/__init__.py
```

**¿Qué es `__init__.py`?** Marca la carpeta como un paquete Python importable. Déjalo vacío.

---

### Paso 2 — Crear `app/dominios/comodidades/modelos.py`

Crea el archivo `app/dominios/comodidades/modelos.py`:

```python
from app import db


# Tabla de asociacion para relacion N:M entre Alojamientos y Comodidades
alojamiento_comodidad = db.Table(
    'alojamiento_comodidad',
    db.Column('alojamiento_id', db.Integer, db.ForeignKey('alojamientos.id'), primary_key=True),
    db.Column('comodidad_id', db.Integer, db.ForeignKey('comodidades.id'), primary_key=True),
)


class Comodidad(db.Model):
    """Modelo de comodidad de la plataforma."""
    __tablename__ = 'comodidades'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)

    # Relacion N:M con Alojamiento
    alojamientos = db.relationship(
        'Alojamiento',
        secondary=alojamiento_comodidad,
        back_populates='comodidades',
        lazy=True,
    )

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
        }
```

**¿Qué hace cada parte?**

| Elemento | Explicación |
|---|---|
| `alojamiento_comodidad = db.Table(...)` | Tabla intermedia para la relación N:M. Tiene dos columnas (FK a cada tabla) y primary key compuesta. No es un modelo, es una tabla auxiliar. |
| `nombre` con `unique=True` | No pueden existir dos comodidades con el mismo nombre. |
| `alojamientos = db.relationship(...)` | Relación inversa: desde una comodidad puedes acceder a los alojamientos que la tienen. `secondary=` apunta a la tabla intermedia. `back_populates='comodidades'` conecta con la relación que definiremos en `Alojamiento`. |
| `to_dict()` | Devuelve solo `id` y `nombre`. Simple y limpio para respuestas JSON. |

---

### Paso 3 — Actualizar `app/dominios/alojamientos/modelos.py`

Abre `app/dominios/alojamientos/modelos.py` y actualízalo para incluir la relación N:M con `Comodidad`.

**Reemplaza todo** el contenido con:

```python
from datetime import datetime
from app import db

# Importar la tabla de asociacion para definir la relacion N:M
# (se importa desde comodidades para evitar import circular)
from app.dominios.comodidades.modelos import alojamiento_comodidad


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

    # Relacion many-to-one con Usuario
    usuario = db.relationship(
        'Usuario',
        backref=db.backref('alojamientos', lazy=True),
        lazy=True,
    )

    # Relacion many-to-many con Comodidad
    comodidades = db.relationship(
        'Comodidad',
        secondary=alojamiento_comodidad,
        back_populates='alojamientos',
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
            'comodidades': [c.to_dict() for c in self.comodidades],
        }
```

**¿Qué cambió?**

| Cambio | Explicación |
|---|---|
| Import de `alojamiento_comodidad` | Se importa desde `comodidades.modelos`. Esto evita import circular porque `comodidades` no importa de `alojamientos`. |
| `comodidades = db.relationship(...)` | Relación N:M. `secondary=alojamiento_comodidad` usa la tabla intermedia. `back_populates='alojamientos'` conecta con la relación del otro lado. |
| `to_dict()` con `'comodidades'` | Ahora la serialización incluye la lista de comodidades asignadas. Cada comodidad se serializa con su propio `to_dict()` (solo `id` y `nombre`). |

---

### Paso 4 — Crear `app/dominios/comodidades/dtos.py`

Crea `app/dominios/comodidades/dtos.py`:

```python
from marshmallow import Schema, fields, validate


class CrearComodidadDTO(Schema):
    """DTO para validar creacion de comodidad."""
    nombre = fields.String(required=True, validate=validate.Length(min=1))


class AsignarComodidadesDTO(Schema):
    """DTO para validar asignacion de comodidades a un alojamiento."""
    comodidades_ids = fields.List(
        fields.Integer(),
        required=True,
    )
```

**¿Qué hace cada DTO?**

| DTO | Dónde se usa | Validación |
|---|---|---|
| `CrearComodidadDTO` | `POST /api/v1/comodidades` | `nombre` requerido, string, mínimo 1 carácter |
| `AsignarComodidadesDTO` | `PATCH /api/v1/alojamientos/<id>/comodidades` | `comodidades_ids` lista de integers requerida; acepta `[]` para vaciar |

**Nota importante:** `AsignarComodidadesDTO` vive aquí (en `comodidades/dtos.py`) porque representa datos de comodidades. El controlador de alojamientos lo importa desde aquí cuando lo necesita.

---

### Paso 5 — Crear `app/dominios/comodidades/repositorios.py`

Crea `app/dominios/comodidades/repositorios.py`:

```python
from app import db
from app.dominios.comodidades.modelos import Comodidad


class ComodidadRepositorio:
    """Capa de acceso a datos para comodidades."""

    @staticmethod
    def guardar(comodidad):
        """Inserta o actualiza una comodidad en la BD."""
        db.session.add(comodidad)
        db.session.commit()
        return comodidad

    @staticmethod
    def obtener_por_id(comodidad_id):
        """Busca una comodidad por su ID."""
        return db.session.get(Comodidad, comodidad_id)

    @staticmethod
    def obtener_todos():
        """Devuelve todas las comodidades."""
        return db.session.query(Comodidad).all()

    @staticmethod
    def obtener_por_ids(comodidad_ids):
        """Devuelve las comodidades cuyos IDs estan en la lista."""
        return db.session.query(Comodidad).filter(Comodidad.id.in_(comodidad_ids)).all()
```

**¿Qué hace `obtener_por_ids`?** Recibe una lista de IDs (ej. `[1, 3, 5]`) y devuelve solo las comodidades que existen con esos IDs. Se usa en el servicio de alojamientos para verificar que todas las comodidades solicitadas existen antes de asignarlas.

---

### Paso 6 — Actualizar `app/dominios/alojamientos/repositorios.py`

Abre `app/dominios/alojamientos/repositorios.py` y añade el método `obtener_por_id_con_comodidades` al final de la clase:

```python
    @staticmethod
    def obtener_por_id_con_comodidades(alojamiento_id):
        """Busca un alojamiento por su ID cargando sus comodidades (eager loading)."""
        return db.session.query(Alojamiento).options(
            db.joinedload(Alojamiento.comodidades)
        ).filter(Alojamiento.id == alojamiento_id).first()
```

**¿Qué es eager loading?** Por defecto, SQLAlchemy carga las relaciones de forma "lazy" (una query adicional por cada acceso). `joinedload` carga las comodidades en la **misma query** que el alojamiento, evitando el problema N+1. Esto es importante para `obtener_detalle`, que ahora incluye comodidades en la respuesta.

---

### Paso 7 — Crear `app/dominios/comodidades/servicios.py`

Crea `app/dominios/comodidades/servicios.py`:

```python
from app.dominios.comodidades.modelos import Comodidad
from app.dominios.comodidades.repositorios import ComodidadRepositorio


# --- Excepciones de dominio ---

class ComodidadNoEncontradaError(Exception):
    pass


class ComodidadYaExisteError(Exception):
    pass


# --- Servicio de comodidades ---

class ComodidadServicio:
    """Logica de negocio para comodidades."""

    def crear_comodidad(self, datos):
        """Crea una nueva comodidad. Solo admin."""
        nombre = datos['nombre']

        # Verificar duplicado
        comodidades_existentes = ComodidadRepositorio.obtener_todos()
        for c in comodidades_existentes:
            if c.nombre.lower() == nombre.lower():
                raise ComodidadYaExisteError(f'Ya existe una comodidad con el nombre {nombre}.')

        comodidad = Comodidad(nombre=nombre)
        ComodidadRepositorio.guardar(comodidad)
        return comodidad

    def listar_todos(self):
        """Devuelve lista de todas las comodidades (publico)."""
        comodidades = ComodidadRepositorio.obtener_todos()
        return [c.to_dict() for c in comodidades]

    def obtener_detalle(self, comodidad_id):
        """Obtiene el detalle de una comodidad (publico)."""
        comodidad = ComodidadRepositorio.obtener_por_id(comodidad_id)
        if not comodidad:
            raise ComodidadNoEncontradaError(
                f'Comodidad con id {comodidad_id} no encontrada.'
            )
        return comodidad.to_dict()
```

**¿Qué hace cada parte?**

| Método | Explicación |
|---|---|
| `crear_comodidad` | Verifica que no exista una comodidad con el mismo nombre (case-insensitive). Si existe → lanza `ComodidadYaExisteError`. Si no, crea y guarda. |
| `listar_todos` | Público. Devuelve todas las comodidades como diccionarios. |
| `obtener_detalle` | Público. Lanza `ComodidadNoEncontradaError` si no existe. |

---

### Paso 8 — Actualizar `app/dominios/alojamientos/servicios.py`

Abre `app/dominios/alojamientos/servicios.py`.

#### 8a. Añadir imports y excepción

Al inicio del archivo, añade el import de `ComodidadRepositorio` y la nueva excepción:

```python
from app import db
from app.dominios.alojamientos.modelos import Alojamiento
from app.dominios.alojamientos.repositorios import AlojamientoRepositorio
from app.dominios.comodidades.repositorios import ComodidadRepositorio
from app.dominios.usuarios.servicios import PermisoDenegadoError


# --- Excepciones de dominio ---

class AlojamientoNoEncontradoError(Exception):
    pass


class ComodidadesInvalidasError(Exception):
    pass
```

#### 8b. Actualizar `obtener_detalle`

Cambia el método `obtener_detalle` para usar `obtener_por_id_con_comodidades`:

```python
    def obtener_detalle(self, alojamiento_id):
        """Obtiene el detalle de un alojamiento incluyendo comodidades (publico)."""
        alojamiento = AlojamientoRepositorio.obtener_por_id_con_comodidades(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f'Alojamiento con id {alojamiento_id} no encontrado.'
            )
        return alojamiento.to_dict()
```

#### 8c. Añadir `asignar_comodidades`

Al final de la clase `AlojamientoServicio`, añade este método:

```python
    def asignar_comodidades(self, alojamiento_id, usuario_id, comodidad_ids):
        """Reemplaza la lista completa de comodidades de un alojamiento."""
        alojamiento = AlojamientoRepositorio.obtener_por_id(alojamiento_id)
        if not alojamiento:
            raise AlojamientoNoEncontradoError(
                f'Alojamiento con id {alojamiento_id} no encontrado.'
            )

        # Verificar permiso: propietario o admin
        from app.dominios.usuarios.repositorios import UsuarioRepositorio
        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        es_admin = usuario is not None and usuario.rol == 'admin'

        if not es_admin and alojamiento.usuario_id != usuario_id:
            raise PermisoDenegadoError(
                'Permiso denegado. Solo el propietario o un administrador pueden modificar las comodidades de este alojamiento.'
            )

        # Verificar que todas las comodidades existen
        if comodidad_ids:
            comodidades = ComodidadRepositorio.obtener_por_ids(comodidad_ids)
            if len(comodidades) != len(comodidad_ids):
                ids_encontrados = {c.id for c in comodidades}
                ids_faltantes = set(comodidad_ids) - ids_encontrados
                raise ComodidadesInvalidasError(
                    f'Las comodidades con ids {list(ids_faltantes)} no existen.'
                )
            alojamiento.comodidades = comodidades
        else:
            # Lista vacia: dejar el alojamiento sin comodidades
            alojamiento.comodidades = []

        db.session.commit()
        return alojamiento
```

**¿Qué hace?**
1. Busca el alojamiento. Si no existe → `AlojamientoNoEncontradoError`.
2. Verifica que el usuario es **propietario o admin**. Si no → `PermisoDenegadoError`.
3. Si hay IDs, verifica que todas las comodidades existen usando `obtener_por_ids`. Si faltan → `ComodidadesInvalidasError`.
4. Reemplaza la lista completa de comodidades (`alojamiento.comodidades = comodidades`).
5. Si `comodidad_ids` es `[]`, deja el alojamiento sin comodidades.
6. Guarda y retorna el alojamiento actualizado.

---

### Paso 9 — Crear `app/dominios/comodidades/controladores.py`

Crea `app/dominios/comodidades/controladores.py`:

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.dominios.comodidades.dtos import CrearComodidadDTO
from app.seguridad import requiere_admin

comodidades_bp = Blueprint('comodidades', __name__)

# Variable global que el app factory asignara al crear la app
comodidad_servicio = None


@comodidades_bp.route('', methods=['POST'])
@requiere_admin
def crear_comodidad(usuario_id):
    """Crear una nueva comodidad (solo admin)."""
    datos = request.get_json(silent=True) or {}

    dto = CrearComodidadDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    comodidad = comodidad_servicio.crear_comodidad(datos_validados)

    return jsonify({
        'success': True,
        'message': 'Comodidad creada con exito.',
        'data': comodidad.to_dict(),
    }), 201


@comodidades_bp.route('', methods=['GET'])
def listar_comodidades():
    """Listar todas las comodidades (publico)."""
    lista = comodidad_servicio.listar_todos()
    return jsonify({
        'success': True,
        'message': 'Lista de comodidades.',
        'data': lista,
    }), 200


@comodidades_bp.route('/<int:comodidad_id>', methods=['GET'])
def obtener_detalle(comodidad_id):
    """Ver detalle de una comodidad (publico)."""
    detalle = comodidad_servicio.obtener_detalle(comodidad_id)
    return jsonify({
        'success': True,
        'message': 'Detalle de comodidad.',
        'data': detalle,
    }), 200
```

**¿Qué hace cada endpoint?**

| Endpoint | Auth | Comportamiento |
|---|---|---|
| `POST /` | `@requiere_admin` | Valida DTO → crea comodidad → 201 |
| `GET /` | Público | Lista todas → 200 |
| `GET /<id>` | Público | Detalle → 200 o lanza `ComodidadNoEncontradaError` → 404 |

---

### Paso 10 — Actualizar `app/dominios/alojamientos/controladores.py`

Abre `app/dominios/alojamientos/controladores.py`.

#### 10a. Actualizar imports

Cambia la línea de imports para incluir `AsignarComodidadesDTO` desde comodidades:

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.dominios.alojamientos.dtos import CrearAlojamientoDTO, ActualizarAlojamientoDTO
from app.dominios.comodidades.dtos import AsignarComodidadesDTO
from app.seguridad import requiere_token
```

#### 10b. Añadir el endpoint de asignación

Al final del archivo, después de `eliminar_alojamiento`, añade:

```python
@alojamientos_bp.route('/<int:alojamiento_id>/comodidades', methods=['PATCH'])
@requiere_token
def asignar_comodidades(usuario_id, alojamiento_id):
    """Asignar comodidades a un alojamiento (propietario o admin)."""
    datos = request.get_json(silent=True) or {}

    dto = AsignarComodidadesDTO()
    try:
        datos_validados = dto.load(datos)
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'message': 'Datos de entrada invalidos.', 'details': err.messages}
        }), 400

    alojamiento = alojamiento_servicio.asignar_comodidades(
        alojamiento_id, usuario_id, datos_validados['comodidades_ids']
    )

    return jsonify({
        'success': True,
        'message': 'Comodidades asignadas.',
        'data': alojamiento.to_dict(),
    }), 200
```

**¿Qué hace?**
1. Valida el DTO (`AsignarComodidadesDTO`).
2. Llama al servicio `asignar_comodidades`.
3. Devuelve el alojamiento actualizado con sus comodidades (el `to_dict()` ya las incluye).

---

### Paso 11 — Actualizar `app/__init__.py`

Abre `app/__init__.py`.

#### 11a. Registrar `comodidades_bp`

Busca donde se registran los blueprints (después de `alojamientos_bp`) y añade:

```python
    # Registrar blueprint de comodidades
    from app.dominios.comodidades.controladores import comodidades_bp
    from app.dominios.comodidades.servicios import ComodidadServicio
    from app.dominios.comodidades import controladores as comodidades_ctrl

    comodidades_ctrl.comodidad_servicio = ComodidadServicio()

    app.register_blueprint(comodidades_bp, url_prefix=f'/api/{API_VERSION}/comodidades')
```

#### 11b. Actualizar error handlers de dominio

Busca en `app/__init__.py` el bloque que ya registra los manejadores de errores de dominio de alojamientos. **Reemplázalo completamente** por este bloque consolidado que incluye tanto los handlers existentes como los nuevos de comodidades:

```python
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
```

**Importante:** No añadas un bloque separado. Reemplaza el bloque existente para que quede un solo grupo coherente con los cuatro handlers. El handler de `AlojamientoNoEncontradoError` ya existía desde el Sprint 4; ahora solo se amplía el bloque con los tres nuevos handlers de comodidades.

**¿Qué hace?** Captura las excepciones de dominio y las traduce a respuestas HTTP:
- `ComodidadNoEncontradaError` → 404
- `ComodidadYaExisteError` → 400
- `ComodidadesInvalidasError` → 400

---

### Paso 12 — Generar y aplicar la migración

Con el entorno virtual activado, configura `FLASK_APP`:

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
python -m flask db migrate -m "crear tabla comodidades y relacion con alojamientos"
```

**Resultado esperado:**

```
INFO  [alembic.autogenerate.compare.tables] Detected added table 'comodidades'
INFO  [alembic.autogenerate.compare.tables] Detected added table 'alojamiento_comodidad'
Generating .../migrations/versions/<hash>_crear_tabla_comodidades_y_relacion_con_.py ...  done
```

Esta migración debe crear **solo** las tablas `comodidades` y `alojamiento_comodidad`. No debe tocar tablas de sprints anteriores.

**Importante:** Si Alembic detecta también tablas que ya existen (como `usuarios`, `perfiles`, `alojamientos`), debes editar el archivo generado y eliminar las líneas de `op.create_table` para esas tablas. La migración debe contener **únicamente** lo nuevo de este sprint.

Aplica la migración:

```bash
python -m flask db upgrade
```

**Resultado esperado:**

```
INFO  [alembic.runtime.migration] Running upgrade <hash_anterior> -> <hash_nuevo>, crear tabla comodidades y relacion con alojamientos
```

---

### Paso 13 — Crear `tests/test_comodidades.py`

Crea `tests/test_comodidades.py`:

```python
import json


class TestComodidades:
    """Pruebas de integracion para el dominio de comodidades y relacion N:M."""

    def test_crear_comodidad_con_admin(self, client, admin_auth):
        """Crear comodidad con admin debe responder 201."""
        resp = client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Wifi',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos['success'] is True
        assert datos['data']['nombre'] == 'Wifi'

    def test_crear_comodidad_con_usuario_normal(self, client, usuario_auth):
        """Crear comodidad con usuario normal debe responder 403."""
        resp = client.post('/api/v1/comodidades', headers=usuario_auth, json={
            'nombre': 'Piscina',
        })
        assert resp.status_code == 403

    def test_crear_comodidad_nombre_duplicado(self, client, admin_auth):
        """Crear comodidad con nombre duplicado debe responder 400."""
        # Primero crear
        client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Estacionamiento',
        })
        # Intentar duplicar
        resp = client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Estacionamiento',
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos['success'] is False

    def test_listar_comodidades_sin_auth(self, client):
        """Listar comodidades sin auth debe responder 200."""
        resp = client.get('/api/v1/comodidades')
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert isinstance(datos['data'], list)

    def test_asignar_comodidades_a_alojamiento_propio(self, client, usuario_auth, admin_auth):
        """Asignar comodidades a alojamiento propio debe responder 200."""
        # Crear comodidad como admin
        r1 = client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Cocina',
        })
        d1 = json.loads(r1.data)
        comodidad_id = d1['data']['id']

        # Crear alojamiento con usuario normal
        r2 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Mi Casa',
            'descripcion': 'Bonita casa',
            'precio_noche': 50.0,
            'ciudad': 'Medellin',
        })
        d2 = json.loads(r2.data)
        alojamiento_id = d2['data']['id']

        # Asignar comodidad como propietario
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}/comodidades', headers=usuario_auth, json={
            'comodidades_ids': [comodidad_id],
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert len(datos['data']['comodidades']) == 1

    def test_asignar_comodidades_a_alojamiento_ajeno(self, client, usuario_auth, usuario_auth2, admin_auth):
        """Asignar comodidades a alojamiento ajeno con usuario normal debe responder 403."""
        # Crear comodidad como admin
        r1 = client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Piscina S5',
        })
        d1 = json.loads(r1.data)
        comodidad_id = d1['data']['id']

        # Usuario 1 crea alojamiento
        r2 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Casa Ajena',
            'descripcion': 'No es tuya',
            'precio_noche': 80.0,
            'ciudad': 'Bogota',
        })
        d2 = json.loads(r2.data)
        alojamiento_id = d2['data']['id']

        # Usuario 2 intenta asignar
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}/comodidades', headers=usuario_auth2, json={
            'comodidades_ids': [comodidad_id],
        })
        assert resp.status_code == 403

    def test_asignar_comodidades_con_id_inexistente(self, client, usuario_auth):
        """Asignar comodidades con ID inexistente debe responder 400."""
        # Crear alojamiento propio
        r1 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Casa Prueba',
            'descripcion': 'Para test',
            'precio_noche': 30.0,
            'ciudad': 'Lima',
        })
        d1 = json.loads(r1.data)
        alojamiento_id = d1['data']['id']

        # Intentar asignar comodidad inexistente
        resp = client.patch(f'/api/v1/alojamientos/{alojamiento_id}/comodidades', headers=usuario_auth, json={
            'comodidades_ids': [99999],
        })
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos['success'] is False

    def test_detalle_alojamiento_incluye_comodidades(self, client, usuario_auth, admin_auth):
        """Detalle de alojamiento debe incluir comodidades asignadas."""
        # Crear comodidad como admin
        r1 = client.post('/api/v1/comodidades', headers=admin_auth, json={
            'nombre': 'Aire Acondicionado',
        })
        d1 = json.loads(r1.data)
        comodidad_id = d1['data']['id']

        # Crear alojamiento
        r2 = client.post('/api/v1/alojamientos', headers=usuario_auth, json={
            'titulo': 'Suite Premium',
            'descripcion': 'Con aire',
            'precio_noche': 120.0,
            'ciudad': 'Quito',
        })
        d2 = json.loads(r2.data)
        alojamiento_id = d2['data']['id']

        # Asignar comodidad
        client.patch(f'/api/v1/alojamientos/{alojamiento_id}/comodidades', headers=usuario_auth, json={
            'comodidades_ids': [comodidad_id],
        })

        # Verificar que el detalle incluye comodidades
        resp = client.get(f'/api/v1/alojamientos/{alojamiento_id}')
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert 'comodidades' in datos['data']
        assert isinstance(datos['data']['comodidades'], list)
        assert len(datos['data']['comodidades']) == 1
        assert datos['data']['comodidades'][0]['nombre'] == 'Aire Acondicionado'
```

**Resumen de las 8 pruebas:**

| # | Test | Qué valida |
|---|---|---|
| 1 | crear con admin → 201 | Admin crea comodidad |
| 2 | crear con usuario normal → 403 | Usuario normal no puede crear |
| 3 | nombre duplicado → 400 | No permite duplicados |
| 4 | listar sin auth → 200 | Listado es público |
| 5 | asignar a alojamiento propio → 200 | Propietario asigna comodidades |
| 6 | asignar a alojamiento ajeno → 403 | Usuario normal no asigna a ajeno |
| 7 | asignar con ID inexistente → 400 | Valida IDs existentes |
| 8 | detalle incluye comodidades → 200 | `to_dict()` incluye comodidades |

**¿Por qué algunos tests usan `admin_auth`?** Porque crear comodidades requiere rol de admin. El fixture `admin_auth` (creado en Sprint 3) promueve un usuario a admin y devuelve sus headers.

---

### Paso 14 — Ejecutar la suite completa de pruebas

```bash
pytest tests/ -v
```

**Resultado esperado:**

```
tests/test_alojamientos.py::TestAlojamientos::test_crear_alojamiento_con_auth PASSED
tests/test_alojamientos.py::TestAlojamientos::test_crear_alojamiento_sin_token PASSED
... (11 tests de alojamientos)
tests/test_comodidades.py::TestComodidades::test_crear_comodidad_con_admin PASSED
tests/test_comodidades.py::TestComodidades::test_crear_comodidad_con_usuario_normal PASSED
... (8 tests de comodidades)
tests/test_usuarios.py::TestRegistroUsuario::test_registro_exitoso PASSED
... (14 tests de usuarios)

========================= 33 passed in X.XXs ==========================
```

---

## 7. Cómo probar los endpoints manualmente

### Validación manual de comodidades

Levanta el servidor:

```bash
python app.py
```

En otra terminal, necesitas un usuario admin. Si no tienes uno, créalo:

```bash
# 1. Registrar un usuario
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"admin@demo.com\",\"contrasena\":\"123456\"}"
```

```bash
# 2. Promover a admin
python scripts/promover_admin.py admin@demo.com
```

```bash
# 3. Hacer login y guardar el token de admin
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"admin@demo.com\",\"contrasena\":\"123456\"}"
```

Copia el `access_token` de la respuesta.

```bash
# 4. Crear comodidad (admin)
curl -s -X POST http://127.0.0.1:5000/api/v1/comodidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d "{\"nombre\":\"Wifi\"}"
```

**Resultado esperado:** `201` con datos de la comodidad.

```bash
# 5. Listar comodidades (público, sin token)
curl -s http://127.0.0.1:5000/api/v1/comodidades
```

**Resultado esperado:** `200` con lista de comodidades.

```bash
# 6. Ver detalle de una comodidad (público)
curl -s http://127.0.0.1:5000/api/v1/comodidades/1
```

**Resultado esperado:** `200` con detalle.

### Probar la asignación de comodidades

```bash
# 7. Registrar un usuario normal y hacer login (para obtener su token)
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"host@demo.com\",\"contrasena\":\"123456\"}"

curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"host@demo.com\",\"contrasena\":\"123456\"}"
```

Copia el token del usuario normal.

```bash
# 8. Crear un alojamiento con el usuario normal
curl -s -X POST http://127.0.0.1:5000/api/v1/alojamientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_USUARIO>" \
  -d "{\"titulo\":\"Casa de Playa\",\"descripcion\":\"Vista al mar\",\"precio_noche\":100.0,\"ciudad\":\"Cartagena\"}"
```

Copia el `id` del alojamiento creado.

```bash
# 9. Asignar comodidades al alojamiento (propietario)
curl -s -X PATCH http://127.0.0.1:5000/api/v1/alojamientos/<ID_ALOJAMIENTO>/comodidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_USUARIO>" \
  -d "{\"comodidades_ids\":[1]}"
```

**Resultado esperado:** `200` con el alojamiento actualizado y su lista de comodidades.

```bash
# 10. Ver detalle del alojamiento (incluye comodidades)
curl -s http://127.0.0.1:5000/api/v1/alojamientos/<ID_ALOJAMIENTO>
```

**Resultado esperado:** `200` con campo `comodidades` incluido.

```bash
# 11. Vaciar comodidades del alojamiento
curl -s -X PATCH http://127.0.0.1:5000/api/v1/alojamientos/<ID_ALOJAMIENTO>/comodidades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_USUARIO>" \
  -d "{\"comodidades_ids\":[]}"
```

**Resultado esperado:** `200` con `"comodidades": []`.

### Tabla de validación rápida

| Qué probar | Comando | Resultado |
|---|---|---|
| Crear comodidad sin token | `curl -s -X POST http://127.0.0.1:5000/api/v1/comodidades -H "Content-Type: application/json" -d "{\"nombre\":\"X\"}"` | 401 |
| Crear comodidad con usuario normal | Con token de usuario normal | 403 |
| Detalle de comodidad inexistente | `curl -s http://127.0.0.1:5000/api/v1/comodidades/99999` | 404 |
| Asignar comodidades a alojamiento ajeno | Con token de otro usuario | 403 |
| Asignar con IDs inexistentes | `{"comodidades_ids":[99999]}` | 400 |

---

## 8. Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `ImportError: cannot import name 'alojamiento_comodidad'` | Import circular entre modelos | Importar `alojamiento_comodidad` desde `comodidades.modelos` dentro de `alojamientos/modelos.py`, no al revés. |
| `flask db migrate` detecta tablas de sprints anteriores | Alembic compara el estado actual de la BD | Edita la migración generada y elimina las líneas `op.create_table` para tablas que ya existen. |
| `OperationalError: Foreign key constraint is incorrectly formed` | Las tablas referenciadas no existen al crear la tabla intermedia | Asegúrate de que `alojamientos` y `comodidades` se crean **antes** que `alojamiento_comodidad` en la migración. |
| `POST /comodidades` devuelve 401 | No se envió token | El endpoint requiere autenticación (admin). Incluye `Authorization: Bearer <token>`. |
| `POST /comodidades` devuelve 403 con token válido | El usuario no es admin | Promueve al usuario con `python scripts/promover_admin.py correo@ejemplo.com`. |
| `PATCH /alojamientos/<id>/comodidades` devuelve 400 | `comodidades_ids` contiene IDs inexistentes | Verifica que los IDs existen con `GET /api/v1/comodidades`. |
| El detalle del alojamiento no incluye comodidades | `to_dict()` no fue actualizado o no se usa eager loading | Verifica que `obtener_detalle` usa `obtener_por_id_con_comodidades` y que `to_dict()` incluye `'comodidades'`. |
| Tests de comodidades fallan por fixtures | No se usan `admin_auth`, `usuario_auth` correctamente | Verifica que los fixtures están en `tests/conftest.py` desde Sprints 2-3. |

---

## 9. Cierre con Git y GitHub

### Hacer el commit del Sprint 5

Verifica qué archivos se van a commitear:

```bash
git status
```

Agrega todo y commitea:

```bash
git add .
git commit -m "feat: comodidades con relacion N:M y asignacion a alojamientos

- Modelos: Comodidad + tabla intermedia alojamiento_comodidad + relacion N:M
- DTOs: CrearComodidadDTO, AsignarComodidadesDTO
- Repositorio: ComodidadRepositorio con obtener_por_ids
- Repositorio alojamientos: obtener_por_id_con_comodidades
- Servicios: ComodidadServicio + ComodidadesInvalidasError + asignar_comodidades
- Controladores: comodidades_bp + PATCH /alojamientos/<id>/comodidades
- Error handlers: ComodidadNoEncontradaError, ComodidadYaExisteError, ComodidadesInvalidasError
- Migracion: tabla comodidades + tabla intermedia
- Tests: 8 tests de comodidades y relacion N:M
- 33 tests en total pasando (25 anteriores + 8 nuevos)"
```

### Hacer push a GitHub

```bash
git push
```

**Validación:** Visita tu repositorio en GitHub y verifica que los nuevos archivos aparecen listados.

---

## 10. Resultado final del Sprint 5

Si seguiste todos los pasos, ahora tienes:

- ✅ Modelo `Comodidad` con tabla intermedia `alojamiento_comodidad`.
- ✅ Relación N:M bidireccional entre `Alojamiento` y `Comodidad`.
- ✅ 3 endpoints nuevos para comodidades: crear (admin), listar (público), detalle (público).
- ✅ Endpoint `PATCH /alojamientos/<id>/comodidades` para asignar comodidades (propietario o admin).
- ✅ El detalle de alojamiento (`GET /api/v1/alojamientos/<id>`) incluye las comodidades asignadas.
- ✅ Validación de IDs inexistentes al asignar comodidades (responde 400).
- ✅ Posibilidad de dejar un alojamiento sin comodidades enviando `{"comodidades_ids": []}`.
- ✅ 8 tests de integración para comodidades.
- ✅ 33 tests en total pasando (25 de Sprints 2-4 + 8 de Sprint 5).
- ✅ Código versionado en Git y subido a GitHub.

**Próximo paso:** En el Sprint 6 construirás la carga de imágenes para los alojamientos.
