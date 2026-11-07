# Sprint 8 — Búsqueda y disponibilidad

## 1. Nombre del sprint
Búsqueda y disponibilidad.

## 2. Objetivo del sprint
Este sprint queda como preparación futura para permitir búsqueda avanzada y consulta de disponibilidad cuando el backend tenga endpoints reales para ello. No se implementa en la versión actual, no forma parte del MVP actual, depende de endpoints futuros del backend y no debe simular disponibilidad ni resultados filtrados como si vinieran del servidor.

## 3. Contexto de negocio
La búsqueda y disponibilidad permitirían a los usuarios encontrar alojamientos por criterios como ciudad, precio, fechas, capacidad o comodidades, y evitar mostrar alojamientos no disponibles. Pero estos filtros deben estar respaldados por consultas reales del backend para ser confiables.

## 4. Alcance del sprint
Como sprint futuro, el alcance proyectado sería:

- búsqueda por texto o ciudad;
- filtros por precio;
- filtros por comodidades;
- filtros por fechas;
- consulta de disponibilidad;
- ordenamiento de resultados si el backend lo soporta;
- paginación si el backend la define;
- estado de resultados vacíos;
- estados loading y error;
- preservación de filtros en la URL si se define como requisito.

Este alcance es futuro y no debe implementarse hasta que existan endpoints reales del backend.

## 5. Fuera de alcance
En la versión actual NO se implementa:

- búsqueda avanzada real;
- consulta real de disponibilidad;
- filtros persistidos por backend;
- paginación real;
- ordenamiento real;
- calendario funcional de disponibilidad;
- simulación de resultados filtrados como si vinieran del backend;
- endpoints simulados;
- reservas;
- pagos;
- favoritos;
- reseñas;
- mapas o geolocalización.

## 6. Prerrequisitos
Antes de implementarlo se necesitará:

- backend con endpoints reales de búsqueda y disponibilidad;
- contrato backend-frontend actualizado;
- definición de query params;
- definición de respuestas;
- definición de reglas de disponibilidad;
- decisión sobre paginación y ordenamiento;
- frontend de sprints 1 al 5 funcionando;
- idealmente sprint de reservas definido si disponibilidad depende de reservas.

## 7. Herramientas y tecnologías usadas
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API
- URLSearchParams cuando el backend lo soporte
- JWT si los filtros requieren sesión en algún caso futuro
- Git

## 8. Tareas del sprint
Como sprint futuro, las tareas se redactan en futuro o como planificación:

- actualizar contrato backend-frontend cuando existan endpoints;
- definir query params reales;
- definir respuestas reales para búsqueda;
- definir reglas de disponibilidad;
- planificar formulario de filtros;
- planificar búsqueda por ciudad o texto;
- planificar filtros por precio;
- planificar filtros por comodidades;
- planificar filtros por fechas;
- planificar estado de resultados vacíos;
- planificar estados loading y error;
- planificar paginación si el backend la define;
- planificar preservación de filtros en URL;
- planificar validaciones manuales cuando existan endpoints.

No incluir código completo.
No inventar rutas.
No escribir endpoints supuestos como si existieran.

## 9. Riesgos o puntos de atención
- Inventar endpoints de búsqueda antes de que existan.
- Filtrar solo en frontend y presentarlo como búsqueda real.
- Simular disponibilidad sin reglas del backend.
- Calcular disponibilidad sin reservas reales.
- Cargar todos los alojamientos para filtrar localmente en producción.
- No definir paginación.
- Mezclar búsqueda con reservas antes de tiempo.
- Prometer resultados confiables sin soporte del servidor.

## 10. Criterios de aceptación
Como sprint futuro, los criterios deben ser condicionales:

- solo se considerará implementable cuando el backend exponga endpoints reales;
- el contrato backend-frontend deberá documentar query params, respuestas y reglas;
- la disponibilidad deberá validarse desde el backend;
- la UI deberá diferenciar resultados vacíos de errores;
- no debe existir implementación real en la versión actual del MVP frontend.

## 11. Definition of Done
- Sprint documentado como futuro.
- Dependencia de backend real explícita.
- Sin endpoints inventados.
- Sin tutorial implementable.
- Sin implementación en la versión actual.
- Commit sugerido:

```text
docs: actualizar sprint 8 busqueda disponibilidad
```

## 12. Entregables del sprint
- Documento del Sprint 8 actualizado.
- Alcance futuro descrito.
- Límites actuales claros.
- Criterios para habilitar implementación futura.

## 13. Estado
Futuro. Depende de endpoints no implementados en backend.

