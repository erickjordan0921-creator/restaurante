# Anexo 3 — Equivalencias entre SPA vanilla y React

## 1. Propósito del anexo
Este anexo ayuda a relacionar lo aprendido en la SPA vanilla con conceptos que aparecen en React.

Es material complementario:

- no reemplaza los tutoriales;
- no cambia el stack del MVP;
- no implica instalar React;
- el proyecto principal sigue usando JavaScript vanilla, Vite y Bootstrap 5.3.

## 2. Por qué comparar con React
React es común en el entorno profesional y entender equivalencias ayuda a que los estudiantes vean que los conceptos aprendidos con vanilla son transferibles.

Primero se aprenden los fundamentos y después resulta más fácil comprender herramientas más abstractas.

## 3. Idea principal
Muchas cosas que en React vienen organizadas por la herramienta, en SPA vanilla se construyen manualmente.

Ejemplos:

- renderizado;
- componentes;
- estado;
- eventos;
- rutas;
- carga de datos;
- guards;
- servicios API.

## 4. Tabla general de equivalencias
| En SPA vanilla del proyecto | Equivalente conceptual en React |
|---|---|
| Función que devuelve HTML | Componente |
| `Navbar.js` | Componente Navbar |
| `AlojamientoCard.js` | Componente Card |
| `AlojamientoForm.js` | Componente Form |
| `pages/` | Páginas o views |
| `main.js` | Punto de entrada de la app |
| `router/routes.js` | Definición de rutas |
| `router/guards.js` | Protección de rutas |
| `session.service.js` | Estado o servicio de sesión |
| `permissions.js` | Utilidades de permisos |
| `api/http.js` | Cliente HTTP |
| `auth.api.js`, `alojamientos.api.js`, `comodidades.api.js` | Servicios por recurso |
| `render -> bindEvents -> cargarDatos` | Renderizado + efectos |
| `loading/error/empty` | Estados de UI |
| `addEventListener` | Manejadores de eventos |

En este proyecto, esas equivalencias se van incorporando de forma progresiva: en Sprint 1 `src/js/main.js` solo muestra una pantalla base, en Sprint 2 mantiene navegación simple para usuarios y autenticación, y desde Sprint 3 `router/routes.js` y `router/guards.js` se separan en archivos propios. Al terminar Sprint 2 todavía no existen como archivos separados.

## 5. Componentes
En SPA vanilla, un componente es una función que devuelve HTML reutilizable, por ejemplo `AlojamientoCard`.

En React, un componente también representa una pieza reutilizable de interfaz, pero se escribe con la sintaxis y reglas del ecosistema React.

El concepto es similar; la implementación cambia. Aprender componentes vanilla ayuda a entender componentes en frameworks.

## 6. Páginas
Las páginas del proyecto representan vistas completas:

- Login;
- Registro;
- Perfil;
- Admin;
- Alojamientos;
- Detalle;
- Crear o editar alojamiento;
- Comodidades.

En React, esas vistas normalmente también se organizan como componentes de página.

## 7. Renderizado
En SPA vanilla:

- se genera HTML;
- se inserta en `#app`;
- luego se registran eventos;
- luego se cargan datos si aplica.

En React:

- el renderizado lo administra la librería;
- la UI se recalcula cuando cambian datos o estado;
- normalmente no se manipula `innerHTML` de forma directa.

## 8. Estado
En el proyecto vanilla, el estado se maneja de forma simple con:

- variables;
- sesión guardada;
- datos cargados desde backend;
- estados `loading`, `error`, `empty`, `success`.

En React, el estado suele manejarse con mecanismos propios del ecosistema, pero la idea base es la misma: datos que cambian y hacen cambiar la interfaz.

## 9. Eventos
En vanilla se usa `addEventListener`.

En React se usan manejadores declarativos en los componentes.

La idea conceptual es la misma:

- el usuario hace algo;
- se ejecuta una función;
- cambia el estado, se llama una API o se actualiza la vista.

## 10. Rutas y navegación
En este proyecto se construye un router propio de forma progresiva:

- rutas públicas;
- rutas privadas;
- rutas admin;
- rutas con id;
- guards.

En Sprint 1 `src/js/main.js` solo muestra una pantalla base; en Sprint 2 mantiene navegación simple para usuarios y autenticación; desde Sprint 3 la navegación se separa en `src/js/router/routes.js` y `src/js/router/guards.js`. Al terminar Sprint 2 todavía no existen como archivos separados.

En React normalmente se usa una librería de rutas, pero la lógica conceptual sigue siendo:

- decidir qué vista mostrar;
- leer parámetros;
- proteger rutas;
- manejar navegación.

## 11. Guards y permisos
Equivalencias importantes:

- `requiresAuth`;
- `requiresAdmin`;
- `401`;
- `403`;
- rol `usuario`;
- rol `admin`;
- permisos visuales;
- validación real del backend.

Ocultar botones no es seguridad real. El backend siempre valida los permisos definitivos.

En este proyecto, los guards forman parte de la arquitectura final del MVP, pero se formalizan desde Sprint 3; durante Sprint 2 la navegación sigue siendo simple dentro de `src/js/main.js`.

## 12. Consumo de API
En la SPA vanilla el consumo se organiza con:

- `api/http.js`;
- `auth.api.js`;
- `admin.api.js`;
- `alojamientos.api.js`;
- `comodidades.api.js`.

En React también conviene separar la comunicación con el backend de los componentes visuales.

La idea importante es la misma:

- no mezclar renderizado con detalles de `fetch`;
- centralizar token, errores y base URL;
- respetar el contrato backend-frontend.

## 13. Formularios
Los formularios del proyecto capturan valores del DOM, construyen payloads y llaman servicios API.

En React, los formularios suelen tener otro patrón de manejo, pero los conceptos son los mismos:

- leer datos;
- validar;
- construir payload;
- enviar;
- mostrar errores;
- mostrar éxito.

## 14. Qué se transfiere al aprender SPA vanilla
Los fundamentos que sí se transfieren son:

- DOM;
- eventos;
- Fetch API;
- JSON;
- HTTP status codes;
- renderizado;
- componentes;
- separación de responsabilidades;
- sesión;
- permisos;
- manejo de errores;
- estructura por módulos.

## 15. Qué cambia al usar React
Al usar React cambian varias cosas:

- cambia la forma de declarar la UI;
- cambia el manejo del renderizado;
- cambia la forma de manejar estado;
- cambia la forma de enlazar eventos;
- aparece un ecosistema de librerías alrededor;
- se reducen algunas tareas manuales, pero aparece otra curva de aprendizaje.

## 16. Qué NO significa este anexo
Este anexo no significa que:

- se vaya a migrar el MVP a React;
- se deba instalar React;
- se reescriban los tutoriales;
- la SPA vanilla sea temporal o incorrecta;
- se habiliten endpoints o módulos futuros.

## 17. Relación con el anexo de migración futura
Este documento solo muestra equivalencias conceptuales.

La planificación de una migración futura, si algún día se decide, se trata aparte en el anexo correspondiente.

## 18. Cierre
Entender equivalencias ayuda a ver que los fundamentos aprendidos en SPA vanilla son la base para comprender herramientas más avanzadas después.


