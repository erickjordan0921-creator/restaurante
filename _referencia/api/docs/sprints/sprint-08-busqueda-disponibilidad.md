# Sprint 8 — Búsqueda y disponibilidad

---

## 1. Nombre del sprint

**Sprint 8 — Búsqueda y disponibilidad**

---

## 2. Objetivo del sprint

Construir un endpoint público de búsqueda de alojamientos con filtros combinables (ciudad, rango de precio, comodidades, rango de fechas), integrar la consulta de disponibilidad con el dominio de reservas para excluir alojamientos no disponibles, definir validaciones claras para los parámetros de búsqueda, controlar el tamaño de la respuesta mediante paginación simple (`page`, `per_page`), y devolver un shape mínimo útil de datos. Añadir pruebas de integración del flujo de búsqueda/disponibilidad.

Al final del sprint, el estudiante comprenderá cómo se diseña un endpoint de consulta con filtros compuestos, cómo se integra con otro dominio (reservas) para calcular disponibilidad, y cómo se valida y controla la respuesta de forma coherente.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, la búsqueda es la puerta de entrada del usuario. Hasta Sprint 7 el proyecto ya tiene usuarios, alojamientos, comodidades, imágenes y reservas. Ahora el estudiante debe aprender a construir un endpoint que componga filtros de negocio y que consulte múltiples dominios para ofrecer resultados útiles.

Este sprint enseña:
- diseñar un endpoint público de búsqueda con filtros combinables.
- validar parámetros de consulta (ciudad, precios, fechas, comodidades).
- calcular disponibilidad cruzando datos de reservas (excluir alojamientos con reservas activas que se crucen).
- paginar resultados de forma simple (`page`, `per_page`).
- devolver un shape mínimo útil (no el detalle completo del alojamiento).
- mantener la separación de dominios: búsqueda consulta alojamientos, comodidades y reservas sin acoplamiento.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Añadir al blueprint `alojamientos_bp` (ya existente) el endpoint:
  - `GET /api/v1/alojamientos/buscar` — búsqueda pública con filtros combinables.
- Parámetros de consulta (query params) soportados:
  - `ciudad` (string, opcional) — filtro exacto por nombre de ciudad (case-insensitive).
  - `precio_min` (float, opcional, >= 0) — precio mínimo por noche.
  - `precio_max` (float, opcional, >= precio_min si ambos están presentes) — precio máximo por noche.
  - `fecha_inicio` (date, opcional) — primer día de la estancia deseada. Debe enviarse junto con `fecha_fin`; si se envía solo uno de los dos, la solicitud responde 400.
  - `fecha_fin` (date, opcional) — último día de la estancia deseada (exclusive; debe ser mayor que `fecha_inicio`). Debe enviarse junto con `fecha_inicio`; si se envía solo uno de los dos, la solicitud responde 400. Si no se envía ninguna, no se filtra por disponibilidad.
  - `comodidades_ids` (string, opcional) — lista de IDs de comodidades separadas por comas, ej. `1,3,5`. Se parsea a lista de enteros en la capa de validación antes de pasar al servicio. El alojamiento debe tener **todas** las comodidades indicadas.
  - `page` (integer, opcional, default `1`, >= 1) — página de resultados.
  - `per_page` (integer, opcional, default `20`, entre 1 y 50) — cantidad de resultados por página.
- Reglas de validación de parámetros:
  - Si se envían fechas, `fecha_fin > fecha_inicio` y `fecha_inicio` no puede ser en el pasado. Respuesta 400 si no se cumple.
  - Si se envían ambos precios, `precio_max >= precio_min`. Respuesta 400 si no se cumple.
  - Si `comodidades_ids` contiene IDs no numéricos o negativos, respuesta 400.
- Cálculo de disponibilidad:
  - Si se envían `fecha_inicio` y `fecha_fin`, se excluyen alojamientos que tengan al menos una reserva con estado `'confirmada'` cuyas fechas se crucen: `fecha_inicio_solicitada < fecha_fin_reserva AND fecha_fin_solicitada > fecha_inicio_reserva`.
  - Si no se envían fechas, no se filtra por disponibilidad (se muestran todos los alojamientos que cumplan los demás filtros).
- Shape de respuesta para cada alojamiento en la lista:
  - `id`, `titulo`, `ciudad`, `precio_noche`.
  - `comodidades`: lista de `{id, nombre}` de todas las comodidades del alojamiento.
  - `tiene_imagen_principal`: boolean que indica si el alojamiento tiene al menos una imagen marcada como `es_principal=True`.
  - Se obtiene mediante un método dedicado `to_dict_resumen()` en el modelo `Alojamiento`. No se usa `to_dict()` (que devuelve el detalle completo).
- Respuesta envuelta en estructura paginada:
  ```json
  {
    "success": true,
    "message": "Resultados de búsqueda.",
    "data": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3
    },
    "filters": {
      "ciudad": "Quito",
      "precio_min": 50.0,
      "precio_max": 150.0,
      "comodidades_ids": [1, 3],
      "disponible_desde": "2026-06-01",
      "disponible_hasta": "2026-06-05"
    }
  }
  ```
- Implementación en la capa de servicio:
  - Nuevo método `buscar_alojamientos(filtros)` en `AlojamientoServicio` (ya existente) que compone la consulta dinámicamente según los filtros recibidos.
  - La consulta de disponibilidad se resuelve mediante una subconsulta que excluye IDs de alojamientos con reservas activas solapadas (reutiliza la lógica de solapamiento del dominio de reservas).
- Crear `tests/test_busqueda.py` con pruebas de integración:
  - Búsqueda sin filtros → 200 con paginación.
  - Búsqueda por ciudad → 200 con resultados filtrados.
  - Búsqueda por rango de precio → 200 con resultados en rango.
  - Búsqueda por comodidades → 200 solo con alojamientos que tienen todas las comodidades.
  - Búsqueda con fechas disponibles → 200 excluyendo alojamientos con reservas solapadas.
  - Búsqueda con solo `fecha_inicio` o solo `fecha_fin` → 400.
  - Búsqueda con `comodidades_ids` inválido → 400.
  - Búsqueda con `fecha_fin <= fecha_inicio` → 400.
  - Búsqueda con fecha en el pasado → 400.
  - Búsqueda con `precio_max < precio_min` → 400.
  - Búsqueda con `page` y `per_page` → 200 con paginación correcta.
  - Total: 11 tests.
- Ejecutar toda la suite de pruebas existentes (54 de Sprints 2-7) más las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Búsqueda full-text avanzada (búsqueda por palabras en título/descripción).
- Geolocalización ni mapas.
- Recomendaciones ni ranking personalizado.
- Reseñas ni valoraciones.
- Pagos ni notificaciones.
- Soft delete — se verá en un sprint posterior.
- Auditoría de acciones — fuera del alcance base (Nivel 2).
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.
- Endpoints separados de disponibilidad (la disponibilidad se consulta solo dentro de `GET /buscar`).

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 7 completado y funcionando: reservas con validación de fechas y solapamientos, 54 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-7.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Datos de prueba suficientes: varios alojamientos con distintas ciudades, precios y comodidades, y algunas reservas creadas para validar exclusiones por disponibilidad.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 8 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada — endpoint de búsqueda con query params |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — composición de consultas con filtros dinámicos |
| Flask-Migrate | 4.x | Migraciones | Ya instalada (no participa activamente en este sprint: no hay nuevas tablas ni índices) |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| marshmallow | 3.x | Validación de DTOs | Ya instalada — validación de parámetros de búsqueda |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de búsqueda |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se añaden nuevas dependencias.** El Sprint 8 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Actualizar `app/dominios/alojamientos/dtos.py` | `BuscarAlojamientosDTO` con validación de parámetros opcionales: `ciudad` (string), `precio_min` (float >= 0), `precio_max` (float >= precio_min), `fecha_inicio` (date), `fecha_fin` (date > fecha_inicio, no pasada), `comodidades_ids` (string query param `1,3,5` que el **DTO parsea internamente** a lista de ints), `page` (int >= 1), `per_page` (int 1-50). Si `fecha_inicio` o `fecha_fin` se envía sin el otro → ValidationError → 400. |
| 2 | Añadir método `buscar_alojamientos` a `AlojamientoServicio` | Nuevo método en `AlojamientoServicio` (ya existente) que recibe filtros validados y compone la consulta: filtra por ciudad (igualdad case-insensitive, ej. `lower(ciudad) = lower(valor)`), por rango de precio, por comodidades (JOIN + GROUP BY + HAVING count = total comodidades solicitadas), por disponibilidad (NOT EXISTS reservas confirmadas solapadas). Aplica paginación con SQLAlchemy `paginate`. Devuelve `(resultados, total)`. |
| 3 | Crear método `to_dict_resumen()` en `Alojamiento` | Shape mínimo: `id`, `titulo`, `ciudad`, `precio_noche`, `comodidades` (lista de `{id, nombre}`), `tiene_imagen_principal` (boolean). `to_dict()` se deja intacto para el endpoint de detalle. |
| 4 | Añadir endpoint `GET /api/v1/alojamientos/buscar` en `controladores.py` | Lee query params crudos y los pasa tal cual al `BuscarAlojamientosDTO`. El DTO parsea y valida todo (incluyendo `comodidades_ids` de string a lista de ints). Si hay `ValidationError` responde 400 con detalles. Si pasa validación, llama a `AlojamientoServicio.buscar_alojamientos`, construye respuesta con `data`, `pagination` y `filters`. Responde 200. |
| 5 | Validación de errores de búsqueda | Los errores de validación del DTO (`ValidationError`) se responden directamente como 400 con `{success: false, error: {message, details}}`. No se crea excepción adicional. |
| 6 | Crear `tests/test_busqueda.py` | 11 tests: sin filtros (200), por ciudad (200), por precio (200), por comodidades (200), con fechas disponibles (200), fecha parcial (400), fecha inválida (400), fecha pasada (400), precio inválido (400), `comodidades_ids` inválido (400), paginación (200). |
| 7 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 54 pruebas existentes más las nuevas pasan. |
| 8 | Commit y push | `git add .`, `git commit -m "feat: busqueda de alojamientos con filtros y disponibilidad"`, `git push`. |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Consulta de búsqueda demasiado lenta | Experiencia de usuario pobre | Usar índices en columnas filtradas (`ciudad`, `precio_noche`). Limitar `per_page` a 50 máximo. Considerar optimización posterior si el dataset crece. |
| Filtro por comodidades con lógica incorrecta | Alojamientos que no tienen todas las comodidades aparecen en resultados | Usar `JOIN alojamiento_comodidad WHERE comodidad_id IN (...) GROUP BY alojamiento_id HAVING count(DISTINCT comodidad_id) = N` donde N es la cantidad de comodidades solicitadas. |
| Disponibilidad mal calculada | Alojamientos con reservas solapadas aparecen como disponibles | Reutilizar la regla de solapamiento de Sprint 7: `fecha_inicio_solicitada < fecha_fin_reserva AND fecha_fin_solicitada > fecha_inicio_reserva`. Excluir solo reservas con estado `'confirmada'`. |
| Fechas pasadas permitidas | Búsqueda para fechas que ya ocurrieron | Validar en el DTO o servicio que `fecha_inicio >= date.today()`. Rechazar con 400. |
| Respuesta demasiado grande o sin paginación | Tiempo de respuesta excesivo | Paginación obligatoria con `page` (default 1) y `per_page` (default 20, máximo 50). Incluir `total` y `total_pages` en la respuesta. |
| `comodidades_ids` con formato inválido | Error de parsing o consulta rota | El DTO valida y parsea la cadena `1,3,5` a lista de integers. Si contiene valores no numéricos o negativos, responde 400 con detalles de validación. |
| Shape de respuesta inconsistente con otros endpoints | Confusión para el consumidor | Usar el mismo wrapper `{success, message, data}` ya consolidado en el proyecto. Añadir `pagination` y `filters` como campos adicionales claros. |
| Tests de búsqueda sin datos suficientes | Tests pasan vacíos o no validan filtros correctamente | Crear fixtures con alojamientos variados (distintas ciudades, precios, comodidades) y reservas solapadas para cada caso de prueba. |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] El endpoint `GET /api/v1/alojamientos/buscar` existe y es público (sin auth).
- [ ] El endpoint acepta query params: `ciudad`, `precio_min`, `precio_max`, `fecha_inicio`, `fecha_fin`, `comodidades_ids`, `page`, `per_page`.
- [ ] La búsqueda sin filtros devuelve todos los alojamientos paginados (200).
- [ ] El filtro por ciudad aplica **igualdad case-insensitive** (ej. "Quito" coincide con "quito", pero no con "San Quito"). No es búsqueda parcial ni contains.
- [ ] El filtro por precio funciona correctamente (`precio_min` <= precio <= `precio_max`).
- [ ] El filtro por comodidades solo devuelve alojamientos que tienen **todas** las comodidades solicitadas.
- [ ] Si se envían fechas, se excluyen alojamientos con reservas `'confirmada'` solapadas.
- [ ] Si se envía solo `fecha_inicio` o solo `fecha_fin` (sin la otra), responde 400.
- [ ] Si `comodidades_ids` contiene valores no numéricos o negativos, responde 400.
- [ ] `fecha_fin <= fecha_inicio` responde 400.
- [ ] `fecha_inicio` en el pasado responde 400.
- [ ] `precio_max < precio_min` responde 400.
- [ ] Los errores de validación del DTO responden 400 con `{success: false, error: {message, details}}`. No se usa excepción adicional.
- [ ] La respuesta incluye `data` (lista de alojamientos con shape mínimo), `pagination` (page, per_page, total, total_pages) y `filters` (filtros aplicados).
- [ ] El shape de cada alojamiento en `data` se obtiene mediante `to_dict_resumen()`: `id`, `titulo`, `ciudad`, `precio_noche`, `comodidades`, `tiene_imagen_principal`.
- [ ] `page` por defecto es 1. `per_page` por defecto es 20, máximo 50.
- [ ] Los tests de búsqueda existen y pasan.
- [ ] Las 54 pruebas existentes de Sprints 2-7 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código de búsqueda y disponibilidad está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. El endpoint `GET /api/v1/alojamientos/buscar` responde correctamente con y sin filtros.
4. La validación de parámetros funciona: fechas inválidas, precios invertidos, fechas pasadas → 400.
5. La exclusión por disponibilidad funciona correctamente (alojamientos con reservas solapadas no aparecen).
6. El filtro por comodidades requiere que el alojamiento tenga todas las comodidades solicitadas.
7. La paginación funciona con `page` y `per_page`, y la respuesta incluye `total` y `total_pages`.
8. El shape de respuesta es consistente y mínimo (no incluye datos sensibles ni detalles innecesarios).
9. Los nuevos tests de búsqueda pasan junto con todas las pruebas existentes.
10. No hay errores en consola al ejecutar búsquedas con distintas combinaciones de filtros.
11. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/alojamientos/dtos.py` (actualizado) | `BuscarAlojamientosDTO` con validación y parseo de parámetros de búsqueda (incluye parseo de `comodidades_ids`) |
| `app/dominios/alojamientos/servicios.py` (actualizado) | Método `buscar_alojamientos` en `AlojamientoServicio` con composición de filtros y disponibilidad |
| `app/dominios/alojamientos/modelos.py` (actualizado) | Nuevo método `to_dict_resumen()` con shape mínimo para búsqueda. `to_dict()` se mantiene para detalle completo. |
| `app/dominios/alojamientos/controladores.py` (actualizado) | Endpoint `GET /api/v1/alojamientos/buscar` |
| `tests/test_busqueda.py` | 11 tests de integración de búsqueda con filtros, validación de fechas parciales, `comodidades_ids` inválido y disponibilidad |
| Repositorio Git | Commit con cambios del Sprint 8 |
| Repositorio GitHub | Push exitoso |

---

## 13. Estado

**Pendiente de aprobación** — Este documento requiere validación antes de proceder a la implementación.
