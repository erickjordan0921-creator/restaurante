# Sprint 3 — Roles y autorizacion

---

## 1. Nombre del sprint

**Sprint 3 — Roles y autorizacion**

---

## 2. Objetivo del sprint

Implementar autorizacion basada en roles sobre la capa de autenticacion ya construida en Sprint 2. Hacer que el campo `rol` del modelo `Usuario` deje de ser un dato decorativo y se use realmente para controlar el acceso a rutas protegidas. Crear un decorador `requiere_admin` que restrinja endpoints exclusivos al rol administrador. Anadir al menos un endpoint administrable para demostrar la diferencia entre un usuario normal y un admin. Incluir pruebas de autorizacion.

Al final del sprint, un usuario con `rol='usuario'` no podra acceder a rutas de administrador, y un usuario con `rol='admin'` si podra.

---

## 3. Contexto de negocio

En cualquier plataforma de alojamientos existen al menos dos tipos de participante:

- **Usuarios normales**: se registran, publican alojamientos, hacen reservas.
- **Administradores**: supervisan la plataforma, gestionan usuarios, moderan contenido.

En Sprint 2 el campo `rol` ya existia en el modelo `Usuario` con valor por defecto `'usuario'`, pero no se usaba para nada. En Sprint 3 eso cambia: el rol se convierte en el mecanismo de autorizacion que decide quien puede hacer que.

Este sprint cierra la capa de seguridad (autenticacion + autorizacion) antes de entrar al primer dominio de negocio fuerte (alojamientos en Sprint 4).

---

## 4. Alcance del sprint

Lo que **SI** se construye en este sprint:

- Crear el decorador `requiere_admin` en `app/seguridad.py`. Este decorador:
  - Primero verifica que el usuario este autenticado (reutiliza validacion de token internamente).
  - Luego consulta la BD para verificar que `usuario.rol == 'admin'`.
  - Si no es admin, lanza `PermisoDenegadoError` (manejado por el error handler global que responde 403).
  - Si es admin, ejecuta la funcion decorada.
- Crear un blueprint de administracion `admin_bp` bajo `app/dominios/usuarios/` (modulo existente, se amplia).
- Crear el endpoint `GET /api/v1/admin/usuarios` protegido por `@requiere_admin`:
  - Devuelve la lista de todos los usuarios (id, correo, fecha_creacion, rol).
  - Sin datos sensibles (no devuelve contrasenas).
- Crear excepcion `PermisoDenegadoError`. **Ubicacion:** se define en `app/dominios/usuarios/servicios.py`, junto a las demas excepciones de dominio (`CorreoYaRegistradoError`, `CredencialesInvalidasError`, `UsuarioNoEncontradoError`). Esto mantiene todas las excepciones de negocio centralizadas en la capa de dominio.
- Crear metodo `listar_todos_los_usuarios()` en `UsuarioServicio` para obtener la lista de usuarios sin datos sensibles.
- Crear metodo `promover_a_admin(correo)` en `UsuarioServicio` para asignar rol admin a un usuario existente.
- Registrar el manejador de error `PermisoDenegadoError` → 403 en `app/__init__.py`.
- Registrar el blueprint `admin_bp` en `app/__init__.py` con prefijo `/api/v1/admin`.
- Crear script `scripts/promover_admin.py` para asignar rol `admin` a un usuario existente por correo. Este script:
  - Recibe un correo por linea de comandos.
  - Busca el usuario en la BD.
  - Si existe, cambia su `rol` a `'admin'` y guarda.
  - Si no existe, muestra un error claro.
- Actualizar `tests/conftest.py` para anadir un fixture `admin_auth` que crea un usuario, lo promueve a admin via servicio directo y devuelve headers con token de admin.
- Actualizar `tests/test_usuarios.py` con pruebas de autorizacion:
  - `GET /api/v1/admin/usuarios` sin token → 401.
  - `GET /api/v1/admin/usuarios` con token de usuario normal → 403.
  - `GET /api/v1/admin/usuarios` con token de admin → 200 con lista de usuarios.
- Commit y push del sprint.

---

## 5. Fuera de alcance

Lo que **NO** se hace en este sprint:

- CRUD completo de administracion de usuarios (editar, eliminar) — se vera en un sprint posterior.
- Sistema de permisos granulares (RBAC complejo con multiples roles y permisos por accion).
- Auditoria de acciones administrativas.
- Alojamientos, reservas, comodidades, imagenes, busqueda avanzada, soft delete — sprints posteriores.
- Refresh tokens, blacklist, logout — fuera del alcance base (Nivel 2).
- Rate limiting — fuera del alcance base (Nivel 2).
- Gestion de roles desde la API (crear, editar, eliminar roles) — el rol se gestiona via script manual en esta etapa.
- Documentacion Swagger/Flasgger — se anadira en un sprint posterior.
- Despliegue, Docker, CI/CD — fuera del alcance base.

---

## 6. Prerrequisitos

Antes de iniciar este sprint, se debe tener:

- Sprint 2 completado y funcionando: registro, login, perfil protegido, actualizacion de perfil, tests pasando.
- Repositorio Git actualizado con al menos el commit del Sprint 2.
- Entorno virtual activo.
- MySQL corriendo con `alojamientos_db` y migraciones aplicadas.
- Al menos un usuario registrado en la BD para pruebas manuales.

---

## 7. Herramientas y tecnologias usadas

| Tecnologia | Version | Uso | Justificacion en Sprint 3 |
|---|---|---|---|
| Flask | 3.x | Framework web | Ya instalada |
| Flask-SQLAlchemy | 3.x | ORM | Ya instalada |
| Flask-Migrate | 4.x | Migraciones | Ya instalada |
| Flask-CORS | 6.x | Cross-origin | Ya instalada |
| PyJWT | 2.x | JWT | Ya instalada — se reutiliza en `requiere_admin` |
| Werkzeug | 3.x | Utilidades | Ya instalada |
| PyMySQL | 1.x | Driver MySQL | Ya instalada |
| pytest | 9.x | Framework de pruebas | Ya instalada — nuevos tests de autorizacion |

**No se anaden nuevas dependencias.** El Sprint 3 trabaja con las dependencias ya instaladas en Sprint 2.

---

## 8. Tareas del sprint

| # | Tarea | Detalle |
|---|---|---|
| 1 | Crear `PermisoDenegadoError` | Nueva excepcion en `app/dominios/usuarios/servicios.py`, junto a las demas excepciones de dominio. Mantiene las excepciones de negocio centralizadas en la capa de dominio. |
| 2 | Crear `requiere_admin` en `app/seguridad.py` | Decorador que verifica autenticacion + rol admin. Extrae y valida el JWT, obtiene `usuario_id`, consulta el usuario en la BD, verifica `rol == 'admin'`. Si no es admin, lanza `PermisoDenegadoError`. |
| 3 | Crear `listar_todos_los_usuarios()` en `UsuarioServicio` | Metodo que devuelve lista de todos los usuarios sin datos sensibles (id, correo, fecha_creacion, rol). |
| 4 | Crear `promover_a_admin(correo)` en `UsuarioServicio` | Metodo que busca usuario por correo y cambia su rol a `'admin'`. |
| 5 | Crear blueprint `admin_bp` | En `app/dominios/usuarios/controladores.py`, nuevo blueprint `admin_bp` con ruta `GET /usuarios` protegida por `@requiere_admin`. |
| 6 | Registrar `admin_bp` en app factory | Importar y registrar en `app/__init__.py` con `url_prefix='/api/v1/admin'`. |
| 7 | Registrar error handler para `PermisoDenegadoError` | En `app/__init__.py`, mapear a respuesta 403 con formato consistente. |
| 8 | Crear `scripts/promover_admin.py` | Script que recibe un correo por argumento (`sys.argv[1]`), busca el usuario, cambia su rol a `'admin'` y guarda. Con mensajes de exito y error. |
| 9 | Actualizar `tests/conftest.py` | Anadir fixture `admin_auth`: crea usuario, lo promueve a admin via servicio directo, hace login, devuelve headers con token de admin. |
| 10 | Anadir tests de autorizacion | `GET /admin/usuarios` sin token → 401, con usuario normal → 403, con admin → 200. |
| 11 | Ejecutar toda la suite de tests | `pytest tests/ -v` y verificar que todas las pruebas existentes (11) mas las nuevas pasan. |
| 12 | Commit y push | `git add .`, `git commit -m "feat: roles y autorizacion con decorador requiere_admin"`, `git push`. |

---

## 9. Riesgos o puntos de atencion

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| `requiere_admin` consulta la BD en cada peticion | Impacto menor en rendimiento | Aceptable para esta etapa; en produccion se podria optimizar con cache o claims en el JWT |
| Crear un admin es manual (via script) | No es ideal para produccion, pero es suficiente para aprendizaje | El script `promover_admin.py` resuelve la necesidad de tener un admin para pruebas sin exponer un endpoint de creacion de admin publico |
| Confundir autenticacion con autorizacion | El estudiante puede pensar que `requiere_token` ya basta | Dejar clara la diferencia: `requiere_token` verifica identidad, `requiere_admin` verifica permisos |
| Pruebas de autorizacion fragiles | Si el fixture de admin no se crea correctamente, los tests fallan | El fixture `admin_auth` debe crear un usuario, promoverlo a admin via servicio directo (no via script CLI), y devolver headers con token |
| Exponer contrasenas en `GET /admin/usuarios` | Vulnerabilidad de seguridad | El servicio debe devolver solo campos seguros: id, correo, fecha_creacion, rol. Nunca `contrasena`. |
| `PermisoDenegadoError` no registrado en app factory | La app devuelve 500 en lugar de 403 | Verificar que el error handler esta registrado en `crear_app()`. |

---

## 10. Criterios de aceptacion

El sprint se considera aceptado cuando se cumple **todo** lo siguiente:

- [ ] El decorador `requiere_admin` existe en `app/seguridad.py` y funciona correctamente.
- [ ] `requiere_admin` verifica autenticacion (token JWT valido) y rol (`rol == 'admin'`).
- [ ] La excepcion `PermisoDenegadoError` existe y se lanza cuando un usuario no admin intenta acceder a una ruta protegida.
- [ ] El manejador de error `PermisoDenegadoError` esta registrado en `app/__init__.py` y responde 403 con formato consistente.
- [ ] El blueprint `admin_bp` esta creado y registrado con prefijo `/api/v1/admin`.
- [ ] El endpoint `GET /api/v1/admin/usuarios` existe, requiere autenticacion + rol admin, y devuelve la lista de usuarios sin contrasenas.
- [ ] El script `scripts/promover_admin.py` existe y funciona: cambia el rol de un usuario existente a `'admin'`.
- [ ] Se puede crear un admin de prueba y verificar que su rol cambio en la BD.
- [ ] `GET /api/v1/admin/usuarios` sin token responde 401.
- [ ] `GET /api/v1/admin/usuarios` con token de usuario normal responde 403.
- [ ] `GET /api/v1/admin/usuarios` con token de admin responde 200 con lista de usuarios.
- [ ] `tests/conftest.py` incluye el fixture `admin_auth` que crea un usuario, lo promueve a admin via servicio directo y devuelve headers con token valido.
- [ ] Los tests de autorizacion estan anadidos a `tests/test_usuarios.py` y usan los fixtures `usuario_auth` y `admin_auth`.
- [ ] Todas las pruebas existentes del Sprint 2 (11) siguen pasando.
- [ ] Se hizo commit y push a GitHub.

---

## 11. Definition of Done

El sprint se considera **Done** cuando:

1. Todo el codigo de roles y autorizacion esta versionado en Git con un commit descriptivo.
2. El codigo esta subido al repositorio remoto de GitHub.
3. El decorador `requiere_admin` protege correctamente las rutas de administrador.
4. El endpoint `GET /api/v1/admin/usuarios` funciona con admin y bloquea a usuarios normales.
5. El script `promover_admin.py` permite asignar rol admin a un usuario existente.
6. Las pruebas de autorizacion pasan junto con todas las pruebas existentes del Sprint 2.
7. No hay errores en consola al acceder como admin ni como usuario normal.
8. Las contrasenas nunca se exponen en las respuestas del endpoint de administracion.
9. El `.env` sigue sin estar versionado.

---

## 12. Entregables del sprint

| Entregable | Descripcion |
|---|---|
| `app/seguridad.py` (actualizado) | Nuevo decorador `requiere_admin` |
| `app/dominios/usuarios/servicios.py` (actualizado) | Nueva excepcion `PermisoDenegadoError`, metodos `listar_todos_los_usuarios()` y `promover_a_admin()` en `UsuarioServicio` |
| `app/dominios/usuarios/controladores.py` (actualizado) | Nuevo blueprint `admin_bp` con `GET /usuarios` |
| `app/__init__.py` (actualizado) | Registro de `admin_bp`, error handler para `PermisoDenegadoError` |
| `scripts/promover_admin.py` | Script para asignar rol admin a un usuario existente |
| `tests/conftest.py` (actualizado) | Nuevo fixture `admin_auth` para pruebas de autorizacion |
| `tests/test_usuarios.py` (actualizado) | 3 nuevos tests de autorizacion: sin token (401), usuario normal (403), admin (200) |
| Repositorio Git y GitHub | Commit descriptivo y push al remoto |

---

## 13. Estado

**✅ Completado** — Implementado, validado y subido a GitHub.

- Decorador `requiere_admin` funcionando: autentica, verifica rol y lanza `PermisoDenegadoError` manejado por el handler global (→ 403).
- Endpoint `GET /api/v1/admin/usuarios` responde 200 solo para admins, 403 para usuarios normales, 401 sin token.
- Script `promover_admin.py` operativo: usa `UsuarioServicio.promover_a_admin()` para promover usuarios.
- 3 nuevos tests de autorizacion anadidos. Total 14 tests pasando (11 Sprint 2 + 3 Sprint 3).
