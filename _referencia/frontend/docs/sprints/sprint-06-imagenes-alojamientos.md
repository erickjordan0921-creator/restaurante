# Sprint 6 — Imágenes de alojamientos

## 1. Nombre del sprint
Imágenes de alojamientos.

## 2. Objetivo del sprint
Este sprint queda como preparación futura para mostrar y gestionar imágenes de alojamientos cuando el backend tenga endpoints reales para ello. No se implementa en la versión actual, no forma parte del MVP actual y depende de endpoints futuros del backend. Por ahora el frontend puede usar placeholders visuales si los sprints implementables lo requieren, pero no debe simular carga real de imágenes.

## 3. Contexto de negocio
Las imágenes ayudan a mejorar la presentación visual de los alojamientos y permiten que los visitantes evalúen mejor un alojamiento antes de reservar o contactar, pero necesitan soporte real del backend para persistencia y consulta.

## 4. Alcance del sprint
Como sprint futuro, el alcance proyectado sería:

- visualización de imágenes asociadas a alojamientos;
- imagen principal para cards;
- galería en detalle de alojamiento;
- carga de imágenes por propietario o admin;
- reemplazo o eliminación de imágenes si el backend lo permite;
- validación de tipo y tamaño de archivo;
- estados loading, error y empty para imágenes;
- accesibilidad básica con texto alternativo.

Este alcance es futuro y no debe implementarse hasta que existan endpoints reales del backend.

## 5. Fuera de alcance
En la versión actual NO se implementa:

- carga real de imágenes;
- subida de archivos;
- galería funcional;
- almacenamiento de imágenes;
- endpoints simulados;
- imágenes persistidas;
- integración con servicios externos de almacenamiento;
- reservas;
- favoritos;
- reseñas;
- pagos;
- búsqueda avanzada.

## 6. Prerrequisitos
Antes de implementarlo se necesitará:

- backend con endpoints reales para imágenes;
- contrato backend-frontend actualizado;
- definición de payloads y respuestas;
- definición de permisos;
- validación de tamaño y tipo de archivo;
- decisión sobre almacenamiento de archivos;
- frontend de sprints 1 al 5 funcionando.

## 7. Herramientas y tecnologías usadas
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API
- FormData cuando el backend lo soporte
- JWT
- Guards frontend
- Git

## 8. Tareas del sprint
Como sprint futuro, las tareas se redactan como planificación:

- actualizar contrato backend-frontend cuando existan endpoints;
- definir endpoints reales de imágenes;
- definir permisos para subir o eliminar imágenes;
- diseñar placeholder visual para alojamientos sin imagen;
- planificar imagen principal en cards;
- planificar galería en detalle;
- planificar formulario de carga;
- planificar validación de archivos;
- planificar manejo de errores;
- planificar textos alternativos para accesibilidad;
- crear validaciones manuales cuando existan endpoints.

No incluir código completo.
No inventar rutas.
No escribir endpoints supuestos como si existieran.

## 9. Riesgos o puntos de atención
- Inventar endpoints de imágenes antes de que existan.
- Simular carga real sin backend.
- Usar imágenes externas como si fueran persistidas por el sistema.
- No validar tamaño o tipo de archivo.
- Olvidar permisos de propietario o admin.
- Mezclar este sprint con reservas o reseñas.
- Romper la experiencia si un alojamiento no tiene imagen.

## 10. Criterios de aceptación
Como sprint futuro, los criterios deben ser condicionales:

- solo se considerará implementable cuando el backend exponga endpoints reales;
- el contrato backend-frontend deberá documentar payloads y respuestas;
- la UI deberá mostrar placeholders cuando no existan imágenes;
- la carga o edición de imágenes deberá respetar permisos del backend;
- no debe existir implementación real en la versión actual del MVP frontend.

## 11. Definition of Done
- Sprint documentado como futuro.
- Dependencia de backend real explícita.
- Sin endpoints inventados.
- Sin tutorial implementable.
- Sin implementación en la versión actual.
- Commit sugerido:

```text
docs: actualizar sprint 6 imagenes alojamientos
```

## 12. Entregables del sprint
- Documento del Sprint 6 actualizado.
- Alcance futuro descrito.
- Límites actuales claros.
- Criterios para habilitar implementación futura.

## 13. Estado
Futuro. Depende de endpoints no implementados en backend.

