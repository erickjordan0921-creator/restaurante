# Anexo 1 — Frameworks frontend

## 1. Propósito del anexo
Este anexo sirve para que los estudiantes conozcan qué son los frameworks frontend y cómo se relacionan conceptualmente con lo que construirán usando JavaScript vanilla.

Es material complementario:

- no reemplaza los tutoriales;
- no cambia el stack del proyecto;
- no altera las decisiones ya aprobadas;
- la implementación principal sigue siendo SPA vanilla con Vite, Bootstrap 5.3 y JavaScript vanilla.

## 2. Qué es un framework frontend
Un framework frontend es una herramienta o conjunto de herramientas que ayuda a estructurar aplicaciones web más grandes.

Normalmente ayuda con:

- componentes;
- estado;
- renderizado;
- rutas;
- formularios;
- organización del proyecto;
- reutilización de código.

## 3. Por qué existen los frameworks frontend
Los frameworks frontend surgieron para resolver problemas comunes en aplicaciones web modernas:

- interfaces cada vez más dinámicas;
- muchas pantallas;
- actualización de datos en tiempo real;
- reutilización de componentes;
- mantenimiento de proyectos grandes;
- coordinación entre equipos.

## 4. Ejemplos conocidos
Algunos ejemplos conocidos son:

- React;
- Vue;
- Angular;
- Svelte.

Este anexo solo los presenta como referencia conceptual. No propone migrar el proyecto actual a ninguno de ellos.

## 5. Diferencia entre JavaScript vanilla y un framework
### JavaScript vanilla
- usa el lenguaje directamente;
- ayuda a entender los fundamentos;
- requiere construir manualmente router, componentes, estado y eventos;
- es ideal para aprender cómo funciona una SPA por dentro.

### Framework
- trae convenciones y herramientas listas;
- simplifica patrones repetitivos;
- puede acelerar proyectos grandes;
- exige aprender su ecosistema y forma de pensar.

## 6. Por qué este proyecto usa SPA vanilla
Este proyecto usa SPA vanilla porque:

- los estudiantes ya trabajaron el backend y ahora necesitan entender cómo el navegador consume una API;
- permite aprender fundamentos reales de HTML, CSS, JavaScript, DOM, Fetch API y eventos;
- hace visible cómo irán apareciendo router, guards, sesión, componentes y servicios API de forma progresiva;
- evita depender de abstracciones desde el inicio;
- mantiene el curso alineado con los objetivos pedagógicos.

## 7. Qué conceptos del proyecto existen también en frameworks
| Concepto en este proyecto | Equivalente conceptual en frameworks |
|---|---|
| Componente vanilla | Componente |
| Página | Vista o página |
| Router propio | Router del framework o librería |
| `session.service.js` | Servicio o store de sesión |
| `api/http.js` | Cliente HTTP |
| Guards | Guards, middleware o protección de rutas |
| `render -> bindEvents -> cargarDatos` | Ciclo de renderizado y efectos |
| Estado loading/error/empty | Estado de UI |

En este proyecto, esos conceptos aparecen progresivamente: en Sprint 1 `src/js/main.js` solo muestra una pantalla base, en Sprint 2 mantiene navegación simple para usuarios y autenticación, y desde Sprint 3 router y guards se separan en archivos propios. Al terminar Sprint 2 todavía no existen como archivos separados.

## 8. Qué NO significa este anexo
Este anexo no significa que:

- se vaya a cambiar el proyecto a un framework;
- haya que instalar nuevas dependencias;
- los tutoriales deban reescribirse;
- el frontend vanilla sea una solución incompleta;
- se habiliten endpoints o funcionalidades futuras.

## 9. Cuándo tendría sentido usar un framework
De forma general, un framework puede tener sentido en escenarios como:

- equipos grandes;
- muchas pantallas;
- estado complejo;
- componentes muy reutilizables;
- mantenimiento a largo plazo;
- ecosistema de pruebas y herramientas más amplio.

Esa sería una decisión futura y separada del MVP actual.

## 10. Cierre
Conocer frameworks ayuda a entender el panorama profesional, pero dominar primero los fundamentos con SPA vanilla hará más fácil aprender cualquier framework después.


