# Sprint 5 - Comodidades

## 1. Nombre del sprint
Comodidades.

## 2. Objetivo del sprint
Incorporar comodidades al frontend sin romper lo validado en el Sprint 4. Este sprint agrega el catálogo público de comodidades, el detalle público de una comodidad, la creación de comodidades solo para admin, la visualización de comodidades en cards y en el detalle de alojamiento, la asignación o reemplazo de comodidades en alojamientos existentes, y la actualización de la navegación principal con un enlace público a `Comodidades`.

## 3. Contexto de negocio
Las comodidades enriquecen la información de los alojamientos y permiten describir mejor qué ofrece cada uno. No es lo mismo crear una comodidad en el catálogo general que asignarla a un alojamiento concreto:

- crear una comodidad agrega una opción reutilizable al catálogo;
- asignar comodidades vincula esas opciones a un alojamiento existente.

El sprint mantiene esa diferencia clara para no mezclar administración del catálogo con la gestión de un alojamiento.

## 4. Alcance del sprint
Este sprint incluye:

- servicio API de comodidades;
- componente `ComodidadBadge`;
- componente `ComodidadesSelector`;
- listado público de comodidades;
- detalle público de comodidad;
- creación de comodidad por admin;
- selector de comodidades en la edición de alojamiento;
- actualización de cards de alojamiento para mostrar badges;
- actualización del detalle de alojamiento para mostrar badges;
- actualización de `routes.js` para nuevas rutas;
- actualización de `Navbar.js` para el enlace público a comodidades;
- uso de `comodidades_ids`;
- soporte para `comodidades_ids: []`;
- manejo de estados `loading`, `error` y `empty`;
- manejo de errores `400`, `401`, `403` y `404`;
- uso de `request()` centralizado;
- contrato `response.data` como contenedor del recurso principal;
- convivencia con el estado validado del Sprint 4.

Contrato de API permitido en este sprint:

- `GET /comodidades`
- `GET /comodidades/:id`
- `POST /comodidades`
- `PATCH /alojamientos/:id/comodidades`

## 5. Fuera de alcance
Este sprint NO implementa:

- editar comodidad;
- eliminar comodidad;
- administración completa de comodidades;
- reservas;
- favoritos;
- reseñas;
- imágenes reales;
- búsqueda avanzada;
- disponibilidad;
- pagos;
- subida de archivos;
- mapas;
- geolocalización;
- funcionalidades de Sprint 6 o posteriores.

Tampoco adelanta cambios innecesarios en:

- `src/js/main.js`;
- `src/js/auth/permissions.js`;
- `src/js/api/alojamientos.api.js`.

## 6. Prerrequisitos
Antes de iniciar este sprint, se debe contar con:

- Sprint 1 aprobado;
- Sprint 2 aprobado;
- Sprint 3 aprobado;
- Sprint 4 aprobado y validado;
- cliente HTTP centralizado funcionando;
- rutas dinámicas funcionando;
- `home` resuelto desde el router;
- sesión funcionando;
- guards funcionando;
- backend corriendo en `http://localhost:5000/api/v1`;
- usuario admin para probar la creación de comodidad;
- usuario propietario o admin para probar la asignación de comodidades a alojamientos.

## 7. Herramientas y tecnologías
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API centralizada mediante `request()`
- JWT
- guards frontend
- Git

No debe sugerirse `fetch` directo en páginas o componentes.

## 8. Tareas del sprint
- Crear `src/js/api/comodidades.api.js`.
- Crear `src/js/components/comodidades/ComodidadBadge.js`.
- Crear `src/js/components/alojamientos/ComodidadesSelector.js`.
- Crear `src/js/pages/ComodidadesPage.js`.
- Crear `src/js/pages/ComodidadDetallePage.js`.
- Crear `src/js/pages/AdminCrearComodidadPage.js`.
- Actualizar `src/js/components/alojamientos/AlojamientoCard.js`.
- Actualizar `src/js/components/alojamientos/AlojamientoForm.js`.
- Actualizar `src/js/pages/AlojamientoDetallePage.js`.
- Actualizar `src/js/pages/EditarAlojamientoPage.js`.
- Actualizar `src/js/router/routes.js`.
- Actualizar `src/js/components/layout/Navbar.js`.
- Verificar que `src/js/main.js` no se modifica.
- Verificar que `src/js/auth/permissions.js` no se modifica.
- Verificar que `src/js/api/alojamientos.api.js` no se modifica.
- Validar que no exista editar ni eliminar comodidad.
- Validar que el build pase al finalizar.
- Registrar solo validaciones y ajustes necesarios para mantener el alcance del Tutorial 5.

Esta fase no debe incluir código completo dentro del documento.

## 9. Archivos esperados
Archivos nuevos esperados:

- `src/js/api/comodidades.api.js`
- `src/js/components/comodidades/ComodidadBadge.js`
- `src/js/components/alojamientos/ComodidadesSelector.js`
- `src/js/pages/ComodidadesPage.js`
- `src/js/pages/ComodidadDetallePage.js`
- `src/js/pages/AdminCrearComodidadPage.js`

Archivos existentes que se actualizan:

- `src/js/components/alojamientos/AlojamientoCard.js`
- `src/js/components/alojamientos/AlojamientoForm.js`
- `src/js/pages/AlojamientoDetallePage.js`
- `src/js/pages/EditarAlojamientoPage.js`
- `src/js/router/routes.js`
- `src/js/components/layout/Navbar.js`

Archivos que no se modifican en este sprint:

- `src/js/main.js`
- `src/js/auth/permissions.js`
- `src/js/api/alojamientos.api.js`
- `src/js/pages/AlojamientosPage.js`
- `src/js/pages/CrearAlojamientoPage.js`

## 10. Rutas esperadas
Este sprint conserva todas las rutas del Sprint 4 y agrega las siguientes:

- `comodidades`
- `comodidades/:id`
- `admin/comodidades/nueva`

La ruta `admin/comodidades/nueva` debe requerir autenticación y rol admin.

Orden esperado de rutas:

- primero las rutas específicas;
- luego las rutas dinámicas;
- no registrar `comodidades/:id` antes de `comodidades`;
- no romper el orden validado en Sprint 4.

## 11. Riesgos o puntos de atención
- Confundir crear comodidad con asignar comodidad.
- Enviar `comodidadesIds` en vez de `comodidades_ids`.
- Enviar un número en vez de un arreglo.
- No permitir `comodidades_ids: []`.
- Registrar mal rutas dinámicas.
- Romper rutas del Sprint 4.
- Modificar `main.js` sin necesidad.
- Modificar `permissions.js` sin necesidad.
- Modificar `alojamientos.api.js` sin necesidad.
- Olvidar `escapeHtml()` en badges o navbar.
- Usar `fetch` directo en páginas o componentes.
- Reintroducir la lógica vieja de eliminación de alojamiento.
- Implementar editar o eliminar comodidad aunque esté fuera de alcance.
- Adelantar Sprint 6.

## 12. Criterios de aceptación
- Un visitante puede listar comodidades.
- Un visitante puede ver detalle de comodidad.
- Un admin puede crear comodidad.
- Un usuario no admin no puede acceder a `admin/comodidades/nueva`.
- El botón `Crear comodidad` solo aparece para admin.
- La navbar muestra enlace público a `Comodidades`.
- Las cards de alojamiento muestran badges si el backend devuelve comodidades.
- El detalle de alojamiento muestra badges si el backend devuelve comodidades.
- La edición de alojamiento muestra selector de comodidades.
- El selector marca comodidades actuales.
- El selector envía `comodidades_ids`.
- `comodidades_ids: []` permite vaciar comodidades.
- El guardado de edición actualiza datos básicos y luego comodidades.
- No existen editar ni eliminar comodidad.
- No se modifican `main.js`, `permissions.js` ni `alojamientos.api.js`.
- No se adelantan funcionalidades posteriores.
- El build pasa después de implementar el tutorial.

## 13. Definition of Done
- Tutorial 5 implementable desde el estado real del Tutorial 4.
- Build validado.
- Catálogo de comodidades funcionando.
- Detalle de comodidad funcionando.
- Creación admin funcionando.
- Selector de comodidades funcionando.
- Asignación o reemplazo de comodidades funcionando.
- `Navbar.js` actualizado.
- Rutas nuevas verificadas.
- Sin editar ni eliminar comodidad.
- Sin código de Sprint 6 o posterior.
- Archivos esperados documentados.
- Alcance alineado con el Tutorial 5 validado.

## 14. Estado
Documento de sprint alineado con el Tutorial 5 validado.
