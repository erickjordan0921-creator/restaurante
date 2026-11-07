# Sprint 5 — Comodidades

---

## 1. Nombre del sprint

**Sprint 5 — Comodidades**

---

## 2. Objetivo del sprint

Introducir el concepto de **relacion muchos a muchos (N:M)** en el proyecto: crear el recurso `Comodidad` (catalogo global de amenities), modelar la relacion N:M entre `Alojamiento` y `Comodidad` mediante una tabla de asociacion, generar la migracion correspondiente, e implementar los endpoints necesarios para listar comodidades, crearlas (solo admin) y asignar la lista de comodidades de un alojamiento. Anadir pruebas de integracion del nuevo dominio y su relacion.

Al final del sprint, el estudiante comprendera como se modela y gestiona una relacion N:M en una API REST con Flask y SQLAlchemy.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, cada alojamiento ofrece un conjunto de comodidades (wifi, estacionamiento, piscina, cocina, etc.). Una comodidad puede pertenecer a muchos alojamientos, y un alojamiento puede tener muchas comodidades. Esta es una relacion clasica **muchos a muchos**.

Hasta Sprint 4 el estudiante ya sabe construir un dominio completo con autorizacion. El paso natural es anadir un recurso relacionado que requiere un patron de modelado diferente: la relacion N:M.

Este sprint ensena:
- modelar una relacion N:M con tabla intermedia en SQLAlchemy.
- crear un catalogo global de recursos (`Comodidad`).
- gestionar la asignacion de recursos relacionados desde el dominio que los posee (`Alojamiento`).
- validar que los IDs relacionados existen antes de asignar.

---

## 4. Alcance del sprint

Lo que **SI** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/comodidades/`:
  - `__init__.py` (paquete vacio).
  - `modelos.py` — Modelo `Comodidad` con campos:
    - `id` (integer, primary key).
    - `nombre` (string 100, unique, not null).
    - Relacion N:M con `Alojamiento` mediante tabla de asociacion `alojamiento_comodidad` (solo columnas: `alojamiento_id`, `comodidad_id`, primary key compuesta). Se usa `db.Table` con `secondary=` en la relacion.
  - `dtos.py` — Esquema `CrearComodidadDTO` (`nombre` string requerido, min 1). Esquema `AsignarComodidadesDTO` (`comodidades_ids` lista de integers requerida; puede contener una lista vacia para dejar el alojamiento sin comodidades).
  - `repositorios.py` — Clase `ComodidadRepositorio` con metodos: `guardar`, `obtener_por_id`, `obtener_todos`, `obtener_por_ids` (recibe lista de IDs y devuelve las comodidades que existen).
  - `servicios.py` — Clase `ComodidadServicio` con metodos: `crear_comodidad` (solo admin), `listar_todos` (publico), `obtener_detalle` (publico).
    - Excepciones: `ComodidadNoEncontradaError`, `ComodidadYaExisteError`.
- Actualizar el dominio de alojamientos para gestionar la relacion:
  - Ampliar `AlojamientoServicio` con metodo `asignar_comodidades(alojamiento_id, usuario_id, comodidad_ids)`:
    - Verifica que el alojamiento existe.
    - Verifica que el usuario es propietario o admin.
    - Verifica que todas las `comodidad_ids` existen mediante `ComodidadRepositorio.obtener_por_ids`; lanza `ComodidadesInvalidasError` (definida en `app/dominios/alojamientos/servicios.py`) si falta alguna.
    - Reemplaza la lista completa de comodidades del alojamiento con las indicadas.
  - Ampliar `AlojamientoRepositorio` con metodo `obtener_por_id_con_comodidades` que carga el alojamiento con sus comodidades asignadas (eager loading).
  - Anadir endpoint en `alojamientos/controladores.py`:
    - `PATCH /api/v1/alojamientos/<id>/comodidades` — reemplaza la lista completa de comodidades del alojamiento (requiere autenticacion + ser propietario o admin). Recibe `{"comodidades_ids": [1, 3, 5]}` o `{"comodidades_ids": []}` para dejar sin comodidades.
  - Actualizar la respuesta de `GET /api/v1/alojamientos/<id>` para que incluya las comodidades asignadas en el detalle del alojamiento.
- Anadir blueprint `comodidades_bp` con endpoints:
  - `POST /api/v1/comodidades` — crear comodidad (solo admin).
  - `GET /api/v1/comodidades` — listar todas las comodidades (publico).
  - `GET /api/v1/comodidades/<id>` — ver detalle de una comodidad (publico).
- Generar la migracion con `flask db migrate -m "crear tabla comodidades y relacion con alojamientos"` y aplicarla con `flask db upgrade`.
- Registrar `comodidades_bp` y sus error handlers en el app factory.
- Crear `tests/test_comodidades.py` con pruebas de integracion:
  - Crear comodidad con admin → 201.
  - Crear comodidad con usuario normal → 403.
  - Crear comodidad con nombre duplicado → 400.
  - Listar comodidades sin auth → 200.
  - Asignar comodidades a alojamiento propio → 200.
  - Asignar comodidades a alojamiento ajeno con usuario normal → 403.
  - Asignar comodidades con ID inexistente → 400.
  - Detalle de alojamiento incluye comodidades asignadas → 200.
- Ejecutar toda la suite de pruebas existentes (25 de Sprints 2-4) mas las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Endpoints separados para agregar/quitar una comodidad individualmente (la relacion se gestiona reemplazando la lista completa con `PATCH`).
- Carga de imagenes — se vera en un sprint posterior.
- Reservas — se vera en un sprint posterior.
- Busqueda avanzada ni filtros por comodidades — se vera en un sprint posterior.
- Soft delete — se vera en un sprint posterior.
- Auditoria de acciones — fuera del alcance base (Nivel 2).
- Documentacion Swagger/Flasgger — se anadira en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 4 completado y funcionando: alojamientos con CRUD, autorizacion por propietario o admin, 25 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-4.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un usuario admin y un usuario normal registrados para pruebas.

---

## 7. Herramientas y tecnologias usadas

| Tecnologia | Version | Uso | Justificacion en Sprint 5 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `Comodidad` + relacion N:M |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migracion para comodidades + tabla intermedia |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — proteccion de rutas de comodidades (crear) y asignacion |
| Werkzeug | 3.x | Utilidades | Ya instalada |
| marshmallow | 3.x | Validacion de DTOs | Ya instalada — validacion de entrada de comodidades y asignacion |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de comodidades |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se anaden nuevas dependencias.** El Sprint 5 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/comodidades/` con `__init__.py` vacio |
| 2 | Crear `app/dominios/comodidades/modelos.py` | Modelo `Comodidad` (id, nombre unique not null). Tabla de asociacion `alojamiento_comodidad` con `db.Table` (alojamiento_id FK, comodidad_id FK, primary key compuesta). Relacion N:M en `Comodidad` con `db.relationship` usando `secondary=` y `back_populates`. Actualizar `Alojamiento` en `alojamientos/modelos.py` para anadir la relacion inversa con `secondary=` y `back_populates`. |
| 3 | Crear `app/dominios/comodidades/dtos.py` | `CrearComodidadDTO` (nombre requerido, min 1). `AsignarComodidadesDTO` (comodidades_ids lista de integers requerida; puede contener una lista vacia para dejar sin comodidades). |
| 4 | Crear `app/dominios/comodidades/repositorios.py` | Clase `ComodidadRepositorio`: guardar, obtener_por_id, obtener_todos, obtener_por_ids (filtra por lista de IDs, devuelve solo las que existen). |
| 5 | Crear `app/dominios/comodidades/servicios.py` | Clase `ComodidadServicio`: crear_comodidad (solo admin, verifica duplicado), listar_todos (publico), obtener_detalle (publico). Excepciones: `ComodidadNoEncontradaError`, `ComodidadYaExisteError`. |
| 6 | Crear `app/dominios/comodidades/controladores.py` | Blueprint `comodidades_bp`: POST crear (admin), GET listar (publico), GET detalle (publico). |
| 7 | Ampliar `AlojamientoServicio` | Metodo `asignar_comodidades(alojamiento_id, usuario_id, comodidad_ids)`: verifica alojamiento, verifica propietario o admin, verifica que todas las comodidad_ids existen (lanza `ComodidadesInvalidasError`, definida en este mismo archivo, si falta alguna), reemplaza la lista completa de comodidades. |
| 8 | Anadir endpoint en alojamientos | `PATCH /api/v1/alojamientos/<id>/comodidades` en `alojamientos/controladores.py`: valida `AsignarComodidadesDTO`, llama a `asignar_comodidades`, responde 200 con alojamiento actualizado. Payload: `{"comodidades_ids": [1, 3]}` o `{"comodidades_ids": []}` para vaciar. |
| 8b | Actualizar detalle de alojamiento | Actualizar `to_dict()` de `Alojamiento` para incluir la lista de comodidades asignadas en la serializacion. |
| 9 | Registrar `comodidades_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1/comodidades'`. |
| 10 | Registrar error handlers de comodidades | En `app/__init__.py`, mapear `ComodidadNoEncontradaError` → 404, `ComodidadYaExisteError` → 400, `ComodidadesInvalidasError` → 400. |
| 11 | Generar migracion | `flask db migrate -m "crear tabla comodidades y relacion con alojamientos"`. |
| 12 | Aplicar migracion | `flask db upgrade`. |
| 13 | Crear `tests/test_comodidades.py` | 8 tests: crear con admin (201), crear con usuario normal (403), nombre duplicado (400), listar sin auth (200), asignar a alojamiento propio (200), asignar a alojamiento ajeno (403), asignar con ID inexistente (400), detalle alojamiento incluye comodidades (200). |
| 14 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 25 pruebas existentes mas las nuevas pasan. |
| 15 | Commit y push | `git add .`, `git commit -m "feat: comodidades con relacion N:M y asignacion a alojamientos"`, `git push`. |

---

## 9. Riesgos o puntos de atencion

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Import circular entre modelos | `Alojamiento` importa de `Comodidad` y viceversa | Usar `db.Table` para la tabla intermedia y referenciar `'Alojamiento'` como string en las relaciones. Definir la tabla intermedia en `comodidades/modelos.py` y usar `secondary=` en ambos modelos. |
| La migracion no detecta la tabla intermedia | Flask-Migrate no reconoce `db.Table` correctamente | Definir la tabla con `db.Table` explicito en un modelo que se importe en el factory. Verificar que ambos modelos se cargan antes de `flask db migrate`. |
| `comodidades_ids` contiene IDs inexistentes | La asignacion falla silenciosamente o genera error de BD | Validar en el servicio que todas las IDs existen con `obtener_por_ids`. Lanzar `ComodidadesInvalidasError` → 400 si falta alguna. |
| Duplicado de nombres de comodidad | Se crean comodidades con mismo nombre | Verificar unicidad en el servicio antes de crear. Lanzar `ComodidadYaExisteError` si ya existe. |
| Confusion sobre quien puede crear comodidades | Usuario normal crea comodidades del catalogo | Restringir `POST /comodidades` a admin con `@requiere_admin`. Las comodidades son un catalogo global del sistema. |
| Confusion sobre PATCH vs POST para asignar | El estudiante espera endpoints separados de agregar/quitar | El sprint usa una sola ruta: `PATCH /alojamientos/<id>/comodidades` reemplaza la lista completa. Esto es mas simple y suficiente para esta etapa. |
| Tests fragiles por dependencias entre comodidades | Un test falla porque otro creo o elimino una comodidad | Cada test debe crear sus propias comodidades con nombres unicos (uuid o sufijo). |

---

## 10. Criterios de aceptacion

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/comodidades/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Comodidad` tiene campos: id, nombre (unique, not null).
- [ ] La tabla de asociacion `alojamiento_comodidad` existe con `alojamiento_id` y `comodidad_id` como FKs y primary key compuesta.
- [ ] La relacion N:M funciona en ambas direcciones: `alojamiento.comodidades` y `comodidad.alojamientos`.
- [ ] Los DTOs validan: nombre requerido para crear, `comodidades_ids` lista requerida para asignar.
- [ ] El repositorio de comodidades implementa: guardar, obtener_por_id, obtener_todos, obtener_por_ids.
- [ ] El servicio de comodidades implementa: crear (solo admin, verifica duplicado), listar (publico), detalle (publico).
- [ ] `AlojamientoServicio.asignar_comodidades` verifica alojamiento, verifica propietario o admin, verifica existencia de todas las comodidad_ids, y reemplaza la lista completa.
- [ ] El blueprint `comodidades_bp` esta registrado con prefijo `/api/v1/comodidades`.
- [ ] El endpoint `PATCH /api/v1/alojamientos/<id>/comodidades` esta registrado y protegido.
- [ ] Los error handlers `ComodidadNoEncontradaError` (404), `ComodidadYaExisteError` (400) y `ComodidadesInvalidasError` (400) estan registrados en `app/__init__.py`.
- [ ] La migracion fue generada y aplicada exitosamente.
- [ ] `POST /api/v1/comodidades` con admin responde 201.
- [ ] `POST /api/v1/comodidades` con usuario normal responde 403.
- [ ] `POST /api/v1/comodidades` con nombre duplicado responde 400.
- [ ] `GET /api/v1/comodidades` sin auth responde 200.
- [ ] `PATCH /api/v1/alojamientos/<id>/comodidades` con propietario responde 200.
- [ ] `PATCH /api/v1/alojamientos/<id>/comodidades` con `{"comodidades_ids": []}` deja el alojamiento sin comodidades y responde 200.
- [ ] `PATCH /api/v1/alojamientos/<id>/comodidades` con usuario normal ajeno responde 403.
- [ ] `PATCH /api/v1/alojamientos/<id>/comodidades` con IDs inexistentes responde 400.
- [ ] `GET /api/v1/alojamientos/<id>` incluye la lista de comodidades asignadas en la respuesta.
- [ ] Los tests de comodidades existen y pasan.
- [ ] Las 25 pruebas existentes de Sprints 2-4 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el codigo del dominio de comodidades esta versionado en Git con un commit descriptivo.
2. El codigo esta subido al repositorio remoto de GitHub.
3. La migracion de comodidades y relacion N:M fue generada y aplicada exitosamente.
4. Los endpoints de comodidades responden correctamente segun los criterios de aceptacion.
5. La asignacion de comodidades a alojamientos funciona con verificacion de propietario o admin.
6. La validacion de IDs de comodidades inexistentes responde 400 (`ComodidadesInvalidasError`).
7. Es posible dejar un alojamiento sin comodidades enviando `{"comodidades_ids": []}` en el PATCH.
8. El detalle del alojamiento (`GET /api/v1/alojamientos/<id>`) incluye las comodidades asignadas.
9. Los nuevos tests de comodidades pasan junto con todas las pruebas existentes.
10. No hay errores en consola al crear, listar ni asignar comodidades.
11. La relacion N:M funciona correctamente en ambas direcciones (`alojamiento.comodidades` y `comodidad.alojamientos`).
12. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripcion |
|---|---|
| `app/dominios/comodidades/modelos.py` | Modelo `Comodidad` + tabla intermedia `alojamiento_comodidad` |
| `app/dominios/comodidades/dtos.py` | DTOs: `CrearComodidadDTO`, `AsignarComodidadesDTO` |
| `app/dominios/comodidades/repositorios.py` | Clase `ComodidadRepositorio` con operaciones CRUD + obtener_por_ids |
| `app/dominios/comodidades/servicios.py` | Clase `ComodidadServicio` + excepciones `ComodidadNoEncontradaError`, `ComodidadYaExisteError` |
| `app/dominios/comodidades/controladores.py` | Blueprint `comodidades_bp` con 3 endpoints |
| `app/dominios/alojamientos/modelos.py` (actualizado) | Relacion N:M anadida al modelo `Alojamiento` con `secondary=` + `to_dict()` actualizado para incluir comodidades |
| `app/dominios/alojamientos/servicios.py` (actualizado) | Metodo `asignar_comodidades` en `AlojamientoServicio` |
| `app/dominios/alojamientos/controladores.py` (actualizado) | Endpoint `PATCH /<id>/comodidades` + respuesta de detalle con comodidades |
| `app/__init__.py` (actualizado) | Registro de `comodidades_bp`, error handlers de comodidades (`ComodidadNoEncontradaError` → 404, `ComodidadYaExisteError` → 400, `ComodidadesInvalidasError` → 400) |
| `migrations/versions/<hash>_crear_tabla_comodidades_y_relacion.py` | Migracion: tabla comodidades + tabla intermedia |
| `tests/test_comodidades.py` | 8 tests de integracion de comodidades y relacion N:M |
| Repositorio Git y GitHub | Commit descriptivo y push al remoto |

---

## 13. Estado

**✅ Completado** — Implementado, validado y subido a GitHub.

- Modelo `Comodidad` con relacion N:M a `Alojamiento` mediante tabla intermedia `alojamiento_comodidad`.
- Migracion `ebb9cbe49179` generada y aplicada: tablas `comodidades` y `alojamiento_comodidad`.
- 3 endpoints de comodidades operativos: POST crear (admin), GET listar (publico), GET detalle (publico).
- Endpoint `PATCH /alojamientos/<id>/comodidades` para asignar comodidades (propietario o admin).
- Detalle de alojamiento incluye comodidades asignadas (eager loading con `joinedload`).
- 8 tests de integracion pasando. Total 33 tests (25 anteriores + 8 nuevos).
