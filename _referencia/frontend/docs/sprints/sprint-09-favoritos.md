# Sprint 9 — Favoritos

## 1. Nombre del sprint
Favoritos.

## 2. Objetivo del sprint
Este sprint queda como preparación futura para permitir que usuarios autenticados guarden alojamientos como favoritos cuando el backend tenga endpoints reales para ello.

No se implementa en la versión actual, no forma parte del MVP actual, depende de endpoints futuros del backend y no debe simular favoritos en `localStorage` ni en datos falsos como si fueran reales.

## 3. Contexto de negocio
La funcionalidad de favoritos permite guardar alojamientos de interés para revisarlos después, comparar opciones o volver rápidamente a una ficha concreta.

Para que la experiencia sea real y consistente, los favoritos deben persistirse en el backend y quedar asociados al usuario autenticado.

## 4. Alcance del sprint
Como sprint futuro, este apartado describe un alcance proyectado, no implementado ahora:

- marcar un alojamiento como favorito;
- quitar un alojamiento de favoritos;
- listar favoritos del usuario autenticado;
- mostrar estado visual favorito/no favorito en cards o en el detalle;
- sincronizar favoritos con la sesión del usuario;
- manejar estados `loading`, `error` y `empty`;
- respetar permisos y autenticación definidos por el backend.

Este alcance es futuro y no debe implementarse hasta que existan endpoints reales del backend.

## 5. Fuera de alcance
En la versión actual NO se implementa:

- guardar favoritos reales;
- listar favoritos reales;
- eliminar favoritos reales;
- favoritos persistidos;
- favoritos en `localStorage` como si fueran reales;
- endpoints simulados;
- recomendaciones;
- reservas;
- pagos;
- reseñas;
- imágenes reales;
- búsqueda avanzada;
- notificaciones.

## 6. Prerrequisitos
Antes de implementar este sprint se necesitará:

- backend con endpoints reales para favoritos;
- contrato backend-frontend actualizado;
- definición de payloads y respuestas;
- definición de permisos;
- definición de si favoritos aplica solo a usuarios autenticados;
- frontend de los sprints 1 al 5 funcionando;
- listado y detalle de alojamientos funcionando.

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
Como sprint futuro, las tareas deben redactarse como planificación:

- actualizar el contrato backend-frontend cuando existan endpoints;
- definir endpoints reales de favoritos;
- definir permisos para guardar, listar y eliminar favoritos;
- planificar el botón o acción de favorito en cards;
- planificar el botón o acción de favorito en detalle;
- planificar la vista de favoritos del usuario;
- planificar la sincronización con la sesión;
- planificar estados `loading`, `error` y `empty`;
- planificar mensajes de éxito y error;
- planificar validaciones manuales cuando existan endpoints.

No incluir código completo.
No inventar rutas.
No escribir endpoints supuestos como si existieran.

## 9. Riesgos o puntos de atención
- Inventar endpoints de favoritos antes de que existan.
- Usar `localStorage` como persistencia real de favoritos.
- Permitir favoritos sin usuario autenticado si el backend no lo define.
- Mostrar estado favorito sin sincronización real con el backend.
- Mezclar favoritos con reservas.
- Perder consistencia entre listado y detalle.
- Prometer recomendaciones sin soporte real.

## 10. Criterios de aceptación
Como sprint futuro, los criterios deben ser condicionales:

- solo se considerará implementable cuando el backend exponga endpoints reales;
- el contrato backend-frontend deberá documentar payloads, respuestas y permisos;
- el estado favorito/no favorito deberá venir del backend o validarse contra él;
- la UI deberá diferenciar lista vacía de error;
- no debe existir implementación real en la versión actual del MVP frontend.

## 11. Definition of Done
- Sprint documentado como futuro.
- Dependencia de backend real explícita.
- Sin endpoints inventados.
- Sin tutorial implementable.
- Sin implementación en la versión actual.
- Commit sugerido: `docs: actualizar sprint 9 favoritos`

## 12. Entregables del sprint
- Documento del Sprint 9 actualizado.
- Alcance futuro descrito.
- Límites actuales claros.
- Criterios para habilitar implementación futura.

## 13. Estado
Futuro. Depende de endpoints no implementados en backend.

