# Sprint 7 — Reservas

## 1. Nombre del sprint
Reservas.

## 2. Objetivo del sprint
Este sprint queda como preparación futura para permitir que usuarios autenticados reserven alojamientos cuando el backend tenga endpoints reales para ello. No se implementa en la versión actual, no forma parte del MVP actual, depende de endpoints futuros del backend y no debe simular reservas en localStorage ni en datos falsos como si fueran reales.

## 3. Contexto de negocio
Las reservas permitirían convertir el catálogo de alojamientos en una experiencia transaccional, donde un usuario pueda seleccionar fechas, enviar una solicitud o confirmar una reserva, y el propietario pueda revisar la ocupación. Pero todo esto requiere reglas de negocio y persistencia en el backend.

## 4. Alcance del sprint
Como sprint futuro, el alcance proyectado sería:

- selección de fechas de entrada y salida;
- cálculo de noches;
- cálculo de precio total si el backend lo soporta;
- creación de reserva por usuario autenticado;
- consulta de reservas del usuario;
- consulta de reservas de alojamientos propios;
- cancelación o cambio de estado si el backend lo permite;
- validación de disponibilidad;
- manejo de estados loading, error y empty;
- mensajes de éxito y error.

Este alcance es futuro y no debe implementarse hasta que existan endpoints reales del backend.

## 5. Fuera de alcance
En la versión actual NO se implementa:

- creación real de reservas;
- consulta real de reservas;
- cancelación de reservas;
- administración de reservas;
- calendario funcional de disponibilidad;
- cálculo definitivo de disponibilidad;
- pagos;
- facturación;
- endpoints simulados;
- reservas guardadas en localStorage como si fueran reales;
- integración con pasarelas de pago;
- notificaciones.

## 6. Prerrequisitos
Antes de implementarlo se necesitará:

- backend con endpoints reales para reservas;
- contrato backend-frontend actualizado;
- definición de payloads y respuestas;
- definición de permisos;
- reglas de disponibilidad;
- reglas de fechas;
- reglas de estado de reserva;
- frontend de sprints 1 al 5 funcionando;
- idealmente sprint de imágenes resuelto o definido si se requiere mejor experiencia visual.

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

Si se menciona un selector de fechas, debe quedar como decisión futura opcional, no como dependencia obligatoria.

## 8. Tareas del sprint
Como sprint futuro, las tareas se redactan en futuro o como planificación:

- actualizar contrato backend-frontend cuando existan endpoints;
- definir endpoints reales de reservas;
- definir permisos para crear, consultar o cancelar reservas;
- planificar formulario de fechas;
- planificar validación de fecha de entrada y salida;
- planificar cálculo de noches;
- planificar cálculo de precio total si el backend lo define;
- planificar consulta de reservas del usuario;
- planificar consulta de reservas de alojamientos propios;
- planificar cancelación o cambio de estado;
- planificar estados loading, error y empty;
- planificar validaciones manuales cuando existan endpoints.

No incluir código completo.
No inventar rutas.
No escribir endpoints supuestos como si existieran.

## 9. Riesgos o puntos de atención
- Inventar endpoints de reservas antes de que existan.
- Guardar reservas en localStorage como si fueran reales.
- Calcular disponibilidad solo en frontend.
- Permitir reservar alojamientos sin validación del backend.
- No validar fechas correctamente.
- No considerar conflictos de fechas.
- Mezclar reservas con pagos antes de tiempo.
- Prometer confirmación de reserva sin soporte real.

## 10. Criterios de aceptación
Como sprint futuro, los criterios deben ser condicionales:

- solo se considerará implementable cuando el backend exponga endpoints reales;
- el contrato backend-frontend deberá documentar payloads, respuestas y permisos;
- las reglas de disponibilidad deberán venir del backend o estar validadas por él;
- la UI deberá diferenciar reservas creadas, pendientes, canceladas o confirmadas solo cuando el backend defina esos estados;
- no debe existir implementación real en la versión actual del MVP frontend.

## 11. Definition of Done
- Sprint documentado como futuro.
- Dependencia de backend real explícita.
- Sin endpoints inventados.
- Sin tutorial implementable.
- Sin implementación en la versión actual.
- Commit sugerido:

```text
docs: actualizar sprint 7 reservas
```

## 12. Entregables del sprint
- Documento del Sprint 7 actualizado.
- Alcance futuro descrito.
- Límites actuales claros.
- Criterios para habilitar implementación futura.

## 13. Estado
Futuro. Depende de endpoints no implementados en backend.

