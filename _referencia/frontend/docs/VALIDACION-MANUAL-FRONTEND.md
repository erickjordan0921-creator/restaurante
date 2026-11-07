# Validación manual frontend

## 1. Propósito del documento
Este documento sirve para validar manualmente que la SPA vanilla del frontend funciona correctamente después de implementar los tutoriales 1 al 5.

La validación manual permite comprobar:

- funcionamiento visual;
- navegación;
- consumo correcto del backend;
- autenticación y autorización;
- manejo de errores;
- estados de interfaz;
- cumplimiento del contrato backend-frontend.

## 2. Alcance de la validación

| Sprint | Nombre | Estado de validación |
|---|---|---|
| Sprint 1 | Base SPA, Vite, Bootstrap y layout inicial | Validable |
| Sprint 2 | Usuarios y autenticación | Validable |
| Sprint 3 | Roles, autorización y guards | Validable |
| Sprint 4 | Alojamientos | Validable |
| Sprint 5 | Comodidades | Validable |
| Sprint 6 | Imágenes de alojamientos | Futuro / no validable todavía |
| Sprint 7 | Reservas | Futuro / no validable todavía |
| Sprint 8 | Búsqueda y disponibilidad | Futuro / no validable todavía |
| Sprint 9 | Favoritos | Futuro / no validable todavía |
| Sprint 10 | Reseñas | Futuro / no validable todavía |

## 3. Prerrequisitos generales
Antes de validar, confirma:

- backend corriendo en `http://localhost:5000/api/v1`;
- frontend corriendo con `npm run dev` cuando corresponda;
- Git Bash como terminal de trabajo;
- archivo `.env.example` versionado;
- archivo `.env` local no versionado;
- `VITE_API_URL=http://localhost:5000/api/v1`;
- navegador abierto;
- consola del navegador disponible;
- usuario normal de prueba;
- usuario admin de prueba;
- al menos un alojamiento creado para pruebas de edición o eliminación;
- comodidades de prueba si ya existen o admin disponible para crearlas.
- para validar `npm run preview`, el backend debe permitir el origen que muestra Vite para preview, normalmente `http://localhost:4173/`.

## 4. Validación Sprint 1 — Base SPA, Vite, Bootstrap y layout inicial

Checklist:

- `npm install` se ejecuta correctamente;
- `npm run dev` funciona;
- se abre la URL que muestra Vite, normalmente `http://localhost:5173/`;
- la pantalla base muestra el texto `Frontend de alojamientos listo`;
- existe `index.html`;
- existe el punto de montaje `#app`;
- `index.html` apunta a `/src/js/main.js`;
- existe `package.json`;
- existe `package-lock.json`;
- existe `vite.config.js`;
- existe `.env.example`;
- existe `src/js/main.js`;
- existe `src/css/main.css`;
- `.env.example` contiene `VITE_API_URL=http://localhost:5000/api/v1`;
- existe la estructura base `src/css` y `src/js`;
- Bootstrap 5.3 aplica estilos correctamente;
- Bootstrap Icons está disponible;
- `npm run build` genera `dist/`;
- `npm run preview` funciona;
- se abre la URL que muestra Vite para preview, normalmente `http://localhost:4173/`;
- el build compilado muestra la misma pantalla base;
- en este sprint no hay pruebas automatizadas;
- no hay lógica de autenticación, alojamientos ni comodidades en este sprint base;
- no se sube `.env`, solo `.env.example`.

## 5. Validación Sprint 2 — Usuarios y autenticación

Checklist general:

- el proyecto parte del Sprint 1 / Tutorial 1, sin recrear Vite;
- `.env` contiene `VITE_API_URL=http://localhost:5000/api/v1`;
- backend corriendo en `http://localhost:5000/api/v1`;
- existen los archivos:
  - `src/js/utils/storage.js`;
  - `src/js/utils/errorMessages.js`;
  - `src/js/auth/session.service.js`;
  - `src/js/api/http.js`;
  - `src/js/api/auth.api.js`;
  - `src/js/components/layout/Navbar.js`;
  - `src/js/pages/RegistroPage.js`;
  - `src/js/pages/LoginPage.js`;
  - `src/js/pages/PerfilPage.js`;
  - `src/js/main.js`;
- no existen todavía:
  - `src/js/router/routes.js`;
  - `src/js/router/guards.js`;
- el frontend usa solo estos endpoints:
  - `POST /usuarios/registro`;
  - `POST /usuarios/login`;
  - `GET /usuarios/perfil`;
  - `PATCH /usuarios/perfil`;
- Perfil está protegido de forma básica.

### Registro

Checklist:

- el formulario de registro carga;
- el campo técnico usado es `contrasena`, no `contraseña`;
- un usuario nuevo puede registrarse;
- si faltan datos, se muestra un error comprensible en español;
- los errores `400` muestran validaciones comprensibles;
- no se inicia sesión automáticamente si el backend no lo hace;
- después del registro exitoso, la SPA muestra un mensaje breve y navega a `Login`.

### Login

Checklist:

- el usuario puede iniciar sesión con credenciales válidas;
- el frontend lee `response.data.access_token`;
- el frontend lee `response.data.usuario`;
- token y usuario quedan centralizados en `session.service.js` / `localStorage`;
- la sesión actualiza la navbar;
- después del login exitoso, la SPA navega a `Inicio`;
- credenciales inválidas muestran un error claro en español.

### Sesión

Checklist:

- al recargar, la sesión puede recuperarse si el token sigue guardado;
- logout elimina token y usuario;
- logout actualiza la navbar;
- logout vuelve a una vista pública.

### Perfil

Checklist:

- `GET /usuarios/perfil` carga los datos del perfil;
- `PATCH /usuarios/perfil` actualiza datos básicos;
- el formulario edita `nombre`, `apellido` y `telefono`;
- el correo se muestra como dato visible, pero no como campo editable;
- el rol se muestra con una etiqueta legible;
- Perfil sin sesión lleva a `Login`;
- un token inválido produce manejo de `401`.
- `401` limpia sesión y lleva a `Login` desde la vista protegida.

### Build y preview

Checklist:

- `npm run build` genera `dist/`;
- `npm run preview` funciona si CORS permite `http://localhost:4173/`;
- en este sprint no hay pruebas automatizadas.

## 6. Validación Sprint 3 — Roles, autorización y guards

Endpoint a validar:

- `GET /admin/usuarios`

### Invitado

Checklist:

- ve `Inicio`, `Login` y `Registro`;
- no puede entrar a `Perfil`;
- no puede entrar a `Usuarios`;
- si intenta entrar a una ruta privada, se le pide iniciar sesión.

### Usuario normal

Checklist:

- ve `Inicio` y el dropdown con su correo;
- el dropdown muestra `Perfil` y `Cerrar sesión`;
- no ve `Usuarios`;
- no existe panel intermedio de administración;
- un `403` muestra permisos insuficientes sin cerrar sesión.

### Admin

Checklist:

- ve `Inicio`, `Usuarios` y el dropdown con su correo;
- al hacer click en `Usuarios`, entra directamente a la lista de usuarios;
- no aparece panel intermedio;
- `GET /admin/usuarios` funciona;
- `401` limpia sesión y lleva a `Login` desde la vista protegida;
- `403` muestra permisos insuficientes sin cerrar sesión.

### Reglas de alcance

- no aparecen rutas de alojamientos en este sprint;
- no aparece `Comodidades` en la navegación de Sprint 3.

## 7. Validación Sprint 4 — Alojamientos

Endpoints a validar:

- `GET /alojamientos`
- `GET /alojamientos/:id`
- `POST /alojamientos`
- `PATCH /alojamientos/:id`
- `DELETE /alojamientos/:id`

### Listado público

Checklist:

- `Inicio` muestra el listado público de alojamientos;
- las cards muestran solo `Ver detalle`;
- no aparecen acciones de edición ni eliminación en el listado;
- se manejan estados `loading`, `empty` y `error`.

### Detalle

Checklist:

- el detalle se carga por `id`;
- el botón de regreso dice `Volver`;
- si el usuario puede gestionar el alojamiento, aparecen `Editar` y `Eliminar` en detalle;
- `DELETE /alojamientos/:id` maneja `204 No Content`;
- no se intenta leer JSON después de `204`.

### Creación y edición

Checklist:

- un usuario autenticado puede crear alojamiento;
- el botón principal del formulario de creación dice `Crear`;
- la edición usa el botón `Actualizar`;
- el botón de regreso dice `Volver`;
- propietario y admin pueden editar o eliminar según corresponda;
- un usuario no propietario recibe bloqueo visual o `403`.

## 8. Validación Sprint 5 — Comodidades

Endpoints a validar:

- `GET /comodidades`
- `GET /comodidades/:id`
- `POST /comodidades`
- `PATCH /alojamientos/:id/comodidades`

### Comodidades públicas

Checklist:

- `Comodidades` muestra el catálogo público;
- no existe botón `Ver alojamientos`;
- no existe botón de regreso innecesario;
- el detalle de comodidad tiene un solo botón `Volver` si aplica;
- se manejan estados `loading`, `empty` y `error`.

### Crear comodidad

Checklist:

- solo admin ve la opción para crear comodidad;
- no aparece el distintivo `Solo admin`;
- el botón principal dice `Guardar`;
- el botón de regreso dice `Volver`;
- un usuario normal no puede crear comodidad.

### Asignación a alojamientos

Checklist:

- el selector de comodidades carga datos reales;
- `comodidades_ids` se envía como arreglo;
- `comodidades_ids: []` vacía comodidades correctamente;
- las comodidades se renderizan como badges en cards y detalle cuando vienen en la respuesta;
- un usuario no propietario recibe bloqueo visual o `403`.

## 9. Casos de error

| Código | Cuándo aparece | Comportamiento esperado |
|---|---|---|
| 400 | Datos inválidos | Mostrar mensaje de validación en español |
| 401 | Token ausente, inválido o expirado | Limpiar sesión o pedir login |
| 403 | Usuario autenticado sin permisos | Mostrar permisos insuficientes sin cerrar sesión |
| 404 | Recurso no encontrado | Mostrar mensaje claro en español |
| 204 | Eliminación exitosa | No intentar leer JSON |

## 10. Pruebas por perfil de usuario

### Visitante
Debe poder:

- ver listado de alojamientos;
- ver detalle de alojamiento;
- ver comodidades públicas;
- ir a login o registro.

No debe poder:

- crear alojamiento;
- editar alojamiento;
- eliminar alojamiento;
- crear comodidad;
- entrar a `Usuarios`.

### Usuario autenticado normal
Debe poder:

- ver su perfil;
- editar su perfil;
- crear alojamiento;
- editar sus propios alojamientos;
- eliminar sus propios alojamientos;
- asignar comodidades a sus propios alojamientos.

No debe poder:

- entrar a `Usuarios`;
- listar usuarios admin;
- crear comodidad si no es admin;
- editar o eliminar alojamientos de otros usuarios.

### Admin
Debe poder:

- entrar directamente al listado de usuarios desde `Usuarios`;
- listar usuarios;
- crear comodidad;
- editar alojamientos;
- eliminar alojamientos;
- asignar comodidades.

## 11. Checklist final antes de dar por aprobado

- `npm run dev` funciona.
- `npm run build` funciona.
- `npm run preview` funciona.
- No hay errores críticos en consola.
- Variables de entorno correctas.
- No se sube `.env`.
- Solo `.env.example` queda versionado.
- Login y logout funcionan.
- Guards funcionan.
- `Usuarios` funciona.
- `Inicio` muestra alojamientos.
- `Comodidades` funciona.
- `401` y `403` se manejan diferente.
- `204 No Content` se maneja correctamente.
- No hay pruebas automatizadas en Sprint 1 y Sprint 2.
- No hay endpoints inventados.
- No hay funcionalidades futuras simuladas.
- No hay texto corrupto visible.
- Todos los mensajes visibles al usuario están en español.

## 12. Cierre
Si esta validación pasa, el MVP frontend correspondiente a los sprints 1 al 5 queda listo para revisión y entrega académica.

