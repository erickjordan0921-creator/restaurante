# Entrega · Avance funcional (~50 %) de Sinu Control

**Fecha:** 15 de octubre de 2026
**Base de dominio y diseño:** `sinu-control-f.html` (gastrobar, tema claro dorado #C9A24B)
**Arquitectura:** `api.zip` (Flask por dominios) + `frontend-alojamientos.zip` (SPA Vite vanilla)

## 1. Qué se hizo

### Backend (`api/`)

- Se replica la estructura de `api.zip`: app factory, `app/dominios/<dominio>/` con
  `controladores → servicios → repositorios → modelos` y `dtos` en marshmallow, más
  `seguridad.py` (JWT), Flask-Migrate, `scripts/` y `tests/` con pytest.
- **Dominios:** `usuarios`, `inventario` (insumos, lotes, movimientos), `platos` (receta),
  `pedidos` (más mesas), `alertas` y `tablero`.
- **Autenticación:** usuario y contraseña con hash de Werkzeug, JWT de 8 h. Solo hay dos roles
  (`admin`, `mesero`) y se validan contra la base de datos en cada petición (`requiere_rol`).
- **CRUD** de insumos y de platos con receta, con las validaciones de SINU: nombres únicos,
  receta sin insumos repetidos y bloqueo al eliminar un insumo con stock o en una receta.
- **Lotes y FEFO:** al crear un pedido se descuenta primero del lote que vence antes, dentro de
  una sola transacción. Si falta algo, no se descuenta nada.
- **Pedidos:** pasan por `pendiente → en preparación → listo → entregado`. Al cancelar uno
  pendiente se devuelve el stock a sus lotes; si ya estaba en preparación, solo se anula la venta.
- **Mesas:** el estado de las 9 mesas (libre, ocupada o lista) se deriva de sus pedidos, y se
  puede liberar una mesa.
- **Alertas:** agotado, stock bajo, lote vencido, lote por vencer, "usar primero" y plato no
  disponible. Se recalculan en cada consulta y conservan el estado "atendida".
- **Tablero:** ventas del día, pedidos en cocina, alertas, stock bajo, vencimientos a 7 días y
  platos posibles.
- **Seed** (`scripts/seed.py`) con los 10 insumos, 15 lotes y 6 platos de `DatosEjemplo` del
  HTML. Las fechas son relativas a hoy y el script pide confirmación porque borra todo.
- **10 tests** que pasan, incluido el flujo completo de la demo.

### Frontend (`frontend/`)

- Se replica la estructura de `frontend-alojamientos.zip`: `api/*.api.js`, `auth/`, `router/`
  con guards, `pages/` (`XPage` + `mountXPage`), `components/` y `utils/`.
- Se aplica el estilo SINU: paleta, tipografía Georgia + Segoe UI, botones dorados, rojos para
  acciones peligrosas y grises para lo deshabilitado, leyenda de botones y logo original.
- **Pantallas:**
  1. Login con selección rápida de rol.
  2. Mesero: mapa de 9 mesas y panel lateral de pedido con menú y existencias, validación,
     confirmación, cancelación, entrega y liberación de mesa.
  3. Cocina: tickets con cronómetro, prioridad por insumos por vencer y avance de estado. Se
     actualiza cada 10 s.
  4. Administrador: tablero, inventario (alta, edición y eliminación de insumos), lotes en
     orden FEFO con ingreso de lote, y platos con editor de receta.
  5. Alertas con contador en el menú de usuario. El mesero las ve en solo lectura y el
     administrador tiene su centro de alertas.
- Las acciones destructivas (eliminar, cancelar pedido, liberar mesa) piden confirmación.

### Verificación realizada (en el navegador)

Se corrió este flujo: login como Mesero, pedido de 8 Calamares apanados en la mesa 3
($240.000), ticket en cocina con prioridad, avance a "en preparación" y luego a "listo". Como
Administrador se comprobó lo siguiente:

- El Calamar pasó de 4 a 2 kg y quedó en "Stock bajo".
- El Limón se descontó por FEFO del lote L-9 (que vence primero), que pasó de 25 a 17.
- Apareció la alerta "Calamar: quedan 2 kg (mínimo 2)".
- El tablero muestra la venta.

Las capturas están en `docs/capturas/` (01 a 13).

## 2. Qué falta (fuera de este avance)

En la interfaz aparecen como **botón gris deshabilitado / "Próximamente"**:

- Reportes avanzados (más vendidos, consumo por insumo, movimientos)
- Cierre de caja
- Respaldo e importación de datos
- Mermas detalladas, ajustes de lote y baja de lotes vencidos
- Mi perfil y cambio de contraseña
- Umbrales y configuración (en SINU, días de alerta por defecto editables)

También quedan pendientes:

- Gestión de usuarios desde la app (hoy se crean con el seed).
- Refresco de token.
- Despliegue.
- Tests del frontend.

## 3. Decisiones tomadas (la opción más simple ante ambigüedades)

| # | Decisión | Motivo |
|---|---|---|
| 1 | **SQLite como respaldo de MySQL.** Si `DB_USER` está vacío en `.env`, la API usa `api/instance/sinu.db`. | El servidor MySQL local estaba activo, pero no había credenciales disponibles. Con `DB_USER` se usa MySQL igual que en `api.zip`. |
| 2 | Se agregó la dependencia **`cryptography`**. | PyMySQL la necesita para autenticarse en MySQL 8 (`caching_sha2_password`). Es la única dependencia nueva. |
| 3 | Un solo manejador para las excepciones de dominio (`app/errores.py`, cada una con su `codigo_http`), en lugar de un `errorhandler` por excepción. | Hay 6 dominios y se evita repetir decenas de manejadores. El contrato de respuesta no cambia. |
| 4 | Helpers `ok()` y `validar()` en `app/respuestas.py`. | Evitan repetir el bloque `jsonify` y `try/except ValidationError` en cada controlador. |
| 5 | Login por **usuario** (no por correo) y sin registro público. | En SINU solo existen las cuentas `admin` y `mesero`. |
| 6 | La **cocina** es solo para el Administrador; el mesero solo puede pasar un pedido de "listo" a "entregado". | Se respeta la matriz de roles del HTML (el mesero solo tiene "mesas"). |
| 7 | **Cada pedido es la venta** (no hay tabla `ventas`); al cancelarlo, la venta se anula. | Es equivalente a la tabla `ventas` de SINU para lo que pide este avance. |
| 8 | Las alertas **se recalculan al consultarlas** (en el contador y el listado), no con tareas programadas. | Es igual que `App.refrescarAlertas()` en SINU y no necesita un planificador. |
| 9 | Cantidades en `Float` redondeadas a 3 decimales y precios en `Integer` (COP). | Es la misma estrategia `r3()` del HTML. |
| 10 | Panel de mesa y modales propios (CSS de SINU) en vez de offcanvas y modal de Bootstrap. | Se conserva el diseño original y se evita cargar Bootstrap JS dos veces. El dropdown del menú sí es de Bootstrap. |
| 11 | La vista actual se guarda en el `#hash` de la URL. | Al recargar no se pierde la pantalla. El router de referencia volvía siempre al inicio. |
| 12 | Hora local del servidor (sin zona horaria) para pedidos y vencimientos. | SINU usa la fecha local del dispositivo y la API corre en el mismo equipo del gastrobar. |

## 4. Guion de demostración (3 minutos)

**Preparación:** API y frontend corriendo, y `python scripts/seed.py --si` ejecutado justo antes.

| Tiempo | Acción | Qué decir |
|---|---|---|
| 0:00 a 0:20 | Mostrar el árbol `api/` y `frontend/` en VS Code. | "SINU pasó de un HTML con localStorage a una API Flask por dominios y una SPA Vite, con la misma estructura de los proyectos de referencia." |
| 0:20 a 0:40 | Login: tocar la tarjeta **Mesero** y escribir `mesero123`. | "Tenemos login real con JWT y dos roles. El mesero entra directo al mapa de mesas." |
| 0:40 a 1:20 | Mesa 3: agregar **8 Calamares apanados**, **Validar existencias** y **Confirmar**. | "El menú muestra cuántos platos se pueden preparar según el stock. El Filete en salsa de coco aparece bloqueado porque la leche de coco está vencida. Al confirmar, la API descuenta los insumos por FEFO." |
| 1:20 a 1:40 | Menú de usuario → **Alertas** (el contador sube de 12 a 13). | "Las alertas se recalculan en el servidor. El mesero las ve en solo lectura." |
| 1:40 a 2:10 | Cerrar sesión y entrar como **Administrador** (`admin123`). Ir a **Cocina**: Iniciar preparación y luego Marcar listo. | "El ticket va en rojo porque usa limón que vence en 3 días: cocina lo prioriza." |
| 2:10 a 2:40 | **Inventario**: Calamar 2 kg en "Stock bajo". **Lotes**: el L-9 de limón pasó de 25 a 17, el lote que vence primero. | "Esto es FEFO: primero vence, primero sale." |
| 2:40 a 3:00 | **Tablero**: ventas $240.000. Señalar las pestañas grises. | "Reportes, cierre de caja, mermas y respaldo quedan para la segunda mitad y ya están señalizados como Próximamente." |
