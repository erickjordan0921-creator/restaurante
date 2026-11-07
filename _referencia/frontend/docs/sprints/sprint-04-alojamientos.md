# Sprint 4 — Alojamientos

## 1. Nombre del sprint
Alojamientos.

## 2. Objetivo del sprint
Llevar el dominio principal del proyecto al frontend con listado público de alojamientos, detalle público, creación autenticada, edición por propietario o admin, eliminación por propietario o admin, y manejo de estados `loading`, `error` y `empty` con confirmación antes de eliminar. La pantalla inicial `home` comparte el listado público, `home` se resuelve desde el router y el sprint introduce rutas dinámicas para detalle y edición.

## 3. Contexto de negocio
Los alojamientos son el recurso central del proyecto. Los visitantes deben poder explorarlos públicamente, mientras que los usuarios autenticados deben poder crear y gestionar sus propios alojamientos según permisos. Este sprint conecta la experiencia pública con las acciones protegidas del dominio principal.

## 4. Alcance del sprint
- Listado público de alojamientos disponible en `home` y `alojamientos` como vista inicial o alias.
- Ruta pública de detalle `alojamientos/:id`.
- Ruta protegida de creación `alojamientos/nuevo`.
- Ruta protegida de edición `alojamientos/:id/editar`.
- Eliminación con confirmación equivalente o `window.confirm()`.
- Actualización del router para soportar parámetros dinámicos.
- Actualización de `main.js` para quitar el caso especial de `renderHome()` y resolver `home` desde `routes.js`.
- Helper visual `canManageAlojamiento()` para mostrar u ocultar acciones de edición y eliminación.
- Formulario reutilizable para crear y editar.
- Uso de `request()` centralizado para consumir la API.
- Contrato esperado con `response.data` como contenedor del recurso principal.
- Manejo de estados `loading`, `error` y `empty`.
- Control visual de acciones Editar y Eliminar desde el detalle cuando el usuario tenga permiso.
- Si el detalle incluye `comodidades`, solo se muestran como información asociada, sin tratarlas como módulo funcional de este sprint.

Contrato de API involucrado:

- `GET /alojamientos`
- `GET /alojamientos/:id`
- `POST /alojamientos`
- `PATCH /alojamientos/:id`
- `DELETE /alojamientos/:id`

## 5. Fuera de alcance
Este sprint NO implementa:

- catálogo completo de comodidades;
- asignación de comodidades;
- creación de comodidades;
- nuevas pantallas administrativas o gestión administrativa adicional; esto no impide que un admin pueda editar o eliminar alojamientos según los permisos del backend;
- reservas;
- favoritos;
- reseñas;
- imágenes reales;
- búsqueda avanzada;
- disponibilidad;
- pagos;
- subida de archivos;
- mapas o geolocalización.

## 6. Prerrequisitos
- Sprint 1 aprobado.
- Sprint 2 aprobado.
- Sprint 3 aprobado.
- Sesión frontend funcionando.
- Guards disponibles para rutas privadas.
- Cliente HTTP centralizado ya funcionando desde sprints anteriores.
- Contrato backend-frontend revisado.
- Backend corriendo en `http://localhost:5000/api/v1`.
- Tener usuarios de prueba normal y admin si se quiere validar permisos.

## 7. Herramientas y tecnologías usadas
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API centralizada mediante `request()`
- JWT
- Guards frontend
- Confirmación equivalente o `window.confirm()` para eliminar
- Git

## 8. Tareas del sprint
- Crear servicio API de alojamientos.
- Crear utilidades de formato.
- Crear card de alojamiento.
- Crear formulario reutilizable.
- Crear páginas de listado, detalle, creación y edición.
- Actualizar permisos con `canManageAlojamiento()`.
- Actualizar el router para rutas dinámicas y rutas protegidas.
- Actualizar `main.js` para que `home` se resuelva desde `routes.js`.
- Mantener `Navbar.js` sin cambios en este sprint.
- Verificar que `alojamientos/nuevo` no se confunda con `alojamientos/:id`.
- Verificar que la eliminación redirige al listado después de un `DELETE` exitoso.
- Verificar el contrato `response.data` y el manejo de `204 No Content`.
- Registrar validaciones manuales.

No incluir código completo; solo indicar tareas y archivos esperados.

## 9. Archivos esperados
Archivos nuevos esperados:

- `src/js/api/alojamientos.api.js`
- `src/js/utils/formatters.js`
- `src/js/components/alojamientos/AlojamientoCard.js`
- `src/js/components/alojamientos/AlojamientoForm.js`
- `src/js/pages/AlojamientosPage.js`
- `src/js/pages/AlojamientoDetallePage.js`
- `src/js/pages/CrearAlojamientoPage.js`
- `src/js/pages/EditarAlojamientoPage.js`

Archivos existentes que se actualizan:

- `src/js/auth/permissions.js`
- `src/js/router/routes.js`
- `src/js/main.js`

Archivo que no se modifica en este sprint:

- `src/js/components/layout/Navbar.js`

## 10. Riesgos o puntos de atención
- Dejar `home` como caso especial en `main.js`.
- Olvidar registrar rutas dinámicas.
- Registrar `alojamientos/:id` antes de `alojamientos/nuevo`.
- Importar funciones que no existen.
- Usar `fetch` directo en vez de `request()`.
- Modificar `Navbar.js` innecesariamente.
- Adelantar archivos de comodidades del Sprint 5.
- Asumir que ocultar botones reemplaza permisos del backend.
- Intentar leer JSON después de un `204 No Content`.
- Permitir edición visual a usuarios no propietarios.

## 11. Criterios de aceptación
- `home` muestra el listado público de alojamientos.
- `alojamientos` muestra el listado público.
- `alojamientos/:id` muestra detalle.
- `alojamientos/nuevo` requiere autenticación.
- `alojamientos/:id/editar` requiere autenticación.
- `alojamientos/nuevo` no se interpreta como `alojamientos/:id`.
- `main.js` ya no usa `renderHome()`.
- `Navbar.js` no se modifica.
- `canManageAlojamiento()` controla la visibilidad de acciones en detalle.
- `request()` centraliza el acceso HTTP.
- No existen archivos nuevos de comodidades.
- La eliminación maneja `204 No Content`.
- La UI maneja `loading`, `error` y `empty` states.
- Un visitante puede listar alojamientos.
- Un visitante puede ver detalle de alojamiento.
- Un usuario autenticado puede crear alojamiento.
- Un propietario puede editar su alojamiento.
- Un propietario puede eliminar su alojamiento.
- Un admin puede editar o eliminar alojamientos.
- El build pasa después de implementar el tutorial.

## 12. Definition of Done
- Tutorial 4 implementable desde el estado real del Tutorial 3.
- Build validado.
- Rutas dinámicas verificadas.
- `home` verificado desde router.
- Sin código de Sprint 5.
- Sin modificación de `Navbar.js`.
- Archivos esperados documentados.
- Permisos visuales y manejo de `204 No Content` validados.

## 13. Estado
Documentado / alineado con Tutorial 4 validado.
