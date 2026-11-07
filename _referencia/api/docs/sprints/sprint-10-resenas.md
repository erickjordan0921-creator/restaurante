# Sprint 10 — Reseñas

---

## 1. Nombre del sprint

**Sprint 10 — Reseñas**

---

## 2. Objetivo del sprint

Introducir el dominio de **reseñas** en el proyecto: crear el modelo `Resena` que permite a un usuario calificar y comentar un alojamiento después de una estancia, implementar la restricción de unicidad compuesta `(usuario_id, alojamiento_id)`, validar que el usuario tuvo una reserva finalizada en ese alojamiento, y construir los endpoints necesarios para crear una reseña, listar las reseñas públicas de un alojamiento, consultar el resumen de calificaciones (promedio y total), y eliminar la propia reseña. Añadir pruebas de integración del flujo de reseñas.

Al final del sprint, el estudiante comprenderá cómo se modela un recurso de opinión vinculado a una transacción real (reserva), cómo se valida la elegibilidad del usuario, cómo se previenen reseñas duplicadas, y cómo se expone información pública útil para otros consumidores.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, las reseñas son fundamentales para generar confianza entre huéspedes y anfitriones. Hasta Sprint 9 el proyecto ya tiene usuarios, alojamientos, comodidades, imágenes, reservas, búsqueda y favoritos. El siguiente paso natural es permitir que los huéspedes que ya se alojaron en un alojamiento puedan dejar una calificación y un comentario público.

Este sprint enseña:
- modelar reseñas como recurso explícito vinculado a usuario y alojamiento.
- validar que el usuario puede reseñar (tuvo reserva finalizada en ese alojamiento).
- aplicar restricción de unicidad para una sola reseña por par (usuario, alojamiento).
- validar puntuación (1-5) y comentario (requerido, longitud mínima y máxima).
- construir un endpoint público de listado de reseñas con shape mínimo.
- construir un endpoint de resumen con promedio de puntuación y conteo total.
- construir un endpoint de eliminación de reseña propia.
- exponer información pública útil sin datos sensibles.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/resenas/`:
  - `__init__.py` (paquete vacío).
  - `modelos.py` — Modelo `Resena` con campos:
    - `id` (integer, primary key).
    - `usuario_id` (integer, FK a `usuarios.id`, not null).
    - `alojamiento_id` (integer, FK a `alojamientos.id`, not null).
    - `puntuacion` (integer, not null, entre 1 y 5).
    - `comentario` (text, not null, longitud mínima 10 caracteres, máxima 1000).
    - `fecha_creacion` (datetime, default now).
    - Restricción única compuesta: `UniqueConstraint('usuario_id', 'alojamiento_id')`.
    - Relación N:1 con `Usuario` y N:1 con `Alojamiento`.
  - `dtos.py` — Esquema `CrearResenaDTO` con validación: `alojamiento_id` (integer requerido >= 1), `puntuacion` (integer requerido entre 1 y 5), `comentario` (string requerido, longitud 10-1000).
  - `repositorios.py` — Clase `ResenaRepositorio` con métodos: `guardar`, `obtener_por_alojamiento`, `obtener_por_usuario_y_alojamiento`, `eliminar_por_usuario_y_alojamiento`, `calcular_resumen(alojamiento_id)` (devuelve `promedio_puntuacion` y `total_resenas`).
  - `servicios.py` — Clase `ResenaServicio` con métodos:
    - `crear_resena(usuario_id, alojamiento_id, puntuacion, comentario)`:
      - Valida que el alojamiento existe. Si no → `AlojamientoNoEncontradoError`.
      - Valida que el usuario tuvo al menos una reserva de ese alojamiento con estado `'confirmada'` y `fecha_fin < hoy`. Si no → `ResenaNoElegibleError`.
      - Valida que no exista ya una reseña con ese par `(usuario_id, alojamiento_id)`. Si existe → `ResenaDuplicadaError`.
      - Crea la reseña y guarda.
    - `listar_resenas(alojamiento_id)`:
      - Obtiene todas las reseñas públicas del alojamiento.
      - Devuelve lista con shape mínimo: `id`, `puntuacion`, `comentario`, `fecha_creacion`, `nombre_usuario` (del autor, dato público).
    - `obtener_resumen(alojamiento_id)`:
      - Calcula promedio de puntuación y cuenta total de reseñas.
      - Si no hay reseñas: `promedio_puntuacion` es `null`, `total_resenas` es `0`.
    - `eliminar_resena(usuario_id, alojamiento_id)`:
      - Busca la reseña por `(usuario_id, alojamiento_id)`.
      - Si no existe → `ResenaNoEncontradaError`.
      - Si existe → elimina el registro (pertenecer al usuario está implícito por la búsqueda con el par).
    - Excepciones: `ResenaNoElegibleError`, `ResenaDuplicadaError`, `ResenaNoEncontradaError`.
  - `controladores.py` — Blueprint `resenas_bp` registrado con `url_prefix='/api/v1'` y rutas:
    - `POST /resenas` — crear reseña (requiere autenticación). Payload: `{"alojamiento_id": 12, "puntuacion": 5, "comentario": "Excelente alojamiento."}`.
    - `DELETE /resenas/<alojamiento_id>` — eliminar la reseña propia sobre ese alojamiento (requiere autenticación).
    - `GET /alojamientos/<alojamiento_id>/resenas` — listar reseñas públicas de un alojamiento (público).
    - `GET /alojamientos/<alojamiento_id>/resumen-resenas` — resumen de calificaciones de un alojamiento (público).
- Generar la migración con `flask db migrate -m "crear tabla resenas"` y aplicarla con `flask db upgrade`.
- Registrar `resenas_bp` y sus error handlers en el app factory.
- Crear `tests/test_resenas.py` con pruebas de integración:
  - Crear reseña válida → 201.
  - Crear reseña sin auth → 401.
  - Crear reseña de alojamiento sin reserva finalizada → 400.
  - Crear reseña duplicada → 400.
  - Crear reseña con puntuación inválida → 400.
  - Crear reseña con comentario muy corto → 400.
  - Listar reseñas públicas → 200.
  - Listar reseñas públicas de alojamiento inexistente → 404.
  - Resumen sin reseñas → 200 con promedio `null` y total `0`.
  - Resumen con reseñas → 200 con promedio y total calculados.
  - Resumen de alojamiento inexistente → 404.
  - Eliminar reseña propia → 204.
  - Eliminar reseña inexistente → 404.
  - Total: 13 tests.
- Ejecutar toda la suite de pruebas existentes (73 de Sprints 2-9) más las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Respuestas del anfitrión a reseñas.
- Moderación ni edición de reseñas después de crearlas.
- Reseñas de anfitriones hacia huéspedes.
- Reseñas de usuarios entre sí.
- Ranking complejo ni ordenamiento personalizado.
- Análisis de sentimiento ni procesamiento de lenguaje natural.
- Soft delete — se verá en un sprint posterior.
- Auditoría de acciones — fuera del alcance base (Nivel 2).
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 9 completado y funcionando: favoritos, 73 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-9.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un alojamiento registrado, una reserva finalizada y un usuario autenticado para pruebas manuales.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 10 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada — endpoints de reseñas |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `Resena` con restricción única y validaciones |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migración para reseñas |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — protección de rutas de reseñas |
| marshmallow | 3.x | Validación de DTOs | Ya instalada — validación de `CrearResenaDTO` |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de reseñas |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se añaden nuevas dependencias.** El Sprint 10 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/resenas/` con `__init__.py` vacío |
| 2 | Crear `app/dominios/resenas/modelos.py` | Modelo `Resena` (id, usuario_id FK, alojamiento_id FK, puntuacion int 1-5, comentario text, fecha_creacion datetime). Restricción única: `UniqueConstraint('usuario_id', 'alojamiento_id')`. Relaciones N:1 con `Usuario` y `Alojamiento`. |
| 3 | Crear `app/dominios/resenas/dtos.py` | `CrearResenaDTO`: `alojamiento_id` (int requerido >= 1), `puntuacion` (int requerido entre 1 y 5), `comentario` (string requerido, longitud 10-1000). |
| 4 | Crear `app/dominios/resenas/repositorios.py` | Clase `ResenaRepositorio`: guardar, obtener_por_alojamiento, obtener_por_usuario_y_alojamiento, eliminar_por_usuario_y_alojamiento, `calcular_resumen` (promedio y total). |
| 5 | Crear `app/dominios/resenas/servicios.py` | Clase `ResenaServicio`: `crear_resena` (valida alojamiento, valida reserva finalizada → `ResenaNoElegibleError`, valida duplicado → `ResenaDuplicadaError`, crea), `listar_resenas` (shape público mínimo, valida alojamiento existe), `obtener_resumen` (promedio + total, valida alojamiento existe), `eliminar_resena` (busca por par usuario_id+alojamiento_id, si no existe → `ResenaNoEncontradaError`, si existe → elimina). Excepciones: `ResenaNoElegibleError`, `ResenaDuplicadaError`, `ResenaNoEncontradaError`. |
| 6 | Crear `app/dominios/resenas/controladores.py` | Blueprint `resenas_bp` registrado con `url_prefix='/api/v1'` y 4 rutas: POST `/resenas` (crear, auth), DELETE `/resenas/<alojamiento_id>` (eliminar propia, auth), GET `/alojamientos/<id>/resenas` (listar, público), GET `/alojamientos/<id>/resumen-resenas` (resumen, público). Si el alojamiento no existe en los endpoints GET, lanzar `AlojamientoNoEncontradoError` → 404. |
| 7 | Registrar `resenas_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1'`. Registrar nuevos handlers: `ResenaNoElegibleError` → 400, `ResenaDuplicadaError` → 400, `ResenaNoEncontradaError` → 404. (`AlojamientoNoEncontradoError` → 404 ya registrada globalmente, solo se reutiliza). |
| 8 | Generar migración | `flask db migrate -m "crear tabla resenas"`. |
| 9 | Aplicar migración | `flask db upgrade`. |
| 10 | Crear `tests/test_resenas.py` | 13 tests: crear válida (201), sin auth (401), sin reserva finalizada (400), duplicada (400), puntuación inválida (400), comentario corto (400), listar públicas (200), listar alojamiento inexistente (404), resumen sin reseñas (200), resumen con reseñas (200), resumen alojamiento inexistente (404), eliminar propia (204), eliminar inexistente (404). |
| 11 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 73 pruebas existentes más las nuevas pasan. |
| 12 | Commit y push | `git add .`, `git commit -m "feat: dominio reseñas con crear, listar, resumen y eliminar"`, `git push`. |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Reseña sin reserva finalizada | Usuarios reseñan alojamientos donde no se alojaron | Validar en el servicio: existe reserva con estado `'confirmada'` y `fecha_fin < date.today()` para ese `(usuario_id, alojamiento_id)`. |
| Duplicado no detectado | Dos reseñas del mismo usuario para el mismo alojamiento | Usar `UniqueConstraint('usuario_id', 'alojamiento_id')` en el modelo. Validar también en el servicio para devolver mensaje claro 400 antes de intentar insertar. |
| Puntuación fuera de rango | Datos inconsistentes | Validar en DTO (1-5) y agregar `CheckConstraint` en el modelo como capa extra de seguridad. |
| Comentario vacío o demasiado largo | Experiencia de usuario pobre o almacenamiento excesivo | Validar en DTO (longitud 10-1000). |
| Respuesta de listado con datos sensibles | Exposición de información privada | El shape público solo incluye `id`, `puntuacion`, `comentario`, `fecha_creacion`, `nombre_usuario`. No incluye email, teléfono ni datos de la cuenta. |
| Resumen con división por cero | Error al calcular promedio sin reseñas | Si `total_resenas == 0`, devolver `promedio_puntuacion: null`. |
| Import circular entre modelos | `Resena` importa `Usuario` o `Alojamiento` y viceversa | Usar strings `'Usuario'` y `'Alojamiento'` en las relaciones de SQLAlchemy. |
| Tests de reseñas sin datos suficientes | Tests fallan por falta de reserva finalizada o alojamiento | Crear fixtures con alojamiento, reserva finalizada (`fecha_fin` en el pasado) y usuario autenticado. Usar fixtures existentes del proyecto. |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/resenas/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Resena` tiene campos: id, usuario_id (FK), alojamiento_id (FK), puntuacion (int 1-5), comentario (text), fecha_creacion.
- [ ] La restricción única compuesta `(usuario_id, alojamiento_id)` está definida en el modelo.
- [ ] Las relaciones N:1 con `Usuario` y `Alojamiento` funcionan correctamente.
- [ ] El DTO `CrearResenaDTO` valida: `alojamiento_id` int >= 1, `puntuacion` int 1-5, `comentario` string longitud 10-1000.
- [ ] El servicio valida que el usuario tuvo una reserva finalizada del alojamiento antes de permitir crear reseña.
- [ ] El servicio valida que no exista reseña duplicada para el par `(usuario_id, alojamiento_id)`.
- [ ] El blueprint `resenas_bp` está registrado con `url_prefix='/api/v1'`.
- [ ] Los nuevos error handlers están registrados: `ResenaNoElegibleError` → 400, `ResenaDuplicadaError` → 400, `ResenaNoEncontradaError` → 404.
- [ ] La migración fue generada y aplicada exitosamente.
- [ ] `POST /api/v1/resenas` con datos válidos y reserva finalizada responde 201 con `{"success": true, "data": {...}}`.
- [ ] `POST /api/v1/resenas` sin token responde 401.
- [ ] `POST /api/v1/resenas` sin reserva finalizada responde 400.
- [ ] `POST /api/v1/resenas` con reseña duplicada responde 400.
- [ ] `POST /api/v1/resenas` con puntuación inválida responde 400.
- [ ] `POST /api/v1/resenas` con comentario muy corto responde 400.
- [ ] `GET /api/v1/alojamientos/<id>/resenas` sin auth responde 200 con lista de reseñas públicas (shape mínimo). Si el alojamiento no existe responde 404.
- [ ] `GET /api/v1/alojamientos/<id>/resumen-resenas` sin auth responde 200. Si el alojamiento no existe responde 404. Sin reseñas: `promedio_puntuacion: null`, `total_resenas: 0`. Con reseñas: promedio y total calculados.
- [ ] `DELETE /api/v1/resenas/<alojamiento_id>` con reseña propia responde 204 sin body.
- [ ] `DELETE /api/v1/resenas/<alojamiento_id>` con reseña inexistente responde 404.
- [ ] Los tests de reseñas existen y pasan.
- [ ] Las 73 pruebas existentes de Sprints 2-9 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código del dominio de reseñas está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. La migración de reseñas fue generada y aplicada exitosamente.
4. Los endpoints de reseñas responden correctamente según los criterios de aceptación.
5. Solo se puede reseñar un alojamiento si el usuario tuvo una reserva finalizada en ese alojamiento.
6. La restricción de unicidad funciona: intentar agregar una reseña duplicada responde 400.
7. La validación de puntuación (1-5) y comentario (longitud 10-1000) funciona correctamente.
8. El resumen de reseñas devuelve promedio y total calculados correctamente (promedio `null` si no hay reseñas).
9. La eliminación de reseñas propias funciona correctamente y responde 204 sin body.
10. El listado de reseñas no expone datos sensibles del usuario autor.
11. Los nuevos tests de reseñas pasan junto con todas las pruebas existentes.
12. No hay errores en consola al crear, listar ni eliminar reseñas.
13. Las relaciones entre `Resena`, `Usuario` y `Alojamiento` son correctas.
14. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/resenas/modelos.py` | Modelo `Resena` con `UniqueConstraint('usuario_id', 'alojamiento_id')` y relaciones N:1 |
| `app/dominios/resenas/dtos.py` | DTO `CrearResenaDTO` con validación de `alojamiento_id`, `puntuacion` (1-5), `comentario` (10-1000) |
| `app/dominios/resenas/repositorios.py` | Clase `ResenaRepositorio` con CRUD + `calcular_resumen` |
| `app/dominios/resenas/servicios.py` | Clase `ResenaServicio` + excepciones `ResenaNoElegibleError`, `ResenaDuplicadaError`, `ResenaNoEncontradaError` |
| `app/dominios/resenas/controladores.py` | Blueprint `resenas_bp` (`url_prefix='/api/v1'`) con 4 rutas: POST `/resenas`, DELETE `/resenas/<alojamiento_id>`, GET `/alojamientos/<id>/resenas`, GET `/alojamientos/<id>/resumen-resenas` |
| `app/__init__.py` (actualizado) | Registro de `resenas_bp` con `url_prefix='/api/v1'`, error handlers de reseñas |
| `migrations/versions/<hash>_crear_tabla_resenas.py` | Migración: tabla `resenas` |
| `tests/test_resenas.py` | 13 tests de integración de reseñas: creación, validación, elegibilidad por reserva, unicidad, listado, resumen y eliminación |
| Repositorio Git | Commit con cambios del Sprint 10 |
| Repositorio GitHub | Push exitoso |

---

## 13. Estado

**Pendiente de aprobación** — Este documento requiere validación antes de proceder a la implementación.
