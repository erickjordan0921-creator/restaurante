# Sprint 3 — Roles, autorización y guards

## 1. Nombre del sprint
Roles, autorización y guards.

## 2. Objetivo del sprint
Definir cómo la SPA controla rutas y acciones protegidas desde el frontend, incluyendo rutas privadas, rutas solo admin, guards, lectura del rol del usuario autenticado, diferencia entre 401 y 403, protección visual y acceso directo al listado de usuarios como admin.

## 3. Contexto de negocio
No todos los usuarios tienen los mismos permisos. Un usuario autenticado puede gestionar ciertos recursos, pero solo un administrador puede acceder a funciones administrativas como listar usuarios o crear ciertos catálogos en sprints posteriores. Por eso el frontend debe reconocer sesión y rol antes de mostrar o permitir acciones protegidas.

Ese rol se lee del usuario completo que ya quedó guardado en sesión en el Sprint 2; aquí no se cambia el flujo de login, solo se aprovecha el campo `rol` si el backend ya lo devuelve.

## 4. Alcance del sprint
- Guard de autenticación.
- Guard de rol admin.
- Lectura del usuario autenticado desde sesión.
- Validación visual de enlaces según rol.
- Bloqueo de navegación a rutas privadas sin token.
- Bloqueo de navegación a rutas admin sin rol admin.
- Manejo diferenciado de errores 401 y 403.
- Vista de administración directa con el listado de usuarios.
- Consumo de `GET /admin/usuarios`.
- Mensajes claros para usuario sin permisos.
- Preparación para proteger acciones de alojamientos y comodidades en sprints 4 y 5.

Endpoint permitido en este sprint:

- `GET /admin/usuarios`

También se puede reutilizar del Sprint 2:

- `GET /usuarios/perfil`

## 5. Fuera de alcance
Este sprint NO implementa:

- CRUD de alojamientos;
- comodidades;
- creación de comodidad;
- asignación de comodidades;
- reservas;
- favoritos;
- reseñas;
- imágenes;
- búsqueda avanzada;
- pagos;
- sistema avanzado de permisos;
- refresh token;
- gestión de usuarios más allá de listarlos como admin.

## 6. Prerrequisitos
- Sprint 1 aprobado.
- Sprint 2 aprobado.
- Sesión frontend funcionando.
- Token guardado de forma centralizada.
- Usuario autenticado disponible en la SPA.
- Contrato backend-frontend revisado.
- Backend corriendo en `http://localhost:5000/api/v1`.
- Conocer la diferencia entre autenticación y autorización.

## 7. Herramientas y tecnologías usadas
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API
- JWT
- Guards frontend
- Git

## 8. Tareas del sprint
- Definir rutas privadas.
- Definir rutas solo admin.
- Crear o planificar guard de autenticación.
- Crear o planificar guard de rol admin.
- Validar sesión antes de entrar a una ruta protegida.
- Validar rol antes de entrar a una ruta admin.
- Ocultar o mostrar enlaces del navbar según sesión y rol.
- Diferenciar errores 401 y 403.
- Limpiar sesión cuando el token sea inválido.
- Mostrar mensaje amigable cuando el usuario no tenga permisos.
- Crear o planificar vista base de admin.
- Consumir `GET /admin/usuarios` como admin.
- Probar acceso con usuario invitado.
- Probar acceso con usuario normal.
- Probar acceso con usuario admin.
- Preparar reglas para proteger alojamientos y comodidades más adelante.

No incluir código completo; solo indicar tareas y archivos esperados.

## 9. Riesgos o puntos de atención
- Pensar que ocultar botones equivale a seguridad real.
- Olvidar que la validación definitiva ocurre en el backend.
- Confundir autenticación con autorización.
- Confundir 401 con 403.
- Permitir acceso a rutas admin por navegación manual.
- Duplicar lógica de permisos en muchas vistas.
- Asumir que todo usuario autenticado es admin.
- No limpiar sesión cuando el token ya no es válido.

## 10. Criterios de aceptación
- Un invitado no puede entrar a rutas privadas.
- Un usuario autenticado no admin no puede entrar a rutas admin.
- Un admin puede entrar directamente al listado de usuarios.
- El admin puede listar usuarios usando `GET /admin/usuarios`.
- La navbar muestra u oculta opciones según sesión y rol.
- Un 401 se resuelve desde la vista protegida limpiando sesión y solicitando login.
- Un 403 muestra mensaje de permisos insuficientes sin cerrar sesión.
- No se implementan todavía alojamientos ni comodidades.

## 11. Definition of Done
- Reglas de guards documentadas.
- Diferencias entre 401 y 403 documentadas.
- Endpoint admin correctamente referenciado.
- Protección visual y protección real explicadas.
- Sin implementación de funcionalidades fuera del sprint.
- Commit sugerido:

```text
docs: actualizar sprint 3 roles guards
```

## 12. Entregables del sprint
- Documento del Sprint 3 actualizado.
- Alcance de rutas privadas y admin.
- Criterios de validación.
- Preparación para el Tutorial 3.
- Base para permisos en alojamientos y comodidades.

## 13. Estado
Documentado / implementable con tutorial.




