# Tutorial — Sprint 1: Base SPA con Vite, Bootstrap y estructura real del frontend

## 1. Objetivo
Construir la base inicial de la SPA vanilla con Vite, Bootstrap 5.3 y Bootstrap Icons, dejando lista la estructura real del frontend para que los siguientes tutoriales agreguen sesión, router, guards, páginas y consumo de API sin reescribir la base.

## 2. Alcance de este sprint
En este sprint solo se deja la pantalla base y la estructura técnica del proyecto. No se implementa todavía:

- router;
- login;
- registro;
- sesión;
- consumo de API;
- alojamientos;
- comodidades;
- guards;
- navegación entre páginas reales.

La regla es simple: este tutorial prepara el terreno; los siguientes tutoriales construirán la funcionalidad encima de esta base.

## 3. Qué se instala
Debes dejar instalado únicamente lo necesario para una SPA vanilla:

- Vite como herramienta de desarrollo y build;
- Bootstrap 5.3;
- Bootstrap Icons.

No instales React, Vue, Angular, Svelte ni ningún otro framework adicional.

## 4. Archivos que se crean o ajustan
Al terminar este sprint, estos archivos deben existir y quedar alineados con el frontend real:

- `package.json`;
- `package-lock.json`;
- `index.html`;
- `vite.config.js`;
- `.env.example`;
- `src/js/main.js`;
- `src/css/main.css`.

Estructura base esperada:

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
        └── main.js
```

En el frontend final real, `src/js` seguirá creciendo con carpetas como `api/`, `auth/`, `components/`, `pages/`, `router/` y `utils/`. Este tutorial no las implementa todavía, pero conviene saber desde ahora que la base está pensada para crecer en esa dirección.

## 5. Qué genera Vite y qué se reemplaza
Si arrancas desde el template vanilla de Vite, es normal que aparezcan archivos iniciales como:

- `src/main.js`;
- `src/style.css`;
- archivos de ejemplo o assets como `counter.js` o `vite.svg`, si el template los creó.

En este proyecto no se trabaja con esa estructura plana. La estructura real del frontend usa:

- `src/js/main.js`;
- `src/css/main.css`.

Por eso, cualquier archivo generado por Vite que no encaje con esa estructura debe eliminarse o reemplazarse antes de seguir.

## 6. Paso a paso

### Paso 1: entrar a la carpeta del proyecto
Si la carpeta no existe, créala. Si ya existe, entra en ella.

```bash
mkdir frontend-alojamientos
cd frontend-alojamientos
```

Si el proyecto ya está creado, simplemente ubícate dentro de su raíz.

### Paso 2: inicializar Vite en modo vanilla
Crea la base del proyecto con Vite usando la plantilla Vanilla JavaScript:

```bash
npm create vite@latest . -- --template vanilla
```

Cuando se complete, verifica que el proyecto se haya creado en la carpeta actual y no en una carpeta nueva anidada.

### Paso 3: instalar las dependencias base
Instala primero las dependencias del proyecto y luego Bootstrap y Bootstrap Icons:

```bash
npm install
npm install bootstrap@5.3 bootstrap-icons
```

`npm install` crea `package-lock.json`, que debe quedar versionado para fijar el árbol de dependencias del frontend.

### Paso 4: limpiar la plantilla de Vite y preparar la estructura real
Si Vite generó archivos de ejemplo, reemplázalos por la estructura real del proyecto.

Haz estos ajustes concretos:

- elimina `src/main.js` si existe;
- elimina `src/style.css` si existe;
- elimina cualquier archivo de ejemplo que Vite haya creado y que no se vaya a usar;
- crea la carpeta `src/js`;
- crea la carpeta `src/css`;
- crea `src/js/main.js`;
- crea `src/css/main.css`.

No dejes la estructura plana del template, porque el frontend final trabaja con una separación clara entre JavaScript y CSS.

### Paso 5: ajustar `package.json`
Reemplaza el contenido de `package.json` por esta versión completa para este Sprint 1:

```json
{
  "name": "frontend-alojamientos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.0.14"
  },
  "dependencies": {
    "bootstrap": "5.3",
    "bootstrap-icons": "^1.13.1"
  }
}
```

Después de reemplazar `package.json`, vuelve a ejecutar `npm install` para sincronizar `package-lock.json` y `node_modules` con las dependencias finales del Sprint 1.

Lo importante es esto:

- `dev` levanta el servidor de desarrollo;
- `build` genera la versión de producción;
- `preview` sirve para revisar el build;
- no debe haber dependencias de React, Vue, Angular ni similares.

### Paso 6: preparar `index.html`
`index.html` es la única entrada HTML de la SPA. Debe ser limpio y apuntar al archivo real de arranque JavaScript.

Usa una base como esta:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alojamientos</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/js/main.js"></script>
  </body>
</html>
```

Puntos clave:

- el contenedor principal debe ser `#app`;
- el script debe apuntar a `/src/js/main.js`;
- no pongas todavía router ni vistas adicionales aquí.

### Paso 7: crear `src/js/main.js`
Este archivo es temporal en el Tutorial 1. Su trabajo es dejar una sola pantalla base y comprobar que Bootstrap y la estructura del frontend funcionan.

Un arranque mínimo válido puede ser este:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

const app = document.querySelector('#app');

if (app) {
  app.innerHTML = `
    <main class="welcome-shell">
      <section class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <div class="card border-0 shadow-sm welcome-card">
              <div class="card-body p-4 p-md-5 text-center">
                <i class="bi bi-house-heart fs-1 text-primary mb-3"></i>
                <h1 class="h3 mb-3">Frontend de alojamientos listo</h1>
                <p class="text-muted mb-0">
                  Esta es la pantalla base temporal del Tutorial 1.
                  En los siguientes tutoriales se reemplazará por navegación, sesión y páginas reales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}
```

Este archivo no debe presentar la app final todavía. Más adelante se reemplazará o evolucionará con router, navbar, guards, sesión y páginas reales.

### Paso 8: crear `src/css/main.css`
La base visual del frontend real debe quedar ligera, limpia y consistente con la app final.

Usa una base como esta:

```css
:root {
  color-scheme: light;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f5f7fb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f2937;
}

#app {
  min-height: 100vh;
}

.welcome-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.welcome-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}
```

Lo importante de esta base es:

- `:root { color-scheme: light; }` para dejar el modo claro como referencia;
- `body` sin margen;
- `body` con `min-height: 100vh`;
- fondo suave similar al frontend final;
- tipografía `system-ui`;
- `#app` ocupando toda la altura disponible.

### Paso 9: crear `.env.example`
Prepara el archivo `.env.example` con la URL base del backend:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Esta variable quedará lista para usarla después en autenticación, alojamientos y comodidades, pero en este tutorial todavía no se consume.

Si necesitas desarrollo local, puedes copiar ese archivo a `.env` con:

```bash
cp .env.example .env
```

Recuerda que `.env` no debe subirse al repositorio.

### Paso 10: revisar `vite.config.js`
Si la plantilla de Vite no creó `vite.config.js`, créalo manualmente en la raíz del proyecto con este contenido. Para este sprint no necesitas configuración especial:

```js
import { defineConfig } from 'vite';

export default defineConfig({});
```

No agregues alias, plugins ni configuraciones extra todavía. Eso no hace falta para la base inicial.

### Paso 11: verificar que todo arranca
Prueba primero el servidor de desarrollo:

```bash
npm run dev
```

Abre la URL que muestra Vite en la terminal, normalmente `http://localhost:5173/`, y verifica que se vea la pantalla base con el texto `Frontend de alojamientos listo`.

Después genera el build de producción:

```bash
npm run build
```

Ese comando debe crear `dist/`.

Por último, revisa el build generado:

```bash
npm run preview
```

Abre la URL que muestra Vite en la terminal, normalmente `http://localhost:4173/`, y verifica que el build compilado muestre la misma pantalla base.

`preview` debe ejecutarse después de `build`, porque su objetivo es servir la versión ya compilada.

## 7. Cómo validar que quedó bien
En este sprint no hay pruebas automatizadas. La validación consiste en levantar la app, revisar la pantalla base en el navegador, generar el build y revisar el preview.

Antes de cerrar el tutorial, confirma esta lista:

- `package.json` solo usa Vite, Bootstrap y Bootstrap Icons;
- no hay React, Vue, Angular ni otro framework adicional;
- `index.html` apunta a `/src/js/main.js`;
- existe `src/js/main.js`;
- existe `src/css/main.css`;
- existe `.env.example`;
- `VITE_API_URL` está definido en `.env.example`;
- `npm run dev` funciona;
- `npm run build` funciona;
- `npm run preview` funciona.

## 8. Errores comunes
Los errores más frecuentes en este tutorial son:

- dejar el script de `index.html` apuntando a `src/main.js` en vez de `/src/js/main.js`;
- conservar `src/style.css` y olvidar `src/css/main.css`;
- instalar un framework que no corresponde;
- olvidar ejecutar `npm install` antes de `npm run dev`;
- confundir `.env.example` con `.env`;
- subir `.env` al repositorio en vez de dejar solo `.env.example`;
- intentar conectar el backend en este tutorial;
- agregar router, login o páginas reales demasiado pronto.

## 9. Guardar los cambios en Git
Antes de crear el commit, revisa `git status` para confirmar qué archivos se van a guardar.

```bash
git init
git status
git add .
git commit -m "Sprint 1: base SPA con Vite y Bootstrap"
git branch -M main
git remote add origin https://github.com/meet8polisura/frontend-alojamientos.git
git push -u origin main
```

No subas `.env`. Solo debe quedar versionado `.env.example`.

## 10. Resultado esperado
Al terminar este Sprint 1 tendrás:

- una SPA vanilla levantada con Vite;
- Bootstrap 5.3 instalado;
- Bootstrap Icons instalado;
- una sola entrada HTML limpia;
- una pantalla base temporal;
- una estructura real de `src/js` y `src/css`;
- `VITE_API_URL` preparada para los siguientes tutoriales;
- una base que coincide con el frontend real y que seguirá creciendo en los sprints siguientes.
