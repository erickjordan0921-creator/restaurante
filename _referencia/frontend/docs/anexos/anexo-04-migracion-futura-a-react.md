# Anexo 4 — Migración futura a React

## 1. Propósito del anexo
Este anexo describe una posible ruta de migración futura desde la SPA vanilla hacia React.

Es material complementario:

- no reemplaza los tutoriales;
- no cambia el stack del MVP;
- no implica instalar React ahora;
- no forma parte de los sprints implementables actuales;
- el proyecto principal sigue usando JavaScript vanilla, Vite y Bootstrap 5.3.

## 2. Cuándo tendría sentido migrar
Una migración futura podría considerarse si el proyecto crece en:

- cantidad de pantallas;
- complejidad de estado;
- reutilización de componentes;
- cantidad de usuarios o roles;
- pruebas automatizadas;
- mantenimiento por un equipo más grande;
- integración con más módulos del backend.

No es necesario migrar solo porque exista React.

## 3. Qué debe estar estable antes de migrar
Antes de pensar en una migración, debería estar estable:

- el contrato backend-frontend;
- los endpoints reales;
- la autenticación;
- la autorización;
- el módulo de alojamientos;
- el módulo de comodidades;
- el manejo de errores;
- las reglas de permisos;
- la estructura de datos;
- la validación manual del MVP.

## 4. Qué NO debe motivar una migración
No se debería migrar por:

- moda;
- presión por usar una herramienta popular;
- falta de orden en el código actual;
- intentar arreglar errores de arquitectura sin entenderlos;
- implementar funcionalidades futuras sin backend;
- reemplazar fundamentos que todavía no se dominan.

## 5. Qué partes del proyecto se podrían mapear
| SPA vanilla actual | Posible equivalente en React futuro |
|---|---|
| `main.js` | Entrada de aplicación |
| `pages/` | Componentes de página |
| `components/` | Componentes reutilizables |
| `api/http.js` | Cliente HTTP compartido |
| `errorMessages.js` | Utilidades de mensajes de error visibles |
| `auth.api.js` | Servicio API de autenticación |
| `alojamientos.api.js` | Servicio API de alojamientos |
| `comodidades.api.js` | Servicio API de comodidades |
| `session.service.js` | Estado o contexto de sesión |
| `permissions.js` | Utilidades de permisos |
| `router/routes.js` | Configuración de rutas |
| `router/guards.js` | Rutas protegidas |
| `storage.js` | Utilidades de persistencia local |
| `formatters.js` | Utilidades reutilizables |

En este proyecto, la progresión real es: en Sprint 1 `src/js/main.js` solo muestra una pantalla base; en Sprint 2 mantiene navegación simple para usuarios y autenticación; desde Sprint 3 la navegación se separa en `src/js/router/routes.js` y `src/js/router/guards.js`. Al terminar Sprint 2, `router/routes.js` y `router/guards.js` todavía no existen como archivos separados.

## 6. Estrategia recomendada de migración
Una migración sana debería ser gradual y planificada.

### Fase 1 — Congelar el MVP vanilla
- Validar que los sprints 1 al 5 funcionen.
- Confirmar que no hay endpoints inventados.
- Confirmar que el contrato backend-frontend está estable.
- Tener validación manual aprobada.

### Fase 2 — Separar lógica reutilizable
- Mantener servicios API separados.
- Mantener helpers de sesión y permisos claros.
- Evitar lógica duplicada.
- Evitar mezclar renderizado con consumo de API.

### Fase 3 — Crear proyecto experimental separado
- No reescribir encima del MVP actual.
- Crear una rama o proyecto experimental.
- Mantener el MVP vanilla como referencia funcional.
- Comparar comportamiento contra la validación manual.

### Fase 4 — Migrar vistas por dominio
Orden sugerido:

1. Base de layout y navegación.
2. Autenticación y perfil.
3. Roles y guards.
4. Alojamientos.
5. Comodidades.

No migrar módulos futuros sin endpoints reales.

### Fase 5 — Validar equivalencia funcional
Usar la misma guía de validación manual:

- login/logout;
- guards;
- admin;
- alojamientos;
- comodidades;
- errores `401` y `403`;
- `204 No Content`;
- estados loading/error/empty.

## 7. Riesgos de una migración mal hecha
Una migración mal planificada puede provocar:

- duplicar lógica;
- romper permisos;
- leer mal `response.data`;
- perder manejo de `204 No Content`;
- tratar `403` como logout;
- mezclar lógica de API dentro de componentes;
- cambiar nombres técnicos del contrato;
- implementar módulos futuros sin backend;
- reescribir sin pruebas manuales.

## 8. Qué se puede reutilizar conceptualmente
Se podría reutilizar:

- el contrato backend-frontend;
- los endpoints reales;
- la estructura por recursos;
- la idea de cliente HTTP;
- los servicios API;
- las reglas de sesión;
- las reglas de permisos;
- `errorMessages.js` o el manejo de errores visibles;
- la validación manual;
- los estados de UI;
- la separación entre páginas, componentes y servicios.

## 9. Qué probablemente cambiaría
Conceptualmente, una migración alteraría:

- la forma de declarar la UI;
- el manejo de estado;
- el renderizado;
- los eventos;
- las rutas;
- el ciclo de vida de carga de datos;
- la organización interna de componentes.

Este anexo no entra en APIs concretas ni en un tutorial detallado.

## 10. Relación con los sprints futuros
Los sprints 6 al 10 siguen siendo futuros:

- imágenes;
- reservas;
- búsqueda/disponibilidad;
- favoritos;
- reseñas.

Migrar a React no habilita esos módulos. Siguen dependiendo de endpoints reales del backend y no deben simularse como funcionalidades reales.

## 11. Recomendación final
La prioridad actual es terminar y validar bien la SPA vanilla.

React puede ser una evolución futura si el proyecto crece, pero no debe reemplazar el aprendizaje de fundamentos ni el MVP aprobado.

## 12. Cierre
Una migración futura debe ser una decisión técnica planificada, no una reacción automática. El trabajo realizado en SPA vanilla servirá como base conceptual y funcional para cualquier evolución posterior.


