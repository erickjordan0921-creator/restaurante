# Arquitectura SPA vanilla

## 1. Propósito del documento
Este documento describe la arquitectura del frontend SPA vanilla del proyecto alojamientos.

Sirve como guía para entender:

  cómo se organiza el código;
  cómo se separan responsabilidades;
  cómo evoluciona la navegación entre Sprint 1, Sprint 2 y Sprint 3;
  cómo se conectan páginas, componentes, servicios API, sesión, router y guards;
  cómo se mantiene el proyecto escalable y entendible para estudiantes.

La idea es que la arquitectura sea clara, predecible y coherente con los tutoriales y sprints aprobados.

## 2. Principios de arquitectura
La SPA se construye sobre estos principios:

  una sola entrada HTML;
  separación de responsabilidades;
  componentes reutilizables;
  páginas como unidades de vista;
  servicios API separados del renderizado;
  sesión centralizada;
  errores visibles normalizados;
  navegación simple en `main.js` mientras el proyecto todavía no separa router y guards;
  router y guards como capa explícita desde Sprint 3;
  no duplicar lógica;
  no consumir backend directamente desde cualquier archivo;
  no mezclar HTML inline con lógica dispersa;
  no implementar funcionalidades sin endpoints reales.

Estos principios ayudan a que el frontend sea comprensible, mantenible y pedagógico.

## 3. Stack técnico
La implementación principal usa únicamente:

  HTML5;
  CSS3;
  JavaScript vanilla moderno;
  Vite;
  Bootstrap 5.3;
  Bootstrap Icons;
  Fetch API;
  npm;
  Git;
  Git Bash.

El documento se limita al stack definido para este frontend y evita incorporar herramientas fuera del alcance del MVP.

## 4. Entrada única de la aplicación
La aplicación parte de `index.html` como única entrada HTML.

Ese archivo contiene:

  la estructura base del documento;
  los metadatos mínimos;
  el contenedor principal `#app`;
  la carga del módulo inicial `src/js/main.js`.

Ejemplo conceptual:

```html
<div id="app"></div>
<script type="module" src="/src/js/main.js"></script>
```

`#app` es el punto de montaje donde se renderiza toda la interfaz.  
`src/js/main.js` es el punto de arranque que prepara estilos, navegación inicial y montaje de la primera vista.  
`src/css/main.css` concentra estilos base y ajustes globales.

La SPA cambia vistas sin recargar toda la página porque el contenido se reemplaza dentro de `#app` mediante JavaScript.

Progresión esperada:

  en Sprint 1, `main.js` muestra una pantalla base temporal;
  en Sprint 2, `main.js` mantiene una navegación simple para usuarios y autenticación;
  desde Sprint 3, la navegación se separa en `src/js/router/routes.js` y `src/js/router/guards.js`.

## 5. Estructura general esperada
La siguiente estructura corresponde al MVP del frontend y a su progresión pedagógica:

```text
frontend-alojamientos/
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── src/
    ├── css/
    │   └── main.css
    └── js/
        ├── main.js
        ├── api/
        │   ├── http.js
        │   ├── auth.api.js
        │   ├── admin.api.js
        │   ├── alojamientos.api.js
        │   └── comodidades.api.js
        ├── auth/
        │   ├── session.service.js
        │   └── permissions.js
        ├── router/
        │   ├── routes.js
        │   └── guards.js
        ├── components/
        │   ├── layout/
        │   │   └── Navbar.js
        │   ├── alojamientos/
        │   │   ├── AlojamientoCard.js
        │   │   ├── AlojamientoForm.js
        │   │   └── ComodidadesSelector.js
        │   └── comodidades/
        │       └── ComodidadBadge.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegistroPage.js
        │   ├── PerfilPage.js
        │   ├── AdminUsuariosPage.js
        │   ├── AlojamientosPage.js
        │   ├── AlojamientoDetallePage.js
        │   ├── CrearAlojamientoPage.js
        │   ├── EditarAlojamientoPage.js
        │   ├── ComodidadesPage.js
        │   ├── ComodidadDetallePage.js
        │   └── AdminCrearComodidadPage.js
        └── utils/
            ├── storage.js
            ├── formatters.js
            └── errorMessages.js
```

En Sprint 1 y Sprint 2 todavía no existen `router/routes.js` ni `router/guards.js`; esos archivos se incorporan desde Sprint 3 para separar navegación y control de acceso.

Esta estructura corresponde al MVP actual y a su evolución prevista. No incluye carpetas para reservas, favoritos, reseñas, imágenes ni búsqueda avanzada como si fueran funcionalidades implementadas en el presente.

## 6. Responsabilidad de cada carpeta
Cada carpeta cumple un rol específico:

  `api/`: comunicación con backend;
  `auth/`: sesión, token y usuario actual; los helpers de permisos aparecen desde Sprint 3;
  `router/`: rutas y guards a partir de Sprint 3;
  `components/`: piezas reutilizables de interfaz;
  `pages/`: vistas completas;
  `utils/`: funciones auxiliares, incluyendo `storage.js`, `formatters.js` y `errorMessages.js`;
  `css/`: estilos globales.

Mantener esta separación evita mezclar lógica de negocio, navegación y presentación en los mismos archivos.

## 7. Flujo de renderizado
La SPA sigue un ciclo de trabajo simple:

  1. En Sprint 1, `main.js` renderiza una pantalla base temporal.
  2. En Sprint 2, `main.js` resuelve una navegación simple para inicio, login, registro y perfil.
  3. Desde Sprint 3, el router identifica la ruta.
  4. Los guards validan acceso si aplica.
  5. Se renderiza el layout común.
  6. Se monta la página.
  7. La página carga datos si los necesita.
  8. Se registran eventos de formularios o botones.
  9. Se actualiza la UI según la respuesta.

Patrón conceptual recomendado:

```text
render  > bindEvents  > cargarDatos
```

No se deben registrar eventos antes de que el HTML exista en el DOM. Primero se renderiza, luego se enlazan eventos y después se carga la información necesaria.

## 8. Páginas
Una página representa una vista completa dentro de la SPA.

Ejemplos esperados:

  Login;
  Registro;
  Perfil;
  Usuarios;
  Alojamientos;
  Detalle de alojamiento;
  Crear alojamiento;
  Editar alojamiento;
  Comodidades.

Una página puede exportar:

  una función que devuelve HTML;
  una función de carga de datos;
  una función de eventos.

No es obligatorio usar un patrón complejo. Lo importante es mantener consistencia entre páginas.

## 9. Componentes
Los componentes son funciones reutilizables que devuelven HTML.

Ejemplos:

  Navbar;
  AlojamientoCard;
  AlojamientoForm;
  ComodidadBadge;
  ComodidadesSelector.

Un componente no debe hacer demasiadas cosas:

  no debe consumir API si puede recibir datos;
  no debe guardar sesión;
  no debe controlar toda la navegación.

Su función principal es reutilizar interfaz y mantener el código ordenado.

## 10. Cliente HTTP centralizado
Todo consumo del backend debe pasar por `src/js/api/http.js`.

Este cliente debe encargarse de:

  usar `VITE_API_URL`;
  agregar headers JSON;
  agregar `Authorization: Bearer <token>` cuando exista token;
  manejar respuestas JSON;
  manejar `204 No Content`;
  normalizar errores `400`, `401`, `403`, `404` y `500`;
  apoyarse en `src/js/utils/errorMessages.js` para los mensajes visibles;
  evitar `fetch` directo disperso en páginas.

Centralizar este comportamiento reduce duplicación y hace el proyecto más estable.

## 11. Servicios API por recurso
Cada recurso del backend debe tener su propio módulo:

  `auth.api.js`;
  `admin.api.js`;
  `alojamientos.api.js`;
  `comodidades.api.js`.

Estos módulos no deben renderizar HTML. Su responsabilidad es hablar con el backend y devolver datos listos para usar desde páginas o componentes.

## 12. Sesión y permisos
La sesión del usuario debe estar centralizada.

La capa de `auth/` debe manejar:

  token;
  usuario autenticado;
  logout;
  utilidades de permisos en `permissions.js` desde Sprint 3.

Aquí se entiende la diferencia entre autenticación y autorización:

  autenticación: verificar quién es el usuario;
  autorización: verificar qué puede hacer ese usuario.

También debe quedar clara la diferencia entre protección visual y validación real del backend:

  ocultar botones no es seguridad real;
  el backend siempre valida los permisos definitivos.

## 13. Router y guards
El router debe distinguir entre:

  rutas públicas;
  rutas privadas;
  rutas admin.

Los guards deben trabajar con reglas simples como:

  `requiresAuth`;
  `requiresAdmin`.

Manejo esperado:

  `401`: token ausente, inválido o expirado. Las vistas protegidas limpian sesión y piden login.
  `403`: usuario autenticado sin permisos. Muestra permisos insuficientes sin cerrar sesión automáticamente.

El router no debe convertirse en un contenedor de lógica de negocio. Su función es resolver navegación y acceso.

## 14. Estados de interfaz
La interfaz debe manejar estados claros y consistentes:

  loading;
  error;
  empty;
  success;
  forbidden;
  unauthorized.

Casos típicos:

  catálogo vacío;
  backend caído;
  token inválido;
  usuario sin permisos;
  operación exitosa.

Usar estos estados ayuda a que el estudiante entienda qué ocurre en cada momento y evita interfaces ambiguas.

## 15. Variables de entorno
El frontend debe apoyarse en variables de entorno documentadas en `.env.example`.

`.env.example` documenta la configuración esperada y sí se versiona.
`.env` es local, se puede crear copiando `.env.example`, y no debe subirse al repositorio.

La principal variable para consumir backend desde Sprint 2 es:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

En el código se lee con:

```js
import.meta.env.VITE_API_URL
```

Las variables expuestas al frontend deben empezar por `VITE_` para que Vite las publique correctamente en tiempo de compilación.

Para validar `npm run preview`, el backend debe permitir el origen que muestra Vite para preview, normalmente `http://localhost:4173/`.

## 16. Relación con el backend
El frontend se apoya en el contrato backend frontend aprobado para estos recursos:

  usuarios;
  admin usuarios;
  alojamientos;
  comodidades.

El consumo real empieza con los endpoints de usuarios y autenticación en Sprint 2. La arquitectura debe respetar ese contrato y no inventar pantallas o comportamientos que dependan de endpoints inexistentes.

## 17. Funcionalidades futuras
Los sprints 6 al 10 son futuros:

  imágenes;
  reservas;
  búsqueda/disponibilidad;
  favoritos;
  reseñas.

Estas ideas pueden documentarse como roadmap, pero no forman parte de la arquitectura implementable actual hasta que el backend tenga endpoints reales.

## 18. Buenas prácticas
Para mantener el proyecto sano:

  no usar `onclick` inline;
  no duplicar `fetch`;
  no guardar token en múltiples lugares;
  no mezclar responsabilidades;
  no hacer archivos gigantes;
  no inventar endpoints;
  no crear datos falsos como si fueran reales;
  mantener nombres de archivos alineados con su responsabilidad;
  en Sprint 2 es intencional que `main.js` lleve navegación simple; después, cuando router y guards ya existan, mover esa responsabilidad a sus archivos propios;
  mantener commits pequeños y claros.

## 19. Errores comunes
Errores a evitar:

  pensar que Vite es un framework;
  poner lógica de negocio en `index.html`;
  consumir API directamente desde cualquier componente;
  olvidar manejar `204 No Content`;
  tratar `403` como si fuera logout;
  comparar mal `usuario_id`;
  mantener demasiadas responsabilidades en `main.js` una vez que router y guards ya se separaron;
  simular módulos futuros como si ya existieran.

## 20. Cierre
Esta arquitectura permite construir una SPA vanilla profesional, entendible para estudiantes, alineada con el backend actual y preparada para crecer cuando existan nuevos endpoints.
