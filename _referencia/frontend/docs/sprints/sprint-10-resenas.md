# Sprint 10 — Reseñas

## 1. Nombre del sprint
Reseñas.

## 2. Objetivo del sprint
Este sprint queda como preparación futura para permitir que usuarios autenticados escriban y consulten reseñas de alojamientos cuando el backend tenga endpoints reales para ello.

No se implementa en la versión actual, no forma parte del MVP actual, depende de endpoints futuros del backend y no debe simular reseñas en `localStorage` ni en datos falsos como si fueran reales.

## 3. Contexto de negocio
Las reseñas ayudan a aumentar la confianza en los alojamientos, mostrar experiencias de usuarios y apoyar a otros visitantes en la toma de decisiones.

Para que sean confiables, las reseñas deben persistirse en el backend, asociarse a usuarios reales y respetar reglas de negocio claras.

## 4. Alcance del sprint
Como sprint futuro, este apartado describe un alcance proyectado, no implementado ahora:

- listar reseñas de un alojamiento;
- crear reseña por usuario autenticado;
- mostrar calificación si el backend la define;
- mostrar comentario, autor y fecha;
- editar o eliminar reseña si el backend lo permite;
- moderación por admin si el backend lo define;
- validación de contenido;
- estados `loading`, `error` y `empty`;
- mensajes de éxito y error.

Este alcance es futuro y no debe implementarse hasta que existan endpoints reales del backend.

## 5. Fuera de alcance
En la versión actual NO se implementa:

- creación real de reseñas;
- listado real de reseñas;
- edición real de reseñas;
- eliminación real de reseñas;
- moderación real;
- calificaciones persistidas;
- reseñas en `localStorage` como si fueran reales;
- endpoints simulados;
- reservas;
- pagos;
- favoritos;
- imágenes reales;
- búsqueda avanzada;
- recomendaciones.

## 6. Prerrequisitos
Antes de implementar este sprint se necesitará:

- backend con endpoints reales para reseñas;
- contrato backend-frontend actualizado;
- definición de payloads y respuestas;
- definición de permisos;
- definición de reglas de edición y eliminación;
- definición de reglas de moderación si aplica;
- definición de si la reseña depende de una reserva previa;
- frontend de los sprints 1 al 5 funcionando;
- detalle de alojamientos funcionando.

## 7. Herramientas y tecnologías usadas
Tecnologías del stack principal y capacidades futuras previsibles, sin agregar dependencias obligatorias:

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
Como sprint futuro, las tareas deben redactarse en futuro o como planificación:

- actualizar el contrato backend-frontend cuando existan endpoints;
- definir endpoints reales de reseñas;
- definir permisos para crear, editar, eliminar o moderar reseñas;
- planificar el listado de reseñas en el detalle de alojamiento;
- planificar el formulario de reseña;
- planificar la validación de calificación si existe;
- planificar la validación de comentario;
- planificar el estado sin reseñas;
- planificar estados `loading` y `error`;
- planificar edición o eliminación si el backend lo permite;
- planificar moderación si el backend la define;
- planificar validaciones manuales cuando existan endpoints.

No incluir código completo.
No inventar rutas.
No escribir endpoints supuestos como si existieran.

## 9. Riesgos o puntos de atención
- Inventar endpoints de reseñas antes de que existan.
- Usar `localStorage` como persistencia real de reseñas.
- Permitir reseñas sin usuario autenticado si el backend no lo define.
- Mostrar calificaciones falsas.
- Permitir múltiples reseñas sin reglas del backend.
- No validar contenido ofensivo si el backend define moderación.
- Mezclar reseñas con reservas sin regla real.
- Prometer reputación o promedio de calificación sin soporte del servidor.

## 10. Criterios de aceptación
Como sprint futuro, los criterios deben ser condicionales:

- solo se considerará implementable cuando el backend exponga endpoints reales;
- el contrato backend-frontend deberá documentar payloads, respuestas y permisos;
- las reseñas deberán persistirse en backend;
- la UI deberá diferenciar ausencia de reseñas de error;
- cualquier regla de edición, eliminación o moderación deberá venir del backend;
- no debe existir implementación real en la versión actual del MVP frontend.

## 11. Definition of Done
- Sprint documentado como futuro.
- Dependencia de backend real explícita.
- Sin endpoints inventados.
- Sin tutorial implementable.
- Sin implementación en la versión actual.
- Commit sugerido: `docs: actualizar sprint 10 resenas`

## 12. Entregables del sprint
- Documento del Sprint 10 actualizado.
- Alcance futuro descrito.
- Límites actuales claros.
- Criterios para habilitar implementación futura.

## 13. Estado
Futuro. Depende de endpoints no implementados en backend.

