# Tutorial — Sprint 1: Setup, Git/GitHub y base técnica

---

## 1. Objetivo

Construir desde cero la estructura base del proyecto **alojamientos**, configurar el entorno de desarrollo con Flask, conectar a MySQL mediante Flask-SQLAlchemy, inicializar el sistema de migraciones con Flask-Migrate, crear un endpoint de salud (`GET /health`), configurar variables de entorno seguras, y establecer el repositorio en Git/GitHub con un primer commit funcional.

Al final de este tutorial tendrás una API mínima pero funcional que responde en `http://127.0.0.1:5000/health`.

---

## 2. Qué vas a construir

- La carpeta del proyecto `alojamientos/` con toda su estructura de subcarpetas.
- Un repositorio Git con su `.gitignore`.
- Un entorno virtual de Python con las dependencias necesarias instaladas.
- Un archivo `.env` seguro con variables de entorno (clave secreta generada por script, variables `DB_*` para la base de datos).
- Un script para generar la `SECRET_KEY`.
- Un script de apoyo para crear la base de datos.
- La configuración central (`app/config.py`).
- El patrón **app factory** (`app/__init__.py` con `crear_app()`).
- El punto de entrada (`app.py`).
- Flask-SQLAlchemy y Flask-Migrate integrados.
- Un endpoint `GET /health` que devuelve JSON con status 200.
- Un commit inicial y su push a GitHub.

---

## 3. Prerrequisitos

Antes de empezar, asegúrate de tener:

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Python | 3.11+ | `python --version` |
| MySQL | 8.0+ (o XAMPP) | Debe estar corriendo el servicio |
| Git | 2.x | `git --version` |
| Cuenta de GitHub | — | https://github.com |
| Editor de código | VS Code recomendado | — |
| Terminal | CMD, PowerShell, Git Bash | — |

**Notas importantes:**
- El servicio MySQL debe estar corriendo. Si usas XAMPP, asegúrate de que el módulo MySQL esté en verde.
- No necesitas tener ninguna base de datos creada todavía; la crearás en este tutorial.
- Para desarrollo local puedes usar `root` sin contraseña si tu MySQL lo permite.

---

## 4. Estructura final esperada del proyecto

Al terminar, tu carpeta `alojamientos/` debe lucir así:

```
alojamientos/
├── .env                    (NO versionado)
├── .env.example
├── .gitignore
├── app.py
├── app/
│   ├── __init__.py
│   ├── config.py
│   └── migrate.py
├── migrations/
│   ├── alembic.ini
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   └── versions/
├── requirements.txt
├── scripts/
│   ├── create_db.py
│   └── generate_secret.py
├── tests/
├── uploads/
│   └── .gitkeep
└── venv/                   (entorno virtual, NO versionado)
```

---

## 5. Paso a paso completo

### Paso 1 — Crear la carpeta del proyecto

Crea la carpeta donde vivirá tu proyecto. Puedes ubicarla donde prefieras.

```bash
mkdir alojamientos
cd alojamientos
```

**Validación:** Estás dentro de la carpeta `alojamientos/`.

---

### Paso 2 — Inicializar el repositorio Git

```bash
git init
```

Configura tu nombre y correo (usa los tuyos reales):

```bash
git config user.name "Tu Nombre"
git config user.email "tu-correo@ejemplo.com"
```

**Validación:**

```bash
git status
```

Debes ver algo como: `On branch master. No commits yet.`

---

### Paso 3 — Crear el archivo `.gitignore`

Este archivo evita que subas archivos sensibles o innecesarios a Git.

Crea el archivo `.gitignore` en la raíz del proyecto con este contenido exacto:

```
# Entorno Virtual de Python
venv/

# Archivo de variables de entorno (contiene secretos)
.env

# Cache de Python
__pycache__/
.pytest_cache/

# Archivos de base de datos de SQLite (si se usara en el futuro)
*.sqlite3

# Imagenes subidas por usuarios (no se versionan)
uploads/*
!uploads/.gitkeep
```

**¿Qué hace?**
- `venv/` — el entorno virtual es grande y regenerable.
- `.env` — contiene secretos; nunca debe versionarse.
- `__pycache__/` y `.pytest_cache/` — archivos de caché de Python.
- `uploads/*` con `!uploads/.gitkeep` — no versiona las imágenes subidas pero sí mantiene la carpeta vacia en Git gracias a `.gitkeep`.

**Validación:** En un paso posterior, cuando ejecutes `git status`, `.env` y `venv/` **no deben aparecer en la lista** porque `.gitignore` los oculta automáticamente.

---

### Paso 4 — Crear la estructura de carpetas base

Crea las siguientes carpetas dentro de `alojamientos/`:

```bash
# Windows CMD
mkdir app
mkdir scripts
mkdir tests
mkdir uploads

# Linux / Mac
mkdir app scripts tests uploads
```

Dentro de `uploads/`, crea un archivo vacío llamado `.gitkeep` para que Git rastree la carpeta:

```bash
# Windows CMD
type nul > uploads\.gitkeep

# Windows PowerShell
New-Item -Path uploads\.gitkeep -ItemType File

# Linux / Mac
touch uploads/.gitkeep
```

**Validación:** Ejecuta `dir` (Windows) o `ls` (Linux/Mac) y verifica que existen las carpetas `app/`, `scripts/`, `tests/`, `uploads/`.

---

### Paso 5 — Crear y activar el entorno virtual

Crea el entorno virtual dentro de la carpeta del proyecto:

```bash
# Windows
python -m venv venv

# Linux / Mac
python3 -m venv venv
```

Actívalo:

```bash
# Windows CMD
venv\Scripts\activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux / Mac
source venv/bin/activate

# Git Bash
source venv/Scripts/activate
# o tambien
. venv/Scripts/activate

```

**Validación:** Tu terminal debe mostrar `(venv)` al inicio del prompt.

Para desactivar el entorno virtual:

```bash
deactivate
```

---

### Paso 6 — Crear `requirements.txt`

Crea el archivo `requirements.txt` en la raíz del proyecto con este contenido exacto:

```
Flask==3.1.3
Flask-SQLAlchemy==3.1.1
Flask-CORS==6.0.2
Flask-Migrate==4.1.0
PyMySQL==1.1.2
python-dotenv==1.2.2
SQLAlchemy==2.0.49
Werkzeug==3.1.8
```

Copia estas 8 líneas tal cual en el archivo.

**¿Qué incluye cada paquete?**

| Paquete | Para qué sirve |
|---|---|
| Flask | Framework web principal |
| Flask-SQLAlchemy | Extensión que integra SQLAlchemy (ORM) con Flask |
| Flask-CORS | Permite peticiones desde el frontend (React, Vite, etc.) |
| Flask-Migrate | Gestión de migraciones de base de datos con Alembic |
| PyMySQL | Driver para conectar Python con MySQL |
| python-dotenv | Carga variables de entorno desde el archivo `.env` |
| SQLAlchemy | Motor ORM (viene incluido con Flask-SQLAlchemy; se declara explícitamente para fijar versión) |
| Werkzeug | Utilidades de Flask (hashing, etc.; viene con Flask) |

---

### Paso 7 — Instalar dependencias

Con el entorno virtual activado:

```bash
pip install -r requirements.txt
```

**Resultado esperado:** `Successfully installed Flask-3.1.3 Flask-SQLAlchemy-3.1.1 ...`

**Validación:**

```bash
pip list
```

Debes ver los 8 paquetes listados.

---

### Paso 8 — Crear `.env.example`

Crea el archivo `.env.example` en la raíz del proyecto. Este archivo sirve como **plantilla** de las variables de entorno que el proyecto necesita. **No contiene secretos reales**.

```
# Clave secreta para firmar tokens JWT.
# Generar con: python scripts/generate_secret.py
SECRET_KEY=

# CORS: origenes permitidos (separados por comas).
# - En DESARROLLO: dejar vacio para permitir localhost:3000, 5173, etc.
# - En PRODUCCION: definir explicitamente. NUNCA usar '*'.
CORS_ALLOWED_ORIGINS=

# Base de datos (MySQL)
# Estas variables se usan tanto para crear la BD (scripts/create_db.py)
# como para configurar la app (app/config.py).
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alojamientos_db
DB_CHARSET=utf8mb4
```

**¿Qué significa cada variable?**
- `SECRET_KEY` — clave criptográfica para firmar tokens y sesiones. Se genera con un script.
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_CHARSET` — credenciales y configuración de MySQL. Se usan tanto para crear la base de datos como para construir la URI de conexión internamente.
- `CORS_ALLOWED_ORIGINS` — orígenes HTTP permitidos. Vacío = permite localhost en desarrollo.

---

### Paso 9 — Crear `scripts/generate_secret.py`

Este script genera una clave secreta aleatoria y segura. **Nunca hardcodees una clave**; siempre genérala.

Crea el archivo `scripts/generate_secret.py` con este contenido:

```python
"""
Script para generar una SECRET_KEY segura para Flask.
Ejecutar: python scripts/generate_secret.py

Esta clave debe copiarse al archivo .env en la variable SECRET_KEY.
NUNCA compartas esta clave publicamente.
"""
import secrets

secret_key = secrets.token_hex(32)

print("\n" + "=" * 60)
print("Tu nueva SECRET_KEY es:")
print("=" * 60)
print(secret_key)
print("=" * 60)
print("\nCopia esta clave y pegala en tu archivo .env:")
print(f"SECRET_KEY='{secret_key}'")
print()
```

**¿Qué hace?** `secrets.token_hex(32)` genera 32 bytes aleatorios (64 caracteres hexadecimales), lo suficientemente largo para ser seguro.

---

### Paso 10 — Ejecutar el script y crear `.env`

Ejecuta el script:

```bash
python scripts/generate_secret.py
```

**Resultado esperado:**

```
============================================================
Tu nueva SECRET_KEY es:
============================================================
<una_clave_hexadecimal_de_64_caracteres>
============================================================

Copia esta clave y pegala en tu archivo .env:
SECRET_KEY='<esa_misma_clave>'
```

Ahora crea el archivo `.env` copiando `.env.example` y pegando la clave generada:

```bash
# Windows CMD
copy .env.example .env

# Linux / Mac
cp .env.example .env
```

Edita `.env` y reemplaza la línea `SECRET_KEY=` con la clave que el script te mostró. El archivo debe quedar así:

```
SECRET_KEY=<PEGA_AQUI_TU_SECRET_KEY_GENERADA>
CORS_ALLOWED_ORIGINS=
DB_USER=alojamientos_user
DB_PASSWORD=Alojamientos123!
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alojamientos_db
DB_CHARSET=utf8mb4
```

**Importante:** No copies el valor de ejemplo que aparece arriba. Pega **tu propia clave** generada por el script. El resto de las líneas déjalas igual.

**Validación:** Ejecuta `git status`. Los archivos `.env` y `venv/` **no deben aparecer en la lista** porque `.gitignore` los excluye automáticamente. Si `.env` aparece, revisa que la línea `.env` esté presente en `.gitignore`.

---

### Paso 11 — Crear `app/config.py`

Este archivo contiene la clase `Config` que carga y valida todas las variables de entorno.

Crea `app/config.py`:

```python
import os
from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo .env
# Esto debe hacerse ANTES de que se defina la clase Config
load_dotenv()


class Config:
    """Configuracion central de la aplicacion."""

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Clave secreta para firmar tokens y sesiones
    SECRET_KEY = os.getenv("SECRET_KEY")

    # Expiracion del token JWT en minutos
    _jwt_exp = os.getenv("JWT_EXP_MINUTES", "15")
    JWT_EXP_MINUTES = int(_jwt_exp) if _jwt_exp.isdigit() else 15

    # ------------------------------------------------------------------
    # Base de datos: se construye a partir de variables DB_*
    # ------------------------------------------------------------------
    _db_user = os.getenv("DB_USER", "").strip()
    _db_password = os.getenv("DB_PASSWORD", "").strip()
    _db_host = os.getenv("DB_HOST", "localhost").strip()
    _db_port = os.getenv("DB_PORT", "3306").strip()
    _db_name = os.getenv("DB_NAME", "alojamientos_db").strip()

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{_db_user}:{_db_password}@{_db_host}:{_db_port}/{_db_name}"
    )

    # ------------------------------------------------------------------
    # Validaciones obligatorias en desarrollo/produccion
    # ------------------------------------------------------------------
    is_testing = os.getenv("FLASK_TESTING", "false").lower() == "true"

    if not is_testing:
        if not _db_user:
            raise ValueError("Falta la variable DB_USER en el archivo .env")
        if not _db_name:
            raise ValueError("Falta la variable DB_NAME en el archivo .env")
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
            "http://127.0.0.1:5500",
            "http://localhost:8080",
        ]

    # Ruta base del proyecto
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
```

**¿Qué hace?**
1. `load_dotenv()` carga las variables del `.env` al entorno.
2. Lee las variables `DB_*` y construye internamente la URI de conexión a MySQL.
3. **Valida** que `DB_USER`, `DB_NAME` y `SECRET_KEY` existan (excepto en modo testing). Si faltan, la app no arranca y muestra un error claro.
4. Configura los orígenes CORS permitidos.
5. Calcula `BASE_DIR` (ruta absoluta del proyecto) para usos futuros.

---

### Paso 12 — Crear `app/__init__.py` (app factory)

Aquí implementamos el patrón **app factory**: una función `crear_app()` que construye y configura la instancia de Flask. Esto permite testing, múltiples entornos y arranque flexible.

Crea `app/__init__.py`:

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


def crear_app():
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

    # Manejadores globales de error
    @app.errorhandler(404)
    def recurso_no_encontrado(error):
        return {"success": False, "error": {"message": "Recurso no encontrado"}}, 404

    @app.errorhandler(500)
    def error_interno(error):
        return {"success": False, "error": {"message": "Error interno del servidor"}}, 500

    return app
```

**¿Qué hace cada parte?**

| Sección | Explicación |
|---|---|
| `db = SQLAlchemy()` | Crea el objeto `db` que usaremos para definir modelos y consultar la BD |
| `migrate = Migrate()` | Crea el objeto de migraciones; se inicializa dentro del factory para que Flask CLI lo reconozca |
| `app.config.from_object(Config)` | Carga toda la configuración desde la clase `Config` |
| `db.init_app(app)` | Vincula `db` con la app creada |
| `migrate.init_app(app, db)` | Vincula las migraciones con la app y la BD |
| `CORS(app, ...)` | Habilita peticiones cross-origin desde el frontend |
| `@app.route('/health')` | Endpoint público que confirma que la API está viva |
| `@app.errorhandler(404/500)` | Formato uniforme de respuestas de error |

**¿Por qué `migrate` se inicializa dentro del factory y no en `app.py`?** Porque Flask CLI necesita que la extensión esté registrada cuando ejecutas `flask db init`. Si se inicializara después, el comando `db` no estaría disponible.

---

### Paso 13 — Crear `app/migrate.py`

Este archivo re-exporta el objeto `migrate` del factory. Sirve como punto de acceso limpio si otros módulos necesitan referenciarlo.

Crea `app/migrate.py`:

```python
"""
Flask-Migrate: la extension se inicializa dentro del app factory.
Este modulo re-exporta la instancia `migrate` para uso externo si es necesario.
"""
from app import migrate  # noqa: F401
```

---

### Paso 14 — Crear `app.py`

Este es el **punto de entrada** del proyecto. Crea la app usando el factory y la ejecuta.

Crea `app.py` en la raíz del proyecto:

```python
from app import crear_app

# Creamos la aplicacion
app = crear_app()

if __name__ == '__main__':
    # Modo debug para reinicio automatico al guardar cambios
    app.run(debug=True, port=5000)
```

**¿Qué hace?**
1. Importa `crear_app` y crea la instancia `app`.
2. Si se ejecuta directamente (`python app.py`), arranca el servidor en modo debug en el puerto 5000.

---

### Paso 15 — Crear la base de datos en MySQL

Tienes dos opciones. Elige la que te resulte más cómoda:

#### Opcion A — Usar el script `scripts/create_db.py` (recomendada)

Este script crea la base de datos automaticamente desde la terminal. Es una utilidad de apoyo opcional: tambien puedes crear la base de datos manualmente con MySQL CLI, phpMyAdmin o DBeaver.

> **Importante:** El script lee sus credenciales desde **variables de entorno**, no desde valores fijos en el codigo. Esto significa que cada desarrollador puede usar su propia configuracion sin editar el archivo fuente.

Crea `scripts/create_db.py`:

```python
"""
Script para crear la base de datos `alojamientos_db` si no existe.

Lee las credenciales de conexion desde variables de entorno para que
cada desarrollador pueda usar su propia configuracion sin modificar
el codigo fuente.

Variables de entorno requeridas:
    DB_USER       - Usuario de MySQL (por ejemplo: root)
    DB_PASSWORD   - Contrasena del usuario (puede dejarse vacia en local)

Variables de entorno opcionales (tienen valores por defecto):
    DB_HOST       - Servidor MySQL         (default: localhost)
    DB_PORT       - Puerto MySQL           (default: 3306)
    DB_NAME       - Nombre de la base      (default: alojamientos_db)
    DB_CHARSET    - Juego de caracteres    (default: utf8mb4)

Uso:
    python scripts/create_db.py
"""
import os
import sys

from dotenv import load_dotenv
import pymysql


# ------------------------------------------------------------------
# Carga explicita del archivo .env
# ------------------------------------------------------------------
load_dotenv()

# ------------------------------------------------------------------
# Lectura de configuracion desde variables de entorno
# ------------------------------------------------------------------
DB_USER = os.getenv('DB_USER', '').strip()
DB_PASSWORD = os.getenv('DB_PASSWORD', '').strip()
DB_HOST = os.getenv('DB_HOST', 'localhost').strip()
DB_PORT = int(os.getenv('DB_PORT', '3306'))
DB_NAME = os.getenv('DB_NAME', 'alojamientos_db').strip()
DB_CHARSET = os.getenv('DB_CHARSET', 'utf8mb4').strip()

# Validar variables obligatorias
errores = []
if not DB_USER:
    errores.append("DB_USER no esta definida. Asegúrate de configurarla en tu archivo .env")
if not DB_NAME:
    errores.append("DB_NAME no esta definida. Asegúrate de configurarla en tu archivo .env")

if errores:
    print('\nError de configuracion de base de datos:', file=sys.stderr)
    for error in errores:
        print(f'  - {error}', file=sys.stderr)
    print(file=sys.stderr)
    sys.exit(1)


# ------------------------------------------------------------------
# Creacion de la base de datos
# ------------------------------------------------------------------
print(f'Conectando a MySQL en {DB_HOST}:{DB_PORT} como usuario "{DB_USER}"...')

try:
    # Conexion sin especificar base de datos (necesario para CREATE DATABASE)
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset=DB_CHARSET,
    )

    with connection.cursor() as cursor:
        sql = (
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            f"CHARACTER SET {DB_CHARSET} "
            f"COLLATE {DB_CHARSET}_unicode_ci;"
        )
        cursor.execute(sql)
        connection.commit()

    print(f"Base de datos '{DB_NAME}' creada (o ya existia).")

except pymysql.MySQLError as e:
    print(f'Error al crear la base de datos: {e}', file=sys.stderr)
    sys.exit(1)
finally:
    if 'connection' in dir() and connection.open:
        connection.close()
```

**¿Por que usar variables de entorno en vez de valores fijos?**

| Problema del codigo hardcodeado | Como lo resuelve el entorno |
|---|---|
| **Seguridad**: credenciales visibles en el repositorio | Los secretos quedan fuera del codigo, no se commitean |
| **Portabilidad**: cada maquina requiere editar el archivo | `.env` es personal y no se sube a Git |
| **Entornos multiples**: local, staging, produccion requieren codigo distinto | El mismo script funciona en todos lados, solo cambian las variables |
| **Pedagogia**: enseña que las credenciales van "afuera" | Los estudiantes aprenden el patron real de la industria |

**Como configurar las variables:**

El archivo `.env.example` ya documenta las variables `DB_*` que necesita el script. Tu `.env` personal (que no se versiona) debe tener algo como:

```ini
# Variables para scripts/create_db.py
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alojamientos_db
DB_CHARSET=utf8mb4
```

Ejecutalo:

```bash
python scripts/create_db.py
```

**Resultado esperado:**

```
Conectando a MySQL en localhost:3306 como usuario "root"...
Base de datos 'alojamientos_db' creada (o ya existia).
```

**Si falta una variable obligatoria:**

```
Error de configuracion de base de datos:
  - DB_USER no esta definida. Asegúrate de configurarla en tu archivo .env
```

Reparación rápida en caso de tabla mysql.db dañada o su índice corrupto

```sql
REPAIR TABLE mysql.db;
```

Error: 'cryptography' package is required for sha256_password
or caching_sha2_password auth methods.
Esto pasa porque el MySQL del puerto 3307 usa un método
de autenticación más seguro, y PyMySQL necesita soporte
criptográfico extra para poder conectarse.
Por eso se instala: pip install "PyMySQL[rsa]" o pip install cryptography
[rsa] es un extra del paquete PyMySQL, y las comillas
se usan para que la terminal no interprete los corchetes [].

```bash
pip install "PyMySQL[rsa]"
```

#### Opción B — Crearla manualmente

Si prefieres usar MySQL CLI, phpMyAdmin o DBeaver, ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS alojamientos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Puede crear un usuario de base de datos llamado alojamientos_user con contraseña Alojamientos123, accesible solo desde el host local 
CREATE USER 'alojamientos_user'@'127.0.0.1' IDENTIFIED BY 'Alojamientos123!';

# Otorga al usuario nexo permisos completos sobre todas las tablas de la base de datos nexo_dev
GRANT ALL PRIVILEGES ON alojamientos_db.* TO 'alojamientos_user'@'127.0.0.1';

```

**Validación:** La base de datos `alojamientos_db` debe existir en tu servidor MySQL.

---

### Paso 16 — Configurar Flask-SQLAlchemy

Ya está configurado. No necesitas hacer nada adicional aquí porque:

1. `Flask-SQLAlchemy` ya está instalado (`requirements.txt`).
2. El objeto `db = SQLAlchemy()` está creado en `app/__init__.py`.
3. Se inicializa con `db.init_app(app)` dentro de `crear_app()`.
4. Las variables `DB_*` en tu `.env` se usan para construir la URI de conexión internamente.

La conexión queda lista automáticamente cuando la app arranca.

---

### Paso 17 — Configurar Flask-Migrate y ejecutar `flask db init`

Flask-Migrate también ya está configurado en el factory. Ahora inicializa el sistema de migraciones.

Primero, configura la variable de entorno `FLASK_APP`: 
app → el módulo o archivo app.py
crear_app → la función factory que construye la aplicación Flask

```bash
# Windows CMD
set FLASK_APP=app:crear_app

# Windows PowerShell
$env:FLASK_APP = "app:crear_app"

# Linux / Mac
export FLASK_APP=app:crear_app
```

Ejecuta la inicialización:

Flask CLI, cuando intenta descubrir la app automáticamente, busca primero una instancia llamada app o application, 
y si no la encuentra, busca una factory llamada create_app o make_app. crear_app no está entre esos nombres que Flask detecta solo.
Por eso, como la función se llama crear_app, tienes que decírselo explícitamente:

primero guardas FLASK_APP en la sesión actual de la terminal,
luego cualquier comando flask de esa sesión usará ese valor,
sirve si vas a ejecutar varios comandos seguidos

```bash
export FLASK_APP=app:crear_app
python -m flask db init
```

o le pasas la app solo a ese comando,
no deja nada guardado en la terminal,
suele ser más claro y más seguro

```bash
python -m flask --app app:crear_app db init
```

o tambien cámbia crear_app a create_app en app/__init__.py y también en app.py
Esta ultima es la que usaremos por buenas practicas

**Resultado esperado:**

```
Creating directory .../migrations ...  done
Creating directory .../migrations/versions ...  done
Generating .../migrations/alembic.ini ...  done
Generating .../migrations/env.py ...  done
Generating .../migrations/README ...  done
Generating .../migrations/script.py.mako ...  done
```

Esto crea la carpeta `migrations/` con la configuración de Alembic. **No crea tablas todavía** porque aún no hay modelos definidos.

**¿Cuándo se crearán las tablas?** En el sprint que definas el primer modelo, ejecutarás `flask db migrate -m "descripcion"` y luego `flask db upgrade`.

---

### Paso 18 — Levantar el servidor

Ejecuta:

```bash
python app.py
```

**Resultado esperado:**

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

El servidor está corriendo en el puerto 5000. Déjalo abierto para el siguiente paso.

---

### Paso 19 — Probar `GET /health`

Abre **otra terminal** (no cierres la del servidor) y ejecuta:

```bash
# Windows CMD / PowerShell
curl http://127.0.0.1:5000/health

# Linux / Mac
curl http://localhost:5000/health
```

**Resultado esperado (status 200):**

```json
{
  "status": "ok",
  "service": "alojamientos-api",
  "version": "v1"
}
```

Si ves esta respuesta, tu API está funcionando correctamente.

**Validación con código HTTP:**

```bash
# Windows CMD / PowerShell
curl -s -o nul -w "HTTP_STATUS: %{http_code}" http://127.0.0.1:5000/health

# Linux / Mac
curl -s -o /dev/null -w "HTTP_STATUS: %{http_code}" http://localhost:5000/health
```

Debes ver: `HTTP_STATUS: 200`

---

### Paso 20 — Cerrar el servidor

Vuelve a la terminal donde corre el servidor y presiona `Ctrl + C`.

---

## 6. Cómo probar que funciona

Haz esta verificación rápida:

| Qué probar | Cómo | Resultado esperado |
|---|---|---|
| La app arranca | `python app.py` | `Running on http://127.0.0.1:5000` |
| El health check responde | `curl http://127.0.0.1:5000/health` | JSON con `"status": "ok"` |
| El status HTTP es 200 | `curl -s -o nul -w "%{http_code}" http://127.0.0.1:5000/health` | `200` |
| Las migraciones están listas | `dir migrations` (Windows) / `ls migrations` (Linux) | Existen `alembic.ini`, `env.py`, `versions/` |
| El `.env` NO aparece en `git status` | `git status` | `.env` **no aparece en la lista** |
| Las dependencias están instaladas | `pip list` (buscar Flask) | Flask y Flask-SQLAlchemy aparecen |

---

## 7. Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `Falta la variable SECRET_KEY en el archivo .env` | No pegaste la clave generada en `.env` | Ejecuta `python scripts/generate_secret.py` y pega el resultado en `.env` |
| `Falta la variable DB_USER en el archivo .env` | No definiste `DB_USER` en `.env` | Asegúrate de que la línea `DB_USER=root` (o tu usuario) esté presente en `.env` |
| `Falta la variable DB_NAME en el archivo .env` | No definiste `DB_NAME` en `.env` | Asegúrate de que la línea `DB_NAME=alojamientos_db` esté presente en `.env` |
| `Can't connect to MySQL server` | MySQL no está corriendo o las credenciales son incorrectas | Verifica que el servicio MySQL esté activo y que usuario/contraseña en `.env` sean correctos |
| `Error: No such command 'db'` | Flask-Migrate no se inicializó dentro del factory | Asegúrate de que `migrate.init_app(app, db)` esté dentro de `crear_app()` en `app/__init__.py` |
| `Error: Failed to find Flask application` | `FLASK_APP` no está bien configurado | Usa `app:crear_app` (Windows CMD: `set FLASK_APP=app:crear_app`, PowerShell: `$env:FLASK_APP="app:crear_app"`, Linux/Mac: `export FLASK_APP=app:crear_app`) |
| `Puerto 5000 ya está en uso` | Otro proceso usa el puerto 5000 | Cambia el puerto en `app.py` o cierra el otro proceso |
| `ModuleNotFoundError: No module named 'flask_sqlalchemy'` | Dependencias no instaladas o entorno virtual no activado | Ejecuta `pip install -r requirements.txt` con el venv activado |
| `.env` aparece en `git status` | `.gitignore` no lo está excluyendo correctamente | Verifica que `.gitignore` contenga la línea `.env` exactamente así, sin espacios ni caracteres ocultos |
| El health check devuelve 404 | La ruta `/health` no está registrada | Verifica que el decorador `@app.route('/health')` esté dentro de `crear_app()` |

---

## 8. Cierre con Git y GitHub

### Hacer el primer commit

Verifica qué archivos se van a commitear:

```bash
git status
```

Debes ver archivos como `.env.example`, `.gitignore`, `app.py`, `app/`, `migrations/`, `requirements.txt`, `scripts/`, `uploads/`. **NO** debe aparecer `.env` ni `venv/` porque `.gitignore` los excluye.

Agrega todo y commitea:

```bash
git add .
git commit -m "feat: setup inicial del proyecto alojamientos

- Estructura base con app factory (crear_app)
- Flask-SQLAlchemy + Flask-Migrate integrados
- Configuracion via .env con python-dotenv
- Endpoint GET /health funcional
- Script generate_secret.py para SECRET_KEY
- Script create_db.py para crear la base de datos
- Migraciones inicializadas con flask db init
- .gitignore configurado para excluir .env y venv"
```

### Conectar con GitHub

1. Ve a https://github.com/new y crea un repositorio nuevo (por ejemplo, `api-alojamientos`).
2. No marques "Add README", ".gitignore" ni "Choose a license" (ya los tienes).
3. Copia la URL del repositorio creado.

Conecta el remoto y haz push:

```bash
# Renombrar la rama a main
git branch -M main

# Conectar el repositorio remoto (reemplaza con tu URL real)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Hacer push
git push -u origin main
```

**Validación:** Visita tu repositorio en GitHub y verifica que todos los archivos aparecen listados.

---

## 9. Resultado final del Sprint 1

Si seguiste todos los pasos, ahora tienes:

- ✅ Un proyecto Flask funcional en `alojamientos/`.
- ✅ Una API que responde en `GET /health` con status 200.
- ✅ Flask-SQLAlchemy conectado a MySQL.
- ✅ Flask-Migrate inicializado (`migrations/` creado).
- ✅ Variables de entorno seguras (`.env` no versionado, `SECRET_KEY` generada por script).
- ✅ `.gitignore` configurado.
- ✅ Repositorio Git con al menos un commit.
- ✅ Código subido a GitHub.

**Próximo paso:** En el Sprint 2 construirás el dominio de usuarios con registro, login, JWT y perfiles.

---

## 10. Mejora opcional: herramientas de calidad de codigo

> **Esta seccion es opcional.** No forma parte de los 5 sprints obligatorios. Es una mejora que puedes aplicar cuando te sientas comodo con el flujo basico de desarrollo.

El proyecto incluye un archivo `requirements-dev.txt` con dos herramientas opcionales que mejoran la calidad del codigo:

```python

# Dependencias opcionales para desarrollo: formateo, lint y calidad de código.
# Instalar con: pip install -r requirements-dev.txt
-r requirements.txt

# Formateador de código
black==25.1.0

# Linter rápido y moderno (reemplaza flake8, isort, pylint en muchos casos)
ruff==0.12.2

```

### Que incluye?

| Herramienta | Para que sirve |
|-------------|---------------|
| **Black** | Formateador automatico. Aplica un estilo consistente a todo el codigo Python. Tu codigo siempre se ve igual, sin importar quien lo escribio. |
| **Ruff** | Linter ultrarrapido. Detecta imports desordenados, variables no usadas, sintaxis obsoleta y patrones sospechosos que pueden ser bugs. |

### Como instalarlas y usarlas

```bash
pip install -r requirements-dev.txt

black .              # Formatear todo el proyecto
ruff check .         # Revisar errores de calidad
ruff check . --fix   # Corregir automatico lo posible
```

### Flujo recomendado antes de un commit

```bash
black . && ruff check . --fix && pytest
```

Esto te garantiza: formato consistente, codigo limpio y tests pasando.

> **Nota:** Estas herramientas **no agregan funcionalidad** al proyecto. Mejoran legibilidad y disciplina de ingenieria. Usalas cuando te sientas comodo con el flujo basico de crear archivos, probar y hacer commit.

feat = nueva funcionalidad
fix = corrección de error
docs = cambios en documentación
style = formato/estilo, sin cambiar lógica
refactor = reorganizar código sin cambiar comportamiento
test = agregar o cambiar tests
chore = tareas de mantenimiento
perf = mejora de rendimiento
build = cambios de build o dependencias
ci = cambios en CI/CD
revert = revertir un commit
```bash
git commit -m "chore: agregar herramientas de calidad de codigo"
```