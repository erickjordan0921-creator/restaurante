# Sprint 6 — Imágenes de alojamientos

---

## 1. Nombre del sprint

**Sprint 6 — Imágenes de alojamientos**

---

## 2. Objetivo del sprint

Introducir la **carga y gestión de archivos** en una API REST: crear el modelo `ImagenAlojamiento`, establecer la relación 1:N entre `Alojamiento` e imágenes, implementar almacenamiento local de archivos en disco, validar tipo y tamaño de archivos, y construir los endpoints necesarios para subir, listar y eliminar imágenes de un alojamiento. Añadir pruebas de integración del nuevo flujo y actualizar el detalle del alojamiento para incluir sus imágenes.

Al final del sprint, el estudiante comprenderá cómo se implementa la carga de archivos en una API Flask con buenas prácticas de validación, autorización y almacenamiento local.

---

## 3. Contexto de negocio

En una plataforma de alojamientos, las imágenes son esenciales: un alojamiento sin fotos no tiene atractivo visual. Hasta Sprint 5 el alojamiento solo tenía datos textuales. Ahora el estudiante aprenderá un concepto que toda API real debe manejar: la carga de archivos.

Este sprint enseña:
- recibir archivos vía `multipart/form-data`.
- validar extensiones permitidas y tamaño máximo.
- generar nombres únicos para evitar colisiones.
- almacenar archivos en una carpeta controlada del proyecto.
- persistir metadatos de la imagen en la BD.
- servir archivos de forma simple.
- autorizar operaciones sobre imágenes derivadas del alojamiento.

---

## 4. Alcance del sprint

Lo que **SÍ** se construye en este sprint:

- Crear la estructura del dominio bajo `app/dominios/imagenes/`:
  - `__init__.py` (paquete vacío).
  - `modelos.py` — Modelo `ImagenAlojamiento` con campos:
    - `id` (integer, primary key).
    - `nombre_archivo` (string 255, not null) — nombre original del archivo subido por el usuario.
    - `nombre_interno` (string 255, unique, not null) — nombre único generado por el sistema (uuid + extensión) para evitar colisiones.
    - `alojamiento_id` (integer, FK a `alojamientos.id`, not null).
    - `es_principal` (boolean, default `False`) — indica si la imagen es la principal del alojamiento.
    - `fecha_creacion` (datetime, default now).
    - Relación 1:N con `Alojamiento` (muchas imágenes pertenecen a un alojamiento).
  - `repositorios.py` — Clase `ImagenRepositorio` con métodos: `guardar`, `obtener_por_id`, `obtener_por_alojamiento`, `eliminar`.
  - `servicios.py` — Clase `ImagenServicio` con métodos: `subir_imagen` (valida extensión y tamaño, genera nombre interno con uuid, guarda archivo en disco, persiste metadatos; lanza `ArchivoInvalidoError` si la validación falla; si `es_principal=True`, desmarca automáticamente la imagen principal anterior del mismo alojamiento), `listar_por_alojamiento` (público), `eliminar_imagen` (verifica que el alojamiento existe y que el usuario es propietario o admin, elimina archivo de disco y registro de BD).
    - Excepciones: `ImagenNoEncontradaError`, `ArchivoInvalidoError` (extensión no permitida o tamaño excedido).
  - `controladores.py` — Blueprint `imagenes_bp` con endpoints:
    - `POST /api/v1/alojamientos/<id>/imagenes` — subir imagen (requiere autenticación + ser propietario o admin). Recibe `multipart/form-data` con campo `imagen` (archivo) y campo opcional `es_principal` (booleano).
    - `GET /api/v1/alojamientos/<id>/imagenes` — listar imágenes de un alojamiento (público).
    - `GET /api/v1/imagenes/<id>` — obtener metadatos de una imagen (público).
    - `GET /api/v1/imagenes/<id>/archivo` — servir el archivo de imagen (público, lectura desde disco).
    - `DELETE /api/v1/imagenes/<id>` — eliminar imagen (requiere autenticación + ser propietario o admin del alojamiento asociado).
- Configurar constantes de validación en `app/config.py`:
  - Extensiones permitidas: `{'png', 'jpg', 'jpeg', 'webp'}`.
  - Tamaño máximo: 5 MB.
  - Carpeta de almacenamiento: `uploads/alojamientos/` dentro del proyecto.
- Actualizar `Alojamiento.to_dict()` para incluir la lista de imágenes (solo metadatos: id, nombre_archivo, es_principal, url_archivo). El campo `url_archivo` se construye como `/api/v1/imagenes/<id>/archivo` para que el cliente pueda descargar la imagen.
- Actualizar `app/__init__.py` para:
  - Registrar `imagenes_bp` con prefijo `/api/v1`.
  - Registrar error handlers: `ImagenNoEncontradaError` → 404, `ArchivoInvalidoError` → 400.
- Configurar Flask para permitir `multipart/form-data` y limitar `MAX_CONTENT_LENGTH` a 16 MB (doble del máximo de una imagen individual para dar margen).
- Generar la migración con `flask db migrate -m "crear tabla imagenes_alojamiento"` y aplicarla con `flask db upgrade`.
- Crear `tests/test_imagenes.py` con pruebas de integración:
  - Subir imagen como propietario → 201.
  - Subir imagen sin auth → 401.
  - Subir imagen como usuario ajeno → 403.
  - Subir archivo con extensión no permitida → 400.
  - Subir archivo que excede tamaño máximo → 400.
  - Listar imágenes de alojamiento → 200.
  - Eliminar imagen como propietario → 204.
  - Eliminar imagen como usuario ajeno → 403.
- Ejecutar toda la suite de pruebas existentes (33 de Sprints 2-5) más las nuevas.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- Almacenamiento en S3, Cloudinary u otro proveedor externo — las imágenes se guardan en disco local.
- Procesamiento de imágenes (redimensionar, recortar, optimizar).
- Generación de thumbnails o múltiples tamaños.
- CDN para servir imágenes.
- Reservas — se verá en un sprint posterior.
- Búsqueda avanzada ni filtros por imágenes.
- Soft delete — se verá en un sprint posterior.
- Auditoría de acciones — fuera del alcance base (Nivel 2).
- Documentación Swagger/Flasgger — se añadirá en un sprint posterior.
- Rate limiting — fuera del alcance base (Nivel 2).
- Despliegue, Docker, CI/CD — fuera del alcance base.
- Subida de base64 — la ruta oficial es `multipart/form-data`.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 5 completado y funcionando: alojamientos con comodidades, 33 tests pasando.
- Repositorio Git actualizado con todos los commits de Sprints 1-5.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Carpeta `uploads/` existente en el proyecto (creada en Sprint 1).
- Al menos un alojamiento registrado para pruebas manuales.

---

## 7. Herramientas y tecnologías usadas

| Tecnología | Versión | Uso | Justificación en Sprint 6 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada — soporta `multipart/form-data` nativamente para recepción de archivos |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada — modelo `ImagenAlojamiento` |
| Flask-Migrate | 4.x | Migraciones | Ya instalada — nueva migración para imágenes |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — protección de rutas de subida/eliminación |
| Werkzeug | 3.x | Utilidades | Ya instalada — `secure_filename` para sanitizar nombres de archivo |
| marshmallow | 3.x | Validación de DTOs | Ya instalada (aunque en este sprint la validación de archivos se delega al servicio, no se usa Marshmallow) |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de imágenes |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| python-dotenv | 1.x | Carga de `.env` | Ya instalada |

**No se añaden nuevas dependencias.** El Sprint 6 trabaja con las dependencias ya instaladas. `werkzeug.utils.secure_filename` se usa para sanitizar nombres de archivo.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear estructura del dominio | `app/dominios/imagenes/` con `__init__.py` vacío |
| 2 | Crear `app/dominios/imagenes/modelos.py` | Modelo `ImagenAlojamiento` (id, nombre_archivo, nombre_interno unique, alojamiento_id FK, es_principal boolean, fecha_creacion). Relación 1:N: `Alojamiento.imagenes` con `back_populates`. Relación inversa: `ImagenAlojamiento.alojamiento`. |
| 3 | Crear `app/dominios/imagenes/repositorios.py` | Clase `ImagenRepositorio`: guardar, obtener_por_id, obtener_por_alojamiento, eliminar. |
| 4 | Crear `app/dominios/imagenes/servicios.py` | Clase `ImagenServicio`: `subir_imagen` (valida extensión y tamaño con reglas fijas, genera nombre interno con uuid, guarda archivo en `uploads/alojamientos/`, persiste metadatos; **si `es_principal=True`, desmarca automáticamente la imagen principal anterior del mismo alojamiento**), `listar_por_alojamiento`, `eliminar_imagen` (elimina archivo de disco y registro de BD). Excepciones: `ImagenNoEncontradaError`, `ArchivoInvalidoError`. |
| 5 | Crear `app/dominios/imagenes/controladores.py` | Blueprint `imagenes_bp` con 5 endpoints: POST subir (multipart/form-data, propietario o admin), GET listar (público), GET metadatos (público), GET archivo (público, sirve archivo desde disco), DELETE eliminar (propietario o admin). |
| 6 | Actualizar `Alojamiento.to_dict()` | Añadir campo `imagenes` que devuelve lista de metadatos: `id`, `nombre_archivo`, `es_principal`, `url_archivo` (construido como `/api/v1/imagenes/<id>/archivo`). |
| 7 | Configurar constantes en `app/config.py` | Añadir a la clase `Config`: `IMAGENES_EXTENSIONES_PERMITIDAS = {'png', 'jpg', 'jpeg', 'webp'}`, `IMAGENES_TAMANO_MAXIMO = 5 * 1024 * 1024` (5 MB), `IMAGENES_UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'alojamientos')`, `MAX_CONTENT_LENGTH = 16 * 1024 * 1024` (16 MB). Flask recibe `multipart/form-data` de forma natural y usa `MAX_CONTENT_LENGTH` desde `Config`. |
| 8 | Registrar `imagenes_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1'`. |
| 9 | Registrar error handlers de imágenes | En `app/__init__.py`, mapear `ImagenNoEncontradaError` → 404, `ArchivoInvalidoError` → 400. |
| 10 | Generar migración | `flask db migrate -m "crear tabla imagenes_alojamiento"`. |
| 11 | Aplicar migración | `flask db upgrade`. |
| 12 | Crear `tests/test_imagenes.py` | 10 tests: subir como propietario (201), subir sin auth (401), subir como usuario ajeno (403), extensión no permitida (400), archivo muy grande (400), listar imágenes (200), metadatos de imagen (200), archivo de imagen (200), eliminar como propietario (204), eliminar como usuario ajeno (403). |
| 13 | Ejecutar toda la suite | `pytest tests/ -v` y verificar que las 33 pruebas existentes más las nuevas pasan. |
| 14 | Commit y push | `git add .`, `git commit -m "feat: carga y gestion de imagenes para alojamientos"`, `git push`. |

---

## 9. Riesgos o puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Colisión de nombres de archivo | Dos imágenes con el mismo nombre sobrescriben la anterior | Generar `nombre_interno` con `uuid4` + extensión original. Nunca usar el nombre original del archivo como nombre en disco. |
| Subida de archivos maliciosos | Ejecutables disfrazados como imágenes | Validar extensión contra whitelist estricta. Usar `werkzeug.utils.secure_filename` para sanitizar el nombre original. |
| Archivos demasiado grandes | Consumo de memoria o timeout | Configurar `MAX_CONTENT_LENGTH = 16 MB` en Flask. Rechazar archivos que superen 5 MB con validación explícita en el servicio. |
| Eliminación de imagen sin borrar archivo de disco | Archivos huérfanos que consumen espacio | El servicio `eliminar_imagen` debe eliminar tanto el registro de BD como el archivo físico de `uploads/alojamientos/`. |
| Carpeta `uploads/alojamientos/` no existe | Error al guardar el archivo | Crear la carpeta si no existe al iniciar la app o al subir la primera imagen. |
| Tests de archivos no funcionan sin archivos reales | Tests fallan porque no hay archivo para subir | Usar `io.BytesIO` para crear archivos de prueba en memoria con contenido PNG/JPG mínimo. |
| `es_principal` con múltiples `True` por alojamiento | Inconsistencia de datos | Al marcar una imagen como principal, actualizar las demás del mismo alojamiento a `es_principal=False` dentro del mismo método `subir_imagen`. |
| Import circular entre modelos | `ImagenAlojamiento` importa `Alojamiento` y viceversa | Usar string `'Alojamiento'` en la relación de SQLAlchemy o importar de forma controlada. |
| Servir archivos estáticos sin control de acceso | Acceso directo a archivos sin validación | Los archivos se sirven desde un endpoint controlado (`GET /imagenes/<id>/archivo`) que valida que la imagen existe antes de leer el disco. |

---

## 10. Criterios de aceptación

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] La carpeta `app/dominios/imagenes/` existe con todos los archivos: `__init__.py`, `modelos.py`, `repositorios.py`, `servicios.py`, `controladores.py`.
- [ ] El modelo `ImagenAlojamiento` tiene campos: id, nombre_archivo, nombre_interno (unique), alojamiento_id (FK), es_principal (boolean), fecha_creacion.
- [ ] La relación 1:N entre `Alojamiento` e `ImagenAlojamiento` funciona correctamente.
- [ ] Las constantes de validación están definidas en `app/config.py`: extensiones permitidas, tamaño máximo 5 MB, ruta de almacenamiento.
- [ ] `MAX_CONTENT_LENGTH` está configurado en Flask (16 MB).
- [ ] El servicio valida extensión y tamaño antes de guardar.
- [ ] El nombre interno del archivo se genera con uuid para evitar colisiones.
- [ ] El blueprint `imagenes_bp` está registrado con prefijo `/api/v1`.
- [ ] `POST /api/v1/alojamientos/<id>/imagenes` con propietario y archivo válido responde 201.
- [ ] `POST /api/v1/alojamientos/<id>/imagenes` sin token responde 401.
- [ ] `POST /api/v1/alojamientos/<id>/imagenes` con usuario ajeno responde 403.
- [ ] `POST /api/v1/alojamientos/<id>/imagenes` con extensión no permitida responde 400.
- [ ] `POST /api/v1/alojamientos/<id>/imagenes` con archivo que excede 5 MB responde 400.
- [ ] `GET /api/v1/alojamientos/<id>/imagenes` sin auth responde 200 con lista de imágenes.
- [ ] `GET /api/v1/imagenes/<id>` sin auth responde 200 con metadatos de la imagen (id, nombre_archivo, es_principal, url_archivo).
- [ ] `GET /api/v1/imagenes/<id>/archivo` sin auth responde 200 sirviendo el archivo de imagen desde disco.
- [ ] `GET /api/v1/imagenes/<id>/archivo` con ID inexistente responde 404.
- [ ] `DELETE /api/v1/imagenes/<id>` con propietario responde 204 y elimina archivo de disco.
- [ ] `DELETE /api/v1/imagenes/<id>` con usuario ajeno responde 403.
- [ ] `GET /api/v1/alojamientos/<id>` incluye la lista de imágenes en la respuesta con campo `url_archivo`.
- [ ] Al subir una imagen con `es_principal=True`, las demás imágenes del mismo alojamiento quedan con `es_principal=False`.
- [ ] La migración fue generada y aplicada exitosamente.
- [ ] Los tests de imágenes existen y pasan.
- [ ] Las 33 pruebas existentes de Sprints 2-5 siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el código del dominio de imágenes está versionado en Git con un commit descriptivo.
2. El código está subido al repositorio remoto de GitHub.
3. La migración de imágenes fue generada y aplicada exitosamente.
4. Los endpoints de imágenes responden correctamente según los criterios de aceptación.
5. La subida de imágenes funciona con validación de extensión y tamaño.
6. La eliminación de imágenes elimina tanto el registro de BD como el archivo de disco.
7. El detalle del alojamiento incluye la lista de imágenes.
8. Los nuevos tests de imágenes pasan junto con todas las pruebas existentes.
9. No hay errores en consola al subir, listar ni eliminar imágenes.
10. La relación 1:N entre `Alojamiento` e `ImagenAlojamiento` es correcta.
11. El `.env` sigue sin estar versionado.
12. La carpeta `uploads/alojamientos/` existe y es funcional.

---

## 12. Entregables del sprint

| Entregable | Descripción |
|---|---|
| `app/dominios/imagenes/modelos.py` | Modelo `ImagenAlojamiento` con relación 1:N a `Alojamiento` |
| `app/dominios/imagenes/repositorios.py` | Clase `ImagenRepositorio` con operaciones CRUD |
| `app/dominios/imagenes/servicios.py` | Clase `ImagenServicio` + excepciones `ImagenNoEncontradaError`, `ArchivoInvalidoError` |
| `app/dominios/imagenes/controladores.py` | Blueprint `imagenes_bp` con 5 endpoints (subir, listar, metadatos, archivo, eliminar) |
| `app/dominios/alojamientos/modelos.py` (actualizado) | `to_dict()` actualizado para incluir lista de imágenes |
| `app/config.py` (actualizado) | Constantes: `IMAGENES_EXTENSIONES_PERMITIDAS`, `IMAGENES_TAMANO_MAXIMO`, `IMAGENES_UPLOAD_DIR`, `MAX_CONTENT_LENGTH` |
| `app/__init__.py` (actualizado) | Registro de `imagenes_bp`, error handlers de imágenes |
| `uploads/alojamientos/` | Carpeta de almacenamiento local de imágenes (con `.gitkeep` si aplica) |
| `migrations/versions/<hash>_crear_tabla_imagenes_alojamiento.py` | Migración: tabla `imagenes_alojamiento` |
| `tests/test_imagenes.py` | 10 tests de integración: carga, listado, metadatos, archivo, y eliminación de imágenes |
| Repositorio Git | Commit con cambios del Sprint 6 |
| Repositorio GitHub | Push exitoso |

---

## 13. Estado

**Pendiente de aprobación** — Este documento requiere validación antes de proceder a la implementación.
