# Anexo 2 — Antes de Vite

## 1. Propósito del anexo
Este anexo sirve para entender qué herramientas y flujos eran comunes antes de Vite.

Es material complementario:

- no reemplaza los tutoriales;
- no cambia el stack actual;
- el proyecto principal usa Vite, JavaScript vanilla, Bootstrap 5.3 y Bootstrap Icons.

## 2. Qué problema resuelve Vite
Vite facilita el trabajo frontend moderno porque permite:

- servidor local rápido;
- recarga en desarrollo;
- uso de módulos JavaScript modernos;
- importación de CSS y dependencias desde JavaScript;
- uso de dependencias instaladas con npm;
- build con `npm run build`;
- preview del build con `npm run preview`.

## 3. Cómo se trabajaba antes en proyectos simples
Antes de Vite era común trabajar con:

- archivos HTML abiertos directamente en el navegador;
- scripts enlazados manualmente con `<script>`;
- CSS enlazado con `<link>`;
- librerías descargadas en archivos locales;
- CDN para librerías externas;
- poca o ninguna herramienta de build.

Este enfoque puede servir para proyectos pequeños, pero se vuelve difícil cuando la aplicación crece.

## 4. Uso de CDNs
Un CDN es una red de distribución que permite cargar archivos externos desde una URL pública.

Se usaba mucho para cargar librerías como Bootstrap:

```html
<link rel="stylesheet" href="...bootstrap...">
<script src="...bootstrap..."></script>
```

Ventajas:

- rápido para empezar;
- no requiere npm;
- útil para prototipos.

Desventajas:

- dependes de enlaces externos;
- menos control sobre versiones;
- no hay build optimizado;
- no organiza la arquitectura de la aplicación.

## 5. Bundlers tradicionales
Un bundler es una herramienta que agrupa y procesa archivos del frontend para producción.

Ejemplos conocidos:

- Webpack;
- Parcel;
- Rollup.

Estas herramientas ayudaban con:

- empaquetar JavaScript;
- procesar CSS;
- optimizar archivos;
- manejar dependencias;
- generar builds.

## 6. Por qué configurar antes podía ser más complejo
Antes muchas configuraciones requerían:

- archivos de configuración extensos;
- loaders;
- plugins;
- configuración manual para CSS;
- configuración manual para assets;
- ajustes para servidor de desarrollo;
- ajustes para producción.

Esto no era necesariamente malo, pero sí hacía el arranque más pesado y más difícil de explicar en un curso introductorio.

## 7. Qué cambia con Vite
Vite simplifica el flujo porque:

- trae servidor de desarrollo listo;
- usa módulos modernos en desarrollo;
- permite importar CSS y librerías instaladas con npm;
- tiene comandos claros;
- genera build con configuración mínima.

Comandos del proyecto:

- `npm run dev`
- `npm run build`
- `npm run preview`

`npm run dev` levanta el servidor de desarrollo, normalmente en `http://localhost:5173/`; `npm run build` genera `dist/`; `npm run preview` sirve el build compilado, normalmente en `http://localhost:4173/`. `preview` se usa para revisar el build y no reemplaza a `dev`.

## 8. Comparación rápida
| Antes de Vite | Con Vite |
|---|---|
| Abrir HTML directo en el navegador | Servidor local con `npm run dev` |
| Scripts manuales | Imports ES Modules |
| Librerías por CDN o archivos descargados | Dependencias instaladas con npm |
| Build manual o inexistente | `npm run build` |
| Preview manual | `npm run preview` |
| Configuración más dispersa | Flujo más unificado |

## 9. Por qué el curso usa Vite
El curso usa Vite porque:

- permite trabajar con JavaScript moderno;
- facilita organizar una SPA vanilla;
- se integra bien con Bootstrap instalado por npm;
- permite preparar un build profesional;
- evita dedicar demasiado tiempo a configuración;
- mantiene el foco en arquitectura, consumo de API, sesión, guards, alojamientos y comodidades.

## 10. Qué NO significa este anexo
Este anexo no significa que:

- se usará Webpack, Parcel o Rollup manualmente en el proyecto principal;
- se deba abandonar Vite;
- el proyecto se hará con CDN como estrategia principal;
- se cambiarán los tutoriales aprobados;
- se agregarán dependencias nuevas.

## 11. Relación con el proyecto actual
En este proyecto:

- Vite se usa desde el Sprint 1;
- Bootstrap y Bootstrap Icons se instalan con npm;
- `index.html` mantiene una entrada única;
- `#app` es el punto de montaje;
- `src/js/main.js` arranca la SPA;
- en Sprint 1, `src/js/main.js` muestra una pantalla base;
- en Sprint 2, `src/js/main.js` mantiene navegación simple para usuarios y autenticación;
- `src/css/main.css` centraliza estilos base;
- `package.json` define scripts y dependencias;
- `package-lock.json` fija el árbol de dependencias;
- `vite.config.js` contiene configuración mínima de Vite;
- `.env.example` documenta `VITE_API_URL`;
- `.env` es local y no debe subirse al repositorio;
- desde Sprint 2, `.env` necesita `VITE_API_URL=http://localhost:5000/api/v1` para consumir backend;
- para validar `npm run preview`, el backend debe permitir por CORS el origen de preview, normalmente `http://localhost:4173/`.

## 12. Cierre
Entender qué había antes de Vite ayuda a valorar por qué el flujo actual es más simple y profesional, pero el proyecto seguirá usando Vite como herramienta principal.


