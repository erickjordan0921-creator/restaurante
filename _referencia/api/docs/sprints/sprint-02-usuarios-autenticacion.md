# Sprint 2 — Usuarios y autenticación

---

## 1. Nombre del sprint

**Sprint 2 — Usuarios y autenticación**

---

## 2. Objetivo del sprint

Construir el dominio de usuarios del proyecto **alojamientos**: crear los primeros modelos de base de datos (`Usuario` y `PerfilUsuario`), generar la primera migración real con Flask-Migrate, implementar registro de usuarios con hash de contraseñas, login con generación de tokens JWT, protección de rutas mediante decorador, y endpoints de consulta y actualización parcial del perfil.

Al final del sprint, un usuario podrá registrarse, iniciar sesión, obtener su perfil y actualizarlo. Las rutas protegidas requerirán un token JWT válido con expiración configurable (ya definida en Sprint 1 como `JWT_EXP_MINUTES`).

---

## 3. Contexto de negocio

En una plataforma de alquiler de alojamientos, el usuario es la entidad central: todo lo demás (alojamientos, reservas, reseñas) se relaciona con él.

El Sprint 2 entrega el primer bloque funcional real del sistema:

1. **Registro**: un visitante crea su cuenta con correo y contraseña.
2. **Login**: el usuario autentica sus credenciales y recibe un token JWT.
3. **Perfil**: el usuario consulta y actualiza su perfil (nombre, apellido, teléfono).
4. **Protección**: los endpoints sensibles verifican el token JWT antes de responder.

Este es el cimiento sobre el que se construirá todo lo demás: en Sprint 3 se añadirán roles y autorización avanzada, en Sprint 4 el CRUD de alojamientos, y así sucesivamente.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Añadir nuevas dependencias a `requirements.txt`: PyJWT, marshmallow, pytest.
- Instalar las nuevas dependencias.
- Crear la estructura del dominio de usuarios bajo `app/dominios/usuarios/`:
  - `modelos.py` — Modelo `Usuario` (id, correo, contraseña hasheada, fecha de creación, rol con valor por defecto `'usuario'`) y modelo `PerfilUsuario` (id, nombre, apellido, teléfono, relación one-to-one con Usuario). **Nota:** el campo `rol` se almacena con valor por defecto pero NO se utiliza para autorización en este sprint; su uso efectivo corresponde al Sprint 3.
  - `dtos.py` — Esquemas Marshmallow para validar las entradas de registro (`correo`, `contrasena`) y actualización de perfil (`nombre`, `apellido`, `telefono`).
  - `repositorios.py` — Capa de acceso a datos: guardar, buscar por correo, buscar por ID, guardar perfil.
  - `servicios.py` — Lógica de negocio: registrar usuario (con verificación de duplicados y hash de contraseña), login (con validación de credenciales y generación de JWT usando `JWT_EXP_MINUTES` ya configurado en Sprint 1), obtener perfil, actualizar perfil.
  - `controladores.py` — Blueprint Flask con los endpoints: `POST /api/v1/usuarios/registro`, `POST /api/v1/usuarios/login`, `GET /api/v1/usuarios/perfil`, `PATCH /api/v1/usuarios/perfil`.
- Crear `app/seguridad.py` — Decorador `requiere_token` que extrae y valida el JWT del header `Authorization` e inyecta el `usuario_id` en la función decorada.
- Registrar el blueprint de usuarios en el app factory (`app/__init__.py`).
- Registrar los manejadores de error de dominio en el app factory.
- Generar la **primera migración real**: `flask db migrate -m "crear tablas usuarios y perfiles"` y aplicarla con `flask db upgrade`.
- Crear pruebas de integración con pytest para el dominio de usuarios: registro, login, perfil protegido y actualización parcial de perfil.
- Configurar `conftest.py` y `pytest.ini` para el entorno de pruebas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Roles ni autorización por rol (admin vs usuario) — se verá en Sprint 3. El campo `rol` existe en el modelo pero no se usa para controlar acceso en este sprint.
- Endpoint de logout — queda completamente fuera de alcance en Sprint 2. Un logout real requiere revocación/blacklist de tokens (Nivel 2), y un logout "fake" sin invalidación real sería confuso y didácticamente pobre. Se pospone al sprint donde se implemente la gestión de tokens de forma completa.
- Refresh tokens ni rotación de tokens — quedan fuera del alcance base (Nivel 2).
- Revocación o blacklist de tokens — queda fuera del alcance base (Nivel 2).
- Rate limiting — queda fuera del alcance base (Nivel 2).
- Alojamientos, reservas, comodidades, imágenes, búsqueda avanzada, soft delete — sprints posteriores.
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Despliegue, Docker, CI/CD — fuera del alcance base.
- Tests de cobertura avanzada — los tests de este sprint cubren registro, login, perfil protegido y actualización parcial de perfil (11 tests en total). No se incluyen tests E2E ni cobertura exhaustiva de casos borde.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- El Sprint 1 completado y funcionando en `proyecto/alojamientos/`.
- El repositorio Git con al menos un commit del Sprint 1.
- Entorno virtual activo.
- MySQL corriendo con la base de datos `alojamientos_db` creada.
- El endpoint `GET /health` respondiendo correctamente.
- Flask-Migrate inicializado (`migrations/` existe).
- `.env` y `.env.example` configurados con variables `DB_*` y `JWT_EXP_MINUTES` (todo esto se hizo en Sprint 1).

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 2 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada en Sprint 1 |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada en Sprint 1 |
| Flask-Migrate | 4.x | Migraciones | Ya instalada en Sprint 1 |
| Flask-CORS | 6.x | Cross-origin | Ya instalada en Sprint 1 |
| PyJWT | 2.x | Generación y validación de JWT | **Nueva en Sprint 2** — necesaria para autenticación sin estado |
| Werkzeug | 3.x | Utilidades de Flask | Ya instalada en Sprint 1 — se usa `generate_password_hash` y `check_password_hash` para contraseñas |
| marshmallow | 3.x | Validación de datos de entrada (DTOs) | **Nueva en Sprint 2** — valida que correo sea email válido y contraseña tenga longitud mínima |
| pytest | 9.x | Framework de pruebas | **Nueva en Sprint 2** — pruebas de integración del dominio de usuarios |
| PyMySQL | 1.x | Driver MySQL | Ya instalada en Sprint 1 |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada en Sprint 1 |

**Nuevas dependencias a añadir a `requirements.txt`:**
- `PyJWT==2.10.1`
- `marshmallow==3.23.2`
- `pytest==9.0.3`

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Actualizar `requirements.txt` | Añadir PyJWT, marshmallow, pytest a las dependencias existentes |
| 2 | Instalar nuevas dependencias | `pip install -r requirements.txt` con las nuevas entradas |
| 3 | Crear estructura del dominio | `app/dominios/usuarios/` con `__init__.py` vacío |
| 4 | Crear `modelos.py` | Modelo `Usuario` (id, correo, contrasena, fecha_creacion, rol default `'usuario'`) y `PerfilUsuario` (id, nombre, apellido, telefono, usuario_id one-to-one). `rol` se almacena pero no se usa para autorización en este sprint. |
| 5 | Crear `dtos.py` | Esquemas Marshmallow: `RegistroUsuarioDTO` (correo email requerido, contrasena string min 6) y `ActualizarPerfilDTO` (nombre, apellido, telefono opcionales) |
| 6 | Crear `repositorios.py` | Clase `UsuarioRepositorio` con métodos: guardar_usuario, obtener_por_correo, obtener_por_id, obtener_perfil_por_usuario_id, guardar_perfil |
| 7 | Crear `servicios.py` | Clase `UsuarioServicio` con métodos: registrar_usuario (verifica duplicado, hashea contraseña), iniciar_sesion (valida credenciales, genera JWT con expiración basada en `JWT_EXP_MINUTES` ya configurado), obtener perfil, actualizar perfil. Funciones auxiliares para generación de JWT |
| 8 | Crear `app/seguridad.py` | Decorador `requiere_token`: extrae Bearer token del header, decodifica JWT con SECRET_KEY, valida expiración, inyecta `usuario_id` |
| 9 | Crear `controladores.py` | Blueprint `usuarios_bp` con rutas: POST `/registro`, POST `/login`, GET `/perfil`, PATCH `/perfil`. Validar DTOs antes de llamar servicio |
| 10 | Registrar blueprint en app factory | Importar y registrar `usuarios_bp` en `app/__init__.py` con `url_prefix='/api/v1/usuarios'` |
| 11 | Registrar manejadores de error | En `app/__init__.py`, mapear excepciones de dominio (CorreoYaRegistradoError, CredencialesInvalidasError, UsuarioNoEncontradoError) a respuestas HTTP |
| 12 | Crear primera migración | `flask db migrate -m "crear tablas usuarios y perfiles"` y aplicar con `flask db upgrade` |
| 13 | Crear `pytest.ini` | Configuración base para pytest |
| 14 | Crear `tests/conftest.py` | Fixtures: app de prueba con SQLite en memoria, cliente HTTP, fixture de usuario autenticado |
| 15 | Crear `tests/test_usuarios.py` | 11 tests de integración: registro exitoso, email duplicado, contraseña corta, email inválido, login exitoso, credenciales inválidas, usuario no existente, perfil sin token, perfil con token, actualización de perfil, actualización parcial |
| 16 | Ejecutar pruebas | `pytest tests/` y verificar que todas pasan |
| 17 | Commit y push | `git add .`, `git commit -m "feat: dominio usuarios con registro, login JWT y perfil"`, `git push` |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Contraseñas almacenadas en texto plano | Vulnerabilidad crítica de seguridad | Usar siempre `generate_password_hash` de Werkzeug para hashear y `check_password_hash` para validar |
| Tokens JWT con expiración incorrecta | Token dura demasiado o muy poco | La variable `JWT_EXP_MINUTES` ya está configurada en `.env` desde Sprint 1. Validar que el servicio lee esta variable y calcula bien el `exp` del JWT |
| Email duplicado registrado | Dos usuarios con mismo correo | Verificar existencia en repositorio antes de crear; lanzar `CorreoYaRegistradoError` |
| Primera migración falla | `flask db migrate` detecta cambios incorrectamente | Verificar que los modelos importan correctamente y que `db` es el mismo objeto del factory |
| Decorador `requiere_token` mal implementado | Rutas protegidas accesibles sin token o rutas públicas bloqueadas | Validar que el header `Authorization` existe, que el token se decodifica correctamente, y que la expiración se verifica |
| marshmallow no rechaza datos inválidos | Datos corruptos llegan al servicio | Validar DTO antes de pasar al servicio; retornar 400 con detalles si falla |
| Tests con MySQL en lugar de SQLite | Tests lentos o dependientes de entorno | Usar SQLite en memoria (`sqlite:///:memory:`) para tests, configurando `FLASK_TESTING=true` |
| Modelo PerfilUsuario sin relación correcta | Error de clave foránea o datos huérfanos | Usar `db.relationship` con `backref` y `uselist=False` para relación one-to-one |
| Blueprint no registrado en el factory | Endpoints 404 | Verificar `app.register_blueprint(usuarios_bp, url_prefix='/api/v1/usuarios')` en `crear_app()` |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] PyJWT, marshmallow y pytest están instalados y aparecen en `requirements.txt`.
- [ ] La carpeta `app/dominios/usuarios/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Usuario` tiene campos: id, correo (único), contrasena (hasheada), fecha_creacion, rol (default `'usuario'`, no usado para autorización en este sprint).
- [ ] El modelo `PerfilUsuario` tiene campos: id, nombre, apellido, telefono, usuario_id (one-to-one con Usuario).
- [ ] Los DTOs Marshmallow validan: correo como email requerido, contraseña con mínimo 6 caracteres, campos de perfil opcionales.
- [ ] El repositorio implementa: guardar, buscar por correo, buscar por ID, operaciones de perfil.
- [ ] El servicio implementa: registro (con verificación de duplicado y hash), login (con validación y generación JWT usando `JWT_EXP_MINUTES`), obtener perfil, actualizar perfil.
- [ ] El decorador `requiere_token` en `app/seguridad.py` valida JWT correctamente e inyecta `usuario_id`.
- [ ] El blueprint `usuarios_bp` está registrado en el app factory con prefijo `/api/v1/usuarios`.
- [ ] Los manejadores de error de dominio están registrados en el app factory.
- [ ] La primera migración fue generada con `flask db migrate` y aplicada con `flask db upgrade`.
- [ ] `POST /api/v1/usuarios/registro` crea un usuario y responde 201.
- [ ] `POST /api/v1/usuarios/registro` rechaza email duplicado con 400.
- [ ] `POST /api/v1/usuarios/login` devuelve un token JWT válido con 200.
- [ ] `POST /api/v1/usuarios/login` rechaza credenciales inválidas con 401.
- [ ] `GET /api/v1/usuarios/perfil` sin token responde 401.
- [ ] `GET /api/v1/usuarios/perfil` con token válido responde 200 con datos del perfil.
- [ ] `PATCH /api/v1/usuarios/perfil` actualiza parcialmente el perfil con 200.
- [ ] Las pruebas con pytest existen y pasan al ejecutar `pytest tests/`.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código del dominio de usuarios está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. La primera migración real fue generada y aplicada exitosamente (`flask db upgrade` funciona sin errores).
4. Los endpoints de registro, login, perfil y actualización de perfil responden correctamente según los criterios de aceptación.
5. Las contraseñas se almacenan hasheadas (no en texto plano).
6. Los tokens JWT tienen expiración configurable vía `JWT_EXP_MINUTES` (configurada en Sprint 1) y se validan correctamente.
7. El decorador `requiere_token` protege las rutas de perfil.
8. Las pruebas de integración pasan con `pytest`.
9. No hay errores en consola al registrar un usuario ni al hacer login.
10. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/usuarios/modelos.py` | Modelos SQLAlchemy: Usuario y PerfilUsuario |
| `app/dominios/usuarios/dtos.py` | Esquemas Marshmallow: RegistroUsuarioDTO, ActualizarPerfilDTO |
| `app/dominios/usuarios/repositorios.py` | Clase UsuarioRepositorio con operaciones CRUD |
| `app/dominios/usuarios/servicios.py` | Clase UsuarioServicio con lógica de negocio + generación JWT |
| `app/dominios/usuarios/controladores.py` | Blueprint Flask con endpoints de registro, login y perfil |
| `app/seguridad.py` | Decorador `requiere_token` para protección JWT |
| `requirements.txt` | Actualizado con PyJWT, marshmallow, pytest |
| `migrations/versions/fc96811ac078_crear_tablas_usuarios_y_perfiles.py` | Primera migración real: tablas usuarios y perfiles |
| `tests/conftest.py` | Fixtures de pytest para tests de usuarios |
| `tests/test_usuarios.py` | 11 tests de integración: registro (4), login (3), perfil (4) |
| `pytest.ini` | Configuración de pytest |
| Repositorio Git y GitHub | Commit descriptivo y push al remoto |

---

## 13. Estado

**✅ Completado** — Implementado, validado y subido a GitHub.

- 11 tests de integración pasando (registro, login, perfil protegido y actualización parcial).
- Migración `fc96811ac078` generada y aplicada: tablas `usuarios` y `perfiles` creadas en MySQL.
- Los 4 endpoints (`/registro`, `/login`, `/perfil` GET/PATCH) responden correctamente según los criterios de aceptación.

### Nota técnica

Durante la implementación se detectó que PyJWT 2.x exige que el claim `sub` del token sea un **string**, no un integer. Sin esta conversión (`str(usuario.id)`), el decorador `requiere_token` rechazaba tokens aparentemente válidos. Este ajuste quedó incorporado en la función `_generar_access_token` del servicio de usuarios.
