# Sprint 4 — Alojamientos

---

## 1. Nombre del sprint

**Sprint 4 — Alojamientos**

---

## 2. Objetivo del sprint

Construir el dominio de alojamientos del proyecto **alojamientos**: crear el modelo `Alojamiento` con sus campos base, generar la migracion correspondiente, implementar la arquitectura completa del dominio (DTOs, repositorio, servicio, controladores) con un CRUD funcional, establecer la relacion de propiedad con `Usuario`, aplicar reglas de autorizacion (el propietario edita/elimina lo suyo, admin puede gestionar todo), y anadir pruebas de integracion del nuevo dominio.

Al final del sprint, un usuario autenticado podra crear, ver, editar y eliminar sus propios alojamientos. Cualquier visitante (autenticado o no) podra listar y ver el detalle de todos los alojamientos del sistema. Un administrador podra editar y eliminar cualquier alojamiento, sea o no suyo.

---

## 3. Contexto de negocio

El alojamiento es el recurso central de la plataforma. Todo lo demas (reservas, resenas, comodidades, imagenes) gira en torno a el.

Hasta Sprint 3 el estudiante ya tiene:
- La base tecnica del proyecto (app factory, config, migraciones).
- El dominio de usuarios con registro, login, perfil y autorizacion por rol.
- Un endpoint administrativo basico (`GET /api/v1/admin/usuarios`).

Ahora el paso natural es introducir el **primer dominio de negocio fuerte**: alojamientos. Este sprint ensena al estudiante como se estructura un recurso completo en una API REST: modelo, validacion, repositorio, servicio, controladores con blueprint, migracion, y pruebas.

La autorizacion se vuelve mas interesante aqui: no basta con estar autenticado; hay que verificar que el usuario es el **propietario** del alojamiento para editarlo o eliminarlo.

---

## 4. Alcance del sprint

Lo que **SI** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/alojamientos/`:
  - `__init__.py` (paquete vacio).
  - `modelos.py` — Modelo `Alojamiento` con campos:
    - `id` (integer, primary key)
    - `titulo` (string 200, not null)
    - `descripcion` (text, not null)
    - `precio_noche` (numeric 10,2 — dinero, not null)
    - `ciudad` (string 100, not null)
    - `usuario_id` (integer, FK a `usuarios.id`, not null)
    - `fecha_creacion` (datetime, default now)
    - Relacion `usuario` con `Usuario` (many-to-one, lazy).
  - `dtos.py` — Esquema Marshmallow `CrearAlojamientoDTO` con validacion: `titulo` (string, requerido), `descripcion` (string, requerido), `precio_noche` (decimal, requerido, > 0), `ciudad` (string, requerido). Esquema `ActualizarAlojamientoDTO` con los mismos campos opcionales.
  - `repositorios.py` — Clase `AlojamientoRepositorio` con metodos: `guardar`, `obtener_por_id`, `obtener_todos`, `obtener_por_usuario_id`, `eliminar`.
  - `servicios.py` — Clase `AlojamientoServicio` con metodos: `crear_alojamiento` (asigna `usuario_id` del autenticado), `listar_todos` (publico), `obtener_detalle` (publico), `actualizar_alojamiento` (verifica que el usuario sea el propietario o admin), `eliminar_alojamiento` (verifica que el usuario sea el propietario o admin).
    - Excepciones de dominio: `AlojamientoNoEncontradoError`, `PermisoDenegadoError` (reutilizada del dominio de usuarios).
  - `controladores.py` — Blueprint `alojamientos_bp` con endpoints:
    - `POST /api/v1/alojamientos` — crear alojamiento (requiere autenticacion).
    - `GET /api/v1/alojamientos` — listar todos los alojamientos (publico, sin auth).
    - `GET /api/v1/alojamientos/<id>` — ver detalle de un alojamiento (publico, sin auth).
    - `PATCH /api/v1/alojamientos/<id>` — actualizar parcialmente (requiere autenticacion + ser propietario o admin).
    - `DELETE /api/v1/alojamientos/<id>` — eliminar alojamiento (requiere autenticacion + ser propietario o admin).
- Generar la migracion con `flask db migrate -m "crear tabla alojamientos"` y aplicarla con `flask db upgrade`.
- Registrar el blueprint `alojamientos_bp` en el app factory (`app/__init__.py`) con prefijo `/api/v1/alojamientos`.
- Registrar los manejadores de error de dominio (`AlojamientoNoEncontradoError`) en el app factory.
- Crear `tests/test_alojamientos.py` con 11 pruebas de integracion:
  - Crear alojamiento con usuario autenticado → 201.
  - Crear alojamiento sin token → 401.
  - Listar alojamientos sin auth → 200 (publico).
  - Ver detalle sin auth → 200 (publico).
  - Detalle inexistente → 404.
  - Actualizar alojamiento ajeno con usuario normal → 403.
  - Eliminar alojamiento ajeno con usuario normal → 403.
  - Actualizar alojamiento propio → 200.
  - Eliminar alojamiento propio → 204.
  - Admin actualiza alojamiento ajeno → 200.
  - Admin elimina alojamiento ajeno → 204.
- Ejecutar toda la suite de pruebas existente (14 de Sprint 2+3) mas las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Comodidades con relacion N:M — se vera en el Sprint 5.
- Carga de imagenes — se vera en un sprint posterior.
- Busqueda avanzada ni filtros — se vera en un sprint posterior.
- Reservas — se vera en un sprint posterior.
- Soft delete — se vera en un sprint posterior.
- Auditoria de acciones — fuera del alcance base (Nivel 2).
- Paginacion en listados — se anadira en un sprint posterior.
- Documentacion Swagger/Flasgger — se anadira en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.
- Gestion de permisos granulares ni RBAC complejo — ya cubierto en Sprint 3 con roles usuario/admin.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 3 completado y funcionando: usuarios, autenticacion JWT, autorizacion con `requiere_admin`, endpoint admin, tests pasando (14).
- Repositorio Git actualizado con todos los commits de Sprints 1-3.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un usuario registrado para pruebas manuales.

---

## 7. Herramientas y tecnologias usadas

| Tecnologia | Version | Uso | Justificacion en Sprint 4 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `Alojamiento` |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migracion para alojamientos |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — proteccion de rutas de alojamiento |
| Werkzeug | 3.x | Utilidades | Ya instalada |
| marshmallow | 3.x | Validacion de DTOs | Ya instalada — validacion de entrada de alojamientos |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de alojamientos |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se anaden nuevas dependencias.** El Sprint 4 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/alojamientos/` con `__init__.py` vacio |
| 2 | Crear `modelos.py` | Modelo `Alojamiento`: id, titulo, descripcion, precio_noche, ciudad, usuario_id (FK a usuarios), fecha_creacion. Relacion `usuario` con backref a `Usuario`. |
| 3 | Crear `dtos.py` | `CrearAlojamientoDTO` (titulo requerido, descripcion requerida, precio_noche > 0 requerido, ciudad requerida). `ActualizarAlojamientoDTO` (mismos campos opcionales). |
| 4 | Crear `repositorios.py` | Clase `AlojamientoRepositorio`: guardar, obtener_por_id, obtener_todos, obtener_por_usuario_id, eliminar. |
| 5 | Crear `servicios.py` | Clase `AlojamientoServicio`: crear_alojamiento (asigna usuario_id del autenticado), listar_todos, obtener_detalle, actualizar_alojamiento (verifica propietario o admin), eliminar_alojamiento (verifica propietario o admin). Excepciones: `AlojamientoNoEncontradoError`. Reutiliza `PermisoDenegadoError` del dominio de usuarios. |
| 6 | Crear `controladores.py` | Blueprint `alojamientos_bp` con 5 endpoints: POST crear, GET listar, GET detalle, PATCH actualizar, DELETE eliminar. Validar DTOs antes de llamar servicio. |
| 7 | Registrar blueprint en app factory | Importar y registrar `alojamientos_bp` en `app/__init__.py` con `url_prefix='/api/v1/alojamientos'`. |
| 8 | Registrar error handlers de dominio | En `app/__init__.py`, mapear `AlojamientoNoEncontradoError` → 404. |
| 9 | Generar migracion | `flask db migrate -m "crear tabla alojamientos"`. |
| 10 | Aplicar migracion | `flask db upgrade`. |
| 11 | Crear `tests/test_alojamientos.py` | 11 tests: crear con auth (201), crear sin token (401), listar publico (200), detalle publico (200), detalle inexistente (404), actualizar ajeno normal (403), eliminar ajeno normal (403), actualizar propio (200), eliminar propio (204), admin actualiza ajeno (200), admin elimina ajeno (204). |
| 12 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 14 pruebas existentes mas las nuevas pasan. |
| 13 | Commit y push | `git add .`, `git commit -m "feat: dominio alojamientos con CRUD base y autorizacion por propietario"`, `git push`. |

---

## 9. Riesgos o puntos de atencion

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Confusion entre autenticacion y autorizacion | El estudiante puede pensar que `requiere_token` basta para editar/eliminar | Dejar clara la diferencia: `requiere_token` verifica identidad; la verificacion de propietario o admin se hace en el servicio comparando `usuario_id` del token con `alojamiento.usuario_id` y consultando el rol |
| `PermisoDenegadoError` no se importa correctamente | Import circular entre dominios | Importar desde `app.dominios.usuarios.servicios` dentro del servicio de alojamientos. Es una dependencia unidireccional: alojamientos depende de usuarios, no al reves. |
| La migracion no detecta el nuevo modelo | Flask-Migrate no reconoce el modelo | Verificar que `Alojamiento` importa `db` desde `app` (el mismo objeto del factory). |
| DTO no valida `precio_noche > 0` | Se permiten precios negativos o cero | Usar `validate.Range(min=0.01, min_inclusive=True)` en el campo `precio_noche` de `CrearAlojamientoDTO`. |
| Tests fragiles por dependencia entre si | Un test falla porque otro dejo estado | Cada test debe crear su propio alojamiento y su propio usuario auth. Usar fixtures con datos unicos (uuid). |
| Relacion `usuario` en `Alojamiento` causa import circular | Modelo de alojamiento importa Usuario y viceversa | Usar string `'Usuario'` en la relacion en lugar de importar la clase directamente, o definir la relacion en `Usuario` con backref desde `Alojamiento`. |
| DELETE sin codigo 204 | Flask devuelve 200 por defecto | Devolver explicitamente `('', 204)` o `jsonify(...), 204` en el endpoint de eliminacion. |

---

## 10. Criterios de aceptacion

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/alojamientos/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Alojamiento` tiene campos: id, titulo, descripcion, precio_noche, ciudad, usuario_id (FK a usuarios), fecha_creacion.
- [ ] La relacion entre `Alojamiento` y `Usuario` esta configurada correctamente (un usuario tiene muchos alojamientos).
- [ ] Los DTOs validan: campos requeridos para crear, campos opcionales para actualizar, `precio_noche > 0`.
- [ ] El repositorio implementa: guardar, obtener_por_id, obtener_todos, obtener_por_usuario_id, eliminar.
- [ ] El servicio implementa: crear (asigna usuario_id del autenticado), listar (publico), detalle (publico), actualizar (verifica propietario o admin), eliminar (verifica propietario o admin).
- [ ] El blueprint `alojamientos_bp` esta registrado con prefijo `/api/v1/alojamientos`.
- [ ] El manejador de error `AlojamientoNoEncontradoError` esta registrado en `app/__init__.py` → 404.
- [ ] La migracion fue generada con `flask db migrate` y aplicada con `flask db upgrade`.
- [ ] `POST /api/v1/alojamientos` crea un alojamiento y responde 201 con usuario autenticado.
- [ ] `POST /api/v1/alojamientos` sin token responde 401.
- [ ] `GET /api/v1/alojamientos` sin token responde 200 con lista de todos los alojamientos.
- [ ] `GET /api/v1/alojamientos/<id>` sin token responde 200 con detalle.
- [ ] `GET /api/v1/alojamientos/<id>` inexistente responde 404.
- [ ] `PATCH /api/v1/alojamientos/<id>` con usuario normal ajeno responde 403.
- [ ] `DELETE /api/v1/alojamientos/<id>` con usuario normal ajeno responde 403.
- [ ] `PATCH /api/v1/alojamientos/<id>` con propietario responde 200.
- [ ] `DELETE /api/v1/alojamientos/<id>` con propietario responde 204.
- [ ] `PATCH /api/v1/alojamientos/<id>` con admin sobre alojamiento ajeno responde 200.
- [ ] `DELETE /api/v1/alojamientos/<id>` con admin sobre alojamiento ajeno responde 204.
- [ ] Los tests de alojamientos existen y pasan.
- [ ] Las 14 pruebas existentes de Sprints 2+3 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el codigo del dominio de alojamientos esta versionado en Git con un commit descriptivo.
2. El codigo esta subido al repositorio remoto de GitHub.
3. La migracion de alojamientos fue generada y aplicada exitosamente.
4. Los 5 endpoints de alojamientos responden correctamente segun los criterios de aceptacion.
5. La autorizacion por propietario funciona: un usuario normal no puede editar ni eliminar alojamientos ajenos.
6. Un admin puede editar y eliminar cualquier alojamiento, sea o no suyo (coherente con Sprint 3).
7. Los 11 nuevos tests de alojamientos pasan junto con las 14 pruebas existentes de Sprints 2+3.
8. No hay errores en consola al crear, listar, ver, editar ni eliminar alojamientos.
9. La relacion entre `Alojamiento` y `Usuario` es correcta (sin import circular).
10. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripcion |
|---|---|
| `app/dominios/alojamientos/modelos.py` | Modelo `Alojamiento` con relacion a `Usuario` |
| `app/dominios/alojamientos/dtos.py` | DTOs: `CrearAlojamientoDTO`, `ActualizarAlojamientoDTO` |
| `app/dominios/alojamientos/repositorios.py` | Clase `AlojamientoRepositorio` con operaciones CRUD |
| `app/dominios/alojamientos/servicios.py` | Clase `AlojamientoServicio` con logica de negocio + verificacion de propietario o admin |
| `app/dominios/alojamientos/controladores.py` | Blueprint `alojamientos_bp` con 5 endpoints |
| `app/__init__.py` (actualizado) | Registro de `alojamientos_bp`, error handler de `AlojamientoNoEncontradoError` |
| `migrations/versions/<hash>_crear_tabla_alojamientos.py` | Migracion real: tabla alojamientos |
| `tests/test_alojamientos.py` | 11 tests de integracion: crear con/sin auth, listar, detalle, actualizacion/eliminacion propia, ajena (403) y admin sobre ajeno (200/204) |
| Repositorio Git y GitHub | Commit descriptivo y push al remoto |

---

## 13. Estado

**✅ Completado** — Implementado, validado y subido a GitHub.

- Modelo `Alojamiento` con relacion a `Usuario` y campo `precio_noche` como `Numeric(10, 2)` para precision monetaria.
- Migracion `65db71a03565` generada y aplicada: tabla `alojamientos` con FK a `usuarios`.
- 5 endpoints CRUD operativos: POST crear (auth), GET listar (publico), GET detalle (publico), PATCH actualizar (propietario o admin), DELETE eliminar (propietario o admin, 204).
- Autorizacion por propietario funcionando: logica de "propietario o admin" concentrada en `AlojamientoServicio`.
- 11 tests de integracion pasando. Total 25 tests (14 anteriores + 11 nuevos).
