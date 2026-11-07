# Conceptos fundamentales frontend

## 1. Propósito del documento
Este documento reúne los conceptos clave que el estudiante debe comprender antes y durante la construcción del frontend SPA vanilla del proyecto alojamientos.

No reemplaza los tutoriales. Su función es servir como base conceptual para entender mejor el código, las decisiones de arquitectura y el contrato con el backend.

## 2. Qué es el frontend en este proyecto
El frontend es la aplicación que el usuario ve y usa en el navegador.

En este proyecto, el frontend:

- muestra interfaces;
- captura datos desde formularios;
- consume el backend;
- administra la sesión del usuario;
- muestra errores y estados;
- respeta permisos;
- no reemplaza la lógica de seguridad del backend.

## 3. Qué es una SPA
Una SPA es una Single Page Application: una aplicación que trabaja con una sola entrada HTML y cambia de vista sin recargar toda la página.

En este proyecto:

- existe una sola entrada HTML;
- la navegación ocurre sin recargar completamente el navegador;
- las vistas se renderizan dinámicamente dentro de `#app`;
- JavaScript controla el cambio de vistas;
- la experiencia es más fluida para el usuario.

La SPA del proyecto se construirá con JavaScript vanilla.

## 4. Qué es Vite
Vite es una herramienta de desarrollo y construcción para aplicaciones web modernas.

Sirve para:

- levantar el servidor local;
- trabajar con módulos JavaScript modernos;
- procesar imports de CSS y dependencias;
- generar el build de producción;
- acelerar la experiencia de desarrollo.

Vite no es un framework.

Comandos importantes:

- `npm run dev`
- `npm run build`
- `npm run preview`

`npm run dev` levanta el servidor de desarrollo, normalmente en `http://localhost:5173/`.

`npm run build` genera la carpeta `dist/`.

`npm run preview` sirve el build generado, normalmente en `http://localhost:4173/`.

`preview` se usa para revisar el resultado compilado, no reemplaza a `dev`.


Vite reemplaza herramientas más pesadas como Create React App o configuraciones manuales con Webpack, ofreciendo un entorno más rápido y sencillo para desarrollar frontend.

Por ejemplo, en un proyecto React, Vite se encarga de:

1. Crear la estructura inicial del proyecto
2. Ejecutar el servidor local
3. Recargar cambios automáticamente
4. Procesar JSX, CSS, imágenes y módulos
5. Generar la versión final para producción

JavaScript:	Lenguaje de programación
React:	Librería para interfaces
Vite:	Herramienta para crear, correr y compilar el proyecto
Node.js:	Entorno que permite ejecutar herramientas como Vite
npm:	Gestor de paquetes

## 5. HTML, CSS y JavaScript en la SPA
Cada tecnología cumple una función distinta:

- HTML: estructura base;
- CSS: estilos globales y ajustes visuales;
- JavaScript: renderizado, eventos, consumo de API y navegación.

Elementos clave del proyecto:

- `index.html`;
- `src/css/main.css`;
- `src/js/main.js`;
- `#app`.

## 6. Bootstrap 5.3 y Bootstrap Icons
Bootstrap 5.3 ayuda a acelerar la construcción visual con:

- grid;
- cards;
- botones;
- formularios;
- alertas;
- tablas;
- badges;
- navbar.

Bootstrap Icons aporta iconografía lista para usar.

Bootstrap no reemplaza la arquitectura de la aplicación; solo facilita la presentación.

## 7. Componentes vanilla
Un componente vanilla es una función JavaScript que devuelve HTML reutilizable.

Ejemplos:

- `Navbar`;
- `AlojamientoCard`;
- `AlojamientoForm`;
- `ComodidadBadge`;
- `ComodidadesSelector`.

Un componente idealmente:

- recibe datos;
- devuelve HTML;
- no debería consumir API si puede recibir datos desde una página;
- no debería manejar sesión global.

## 8. Páginas
Una página representa una vista completa de la aplicación.

Ejemplos:

- Login;
- Registro;
- Perfil;
- Admin;
- Alojamientos;
- Detalle de alojamiento;
- Crear alojamiento;
- Editar alojamiento;
- Comodidades.

Una página puede:

- renderizar HTML;
- cargar datos;
- registrar eventos;
- llamar servicios API.

## 9. Eventos del DOM
Un evento es una acción que ocurre en la interfaz, como un click o el envío de un formulario.

Conceptos importantes:

- `addEventListener` conecta un evento con una función;
- no se recomienda usar `onclick` inline;
- los eventos deben registrarse después de renderizar el HTML;
- formularios y botones son los casos más comunes.

La idea es separar la estructura visual de la lógica de interacción.

## 10. Renderizado dinámico
El frontend cambia el contenido de `#app` según la vista activa.

Flujo conceptual:

`render -> bindEvents -> cargarDatos`

Esto significa:

1. Se genera el HTML.
2. Se enlazan eventos.
3. Se consultan datos si la vista los necesita.
4. La UI se actualiza según la respuesta.

## 11. Router propio
El router propio decide qué vista mostrar según una ruta o un estado de navegación.

Progresión pedagógica:

- en Sprint 1, `main.js` solo muestra la pantalla base;
- en Sprint 2, `main.js` mantiene una navegación simple para usuarios y autenticación;
- desde Sprint 3, la navegación se separa en `router/routes.js` y `router/guards.js`.

Router y guards son parte de la arquitectura final del MVP, pero no existen todavía al terminar Sprint 2.

Debe manejar:

- rutas públicas;
- rutas privadas;
- rutas admin;
- rutas con id;
- navegación interna;
- relación con guards.

No se trata de una implementación compleja, sino de una capa clara para decidir qué página mostrar.

## 12. Cliente HTTP centralizado
Todo consumo del backend debe pasar por `src/js/api/http.js`.

Ese cliente debe encargarse de:

- `VITE_API_URL`;
- Fetch API;
- headers JSON;
- token JWT en `Authorization`;
- manejo de JSON;
- manejo de `204 No Content`;
- manejo de errores visibles apoyado en `src/js/utils/errorMessages.js`.

No conviene hacer `fetch` directo en cada página.

## 13. Servicios API por recurso
Cada recurso tiene su módulo:

- `auth.api.js`;
- `admin.api.js`;
- `alojamientos.api.js`;
- `comodidades.api.js`.

Estos módulos:

- no renderizan HTML;
- solo llaman endpoints;
- separan la comunicación con el backend de la interfaz.

## 14. Variables de entorno
El proyecto usa `.env.example` para documentar la configuración esperada y sí se versiona.

`.env` es local, se puede crear copiando `.env.example`, y no debe subirse al repositorio.

La variable principal es:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

En el código se lee con:

```js
import.meta.env.VITE_API_URL
```

Las variables expuestas al frontend deben empezar por `VITE_`.

`VITE_API_URL=http://localhost:5000/api/v1` es necesaria desde Sprint 2, cuando empieza el consumo real del backend.

Para validar `npm run preview`, el backend debe permitir por CORS el origen que muestra Vite para preview, normalmente `http://localhost:4173/`.

Si el backend solo permite `http://localhost:5173/`, la app puede compilar bien, pero las peticiones desde preview pueden ser bloqueadas por CORS.

## 15. JSON y contrato backend-frontend
El frontend y el backend se comunican principalmente con JSON.

Conceptos importantes:

- payload;
- respuesta exitosa;
- respuesta de error;
- `data`;
- `error.message`;
- `error.details`.

Los campos técnicos deben respetarse exactamente:

- `contrasena`;
- `access_token`;
- `usuario_id`;
- `precio_noche`;
- `comodidades_ids`.

## 16. Autenticación
La autenticación consiste en saber quién es el usuario.

Incluye:

- registro;
- login;
- token JWT;
- sesión frontend;
- logout;
- perfil del usuario autenticado.

Endpoints relacionados:

- `POST /usuarios/registro`;
- `POST /usuarios/login`;
- `GET /usuarios/perfil`;
- `PATCH /usuarios/perfil`.

## 17. Autorización y roles
La autorización consiste en saber qué puede hacer el usuario.

En este proyecto se trabaja con:

- rol `usuario`;
- rol `admin`;
- rutas privadas;
- rutas admin;
- permisos visuales;
- permisos reales del backend.

Ocultar botones no es seguridad real. El backend siempre valida los permisos definitivos.

## 18. Guards
Los guards protegen rutas o vistas.

Desde Sprint 3 aparecen como una capa separada junto con el router. Al terminar Sprint 2 todavía no existen como archivos propios, porque la navegación simple sigue viviendo en `main.js`.

Se usan para:

- guard de autenticación;
- guard de admin;
- `requiresAuth`;
- `requiresAdmin`;
- invitado;
- usuario normal;
- admin.

## 19. 401 vs 403
La diferencia es importante:

- `401 Unauthorized`: no hay token, el token es inválido o la sesión expiró.
- `403 Forbidden`: el usuario está autenticado, pero no tiene permisos.

Regla práctica:

- `401` puede limpiar sesión y pedir login;
- `403` no debe cerrar sesión automáticamente.

## 20. Estados de interfaz
La interfaz debe comunicar el estado de cada operación.

Estados comunes:

- loading;
- error;
- empty;
- success;
- unauthorized;
- forbidden.

Ejemplos:

- catálogo vacío de comodidades;
- lista vacía de alojamientos;
- backend caído;
- usuario sin permisos;
- operación exitosa.

## 21. Formularios
Los formularios capturan datos del usuario.

Conceptos importantes:

- capturar valores;
- validar campos básicos;
- construir payload;
- enviar con API;
- mostrar errores;
- limpiar o conservar datos.

Ejemplos de formularios:

- registro;
- login;
- perfil;
- alojamiento;
- comodidad.

## 22. CRUD y operaciones del frontend
Las operaciones principales del frontend son:

- listar;
- ver detalle;
- crear;
- editar;
- eliminar.

Estas operaciones se aplican sobre:

- alojamientos;
- comodidades.

Las comodidades no tienen editar ni eliminar en el backend actual.

## 23. Manejo de `204 No Content`
Algunas respuestas exitosas no devuelven JSON.

En el proyecto esto ocurre, por ejemplo, con:

- `DELETE /alojamientos/:id`.

Regla:

- no intentar hacer `response.json()` después de un `204`;
- el cliente HTTP debe devolver `null` en ese caso.

## 24. Permisos sobre alojamientos
Reglas del contrato actual:

- cualquier visitante puede listar y ver detalle;
- un usuario autenticado puede crear;
- propietario o admin puede editar;
- propietario o admin puede eliminar;
- el frontend puede usar `usuario_id` para mostrar botones;
- el backend valida realmente.

## 25. Permisos sobre comodidades
Reglas del contrato actual:

- visitantes pueden listar comodidades;
- admin puede crear comodidad;
- propietario o admin puede asignar comodidades a un alojamiento;
- el payload correcto usa `comodidades_ids`;
- no existen editar ni eliminar comodidad en el alcance actual.

## 26. Funcionalidades futuras
Los sprints 6 al 10 son futuros:

- imágenes;
- reservas;
- búsqueda/disponibilidad;
- favoritos;
- reseñas.

No se implementan ahora. Dependen de endpoints reales del backend y no deben simularse con localStorage o datos falsos como si fueran reales.

## 27. Buenas prácticas
Buenas prácticas del proyecto:

- separar responsabilidades;
- usar cliente HTTP centralizado;
- usar servicios API;
- usar componentes reutilizables;
- no duplicar lógica;
- no inventar endpoints;
- no guardar token en varios lugares;
- no tratar `403` como logout;
- manejar estados de UI;
- mantener nombres claros;
- en Sprint 2 es intencional que `main.js` lleve navegación simple; después, cuando router y guards ya existan, mover esa responsabilidad a sus archivos propios;
- hacer commits pequeños.

## 28. Errores comunes
Errores frecuentes:

- pensar que Vite es un framework;
- usar `contraseña` en vez de `contrasena`;
- leer mal `response.data`;
- olvidar `Authorization`;
- comparar mal `usuario_id`;
- intentar leer JSON en un `204`;
- crear módulos futuros sin backend;
- mezclar lógica de API dentro de componentes;
- mantener demasiadas responsabilidades en `main.js` una vez que router y guards ya se separaron;
- convertir un tutorial en una administración completa.

## 29. Cierre
Estos conceptos ayudan a entender los tutoriales y a construir una SPA vanilla profesional, clara y alineada con el backend real.



