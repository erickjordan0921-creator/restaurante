# Sprint 7 — Reservas

---

## 1. Nombre del sprint

**Sprint 7 — Reservas**

---

## 2. Objetivo del sprint

Introducir el dominio de **reservas** en el proyecto: crear el modelo `Reserva` que relaciona un usuario con un alojamiento para un rango de fechas, implementar validación de fechas (fin > inicio, sin fechas pasadas), prevención de solapamientos para el mismo alojamiento, cálculo del total como `noches × precio_noche`, estados básicos de reserva (`confirmada`, `cancelada`), y los endpoints necesarios para crear una reserva, listar las reservas del usuario autenticado, ver el detalle de una reserva y cancelarla.

Al final del sprint, el estudiante comprenderá cómo se modela un recurso con reglas de negocio complejas (validación de rangos, solapamientos, cálculo derivado) y cómo se aplica autorización sobre recursos que involucran múltiples entidades.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, las reservas son el corazón del negocio: conectan a un huésped con un alojamiento en un período determinado. Hasta Sprint 6 el proyecto ya tiene usuarios, alojamientos, comodidades e imágenes. El siguiente paso natural es permitir que un usuario reserve un alojamiento.

Este sprint enseña:
- modelar un recurso que depende de dos entidades (`Usuario` y `Alojamiento`).
- validar rangos de fechas coherentes.
- prevenir solapamientos de reservas para el mismo alojamiento.
- calcular un valor derivado (`total = noches × precio_noche`) al momento de crear la reserva.
- manejar estados básicos (`confirmada`, `cancelada`).
- aplicar reglas de autorización: un usuario solo ve y cancela sus propias reservas; el propietario de un alojamiento o un admin pueden ver el detalle de una reserva asociada a ese alojamiento.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/reservas/`:
  - `__init__.py` (paquete vacío).
  - `modelos.py` — Modelo `Reserva` con campos:
    - `id` (integer, primary key).
    - `usuario_id` (integer, FK a `usuarios.id`, not null) — el huésped que reserva.
    - `alojamiento_id` (integer, FK a `alojamientos.id`, not null).
    - `fecha_inicio` (date, not null) — primer día de la estancia.
    - `fecha_fin` (date, not null) — último día de la estancia (exclusive; la noche de `fecha_fin` no se incluye).
    - `total` (float, not null) — calculado como `noches × precio_noche` del alojamiento al momento de crear.
    - `estado` (string 20, not null, default `'confirmada'`) — estados válidos: `'confirmada'`, `'cancelada'`.
    - `fecha_creacion` (datetime, default now).
    - Relación N:1 con `Usuario` (muchas reservas pertenecen a un usuario).
    - Relación N:1 con `Alojamiento` (muchas reservas pertenecen a un alojamiento).
  - `dtos.py` — Esquema `CrearReservaDTO` con validación: `fecha_inicio` (date requerida), `fecha_fin` (date requerida). El servicio valida reglas de negocio adicionales.
  - `repositorios.py` — Clase `ReservaRepositorio` con métodos: `guardar`, `obtener_por_id`, `obtener_por_usuario`, `obtener_por_alojamiento`, `existe_solapamiento(alojamiento_id, fecha_inicio, fecha_fin, reserva_id_a_excluir=None)`.
  - `servicios.py` — Clase `ReservaServicio` con métodos:
    - `crear_reserva(usuario_id, alojamiento_id, fecha_inicio, fecha_fin)`:
      - Valida que `fecha_fin > fecha_inicio`.
      - Valida que `fecha_inicio` no sea en el pasado (comparación con fecha actual).
      - Valida que el alojamiento existe.
      - Valida que el usuario no está reservando su propio alojamiento (el `usuario_id` del huésped no puede ser igual al `usuario_id` del alojamiento).
      - Verifica que no exista una reserva activa (estado `'confirmada'`) que se solape en fechas para el mismo alojamiento. Si existe → `ReservaSolapadaError`.
      - Calcula `noches = (fecha_fin - fecha_inicio).days`.
      - Obtiene `precio_noche` del alojamiento.
      - Calcula `total = noches × precio_noche`.
      - Crea la reserva con estado `'confirmada'`.
    - `listar_mis_reservas(usuario_id)`: devuelve las reservas del usuario autenticado (incluye datos del alojamiento y de la reserva).
    - `obtener_detalle(reserva_id, usuario_id)`:
      - Busca la reserva por ID. Si no existe → `ReservaNoEncontradaError`.
      - Consulta internamente el usuario y su rol.
      - Si el usuario es el huésped de la reserva → puede ver.
      - Si el usuario es el propietario del alojamiento asociado → puede ver.
      - Si el usuario es admin → puede ver.
      - Si no tiene ningún rol válido → `PermisoDenegadoError`.
    - `cancelar_reserva(reserva_id, usuario_id)`:
      - Solo el huésped (usuario que creó la reserva) puede cancelar.
      - Si la reserva no existe → `ReservaNoEncontradaError`.
      - Si la reserva ya está `'cancelada'` → `ReservaYaCanceladaError`.
      - Cambia estado a `'cancelada'`.
    - Excepciones: `ReservaNoEncontradaError`, `ReservaSolapadaError`, `ReservaYaCanceladaError`.
  - `controladores.py` — Blueprint `reservas_bp` con endpoints:
    - `POST /api/v1/reservas` — crear reserva (requiere autenticación).
    - `GET /api/v1/reservas/mis-reservas` — listar reservas del usuario autenticado.
    - `GET /api/v1/reservas/<id>` — ver detalle de una reserva (huésped, propietario del alojamiento o admin).
    - `POST /api/v1/reservas/<id>/cancelar` — cancelar reserva (solo el huésped).
- Generar la migración con `flask db migrate -m "crear tabla reservas"` y aplicarla con `flask db upgrade`.
- Registrar `reservas_bp` y sus error handlers en el app factory.
- Crear `tests/test_reservas.py` con pruebas de integración:
  - Crear reserva válida → 201.
  - Crear reserva sin auth → 401.
  - Crear reserva con `fecha_fin <= fecha_inicio` → 400.
  - Crear reserva con fecha en el pasado → 400.
  - Crear reserva que solapa con otra activa → 400.
  - Crear reserva del propio alojamiento → 403.
  - Listar mis reservas → 200.
  - Ver detalle como huésped → 200.
  - Ver detalle como propietario del alojamiento → 200.
  - Ver detalle como usuario no autorizado → 403.
  - Ver detalle de reserva inexistente → 404.
  - Cancelar reserva como huésped → 200.
  - Cancelar reserva como otro usuario → 403.
  - Cancelar reserva ya cancelada → 400.
- Ejecutar toda la suite de pruebas existentes (41 de Sprints 2-6) más las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Pagos, facturación ni integración con pasarelas de pago.
- Confirmaciones por correo ni notificaciones.
- Reseñas ni valoraciones.
- Múltiples estados complejos (solo `confirmada` y `cancelada`).
- Modificación de fechas de una reserva existente.
- Lista de espera ni overbooking controlado.
- Búsqueda de disponibilidad avanzada (endpoint separado para consultar disponibilidad de un alojamiento en un rango).
- Soft delete — se verá en un sprint posterior.
- Auditoría de acciones — fuera del alcance base (Nivel 2).
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 6 completado y funcionando: alojamientos con imágenes, 41 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-6.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un alojamiento registrado y un usuario autenticado para pruebas manuales.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 7 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `Reserva` |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migración para reservas |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — protección de rutas de reservas |
| Werkzeug | 3.x | Utilidades | Ya instalada |
| marshmallow | 3.x | Validación de DTOs | Ya instalada — validación de fechas de entrada |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de reservas |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se añaden nuevas dependencias.** El Sprint 7 trabaja con las dependencias ya instaladas.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/reservas/` con `__init__.py` vacío |
| 2 | Crear `app/dominios/reservas/modelos.py` | Modelo `Reserva` (id, usuario_id FK, alojamiento_id FK, fecha_inicio date, fecha_fin date, total float, estado string default 'confirmada', fecha_creacion datetime). Relaciones N:1 con `Usuario` y `Alojamiento`. |
| 3 | Crear `app/dominios/reservas/dtos.py` | `CrearReservaDTO`: `fecha_inicio` (date requerida), `fecha_fin` (date requerida). Validación básica de formato; reglas de negocio en el servicio. |
| 4 | Crear `app/dominios/reservas/repositorios.py` | Clase `ReservaRepositorio`: guardar, obtener_por_id, obtener_por_usuario, obtener_por_alojamiento, `existe_solapamiento(alojamiento_id, fecha_inicio, fecha_fin, reserva_id_a_excluir=None)`. Este método usa una consulta SQL que verifica si existe una reserva con estado `'confirmada'` cuyas fechas se crucen: `fecha_inicio_nueva < fecha_fin_existente AND fecha_fin_nueva > fecha_inicio_existente`. |
| 5 | Crear `app/dominios/reservas/servicios.py` | Clase `ReservaServicio`: `crear_reserva` (valida fechas, alojamiento, no-reserva-propia, solapamiento, calcula total, crea con estado `'confirmada'`), `listar_mis_reservas`, `obtener_detalle` (busca reserva, consulta internamente rol del usuario, permite huésped/propietario/admin, lanza `PermisoDenegadoError` o `ReservaNoEncontradaError`), `cancelar_reserva` (solo huésped, verifica no-cancelada, lanza `ReservaNoEncontradaError` o `ReservaYaCanceladaError`). Excepciones: `ReservaNoEncontradaError`, `ReservaSolapadaError`, `ReservaYaCanceladaError`. |
| 6 | Crear `app/dominios/reservas/controladores.py` | Blueprint `reservas_bp` con 4 endpoints: POST crear (auth), GET mis-reservas (auth), GET detalle (auth + verificación de permiso), POST cancelar (auth + solo huésped). |
| 7 | Registrar `reservas_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1/reservas'`. Registrar error handlers nuevos del sprint: `ReservaNoEncontradaError` → 404, `ReservaSolapadaError` → 400, `ReservaYaCanceladaError` → 400. (`PermisoDenegadoError` ya tiene handler global registrado desde Sprint 3). |
| 8 | Generar migración | `flask db migrate -m "crear tabla reservas"`. |
| 9 | Aplicar migración | `flask db upgrade`. |
| 10 | Crear `tests/test_reservas.py` | 14 tests: crear válida (201), crear sin auth (401), fecha inválida (400), fecha pasada (400), solapamiento (400), reserva propia (403), listar mis reservas (200), detalle como huésped (200), detalle como propietario (200), detalle como usuario no autorizado (403), detalle inexistente (404), cancelar como huésped (200), cancelar como otro (403), cancelar ya cancelada (400). |
| 11 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 41 pruebas existentes más las nuevas pasan. |
| 12 | Commit y push | `git add .`, `git commit -m "feat: dominio reservas con validacion de fechas, solapamientos y cancelacion"`, `git push`. |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Solapamiento no detectado correctamente | Dos reservas activas para el mismo alojamiento en las mismas fechas | La consulta de `existe_solapamiento` debe usar la regla correcta: `fecha_inicio_nueva < fecha_fin_existente AND fecha_fin_nueva > fecha_inicio_existente`. Cubrir con test dedicado. |
| Fechas pasadas permitidas | Usuario reserva para fechas que ya pasaron | Validar en el servicio que `fecha_inicio >= date.today()`. Rechazar con excepción de validación. |
| Cálculo de noches incorrecto | El total no coincide con las noches reales | Usar `(fecha_fin - fecha_inicio).days` (Python datetime). La noche de `fecha_fin` no se cuenta (rango semi-abierto). |
| Usuario reserva su propio alojamiento | Inconsistencia de negocio | Validar que `usuario_id` del huésped no sea igual al `usuario_id` del alojamiento. Rechazar con `PermisoDenegadoError`. |
| Cancelar reserva que no es del usuario | Violación de autorización | Solo el huésped (usuario que creó la reserva) puede cancelar. Verificar `reserva.usuario_id == usuario_id`. |
| Cancelar reserva ya cancelada | Estado inválido | Verificar que `reserva.estado == 'confirmada'` antes de cambiar. Lanzar `ReservaYaCanceladaError`. |
| Import circular entre modelos | `Reserva` importa `Usuario` o `Alojamiento` y viceversa | Usar strings `'Usuario'` y `'Alojamiento'` en las relaciones de SQLAlchemy. |
| Tests de reservas con datos de sprints anteriores | Tests fallan por falta de alojamiento o usuario | Crear los datos necesarios dentro de cada test o usar fixtures con uuid para evitar colisiones. |
| `total` se recalcula al actualizar `precio_noche` del alojamiento | Inconsistencia si el precio cambia después | El `total` se calcula y almacena **al momento de crear** la reserva. No se recalcula si el precio del alojamiento cambia después. Esto es intencional: el precio queda congelado en la reserva. |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/reservas/` existe con todos los archivos: `__init__.py`, `modelos.py`, `dtos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `Reserva` tiene campos: id, usuario_id (FK), alojamiento_id (FK), fecha_inicio, fecha_fin, total, estado (default `'confirmada'`), fecha_creacion.
- [ ] Las relaciones N:1 con `Usuario` y `Alojamiento` funcionan correctamente.
- [ ] El DTO `CrearReservaDTO` valida que `fecha_inicio` y `fecha_fin` sean dates requeridas.
- [ ] El repositorio implementa `existe_solapamiento` con la consulta correcta.
- [ ] El servicio valida: `fecha_fin > fecha_inicio`, `fecha_inicio` no en el pasado, alojamiento existe, usuario no es propietario del alojamiento, no hay solapamiento con reserva activa.
- [ ] El servicio calcula `total = noches × precio_noche` al crear.
- [ ] El servicio `cancelar_reserva` solo permite al huésped cancelar y verifica que no esté ya cancelada.
- [ ] El blueprint `reservas_bp` está registrado con prefijo `/api/v1/reservas`.
- [ ] Los error handlers nuevos del sprint están registrados: `ReservaNoEncontradaError` → 404, `ReservaSolapadaError` → 400, `ReservaYaCanceladaError` → 400. (`PermisoDenegadoError` ya tenía handler desde Sprint 3).
- [ ] `GET /api/v1/reservas/<id>` de reserva inexistente responde 404 mediante `ReservaNoEncontradaError`.
- [ ] `POST /api/v1/reservas/<id>/cancelar` de reserva inexistente responde 404 mediante `ReservaNoEncontradaError`.
- [ ] La migración fue generada y aplicada exitosamente.
- [ ] `POST /api/v1/reservas` con datos válidos responde 201 con `total` calculado y estado `'confirmada'`.
- [ ] `POST /api/v1/reservas` sin token responde 401.
- [ ] `POST /api/v1/reservas` con `fecha_fin <= fecha_inicio` responde 400.
- [ ] `POST /api/v1/reservas` con fecha en el pasado responde 400.
- [ ] `POST /api/v1/reservas` que solapa con reserva activa responde 400.
- [ ] `POST /api/v1/reservas` del propio alojamiento responde 403.
- [ ] `GET /api/v1/reservas/mis-reservas` con token responde 200 con lista de reservas del usuario.
- [ ] `GET /api/v1/reservas/<id>` como huésped responde 200.
- [ ] `GET /api/v1/reservas/<id>` como propietario del alojamiento responde 200.
- [ ] `GET /api/v1/reservas/<id>` como usuario no autorizado responde 403.
- [ ] `GET /api/v1/reservas/<id>` de reserva inexistente responde 404.
- [ ] `POST /api/v1/reservas/<id>/cancelar` como huésped responde 200 con estado `'cancelada'`.
- [ ] `POST /api/v1/reservas/<id>/cancelar` como otro usuario responde 403.
- [ ] `POST /api/v1/reservas/<id>/cancelar` sobre reserva ya cancelada responde 400.
- [ ] Los tests de reservas existen y pasan.
- [ ] Las 41 pruebas existentes de Sprints 2-6 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código del dominio de reservas está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. La migración de reservas fue generada y aplicada exitosamente.
4. Los endpoints de reservas responden correctamente según los criterios de aceptación.
5. La validación de fechas y solapamientos funciona correctamente.
6. El cálculo del total (`noches × precio_noche`) es correcto y se congela al crear la reserva.
7. La cancelación de reservas está autorizada solo para el huésped y no permite doble cancelación.
8. Los nuevos tests de reservas pasan junto con todas las pruebas existentes.
9. No hay errores en consola al crear, listar ni cancelar reservas.
10. Las relaciones entre `Reserva`, `Usuario` y `Alojamiento` son correctas.
11. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/reservas/modelos.py` | Modelo `Reserva` con relaciones N:1 a `Usuario` y `Alojamiento` |
| `app/dominios/reservas/dtos.py` | DTO `CrearReservaDTO` con validación de fechas |
| `app/dominios/reservas/repositorios.py` | Clase `ReservaRepositorio` con CRUD + `existe_solapamiento` |
| `app/dominios/reservas/servicios.py` | Clase `ReservaServicio` + excepciones `ReservaNoEncontradaError`, `ReservaSolapadaError`, `ReservaYaCanceladaError` |
| `app/dominios/reservas/controladores.py` | Blueprint `reservas_bp` con 4 endpoints |
| `app/__init__.py` (actualizado) | Registro de `reservas_bp`, error handlers de reservas |
| `migrations/versions/<hash>_crear_tabla_reservas.py` | Migración: tabla `reservas` |
| `tests/test_reservas.py` | 14 tests de integración de reservas: creación, validación de fechas, solapamientos, permisos de detalle y cancelación |
| Repositorio Git | Commit con cambios del Sprint 7 |
| Repositorio GitHub | Push exitoso |

---

## 13. Estado

**Pendiente de aprobación** — Este documento requiere validación antes de proceder a la implementación.
