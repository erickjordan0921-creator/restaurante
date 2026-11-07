# Sprint 9 — Favoritos

---

## 1. Nombre del sprint

**Sprint 9 — Favoritos**

---

## 2. Objetivo del sprint

Introducir el dominio de **favoritos** en el proyecto: crear el modelo `Favorito` que relaciona un usuario con un alojamiento de forma unívoca, implementar la restricción de unicidad compuesta `(usuario_id, alojamiento_id)`, y construir los endpoints necesarios para agregar un alojamiento a favoritos, listar los favoritos del usuario autenticado y eliminar un favorito por `alojamiento_id`. Añadir pruebas de integración del flujo de favoritos.

Al final del sprint, el estudiante comprenderá cómo se modela una relación de favoritos como recurso explícito, cómo se previenen duplicados mediante restricción de base de datos y validación de servicio, y cómo se devuelve una lista de recursos relacionados con shape mínimo reutilizado del dominio de alojamientos.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, los favoritos permiten a los usuarios guardar alojamientos de su interés para consultarlos o reservar más tarde. Hasta Sprint 8 el proyecto ya tiene usuarios, alojamientos, comodidades, imágenes, reservas y búsqueda. El siguiente paso natural es permitir que cada usuario construya su colección personal de alojamientos favoritos.

Este sprint enseña:
- modelar favoritos como recurso explícito con su propia tabla.
- aplicar restricción de unicidad compuesta para evitar duplicados.
- construir un endpoint de creación con payload mínimo (`alojamiento_id`).
- construir un endpoint de listado que reutiliza el shape mínimo de alojamiento (`to_dict_resumen()`).
- construir un endpoint de eliminación usando `alojamiento_id` como identificador en la URL.
- validar duplicados a nivel de servicio (400).
- autorizar correctamente: solo el usuario autenticado gestiona sus propios favoritos.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/favoritos/`:
  - `__init__.py` (paquete vacío).
  - `modelos.py` — Modelo `Favorito` con campos:
    - `id` (integer, primary key).
    - `usuario_id` (integer, FK a `usuarios.id`, not null).
    - `alojamiento_id` (integer, FK a `alojamientos.id`, not null).
    - `fecha_creacion` (datetime, default now).
    - Restricción única compuesta: `UniqueConstraint('usuario_id', 'alojamiento_id')`.
    - Relación N:1 con `Usuario` y N:1 con `Alojamiento`.
  - `dtos.py` — Esquema `CrearFavoritoDTO` con validación: `alojamiento_id` (integer requerido, >= 1).
  - `repositorios.py` — Clase `FavoritoRepositorio` con métodos: `guardar`, `obtener_por_usuario`, `obtener_por_usuario_y_alojamiento`, `eliminar_por_usuario_y_alojamiento`.
  - `servicios.py` — Clase `FavoritoServicio` con métodos:
    - `agregar_favorito(usuario_id, alojamiento_id)`:
      - Valida que el alojamiento existe. Si no → `AlojamientoNoEncontradoError`.
      - **Se permite marcar como favorito un alojamiento del cual el mismo usuario es propietario** (es una colección personal, no requiere validación de propiedad externa).
      - Valida que no exista ya un favorito con ese par `(usuario_id, alojamiento_id)`. Si existe → `FavoritoDuplicadoError`.
      - Crea el favorito y guarda. Responde 201 con datos mínimos del alojamiento (`to_dict_resumen()`).
    - `listar_mis_favoritos(usuario_id)`:
      - Obtiene todos los favoritos del usuario.
      - Devuelve lista de alojamientos usando `to_dict_resumen()` (reutiliza el shape mínimo de Sprint 8).
    - `eliminar_favorito(usuario_id, alojamiento_id)`:
      - Busca el favorito por `(usuario_id, alojamiento_id)`.
      - Si no existe → `FavoritoNoEncontradoError`.
      - Elimina el registro.
    - Excepciones: `FavoritoDuplicadoError`, `FavoritoNoEncontradoError`.
  - `controladores.py` — Blueprint `favoritos_bp` con endpoints:
    - `POST /api/v1/favoritos` — agregar alojamiento a favoritos (requiere autenticación). Payload: `{"alojamiento_id": 12}`.
    - `GET /api/v1/favoritos/mis-favoritos` — listar favoritos del usuario autenticado (requiere autenticación).
    - `DELETE /api/v1/favoritos/<alojamiento_id>` — eliminar alojamiento de favoritos (requiere autenticación).
- Generar la migración con `flask db migrate -m "crear tabla favoritos"` y aplicarla con `flask db upgrade`.
- Registrar `favoritos_bp` y sus error handlers en el app factory:
  - Nuevos handlers del sprint: `FavoritoDuplicadoError` → 400, `FavoritoNoEncontradoError` → 404.
  - `AlojamientoNoEncontradoError` → 404 ya está registrada globalmente desde Sprints anteriores; el servicio de favoritos la lanza y el handler existente la captura. No se registra de nuevo.
- Crear `tests/test_favoritos.py` con pruebas de integración:
  - Agregar favorito válido → 201.
  - Agregar favorito sin auth → 401.
  - Agregar favorito duplicado → 400.
  - Agregar favorito de alojamiento inexistente → 404.
  - Listar mis favoritos vacío → 200 con lista vacía.
  - Listar mis favoritos con elementos → 200 con lista de alojamientos (shape mínimo).
  - Eliminar favorito existente → 204.
  - Eliminar favorito inexistente → 404.
- Ejecutar toda la suite de pruebas existentes (65 de Sprints 2-8) más las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Reseñas ni valoraciones.
- Recomendaciones ni ranking personalizado.
- Notificaciones ni alertas de favoritos.
- Compartir favoritos entre usuarios.
- Carpetas o colecciones de favoritos.
- Soft delete — se verá en un sprint posterior.
- Auditoría de acciones — fuera del alcance base (Nivel 2).
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 8 completado y funcionando: búsqueda con filtros y disponibilidad, 65 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-8.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un alojamiento registrado y un usuario autenticado para pruebas manuales.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 9 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada — endpoints de favoritos |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `Favorito` con restricción única |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migración para favoritos |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — protección de rutas de favoritos |
| marshmallow | 3.x | Validación de DTOs | Ya instalada — validación de `CrearFavoritoDTO` |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de favoritos |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se añaden nuevas dependencias.** El Sprint 9 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/favoritos/` con `__init__.py` vacío |
| 2 | Crear `app/dominios/favoritos/modelos.py` | Modelo `Favorito` (id, usuario_id FK, alojamiento_id FK, fecha_creacion datetime). Restricción única: `UniqueConstraint('usuario_id', 'alojamiento_id')`. Relaciones N:1 con `Usuario` y `Alojamiento`. |
| 3 | Crear `app/dominios/favoritos/dtos.py` | `CrearFavoritoDTO`: `alojamiento_id` (integer requerido, >= 1). |
| 4 | Crear `app/dominios/favoritos/repositorios.py` | Clase `FavoritoRepositorio`: guardar, obtener_por_usuario, obtener_por_usuario_y_alojamiento, eliminar_por_usuario_y_alojamiento. |
| 5 | Crear `app/dominios/favoritos/servicios.py` | Clase `FavoritoServicio`: `agregar_favorito` (valida alojamiento, valida duplicado → `FavoritoDuplicadoError`, crea), `listar_mis_favoritos` (reutiliza `to_dict_resumen()` de `Alojamiento`), `eliminar_favorito` (busca por par, lanza `FavoritoNoEncontradoError` si no existe, elimina). Excepciones: `FavoritoDuplicadoError`, `FavoritoNoEncontradoError`. |
| 6 | Crear `app/dominios/favoritos/controladores.py` | Blueprint `favoritos_bp` con 3 endpoints: POST `"/"` (crear, auth), GET `"/mis-favoritos"` (listar, auth), DELETE `"/<alojamiento_id>"` (eliminar, auth). |
| 7 | Registrar `favoritos_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1/favoritos'`. Registrar nuevos handlers: `FavoritoDuplicadoError` → 400, `FavoritoNoEncontradoError` → 404. (`AlojamientoNoEncontradoError` → 404 ya registrada globalmente, solo se reutiliza). |
| 8 | Generar migración | `flask db migrate -m "crear tabla favoritos"`. |
| 9 | Aplicar migración | `flask db upgrade`. |
| 10 | Crear `tests/test_favoritos.py` | 8 tests: agregar válido (201), agregar sin auth (401), duplicado (400), alojamiento inexistente (404), listar vacío (200), listar con elementos (200), eliminar existente (204), eliminar inexistente (404). |
| 11 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 65 pruebas existentes más las nuevas pasan. |
| 12 | Commit y push | `git add .`, `git commit -m "feat: dominio favoritos con agregar, listar y eliminar"`, `git push`. |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Duplicado no detectado a nivel de BD | Dos favoritos iguales para el mismo usuario y alojamiento | Usar `UniqueConstraint('usuario_id', 'alojamiento_id')` en el modelo. Validar también en el servicio para devolver mensaje claro 400 antes de intentar insertar. |
| Respuesta de `mis-favoritos` con shape gigante | Tiempo de respuesta innecesariamente largo | Reutilizar `to_dict_resumen()` de `Alojamiento` (Sprint 8). No devolver el detalle completo. |
| Eliminar favorito equivocado | Usuario elimina favorito de otro usuario | El repositorio filtra por `(usuario_id, alojamiento_id)`. Solo se elimina si coincide el par del usuario autenticado. |
| Import circular entre modelos | `Favorito` importa `Usuario` o `Alojamiento` y viceversa | Usar strings `'Usuario'` y `'Alojamiento'` en las relaciones de SQLAlchemy. |
| Tests de favoritos sin datos suficientes | Tests pasan vacíos o no validan correctamente | Crear fixtures con alojamiento registrado y usuario autenticado. Usar `admin_auth`/`usuario_auth` ya existentes. |
| Conflicto entre `DELETE /favoritos/<alojamiento_id>` y rutas futuras | Ambigüedad de rutas | El blueprint tiene prefijo `/api/v1/favoritos`, así que la ruta completa es `/api/v1/favoritos/<alojamiento_id>`. No colisiona con otras rutas del proyecto. |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/favoritos/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Favorito` tiene campos: id, usuario_id (FK), alojamiento_id (FK), fecha_creacion.
- [ ] La restricción única compuesta `(usuario_id, alojamiento_id)` está definida en el modelo.
- [ ] Las relaciones N:1 con `Usuario` y `Alojamiento` funcionan correctamente.
- [ ] El DTO `CrearFavoritoDTO` valida que `alojamiento_id` sea integer requerido >= 1.
- [ ] El servicio valida que el alojamiento existe y que no exista favorito duplicado antes de crear. Se permite marcar como favorito un alojamiento del cual el mismo usuario es propietario.
- [ ] `POST /api/v1/favoritos` con `alojamiento_id` válido responde 201 con `{"success": true, "data": {...}}` (shape mínimo del alojamiento).
- [ ] `POST /api/v1/favoritos` sin token responde 401.
- [ ] `POST /api/v1/favoritos` con favorito duplicado responde 400.
- [ ] `POST /api/v1/favoritos` con alojamiento inexistente responde 404.
- [ ] `GET /api/v1/favoritos/mis-favoritos` con token responde 200 con `{"success": true, "data": [...]}` (lista de alojamientos con shape mínimo).
- [ ] `DELETE /api/v1/favoritos/<alojamiento_id>` con favorito existente responde 204 sin body.
- [ ] `DELETE /api/v1/favoritos/<alojamiento_id>` con favorito inexistente responde 404.
- [ ] Los tests de favoritos existen y pasan.
- [ ] Las 65 pruebas existentes de Sprints 2-8 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código del dominio de favoritos está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. La migración de favoritos fue generada y aplicada exitosamente.
4. Los endpoints de favoritos responden correctamente según los criterios de aceptación (crear → 201 con wrapper, listar → 200 con lista, eliminar → 204 sin body).
5. La restricción de unicidad funciona: intentar agregar un favorito duplicado responde 400.
6. Se permite marcar como favorito un alojamiento del cual el mismo usuario es propietario.
7. El listado de favoritos reutiliza `to_dict_resumen()` de `Alojamiento` (shape mínimo consistente con Sprint 8).
8. La eliminación de favoritos funciona correctamente y responde 404 si el favorito no existe.
9. Los nuevos tests de favoritos pasan junto con todas las pruebas existentes.
10. No hay errores en consola al agregar, listar ni eliminar favoritos.
11. Las relaciones entre `Favorito`, `Usuario` y `Alojamiento` son correctas.
12. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/favoritos/modelos.py` | Modelo `Favorito` con `UniqueConstraint('usuario_id', 'alojamiento_id')` y relaciones N:1 |
| `app/dominios/favoritos/dtos.py` | DTO `CrearFavoritoDTO` con validación de `alojamiento_id` |
| `app/dominios/favoritos/repositorios.py` | Clase `FavoritoRepositorio` con CRUD por usuario y par usuario-alojamiento |
| `app/dominios/favoritos/servicios.py` | Clase `FavoritoServicio` + excepciones `FavoritoDuplicadoError`, `FavoritoNoEncontradoError` |
| `app/dominios/favoritos/controladores.py` | Blueprint `favoritos_bp` con 3 endpoints |
| `app/__init__.py` (actualizado) | Registro de `favoritos_bp`, error handlers de favoritos |
| `migrations/versions/<hash>_crear_tabla_favoritos.py` | Migración: tabla `favoritos` |
| `tests/test_favoritos.py` | 8 tests de integración de favoritos |
| Repositorio Git | Commit con cambios del Sprint 9 |
| Repositorio GitHub | Push exitoso |

---

## 13. Estado

**Pendiente de aprobación** — Este documento requiere validación antes de proceder a la implementación.
