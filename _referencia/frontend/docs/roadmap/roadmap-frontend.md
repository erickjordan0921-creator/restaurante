# Roadmap frontend

Este roadmap guía la construcción de una SPA vanilla profesional para consumir el backend de alojamientos. Su propósito es ordenar el aprendizaje, separar lo implementable de lo futuro y mantener el frontend independiente, pero alineado con el contrato real del backend.

## Stack del frontend

El frontend se construirá únicamente con:

- HTML5
- CSS3
- JavaScript vanilla moderno
- Bootstrap 5.3
- Bootstrap Icons
- Vite
- Fetch API
- npm
- Git
- Git Bash
- Router propio
- Componentes vanilla
- Guards de autenticación y rol
- Cliente HTTP centralizado

Router propio y guards forman parte del MVP final, pero se incorporan desde Sprint 3. En Sprint 1 y Sprint 2 todavía no existen como archivos separados.

## Principio de trabajo

El frontend solo debe implementar funcionalidades respaldadas por endpoints reales del backend.

Las funcionalidades futuras pueden documentarse como roadmap, pero no deben implementarse hasta que el backend las soporte.

## Estado general del proyecto

El backend está organizado en 10 sprints documentados. Para el frontend:

- Los sprints 1 y 2 ya están alineados con los tutoriales aprobados.
- Los sprints 1 al 5 están documentados e implementables con tutorial.
- Los sprints 6 al 10 quedan como futuro.

Esto permite avanzar de forma ordenada sin simular funcionalidades que todavía no existen del lado del servidor.

## Tabla general de sprints

| Sprint | Nombre | Estado | Tutorial | Resultado esperado |
| --- | --- | --- | --- | --- |
| 1 | Base SPA con Vite y Bootstrap | Documentado / implementable con tutorial | Sí | Base técnica lista con `index.html`, `#app`, `package.json`, `package-lock.json`, `vite.config.js`, `.env.example`, `src/js/main.js`, `src/css/main.css`, Bootstrap 5.3, Bootstrap Icons y validación con `npm run dev`, `npm run build` y `npm run preview` |
| 2 | Usuarios y autenticación | Documentado / implementable con tutorial | Sí | Registro, login, logout, sesión local, token y usuario en `localStorage`, `src/js/api/http.js`, `src/js/api/auth.api.js`, `src/js/auth/session.service.js`, `src/js/utils/storage.js`, `src/js/utils/errorMessages.js`, navbar según sesión, perfil protegido de forma básica y navegación simple dentro de `src/js/main.js` |
| 3 | Roles, autorización y guards | Documentado / implementable con tutorial | Sí | Guards de ruta, rol admin, lectura de 401 y 403, acceso administrativo protegido |
| 4 | Alojamientos | Documentado / implementable con tutorial | Sí | Listado público, detalle público y CRUD protegido según propietario o admin |
| 5 | Comodidades | Documentado / implementable con tutorial | Sí | Listado de comodidades, detalle, creación admin y asignación a alojamientos |
| 6 | Imágenes de alojamientos | Futuro. Depende de endpoints no implementados en backend. | No | Preparación documental para carga y visualización de imágenes cuando exista soporte real |
| 7 | Reservas | Futuro. Depende de endpoints no implementados en backend. | No | Preparación documental del flujo de reservas cuando el backend lo permita |
| 8 | Búsqueda y disponibilidad | Futuro. Depende de endpoints no implementados en backend. | No | Preparación documental para filtros y disponibilidad con datos reales |
| 9 | Favoritos | Futuro. Depende de endpoints no implementados en backend. | No | Preparación documental para guardar y listar favoritos cuando existan endpoints |
| 10 | Reseñas | Futuro. Depende de endpoints no implementados en backend. | No | Preparación documental para crear y consultar reseñas cuando el backend lo soporte |

## Sprint 1 — Base SPA con Vite y Bootstrap

Este sprint establece la base técnica del proyecto.

Debe cubrir:

- estructura base del proyecto;
- Vite como herramienta de arranque, desarrollo y build;
- Bootstrap 5.3 y Bootstrap Icons;
- `index.html` como entrada única;
- punto de montaje `#app`;
- `package.json`, `package-lock.json`, `vite.config.js` y `.env.example`;
- `src/js/main.js` y `src/css/main.css`;
- validación con `npm run dev`, `npm run build` y `npm run preview`.

Resultado esperado:

- una base limpia y lista para comenzar a montar vistas sin crear todavía lógica de negocio, con `index.html`, `#app`, `package.json`, `package-lock.json`, `vite.config.js`, `.env.example`, `src/js/main.js`, `src/css/main.css`, Bootstrap 5.3 y Bootstrap Icons.

## Sprint 2 — Usuarios y autenticación

Este sprint conecta el frontend con los endpoints de usuarios y define la sesión del navegador.

Debe cubrir:

- registro;
- login;
- logout;
- sesión local;
- token y usuario en `localStorage`;
- `src/js/api/http.js`;
- `src/js/api/auth.api.js`;
- `src/js/auth/session.service.js`;
- `src/js/utils/storage.js`;
- `src/js/utils/errorMessages.js`;
- navbar según sesión;
- perfil protegido de forma básica;
- navegación simple dentro de `src/js/main.js`;
- consumo de endpoints de usuarios;
- perfil del usuario autenticado como parte del flujo de sesión.

Resultado esperado:

- el usuario puede registrarse, iniciar sesión, cerrar sesión y ver cambios en la interfaz según su estado autenticado, con sesión local, navbar según sesión, perfil protegido de forma básica y navegación simple dentro de `src/js/main.js`.

## Sprint 3 — Roles, autorización y guards

Este sprint incorpora control de acceso desde el frontend.

Router formal y guards se incorporan desde Sprint 3. En Sprint 2 la navegación sigue siendo simple dentro de `src/js/main.js`.

Debe cubrir:

- guard de ruta privada;
- guard de rol admin;
- diferencia entre 401 y 403;
- protección visual vs protección real del backend;
- acceso a funciones administrativas;
- listado de usuarios como admin.

Resultado esperado:

- el frontend protege rutas y acciones según sesión y rol, sin reemplazar la validación real del backend.

## Sprint 4 — Alojamientos

Este sprint lleva el dominio principal del proyecto a la interfaz.

Debe cubrir:

- listado público;
- detalle público;
- creación de alojamiento con token;
- edición por propietario o admin;
- eliminación por propietario o admin;
- estados loading, error y empty;
- confirmación antes de eliminar.

Resultado esperado:

- el usuario puede explorar alojamientos públicamente y, si está autenticado, administrar los suyos según permisos.

## Sprint 5 — Comodidades

Este sprint completa la parte inicial del dominio con el catálogo de comodidades.

Debe cubrir:

- listado público de comodidades;
- detalle de comodidad si aplica;
- creación de comodidad como admin;
- asignación de comodidades a alojamientos por propietario o admin;
- renderizado de comodidades en cards y detalle.

Resultado esperado:

- el frontend muestra comodidades reales y permite asociarlas a alojamientos cuando el usuario tiene permisos.

## Sprint 6 — Imágenes de alojamientos

Este sprint es futuro.

- Descripción corta: preparación de la experiencia visual para imágenes asociadas a alojamientos.
- Estado: futuro.
- Razón por la que no se implementa ahora: el backend no expone aún endpoints para gestionar imágenes.
- Dependencia: endpoints futuros del backend para carga, consulta o reemplazo de imágenes.

## Sprint 7 — Reservas

Este sprint es futuro.

- Descripción corta: preparación del flujo de reservas para alojamientos.
- Estado: futuro.
- Razón por la que no se implementa ahora: el backend no expone aún endpoints para crear, consultar o gestionar reservas.
- Dependencia: endpoints futuros del backend para reservas.

## Sprint 8 — Búsqueda y disponibilidad

Este sprint es futuro.

- Descripción corta: preparación de filtros y consulta de disponibilidad para alojamientos.
- Estado: futuro.
- Razón por la que no se implementa ahora: el backend no expone aún endpoints para búsquedas avanzadas o disponibilidad.
- Dependencia: endpoints futuros del backend para búsqueda y disponibilidad.

## Sprint 9 — Favoritos

Este sprint es futuro.

- Descripción corta: preparación de una experiencia para guardar alojamientos favoritos del usuario.
- Estado: futuro.
- Razón por la que no se implementa ahora: el backend no expone aún endpoints para favoritos.
- Dependencia: endpoints futuros del backend para crear, listar o eliminar favoritos.

## Sprint 10 — Reseñas

Este sprint es futuro.

- Descripción corta: preparación de la experiencia de reseñas y valoraciones para alojamientos.
- Estado: futuro.
- Razón por la que no se implementa ahora: el backend no expone aún endpoints para reseñas.
- Dependencia: endpoints futuros del backend para crear, consultar o moderar reseñas.

## Entregables actuales

El proyecto cuenta con estos entregables documentados:

- documentación base;
- 10 sprints documentados;
- 5 tutoriales implementables;
- contrato backend-frontend;
- validación manual;
- anexos complementarios.

Los sprints resumen alcance, criterios y entregables. Los tutoriales guían la implementación paso a paso. Cada tutorial parte del anterior y los documentos deben mantenerse alineados entre sí.

## Reglas para implementación futura

Para mantener la coherencia del proyecto:

- no crear pantallas para funcionalidades sin endpoint;
- no simular reservas, favoritos, reseñas ni imágenes reales como si existieran;
- no adelantar router formal ni guards antes de Sprint 3;
- no simular funcionalidades futuras con `localStorage` ni datos falsos como si fueran reales;
- usar placeholders solo cuando el documento del sprint lo indique;
- todo consumo de API debe pasar por el cliente HTTP centralizado;
- todo acceso protegido debe pasar por guards una vez que existan.

## Cierre

Este roadmap permite avanzar de forma ordenada, manteniendo el frontend independiente pero alineado con el backend real. También deja claro qué se implementa ahora y qué queda como futuro, evitando promesas técnicas que todavía no tienen soporte del lado del servidor.


