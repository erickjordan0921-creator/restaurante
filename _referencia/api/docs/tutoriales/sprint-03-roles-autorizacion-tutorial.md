# Tutorial — Sprint 3: Roles y autorización

---

## 1. Título del tutorial

**Sprint 3 — Roles y autorización**

---

## 2. Objetivo

Implementar autorización basada en roles sobre la capa de autenticación ya construida en Sprint 2. Hacer que el campo `rol` del modelo `Usuario` se use realmente para controlar el acceso a rutas protegidas. Crear un decorador `requiere_admin`, un endpoint administrativo, un script para promover usuarios a admin, y pruebas de autorización.

Al final de este tutorial tendrás:
- `requiere_admin` protegiendo rutas de administrador.
- `GET /api/v1/admin/usuarios` respondiendo 200 solo para admins, 403 para usuarios normales, 401 sin token.
- 14 tests pasando (11 de Sprint 2 + 3 nuevos de autorización).

---

## 3. Qué vas a construir

- Refactorizar `app/seguridad.py`: extraer `_extraer_y_validar_token()` como función compartida, reescribir `requiere_token` para usarla, y añadir `requiere_admin`.
- Añadir `PermisoDenegadoError`, `listar_todos_los_usuarios()` y `promover_a_admin()` a `UsuarioServicio` en `servicios.py`.
- Añadir el blueprint `admin_bp` con `GET /usuarios` en `controladores.py`.
- Registrar `admin_bp` y el error handler de `PermisoDenegadoError` en el app factory.
- Crear `scripts/promover_admin.py`.
- Añadir el fixture `admin_auth` a `tests/conftest.py`.
- Añadir 3 tests de autorización a `tests/test_usuarios.py`.
- Commit y push.

---

## 4. Prerrequisitos

Antes de empezar, debes tener:

| Requisito | Cómo verificar |
|---|---|
| Sprint 2 completado y funcionando | Los 11 tests pasan con `pytest tests/ -v` |
| Entorno virtual activo | `(venv)` en el prompt |
| MySQL corriendo con `alojamientos_db` y migraciones aplicadas | `GET /health` responde 200 |
| Repositorio Git con commit del Sprint 2 | `git log --oneline` muestra el commit |

Si no tienes todo esto, completa primero el Sprint 2.

---

## 5. Estructura final esperada

Los archivos nuevos y modificados serán:

```
alojamientos/
├── app/
│   ├── __init__.py               (actualizado: admin_bp + error handler)
│   ├── seguridad.py              (actualizado: + requiere_admin + helper)
│   └── dominios/
│       └── usuarios/
│           ├── controladores.py  (actualizado: + admin_bp)
│           └── servicios.py      (actualizado: + PermisoDenegadoError + 2 metodos)
├── scripts/
│   └── promover_admin.py         [NUEVO]
└── tests/
    ├── conftest.py               (actualizado: + admin_auth)
    └── test_usuarios.py          (actualizado: + 3 tests de autorizacion)
```

---

## 6. Paso a paso completo

### Paso 1 — Refactorizar `app/seguridad.py`

Abre `app/seguridad.py` y **reemplaza todo** su contenido con:

```python
from functools import wraps

import jwt
from flask import request, jsonify, current_app


def _extraer_y_validar_token():
    """Extrae el header Authorization, valida el JWT y devuelve el usuario_id."""
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return None, (jsonify({
            'success': False,
            'error': {'message': 'Token no proporcionado.'}
        }), 401)

    partes = auth_header.split()
    if len(partes) != 2 or partes[0].lower() != 'bearer':
        return None, (jsonify({
            'success': False,
            'error': {'message': 'Formato de token invalido. Use: Bearer <token>'}
        }), 401)

    token = partes[1]

    try:
        payload = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256'],
        )
        return int(payload['sub']), None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({
            'success': False,
            'error': {'message': 'Token expirado.'}
        }), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({
            'success': False,
            'error': {'message': 'Token invalido.'}
        }), 401)


def requiere_token(f):
    """Decorador que exige un token JWT valido en el header Authorization.

    Inyecta `usuario_id` como argumento en la funcion decorada.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_id, error = _extraer_y_validar_token()
        if error:
            return error
        return f(*args, usuario_id=usuario_id, **kwargs)
    return wrapper


def requiere_admin(f):
    """Decorador que exige token valido Y rol admin.

    Primero autentica al usuario (reutiliza la validacion de token).
    Luego consulta su rol real en la base de datos.
    Si no es admin, lanza PermisoDenegadoError (manejado por el error handler global).
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_id, error = _extraer_y_validar_token()
        if error:
            return error

        # Consultar rol real en la base de datos
        from app.dominios.usuarios.repositorios import UsuarioRepositorio
        from app.dominios.usuarios.servicios import PermisoDenegadoError

        usuario = UsuarioRepositorio.obtener_por_id(usuario_id)
        if not usuario or usuario.rol != 'admin':
            raise PermisoDenegadoError(
                'Permiso denegado. Se requiere rol de administrador.'
            )

        return f(*args, usuario_id=usuario_id, **kwargs)
    return wrapper
```

**¿Qué cambió?**

| Cambio | Por qué |
|---|---|
| `_extraer_y_validar_token()` | Función compartida que extrae, valida y decodifica el JWT. Evita duplicar código entre `requiere_token` y `requiere_admin`. |
| `requiere_token` reescrito | Ahora usa `_extraer_y_validar_token()`. Comportamiento idéntico al Sprint 2. |
| `requiere_admin` (nuevo) | Autentica primero, luego consulta el rol real en la BD. Si no es admin, **lanza** `PermisoDenegadoError`. El error handler global en `app/__init__.py` se encarga de responder 403. |

**Estrategia coherente:** `requiere_admin` **no** devuelve `jsonify(...), 403` directamente. Lanza la excepción de dominio y el error handler centralizado construye la respuesta.

---

### Paso 2.1 — Actualizar `app/dominios/usuarios/repositorios.py`

Abre `app/dominios/usuarios/repositorios.py`.

#### 2.1. Añadir `listar_todos y actualizar_usuario`

Después de `guardar_perfil` y añade:

```python
    @staticmethod
    def listar_todos():
        return db.session.query(Usuario).all()
    
    @staticmethod
    def actualizar_usuario():
        db.session.commit()
```

### Paso 2.2 — Actualizar `app/dominios/usuarios/servicios.py`

Abre `app/dominios/usuarios/servicios.py`.

#### 2.2a. Añadir `PermisoDenegadoError`

Busca la sección de excepciones de dominio (después de `UsuarioNoEncontradoError`) y añade la nueva excepción:

```python
class PermisoDenegadoError(Exception):
    pass
```
#### 2.2b. Actualizar `obtener_perfil`

Busca el metodo obtener_perfil y cambia None por UsuarioNoEncontradoError('Perfil no encontrado.'):

```python
    def obtener_perfil(self, usuario_id):
        """Obtiene el perfil de un usuario."""
        perfil = UsuarioRepositorio.obtener_perfil_por_usuario_id(usuario_id)
        if not perfil:
            return UsuarioNoEncontradoError('Perfil no encontrado.')
        return perfil.to_dict()
```

#### 2.2c. Añadir `listar_todos_los_usuarios()`

Ve al final de la clase `UsuarioServicio` (después de `actualizar_perfil`) y añade:

```python
    def listar_todos_los_usuarios(self):
        """Devuelve lista de todos los usuarios sin datos sensibles."""
        usuarios = UsuarioRepositorio.listar_todos()
        return [u.to_dict() for u in usuarios]
```

**¿Qué hace?** Consulta todos los usuarios y devuelve una lista de diccionarios usando `to_dict()`, que **no incluye la contraseña**.

#### 2.2d. Añadir `promover_a_admin()`

Justo debajo del método anterior, añade:

```python
    def promover_a_admin(self, correo):
        """Promueve al usuario con el correo dado a rol admin."""
        usuario = UsuarioRepositorio.obtener_por_correo(correo)
        if not usuario:
            raise UsuarioNoEncontradoError(f'No se encontro ningun usuario con correo {correo}.')
        usuario.rol = 'admin'
        UsuarioRepositorio.actualizar_usuario()
        return usuario
```

**¿Qué hace?** Busca el usuario por correo, verifica que existe, cambia su `rol` a `'admin'`, guarda y retorna el usuario. Este método será usado tanto por el script CLI como por los tests.

---

### Paso 3 — Actualizar `app/dominios/usuarios/controladores.py`

Abre `app/dominios/usuarios/controladores.py`.

#### 3a. crear `admin_bp`

Agrega la parte superior del archivo. Debe quedar así:

```python
from app.seguridad import requiere_token, requiere_admin

admin_bp = Blueprint('admin', __name__)

# Variable global que el app factory asignara al crear la app
usuario_servicio = None
```

**Notas importantes:**
- No se importan excepciones de dominio (`CorreoYaRegistradoError`, etc.) porque ya tienen handler global en `app/__init__.py`.
- Se eliminó `_get_servicio()` (era un helper placeholder que no se usaba en el flujo real).
- Se eliminó el import de `UsuarioServicio` (ya no se necesita aquí; el factory lo inyecta).
- Se añadió `requiere_admin` a los imports de `seguridad`.
- Se añadió `admin_bp`.

#### 3b. Simplificar `obtener_perfil()`

Como las excepciones de dominio ahora se manejan con handlers globales, debes eliminar los bloques `try/except` que las capturaban manualmente.

**`obtener_perfil()`** — elimina el `try/except Perfil no encontrado`:

```python
@requiere_token
def obtener_perfil(usuario_id):
    """Obtener el perfil del usuario autenticado."""
    perfil = usuario_servicio.obtener_perfil(usuario_id)

    return jsonify({
        'success': True,
        'message': 'Perfil obtenido.',
        'data': perfil,
    }), 200
```

**Regla del proyecto:** `try/except ValidationError` (Marshmallow) se queda en el controlador porque valida la entrada.

#### 3c. Añadir el endpoint de administración

Al final del archivo, después del último endpoint (`actualizar_perfil`), añade:

```python
# ============================================================
# Blueprint de administracion
# ============================================================

@admin_bp.route('/usuarios', methods=['GET'])
@requiere_admin
def listar_usuarios(usuario_id):
    """Listar todos los usuarios del sistema (solo admin)."""
    lista = usuario_servicio.listar_todos_los_usuarios()
    return jsonify({
        'success': True,
        'message': 'Lista de usuarios.',
        'data': lista,
    }), 200
```

**¿Qué hace?**
- `@requiere_admin` autentica y verifica el rol.
- Si no hay token → 401 (manejado por `_extraer_y_validar_token`).
- Si el usuario no es admin → `PermisoDenegadoError` → 403 (manejado por el error handler global).
- Si es admin → llama al servicio → devuelve la lista de usuarios sin contraseñas.

---

### Paso 4 — Actualizar `app/__init__.py`

Abre `app/__init__.py`.

#### 4a. Registrar `admin_bp`

Busca donde se registran los blueprints y añade `admin_bp`:

```python
    # Registrar blueprint de usuarios
    from app.dominios.usuarios.controladores import usuarios_bp, admin_bp

    app.register_blueprint(admin_bp, url_prefix=f'/api/{API_VERSION}/admin')
```

#### 4b. Registrar error handler para `PermisoDenegadoError`

Busca la sección de manejadores de errores de dominio y añade `PermisoDenegadoError`:

```python
    # Manejadores de errores de dominio de usuarios
    from app.dominios.usuarios.servicios import (
        CorreoYaRegistradoError,
        CredencialesInvalidasError,
        UsuarioNoEncontradoError,
        PermisoDenegadoError,
    )

    @app.errorhandler(PermisoDenegadoError)
    def permiso_denegado(error):
        return {"success": False, "error": {"message": str(error)}}, 403
```

**¿Qué hace?** Cuando `requiere_admin` lanza `PermisoDenegadoError`, este handler captura la excepción y devuelve una respuesta JSON con status 403.

---

### Paso 5 — Crear `scripts/promover_admin.py`

Crea el archivo `scripts/promover_admin.py`:

```python
"""
Script para promover un usuario existente a rol admin.
Ejecutar: python scripts/promover_admin.py correo@ejemplo.com

Usa UsuarioServicio.promover_a_admin() de forma coherente con la arquitectura.
"""
import sys
import os

# Agregar la raiz del proyecto al path para poder importar app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.dominios.usuarios.servicios import UsuarioServicio, UsuarioNoEncontradoError


def promover_admin(correo, secret_key, jwt_exp_minutes):
    """Promueve a admin al usuario con el correo indicado, via servicio."""
    servicio = UsuarioServicio(
        secret_key=secret_key,
        jwt_exp_minutes=jwt_exp_minutes,
    )
    servicio.promover_a_admin(correo)
    print(f"Exito: el usuario '{correo}' ahora tiene rol de administrador.")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Uso: python scripts/promover_admin.py <correo>")
        sys.exit(1)

    app = create_app()

    with app.app_context():
        try:
            promover_admin(
                correo=sys.argv[1],
                secret_key=app.config['SECRET_KEY'],
                jwt_exp_minutes=app.config.get('JWT_EXP_MINUTES', 15),
            )
        except UsuarioNoEncontradoError as e:
            print(f"Error: {e}")
            sys.exit(1)
```

**¿Qué hace?**
- Crea la app y obtiene la configuración (`SECRET_KEY`, `JWT_EXP_MINUTES`).
- Instancia `UsuarioServicio` con esa configuración.
- Llama `servicio.promover_a_admin(correo)`, que es la **misma ruta** que usan los tests en `admin_auth`.
- Si el usuario no existe, `promover_a_admin` lanza `UsuarioNoEncontradoError`; el script lo captura y muestra un mensaje claro con salida de error (código 1).

**Uso:**

```bash
python scripts/promover_admin.py tu-correo@ejemplo.com
```

**Resultado esperado:**

```
Exito: el usuario 'tu-correo@ejemplo.com' ahora tiene rol de administrador.
```

Si el usuario no existe:

```
Error: No se encontro ningun usuario con correo tu-correo@ejemplo.com.
```

Si ya es admin:

```
Exito: el usuario 'tu-correo@ejemplo.com' ahora tiene rol de administrador.
```

---

### Paso 6 — Actualizar `tests/conftest.py`

Abre `tests/conftest.py` (creado en el Sprint 2).

> **Recordatorio:** En el Sprint 2 configuramos `tests/conftest.py` para que las variables de entorno de testing se definieran **antes** de importar `crear_app`. No modifiques esa parte. En este sprint solo vamos a **agregar** `admin_auth`.


#### 6. Añadir `admin_auth`

Al final del archivo, añade este nuevo fixture:

```python
@pytest.fixture
def admin_auth(client):
    """Crea un usuario, lo promueve a admin y devuelve headers con token valido.

    Promueve via servicio directo (UsuarioServicio.promover_a_admin),
    coherente con la arquitectura del proyecto.
    """
    import uuid
    from app.dominios.usuarios.servicios import UsuarioServicio

    email = f'admin-{uuid.uuid4().hex[:8]}@ejemplo.com'

    # Registrar usuario normal
    client.post('/api/v1/usuarios/registro', json={
        'correo': email,
        'contrasena': '123456',
    })

    # Promover a admin via servicio (no via modelo directo)
    servicio = UsuarioServicio(
        secret_key=client.application.config['SECRET_KEY'],
        jwt_exp_minutes=client.application.config.get('JWT_EXP_MINUTES', 15),
    )
    servicio.promover_a_admin(email)

    # Login con usuario admin
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

**¿Por qué usa `UsuarioServicio.promover_a_admin()`?** Porque es coherente con la arquitectura del proyecto: el servicio es la capa de negocio, no el modelo ni la BD directamente.

---

### Paso 7 — Actualizar `tests/test_usuarios.py`

Abre `tests/test_usuarios.py`.

#### 7. Añadir tests de autorización

Al final del archivo, después de la última clase, añade:

```python
class TestAutorizacionAdmin:
    """Pruebas de autorizacion para endpoints de administrador."""

    def test_admin_sin_token(self, client):
        """GET /admin/usuarios sin token debe responder 401."""
        resp = client.get('/api/v1/admin/usuarios')
        assert resp.status_code == 401

    def test_admin_con_usuario_normal(self, client, usuario_auth):
        """GET /admin/usuarios con usuario normal debe responder 403."""
        resp = client.get('/api/v1/admin/usuarios', headers=usuario_auth)
        assert resp.status_code == 403

    def test_admin_con_admin(self, client, admin_auth):
        """GET /admin/usuarios con admin debe responder 200 con lista."""
        resp = client.get('/api/v1/admin/usuarios', headers=admin_auth)
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos['success'] is True
        assert isinstance(datos['data'], list)
        # Verificar que no se exponen contrasenas
        for usuario in datos['data']:
            assert 'contrasena' not in usuario
```

**¿Qué prueban?**

| Test | Qué envía | Qué espera |
|---|---|---|
| `test_admin_sin_token` | Sin header `Authorization` | 401 (no autenticado) |
| `test_admin_con_usuario_normal` | Token de usuario con `rol='usuario'` | 403 (permiso denegado) |
| `test_admin_con_admin` | Token de usuario con `rol='admin'` | 200 con lista de usuarios, sin contraseñas |

---

### Paso 8 — Ejecutar la suite completa de pruebas

```bash
pytest tests/ -v
```

**Resultado esperado:**

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
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_sin_token PASSED
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_con_usuario_normal PASSED
tests/test_usuarios.py::TestAutorizacionAdmin::test_admin_con_admin PASSED

========================= 14 passed in X.XXs ==========================
```

Si alguna falla, revisa el traceback para identificar el problema.

---

## 7. Cómo probar que funciona

### Validación manual del endpoint admin

Levanta el servidor:

```bash
python app.py
```

En otra terminal, primero necesitas un usuario admin. Si no tienes uno, créalo:

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

**Resultado esperado:** `Exito: el usuario 'admin@demo.com' ahora tiene rol de administrador.`

```bash
# 3. Hacer login y guardar el token
curl -s -X POST http://127.0.0.1:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"admin@demo.com\",\"contrasena\":\"123456\"}"
```

Copia el `access_token` de la respuesta.

```bash
# 4. Acceder como admin
curl -s http://127.0.0.1:5000/api/v1/admin/usuarios \
  -H "Authorization: Bearer <TU_TOKEN>"
```

**Resultado esperado (200):**

```json
{
  "success": true,
  "message": "Lista de usuarios.",
  "data": [
    {
      "id": 1,
      "correo": "admin@demo.com",
      "fecha_creacion": "2026-04-11T...",
      "rol": "admin"
    }
  ]
}
```

### Probar los tres escenarios

| Escenario | Comando | Resultado |
|---|---|---|
| Sin token | `curl -s http://127.0.0.1:5000/api/v1/admin/usuarios` | 401 |
| Usuario normal | `curl -s http://127.0.0.1:5000/api/v1/admin/usuarios -H "Authorization: Bearer <TOKEN_USUARIO>"` | 403 |
| Admin | `curl -s http://127.0.0.1:5000/api/v1/admin/usuarios -H "Authorization: Bearer <TOKEN_ADMIN>"` | 200 |

---

## 8. Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `NameError: name 'PermisoDenegadoError' is not defined` | No se importó en `app/__init__.py` | Verifica que está en el import de excepciones de dominio |
| `requiere_admin` devuelve 500 en vez de 403 | El error handler de `PermisoDenegadoError` no está registrado | Verifica `@app.errorhandler(PermisoDenegadoError)` en `crear_app()` |
| `GET /admin/usuarios` responde 404 | `admin_bp` no registrado en el factory | Verifica `app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')` |
| `admin_auth` falla en tests | El fixture no promueve correctamente | Verifica que usa `UsuarioServicio.promover_a_admin()` con la config de la app |
| `ModuleNotFoundError: No module named 'app'` al ejecutar el script | El path no está configurado | Verifica `sys.path.insert(0, ...)` al inicio de `promover_admin.py` |
| Usuario no encontrado al promover | El correo no existe en la BD | Verifica que el usuario fue registrado antes de promoverlo |

---

## 9. Cierre con Git y GitHub

### Hacer el commit del Sprint 3

Verifica qué archivos se van a commitear:

```bash
git status
```

Agrega todo y commitea:

```bash
git add .
git commit -m "feat: roles y autorizacion con decorador requiere_admin

- Decorador requiere_admin en app/seguridad.py
- PermisoDenegadoError en servicios.py
- Metodo listar_todos_los_usuarios() en UsuarioServicio
- Metodo promover_a_admin() en UsuarioServicio
- Blueprint admin_bp con GET /api/v1/admin/usuarios
- Error handler para PermisoDenegadoError -> 403
- Script scripts/promover_admin.py para promover usuarios a admin
- Fixture admin_auth en tests/conftest.py
- 3 nuevos tests de autorizacion (sin token 401, usuario 403, admin 200)
- 14 tests en total pasando"
```

### Hacer push a GitHub

```bash
git push
```

**Validación:** Visita tu repositorio en GitHub y verifica que los nuevos archivos aparecen listados.

---

## 10. Resultado final del Sprint 3

Si seguiste todos los pasos, ahora tienes:

- ✅ `requiere_admin` que autentica y verifica rol antes de permitir acceso.
- ✅ `PermisoDenegadoError` integrada coherente: el decorador lanza la excepción, el error handler responde 403.
- ✅ `GET /api/v1/admin/usuarios` protegido que devuelve la lista de usuarios sin contraseñas.
- ✅ `scripts/promover_admin.py` para asignar rol admin desde la terminal.
- ✅ `UsuarioServicio.promover_a_admin()` como método de negocio para promover usuarios.
- ✅ Fixture `admin_auth` que usa el servicio (no atajos de modelo/BD).
- ✅ 3 tests de autorización (401, 403, 200).
- ✅ 14 tests en total pasando (11 Sprint 2 + 3 Sprint 3).
- ✅ Código versionado en Git y subido a GitHub.

**Próximo paso:** En el Sprint 4 construirás el dominio de alojamientos con su CRUD completo.
