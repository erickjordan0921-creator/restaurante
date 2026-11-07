# Sinu Control · Gastrobar (API + Frontend)

Reconstrucción de `sinu-control-f.html` (un solo archivo con localStorage) como proyecto
con **API REST** y **SPA** separadas, siguiendo la arquitectura de `api.zip` y
`frontend-alojamientos.zip`.

```
proyecto-sinu/
├── api/          Flask 3.1 + SQLAlchemy + Flask-Migrate + JWT (convenciones de api.zip)
├── frontend/     Vite 8 + JS vanilla + Bootstrap 5.3 (convenciones de frontend-alojamientos.zip)
├── docs/         README.md, ENTREGA.md y capturas/
└── _referencia/  zips originales descomprimidos + HTML base (no se edita)
```

## Requisitos

- Python 3.11 o superior (probado con 3.13)
- Node.js 20 o superior (probado con 24)
- MySQL 8 (opcional: si no se configura, la API usa SQLite en `api/instance/sinu.db`)

## Arranque rápido (Windows · PowerShell)

### 1. API (puerto 5000)

```powershell
cd proyecto-sinu\api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env          # luego complete SECRET_KEY (python scripts/generate_secret.py)
flask db upgrade                # crea las tablas
python scripts/seed.py          # datos de ejemplo (pide escribir SI: borra todo)
python app.py
```

Comprobación: <http://localhost:5000/health> → `{"status": "ok", "service": "sinu-api"}`

### 2. Frontend (puerto 5173)

```powershell
cd proyecto-sinu\frontend
npm install
copy .env.example .env          # VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

Abrir <http://localhost:5173>

### Usuarios de prueba (los mismos del HTML original)

| Rol | Usuario | Contraseña | Entra a |
|---|---|---|---|
| Administrador | `admin` | `admin123` | Tablero, mesas, cocina, platos, inventario, lotes, alertas |
| Mesero | `mesero` | `mesero123` | Mapa de mesas + alertas en solo lectura |

## Usar MySQL en lugar de SQLite

1. En `api/.env` complete `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` y `DB_NAME=sinu_db`.
2. `python scripts/create_db.py` (crea la base si no existe).
3. `flask db upgrade` y `python scripts/seed.py`.

## Pruebas

```powershell
cd proyecto-sinu\api
.\venv\Scripts\python -m pytest -q
```

Los 10 tests usan SQLite en memoria con los datos de ejemplo. Cubren login y roles, FEFO,
la cancelación con devolución de stock, el flujo pendiente → listo → entregado, las
alertas, el tablero y la liberación de la mesa.

## Endpoints (`/api/v1`)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/usuarios/login` | público | Usuario + contraseña → JWT y rol |
| GET | `/usuarios/yo` | ambos | Usuario autenticado |
| GET / POST | `/insumos` | admin | Existencias por insumo / alta |
| PUT / DELETE | `/insumos/<id>` | admin | Editar / eliminar (bloqueado si tiene stock o está en una receta) |
| GET / POST | `/lotes` | admin | Lotes en orden FEFO (`?todos=1`) / ingreso de lote |
| GET | `/platos` | ambos | Menú con platos posibles según stock |
| POST | `/platos` | admin | Crear plato con receta |
| GET / PUT / DELETE | `/platos/<id>` | admin | Detalle / editar / eliminar |
| POST | `/pedidos/validar` | ambos | Validar existencias sin descontar |
| POST | `/pedidos` | ambos | Crear pedido (descuenta insumos por FEFO) |
| GET | `/pedidos/cocina` | admin | Cola de cocina con prioridad por vencimiento |
| PATCH | `/pedidos/<id>/avanzar` | admin (mesero solo listo → entregado) | Siguiente estado |
| PATCH | `/pedidos/<id>/cancelar` | ambos | Cancela; devuelve stock si estaba pendiente |
| GET | `/mesas` | ambos | Estado de las 9 mesas |
| POST | `/mesas/<n>/liberar` | ambos | Cierra los pedidos entregados de la mesa |
| GET | `/alertas?estado=activa\|atendida\|todas` | ambos | Alertas recalculadas |
| GET | `/alertas/contador` | ambos | Número de alertas activas (badge del menú) |
| PATCH | `/alertas/<id>/atender` · `/reactivar` | admin | Cambiar estado |
| GET | `/tablero/resumen` | admin | Ventas del día, stock bajo, por vencer, platos posibles |

Las respuestas siguen el contrato de la API de referencia:
`{ "success": true, "message": "...", "data": ... }` y, en error,
`{ "success": false, "error": { "message": "...", "details": {...} } }`.
