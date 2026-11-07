# Alojamientos API

> API REST para gestion de alojamientos y comodidades, construida con Flask como proyecto educativo de portafolio.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)](https://flask.palletsprojects.com/)
[![Tests](https://img.shields.io/badge/Tests-33%20passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

---

## Descripcion

**Alojamientos API** es una API REST que permite gestionar usuarios, alojamientos y comodidades con autenticacion JWT y control de acceso por roles. Ofrece endpoints para registro, login, gestion de perfiles, CRUD completo de alojamientos y comodidades, y la relacion entre ellos.

El proyecto esta diseñado con una **arquitectura por capas** (controladores, servicios, repositorios, modelos y DTOs) para separar responsabilidades y facilitar el mantenimiento.

---

## Objetivo educativo

Este proyecto sirve como **guia de aprendizaje** para estudiantes que quieren construir un backend profesional con Flask. No es solo un CRUD basico: aplica patrones y practicas que se encuentran en proyectos reales de la industria.

Cada sprint del proyecto introduce conceptos nuevos de forma progresiva, desde la configuracion inicial hasta la implementacion de tests automatizados.

---

## Que aprende un estudiante al desarrollarlo

| Area | Habilidades que se practican |
|------|------------------------------|
| **Flask y extensiones** | Factory pattern, Blueprints, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS |
| **Arquitectura limpia** | Separacion en capas: controladores → servicios → repositorios → modelos |
| **Autenticacion** | Generacion y validacion de tokens JWT con PyJWT |
| **Autorizacion** | Decoradores de proteccion: `requiere_token` y `requiere_admin` |
| **Bases de datos** | Modelado relacional, relaciones muchos-a-muchos, migraciones con Alembic |
| **Validacion de datos** | DTOs con Marshmallow para serializacion y validacion de entrada |
| **Manejo de errores** | Excepciones de dominio personalizadas y handlers globales |
| **Variables de entorno** | Configuracion segura con `.env` y `python-dotenv` |
| **Tests automatizados** | Pytest, fixtures, cliente HTTP, base de datos en memoria |
| **Git y flujo de trabajo** | Control de versiones, sprints planificados, migraciones |

---

## Stack tecnologico

- **Python 3.10+** — Lenguaje base
- **Flask 3.x** — Framework web
- **Flask-SQLAlchemy** — ORM para base de datos
- **Flask-Migrate (Alembic)** — Migraciones de esquema
- **Flask-CORS** — Soporte de origenes cruzados
- **PyJWT** — Autenticacion con tokens JWT
- **PyMySQL** — Driver de conexion a MySQL
- **Marshmallow** — Serializacion y validacion de DTOs
- **python-dotenv** — Carga de variables de entorno
- **pytest** — Framework de tests
- **MySQL** — Base de datos en desarrollo/produccion
- **SQLite (en memoria)** — Base de datos para tests

---

## Arquitectura

El proyecto sigue una **arquitectura por dominios**, donde cada dominio (usuarios, alojamientos, comodidades) contiene todas sus capas organizadas de forma independiente:

```
alojamientos/
├── app.py                          # Punto de entrada
├── requirements.txt                # Dependencias de produccion
├── requirements-dev.txt            # Dependencias de desarrollo (black, ruff)
├── pytest.ini
├── pyproject.toml                  # Config de black y ruff
├── .env.example                    # Plantilla de variables de entorno
├── app/
│   ├── __init__.py                 # Factory: crear_app()
│   ├── config.py                   # Configuracion desde .env
│   ├── seguridad.py                # Decoradores JWT
│   └── dominios/
│       ├── usuarios/
│       │   ├── controladores.py    # Endpoints (Blueprints)
│       │   ├── servicios.py        # Logica de negocio
│       │   ├── repositorios.py     # Acceso a datos
│       │   ├── modelos.py          # Modelos SQLAlchemy
│       │   └── dtos.py             # Serializacion Marshmallow
│       ├── alojamientos/
│       │   ├── controladores.py
│       │   ├── servicios.py
│       │   ├── repositorios.py
│       │   ├── modelos.py
│       │   └── dtos.py
│       └── comodidades/
│           ├── controladores.py
│           ├── servicios.py
│           ├── repositorios.py
│           ├── modelos.py
│           └── dtos.py
├── migrations/                     # Migraciones de Alembic
├── scripts/                        # Scripts de utilidad
│   ├── create_db.py                # Crear BD desde variables de entorno
│   ├── generate_secret.py          # Generar SECRET_KEY
│   └── promover_admin.py           # Promover usuario a admin
└── tests/                          # Tests automatizados
```

### Diagrama de flujo de una peticion

```
Cliente HTTP
    │
    ▼
Blueprint (controlador)
    │
    ▼  valida entrada con DTO (Marshmallow)
Servicio (logica de negocio)
    │
    ▼  consulta/persiste datos
Repositorio (acceso a datos)
    │
    ▼
Base de datos (MySQL / SQLite)
    │
    ▼
Respuesta JSON al cliente
```

### Base de datos

```
usuarios ── 1:N ── alojamientos
   │
   └── 1:1 ── perfiles

alojamientos ── N:M ── comodidades
   └── alojamiento_comodidad (tabla intermedia)
```

---

## Requisitos previos

- **Python 3.10+** instalado
- **MySQL 8+** corriendo localmente (para desarrollo)
- **Git** para control de versiones
- Conocimientos basicos de Python y terminal

---

## Instalacion paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd alojamientos
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
copy .env.example .env    # Windows
cp .env.example .env      # Linux / macOS
```

Editar el archivo `.env` con tus credenciales reales (ver seccion **Configuracion** mas abajo).

### 5. Crear la base de datos

El script `scripts/create_db.py` lee sus credenciales desde variables de entorno (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_CHARSET`). Si las definiste en tu `.env`, `python-dotenv` las cargara automaticamente.

```bash
python scripts/create_db.py
```

Si prefieres crear la base de datos manualmente (MySQL CLI, phpMyAdmin, DBeaver):

```sql
CREATE DATABASE IF NOT EXISTS alojamientos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Ejecutar las migraciones

```bash
flask db upgrade
```

Esto crea todas las tablas necesarias (`usuarios`, `perfiles`, `alojamientos`, `comodidades`, `alojamiento_comodidad`).

---

## Configuracion

### Variables de entorno

Toda la configuracion del proyecto se define en un solo archivo: `.env`. Las variables que el proyecto lee son:

| Variable | Uso | Default |
|----------|-----|---------|
| `SECRET_KEY` | Firmar tokens JWT. Generar con `python scripts/generate_secret.py` | — |
| `CORS_ALLOWED_ORIGINS` | Origenes permitidos (separados por comas). Dejar vacio en desarrollo. | (localhost por defecto) |
| `JWT_EXP_MINUTES` | Expiracion del token JWT en minutos | `15` |
| `DB_USER` | Usuario de MySQL (obligatorio) | — |
| `DB_PASSWORD` | Contrasena del usuario (puede estar vacia en local) | — |
| `DB_HOST` | Servidor MySQL | `localhost` |
| `DB_PORT` | Puerto MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `alojamientos_db` |
| `DB_CHARSET` | Juego de caracteres | `utf8mb4` |

**Por que variables `DB_*` y no una URI compuesta?**

El proyecto usa variables individuales (`DB_USER`, `DB_HOST`, etc.) como unica fuente de configuracion de base de datos. Tanto la app (`app/config.py`) como el script de creacion (`scripts/create_db.py`) leen las mismas variables. La app construye internamente `SQLALCHEMY_DATABASE_URI` a partir de ellas. Esto tiene varias ventajas:

- **Un solo lugar** donde definir credenciales, sin duplicar informacion.
- **Coherencia**: `create_db.py` y la app usan exactamente la misma configuracion.
- **Pedagogia**: el estudiante entiende que las variables individuales son la base, y que la URI compuesta se deriva de ellas.

#### Ejemplo de `.env`

```ini
# Aplicacion
SECRET_KEY=tu-clave-generada-aqui
CORS_ALLOWED_ORIGINS=
JWT_EXP_MINUTES=15

# Base de datos
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alojamientos_db
DB_CHARSET=utf8mb4
```

---

## Ejecutar el proyecto

Con el entorno virtual activado y la base de datos configurada:

```bash
python app.py
```

El servidor iniciara en `http://localhost:5000`. Verifica que funciona correctamente:

```bash
curl http://localhost:5000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "alojamientos-api",
  "version": "v1"
}
```

---

## Migraciones de base de datos

El proyecto usa **Flask-Migrate** (Alembic) para gestionar cambios en el esquema.

| Comando | Descripcion |
|---------|-------------|
| `flask db migrate -m "descripcion"` | Generar una nueva migracion |
| `flask db upgrade` | Aplicar migraciones pendientes |
| `flask db downgrade` | Revertir la ultima migracion |
| `flask db history` | Ver historial de migraciones |

> **Nota:** despues de clonar el proyecto por primera vez, ejecuta `flask db upgrade` para crear todas las tablas.

---

## Tests

El proyecto incluye **33 tests automatizados** que cubren autenticacion, CRUD de usuarios, alojamientos y comodidades, asi como control de acceso por roles.

Los tests usan **SQLite en memoria**, por lo que **no requieren MySQL** ni configuracion adicional. Las variables de entorno de testing se definen automaticamente en `tests/conftest.py` antes de importar la app, evitando cualquier conexion accidental a MySQL local.

### Ejecutar todos los tests

```bash
pytest
```

### Ejecutar con verbosity

```bash
pytest -v
```

### Ejecutar un modulo especifico

```bash
pytest tests/test_usuarios.py -v
pytest tests/test_alojamientos.py -v
pytest tests/test_comodidades.py -v
```

---

## Calidad de codigo (opcional)

El proyecto incluye `requirements-dev.txt` con herramientas opcionales de formateo y analisis estatico. No son necesarias para cumplir los 5 sprints, pero **se recomiendan** para mantener un estilo profesional y detectar errores antes de ejecutar.

### Instalar herramientas de desarrollo

```bash
pip install -r requirements-dev.txt
```

### Herramientas incluidas

| Herramienta | Que hace |
|-------------|----------|
| **Black** | Formateador automatico. Aplica un estilo consistente a todo el codigo Python: indentacion, saltos de linea, espacios, comillas. Tu codigo siempre se ve igual, sin importar quien lo escribio. |
| **Ruff** | Linter ultrarrapido escrito en Rust. Detecta imports desordenados, variables no usadas, sintaxis obsoleta y patrones sospechosos. Reemplaza a flake8, isort y pyupgrade en una sola herramienta. |

La configuracion de ambas herramientas esta en `pyproject.toml`.

### Comandos utiles

```bash
black .              # Formatear todo el proyecto
black --check .      # Solo verificar si esta formateado (sin cambiar archivos)

ruff check .         # Revisar errores de calidad (sin corregir)
ruff check . --fix   # Corregir automaticamente lo posible
```

### Flujo recomendado antes de un commit

```bash
black . && ruff check . --fix && pytest
```

Esto garantiza: formato consistente, codigo limpio y tests pasando.

> **Nota para estudiantes:** Estas herramientas **no agregan funcionalidad** al proyecto. Mejoran disciplina de ingenieria y legibilidad. Usalas cuando te sientas comodo con el flujo basico de desarrollo.

---

## Endpoints principales

Todos los endpoints responden en el prefijo `/api/v1`.

### Salud del servicio

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `GET` | `/health` | Publica | Estado del servicio |

### Usuarios y autenticacion

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `POST` | `/api/v1/usuarios/registro` | Publica | Registrar nuevo usuario |
| `POST` | `/api/v1/usuarios/login` | Publica | Iniciar sesion y obtener token JWT |
| `GET` | `/api/v1/usuarios/perfil` | Token | Ver perfil del usuario autenticado |
| `PATCH` | `/api/v1/usuarios/perfil` | Token | Actualizar perfil del usuario |

### Administracion

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `GET` | `/api/v1/admin/usuarios` | Admin | Listar todos los usuarios |

### Alojamientos

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `POST` | `/api/v1/alojamientos` | Token | Crear alojamiento |
| `GET` | `/api/v1/alojamientos` | Publica | Listar todos los alojamientos |
| `GET` | `/api/v1/alojamientos/<id>` | Publica | Ver detalle de un alojamiento |
| `PATCH` | `/api/v1/alojamientos/<id>` | Token (dueno o admin) | Actualizar alojamiento |
| `DELETE` | `/api/v1/alojamientos/<id>` | Token (dueno o admin) | Eliminar alojamiento |
| `PATCH` | `/api/v1/alojamientos/<id>/comodidades` | Token (dueno o admin) | Asignar comodidades a un alojamiento |

### Comodidades

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `POST` | `/api/v1/comodidades` | Admin | Crear comodidad |
| `GET` | `/api/v1/comodidades` | Publica | Listar todas las comodidades |
| `GET` | `/api/v1/comodidades/<id>` | Publica | Ver detalle de una comodidad |

---

## Ejemplos de uso

### Registrar un usuario

```bash
curl -X POST http://localhost:5000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{"correo": "maria@ejemplo.com", "contrasena": "miClave123"}'
```

### Iniciar sesion y obtener token JWT

```bash
curl -X POST http://localhost:5000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "maria@ejemplo.com", "contrasena": "miClave123"}'
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Crear un alojamiento (requiere autenticacion)

```bash
curl -X POST http://localhost:5000/api/v1/alojamientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_AQUI>" \
  -d '{
    "titulo": "Cabanita en el bosque",
    "descripcion": "Hermosa cabana rodeada de naturaleza",
    "precio_noche": 85.50,
    "ciudad": "Bariloche"
  }'
```

### Listar comodidades (publico)

```bash
curl http://localhost:5000/api/v1/comodidades
```

### Promover un usuario a administrador

```bash
python scripts/promover_admin.py maria@ejemplo.com
```

---

## Estado del proyecto

> **Se implementaron 5 de los 10 sprints planificados.**

El nucleo funcional esta completo y operativo. Esto incluye autenticacion, autorizacion, CRUD de las tres entidades principales y tests automatizados. El proyecto es totalmente funcional como API de portafolio.

Mejoras tecnicas aplicadas despues de los 5 sprints base:
- `precio_noche` usa `Numeric(10, 2)` en lugar de `Float` para precision monetaria correcta.
- Repositorios usan `db.session.get(Modelo, id)` (API SQLAlchemy 2.x) en lugar del patron legacy `query.get()`.
- `scripts/create_db.py` lee credenciales desde variables de entorno en lugar de valores hardcodeados.
- `tests/conftest.py` define variables de entorno de testing antes de importar la app para evitar conexion a MySQL local.
- Herramientas de calidad `black` y `ruff` integradas con configuracion en `pyproject.toml`.

---

## Posibles mejoras futuras

Estas son las areas de expansion contempladas en los sprints restantes:

- **Gestion de imagenes:** carga y almacenamiento de fotos para alojamientos
- **Sistema de reservas:** endpoints para crear, consultar y cancelar reservas
- **Filtrado y paginacion:** busqueda avanzada de alojamientos por ciudad, precio, comodidades
- **Rate limiting:** proteccion contra abuso en endpoints de autenticacion
- **Documentacion OpenAPI/Swagger:** documentacion interactiva de la API
- **Dockerizacion:** contenedores para desarrollo y produccion
- **CI/CD:** integracion continua con GitHub Actions
- **Logs y monitoreo:** sistema de logging estructurado
- **Refresco de tokens JWT:** endpoint para renovar tokens expirados sin re-login
- **Validacion mas robusta:** reglas adicionales en DTOs y servicios

---

## Valor para portafolio profesional

Este proyecto demuestra competencias reales de desarrollo backend que los reclutadores y equipos tecnicos buscan:

1. **Arquitectura organizada:** No es un archivo unico con toda la logica. Usa separacion por dominios y capas, lo que refleja como se estructuran proyectos en la industria.

2. **Autenticacion y autorizacion:** Implementa JWT desde cero con decoradores de proteccion y roles de usuario, un patron esencial en cualquier API moderna.

3. **Buenas practicas:** Variables de entorno seguras, migraciones de base de datos, manejo de errores centralizado, DTOs para validacion y factory pattern para la app.

4. **Tests automatizados:** Incluye una suite de tests con Pytest que demuestra compromiso con la calidad del codigo y prevencion de regresiones.

5. **Documentacion y scripts de utilidad:** Scripts para generar claves, crear bases de datos y promover administradores muestran pensamiento operativo completo.

6. **Base de datos relacional bien modelada:** Relaciones uno-a-uno, uno-a-muchos y muchos-a-muchos implementadas correctamente con SQLAlchemy.

7. **Calidad de codigo:** Formateo automatico con Black y analisis estatico con Ruff reflejan disciplina de ingenieria profesional.

8. **Proyecto ejecutable:** Cualquier reclutador o evaluador puede clonar, configurar y probar la API en minutos gracias a los scripts y la documentacion incluida.

---

## Licencia

Este proyecto es de caracter educativo y de portafolio. Uso libre para aprendizaje y referencia.
