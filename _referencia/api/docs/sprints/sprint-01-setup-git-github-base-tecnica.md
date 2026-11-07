# Sprint 1 — Setup, Git/GitHub y base técnica

---

## 1. Nombre del sprint

**Sprint 1 — Setup, Git/GitHub y base técnica**

---

## 2. Objetivo del sprint

Crear desde cero la estructura base del proyecto **alojamientos**, configurar el entorno de desarrollo con Flask, conectar a MySQL mediante Flask-SQLAlchemy, inicializar el sistema de migraciones con Flask-Migrate, crear un endpoint de salud (`/health`), configurar variables de entorno seguras, y establecer el repositorio en Git/GitHub con un primer commit funcional.

Al final del sprint, cualquier persona que clone el repositorio debe poder ejecutar la API y obtener una respuesta válida del endpoint `/health`.

---

## 3. Contexto de negocio

El proyecto **alojamientos** es una API REST para gestionar una plataforma de alquiler de alojamientos (tipo Airbnb). Este primer sprint no entrega funcionalidad de negocio visible al usuario final, pero sienta los cimientos técnicos sobre los que se construirá todo lo demás: autenticación, CRUD de alojamientos, reservas, búsqueda avanzada, etc.

Un buen setup inicial evita problemas recurrentes futuros como: claves hardcodeadas, falta de migraciones, configuración frágil, imposibilidad de replicar el proyecto en otra máquina, o falta de historial de cambios en Git.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Crear la carpeta `proyecto/alojamientos/` desde cero.
- Inicializar repositorio Git y conectar con GitHub.
- Crear estructura de carpetas base del proyecto.
- Crear entorno virtual de Python e instalar dependencias iniciales.
- Crear archivo `.env.example` con las variables necesarias.
- Crear archivo `.env` (no versionado) a partir del ejemplo.
- Crear script `scripts/generate_secret.py` para generar `SECRET_KEY`.
- Crear script `scripts/create_db.py` como utilidad de apoyo para crear la base de datos desde la terminal (no es obligatorio usarlo; la BD también puede crearse desde MySQL CLI, phpMyAdmin o DBeaver).
- Crear módulo `app/config.py` con la clase `Config` que carga variables de entorno.
- Crear módulo `app/__init__.py` con el patrón app factory (`crear_app()`).
- Crear archivo `app.py` como punto de entrada.
- Configurar Flask-SQLAlchemy y Flask-Migrate dentro del app factory; ejecutar `flask db init`.
- Crear la base de datos `alojamientos_db` en MySQL.
- Crear endpoint `GET /health` que confirme que la API está operativa.
- Configurar `.gitignore` adecuado.
- Crear `requirements.txt` con las dependencias base.
- Hacer primer commit y push a GitHub.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Modelos de base de datos (usuarios, alojamientos, reservas, etc.)
- Migraciones de esquema (`flask db migrate` / `flask db upgrade`) — se realizarán cuando exista el primer modelo.
- Autenticación ni autorización
- Blueprints ni dominios
- Validación con Marshmallow
- Carga de imágenes
- Rate limiting
- Documentación Swagger/Flasgger
- Tests unitarios ni de integración
- Scripts de seed o datos de prueba
- Despliegue ni Docker
- CI/CD
- Variables de entorno de producción

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener instalado y funcional:

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| Python | 3.11+ | Lenguaje principal |
| MySQL | 8.0+ (o XAMPP) | Servidor de base de datos (debe estar corriendo) |
| Git | 2.x | Control de versiones |
| Cuenta de GitHub | — | Repositorio remoto |
| Editor de código (VS Code recomendado) | — | Edición de archivos |
| Terminal/consola | — | Ejecución de comandos |

**Notas:**
- El servicio MySQL debe estar corriendo y accesible.
- No es necesario tener ninguna base de datos creada todavía; eso se hace dentro del sprint (manualmente o con `scripts/create_db.py`).
- No es necesario tener un usuario especial de MySQL; se puede usar `root` para desarrollo local.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 1 |
|---|---|---|---|
| Flask | 3.x | Framework web | Núcleo de la API |
| Flask-SQLAlchemy | 3.x | Extensión de Flask para ORM | Integra SQLAlchemy con Flask de forma nativa; gestiona el objeto `db` y el ciclo de vida de sesiones |
| Flask-Migrate | 4.x | Migraciones de BD | Se apoya en Flask-SQLAlchemy para gestionar el esquema de BD con Alembic |
| PyMySQL | 1.x | Driver MySQL | Necesario para que Flask-SQLAlchemy conecte a MySQL |
| python-dotenv | 1.x | Carga de `.env` | Variables de entorno seguras |
| Flask-CORS | 6.x | Cross-origin | Infraestructura base, requerida desde el día 1 |
| Werkzeug | 3.x | Utilidades de Flask | Viene con Flask; se usa para hashing de contraseñas en sprints futuros |

**Notas sobre SQLAlchemy:**
Flask-SQLAlchemy incluye **SQLAlchemy** como dependencia transitiva. No es necesario instalarlo por separado. Se menciona SQLAlchemy porque es el motor ORM que usa Flask-SQLAlchemy internamente, pero la dependencia que el estudiante instala y referencia en su código es **Flask-SQLAlchemy**.

**Se excluyen deliberadamente de Sprint 1:**
- **PyJWT** — se instalará en el Sprint 2 (autenticación).
- **pytest** — se instalará en el Sprint 2 (tests de usuarios).

Esto mantiene `requirements.txt` minimalista y evita dependencias fantasma que no se usan todavía.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear carpeta del proyecto | Crear `proyecto/alojamientos/` |
| 2 | Inicializar Git | `git init` dentro de `alojamientos/` |
| 3 | Crear `.gitignore` | Excluir `venv/`, `.env`, `__pycache__/`, `*.sqlite3`, `.pytest_cache/`, `uploads/*` (con excepción de `.gitkeep`) |
| 4 | Crear estructura de carpetas | `app/`, `scripts/`, `tests/`, `uploads/` (con `.gitkeep` dentro), `docs/` |
| 5 | Crear `app/__init__.py` con app factory | Función `crear_app()`: carga `Config`, inicializa `db = SQLAlchemy()` y `migrate = Migrate()` como extensiones de Flask, registra endpoint `/health` |
| 6 | Crear entorno virtual | `python -m venv venv` y activarlo |
| 7 | Crear `requirements.txt` | Con las 8 dependencias base: Flask, Flask-SQLAlchemy, Flask-CORS, Flask-Migrate, PyMySQL, python-dotenv, SQLAlchemy, Werkzeug. **Nota:** SQLAlchemy y Werkzeug son dependencias transitivas de Flask y Flask-SQLAlchemy, pero en la implementación real quedaron declaradas explícitamente en `requirements.txt` para fijar versión y evitar ambigüedades. |
| 8 | Instalar dependencias | `pip install -r requirements.txt` |
| 9 | Crear `.env.example` | Plantilla con `SECRET_KEY=`, `DB_USER=`, `DB_PASSWORD=`, `DB_HOST=`, `DB_PORT=`, `DB_NAME=`, `DB_CHARSET=`, `CORS_ALLOWED_ORIGINS=`, `JWT_EXP_MINUTES=` |
| 10 | Crear `.env` | Copiar desde `.env.example` |
| 11 | Crear `scripts/generate_secret.py` | Script que genera `SECRET_KEY` con `secrets.token_hex(32)` |
| 12 | Ejecutar script y actualizar `.env` | Ejecutar `python scripts/generate_secret.py`, copiar la clave generada al `.env` |
| 13 | Crear `app/config.py` | Clase `Config` que carga `.env`, valida `DB_USER`, `DB_NAME` y `SECRET_KEY`, construye `SQLALCHEMY_DATABASE_URI` a partir de `DB_*`, configura CORS y `BASE_DIR` |
| 14 | Crear `app.py` | Punto de entrada: importa `crear_app()`, corre en `debug=True` |
| 15 | Crear `app/migrate.py` | Re-export del objeto `migrate` inicializado dentro del app factory |
| 16 | Crear base de datos en MySQL | `CREATE DATABASE alojamientos_db;` (desde MySQL CLI, phpMyAdmin, DBeaver, o `scripts/create_db.py`) |
| 17 | Configurar migraciones | Ejecutar `flask db init` para crear la carpeta `migrations/` con la configuración de Alembic |
| 18 | Probar endpoint `/health` | Ejecutar `python app.py` y verificar `GET http://127.0.0.1:5000/health` con status 200 |
| 19 | Primer commit y push | `git add .`, `git commit -m "feat: setup inicial del proyecto alojamientos"`, crear repo en GitHub, `git remote add origin ...`, `git push -u origin main` |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| MySQL no está corriendo | La app no arranca porque no puede conectar a la BD | Verificar el servicio MySQL antes de empezar; usar XAMPP si es necesario |
| `SECRET_KEY` hardcodeada | Vulnerabilidad de seguridad desde el día 1 | Usar siempre `generate_secret.py`; nunca versionar `.env` |
| `.env` subido a Git | Exposición de credenciales | `.gitignore` debe excluir `.env` desde el primer commit |
| Contraseña de MySQL incorrecta en `.env` | Error de conexión al iniciar | Verificar credenciales antes de arrancar; usar `root` sin contraseña solo en desarrollo local |
| Variables `DB_*` incorrectas en `.env` | Flask-SQLAlchemy no puede conectar | Verificar formato correcto: `DB_USER=root`, `DB_HOST=localhost`, `DB_NAME=alojamientos_db` |
| Puerto 5000 ocupado | La app no arranca | Cambiar puerto en `app.py` o liberar el puerto |
| Commit antes de validar | Subir código roto a GitHub | Siempre probar `/health` antes de hacer commit |
| Carpeta `uploads/` vacía no versionada | Error en rutas de archivos futuros | Crear `.gitkeep` dentro de `uploads/` para que Git rastree la carpeta |
| Nombre de BD incorrecto en `.env` | Error de conexión | Verificar que `alojamientos_db` existe y que la URI coincide |
| Flask CLI no encuentra comando `db` | `flask db init` falla | Flask-Migrate debe inicializarse dentro del app factory, no después en `app.py` |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `proyecto/alojamientos/` existe con la estructura de carpetas definida.
- [ ] El repositorio Git está inicializado y conectado a un repositorio remoto en GitHub.
- [ ] Existe un entorno virtual con las dependencias instaladas.
- [ ] Existe `requirements.txt` con las 8 dependencias base: Flask, Flask-SQLAlchemy, Flask-CORS, Flask-Migrate, PyMySQL, python-dotenv, SQLAlchemy, Werkzeug.
- [ ] Existe `.env.example` con las variables `SECRET_KEY`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PORT`, `DB_CHARSET`, `CORS_ALLOWED_ORIGINS`, `JWT_EXP_MINUTES`.
- [ ] Existe `.env` con valores validos y `SECRET_KEY` generada por script.
- [ ] `.env` está excluido en `.gitignore`.
- [ ] `app/config.py` carga y valida las variables de entorno correctamente.
- [ ] `app/__init__.py` implementa el patrón app factory con `crear_app()`, donde `db = SQLAlchemy()` y `migrate = Migrate()` se inicializan como extensiones de Flask.
- [ ] `app.py` es el punto de entrada y arranca la aplicación.
- [ ] `app/migrate.py` existe y re-exporta el objeto `migrate` del factory.
- [ ] La base de datos `alojamientos_db` fue creada en MySQL.
- [ ] `flask db init` se ejecutó y la carpeta `migrations/` existe.
- [ ] El endpoint `GET /health` responde con status 200 y un JSON con `status`, `service` y `version`.
- [ ] Se hizo al menos un commit con mensaje descriptivo.
- [ ] Se hizo push a GitHub exitosamente.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código está versionado en Git con un commit limpio y descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. Cualquier persona que clone el repositorio puede crear el entorno virtual, instalar dependencias, crear la BD, ejecutar `flask db init`, lanzar `python app.py` y obtener respuesta válida de `GET /health`.
4. No hay errores en consola al iniciar la app.
5. `.env` no está versionado.
6. La estructura de carpetas es clara y coherente con la convención del proyecto.
7. El sistema de migraciones está inicializado (`migrations/` existe) y listo para generar la primera migración real en el sprint que se cree el primer modelo, usando Flask-Migrate respaldado por Flask-SQLAlchemy.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| Código fuente | Estructura base con app factory (`crear_app`), configuración (`Config`), punto de entrada (`app.py`) y endpoint `/health` |
| `.gitignore` | Configurado para excluir archivos sensibles y caches |
| `.env.example` | Plantilla de variables de entorno |
| `scripts/generate_secret.py` | Script para generar `SECRET_KEY` |
| `scripts/create_db.py` | Utilidad de apoyo para crear la base de datos `alojamientos_db` desde la terminal. Lee variables `DB_*` |
| `requirements.txt` | Dependencias base: Flask, Flask-SQLAlchemy, Flask-CORS, Flask-Migrate, PyMySQL, python-dotenv, SQLAlchemy, Werkzeug |
| `migrations/` | Carpeta de migraciones creada con `flask db init` (sin migraciones de modelo todavía) |
| Repositorio Git | Historial con al menos un commit funcional |
| Repositorio GitHub | Código subido al remoto |

---

## 13. Estado

**✅ Completado** — Implementado, validado y subido a GitHub.

- Endpoint `/health` responde 200 con `{"status": "ok", "service": "alojamientos-api", "version": "v1"}`.
- Base de datos `alojamientos_db` creada.
- Migraciones inicializadas con `flask db init`.
- Primer commit realizado: `ae12eca feat: setup inicial del proyecto alojamientos`.
- Push a `origin/main` exitoso en `https://github.com/meet8polisura/api-alojamientos.git`.

---

## 14. Mejora opcional: calidad de codigo

> **Esta seccion es opcional.** No forma parte de los 5 sprints obligatorios. Es una mejora que puedes aplicar cuando te sientas comodo con el flujo basico.

El proyecto incluye `requirements-dev.txt` con dos herramientas opcionales:

| Herramienta | Para que sirve |
|-------------|---------------|
| **Black** | Formateador automatico. Todo el codigo Python queda con estilo consistente. |
| **Ruff** | Linter rapido. Detecta imports desordenados, variables no usadas, sintaxis obsoleta y patrones sospechosos. |

### Como usarlas

```bash
pip install -r requirements-dev.txt

black .              # Formatear todo
ruff check .         # Revisar calidad (sin corregir)
ruff check . --fix   # Corregir automatico lo posible
```

Estas herramientas **no agregan funcionalidad** al proyecto, pero mejoran legibilidad y disciplina de ingenieria. Son un buen primer paso hacia practicas profesionales de desarrollo.
