# Guia de Validacion Manual del Backend

> Prueba paso a paso de todos los endpoints de Alojamientos API usando Postman, Insomnia, cURL o cualquier cliente HTTP.

---

## Objetivo

Verificar que el backend funciona correctamente en un entorno real con MySQL. Esta guia te permite probar cada funcionalidad manualmente, sin depender de los tests automatizados.

**Duracion estimada:** 30-45 minutos

**Herramientas recomendadas:** Postman, Insomnia, Thunder Client (VS Code) o cURL.

---

## 1. Preparacion del Entorno

### 1.1 Verificar que MySQL esta corriendo

Abre una terminal y ejecuta:

```cmd
net start | findstr /I mysql
```

Debes ver algo como `MySQL80` o `MySQL84` en la lista. Si no aparece, inicia el servicio MySQL desde el administrador de servicios o XAMPP.

### 1.2 Activar el entorno virtual

```cmd
cd c:\Users\LENOVO\Documents\misapp\proyecto\alojamientos
venv\Scripts\activate
```

### 1.3 Instalar dependencias

```cmd
pip install -r requirements.txt
```

### 1.4 Configurar `.env`

Asegurate de que el archivo `.env` en la raiz del proyecto tiene estas variables (ajusta usuario/contrasena segun tu instalacion):

```ini
SECRET_KEY=tu-clave-secreta-aqui
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alojamientos_db
DB_CHARSET=utf8mb4
JWT_EXP_MINUTES=15
CORS_ALLOWED_ORIGINS=
```

> **Nota:** Si no tienes `SECRET_KEY`, generala con `python scripts/generate_secret.py`.

### 1.5 Crear la base de datos

```cmd
python scripts/create_db.py
```

Resultado esperado: `Base de datos 'alojamientos_db' creada (o ya existia).`

### 1.6 Aplicar migraciones

```cmd
set FLASK_APP=app:crear_app
python -m flask db upgrade
```

Resultado esperado: 3 migraciones aplicadas exitosamente (usuarios/perfiles, alojamientos, comodidades).

---

## 2. Iniciar el Servidor

```cmd
python app.py
```

El servidor arranca en `http://localhost:5000`. **No cierres esta terminal** mientras realizas las pruebas.

---

## 3. Flujo de Pruebas Manuales

Abre **Postman** (o tu cliente HTTP preferido) y sigue estos pasos en orden.

### 3.1 Health Check

Verifica que el servidor esta respondiendo correctamente.

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/health` |

**Esperado:** `200 OK`

```json
{
  "status": "ok",
  "service": "alojamientos-api",
  "version": "v1"
}
```

---

### 3.2 Registro de Usuarios

Registra dos usuarios: uno normal y uno que luego haras admin.

#### Usuario Normal

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/usuarios/registro` |
| **Headers** | `Content-Type: application/json` |

**Body:**
```json
{
  "correo": "normal@test.com",
  "contrasena": "123456"
}
```

**Esperado:** `201 Created`

#### Usuario Admin

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/usuarios/registro` |

**Body:**
```json
{
  "correo": "admin@test.com",
  "contrasena": "123456"
}
```

**Esperado:** `201 Created`

#### Pruebas de Validacion (Opcionales)

| Prueba | Body | Esperado |
|--------|------|----------|
| Email duplicado | `"correo": "normal@test.com"` | `400 Bad Request` |
| Contrasena corta | `"contrasena": "123"` | `400 Bad Request` |
| Email invalido | `"correo": "no-es-email"` | `400 Bad Request` |

---

### 3.3 Login y Obtener Tokens

Haz login con ambos usuarios y guarda los `access_token` que recibes. Los necesitaras para las pruebas siguientes.

#### Login Usuario Normal

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/usuarios/login` |

**Body:**
```json
{
  "correo": "normal@test.com",
  "contrasena": "123456"
}
```

**Esperado:** `200 OK`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "correo": "normal@test.com",
      "rol": "usuario"
    }
  }
}
```

> **Copia el `access_token`.** Lo llamaremos `TOKEN_NORMAL`.

#### Login Admin

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/usuarios/login` |

**Body:**
```json
{
  "correo": "admin@test.com",
  "contrasena": "123456"
}
```

**Esperado:** `200 OK`

> **Copia el `access_token`.** Lo llamaremos `TOKEN_ADMIN`.

#### Login con Contrasena Incorrecta

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/usuarios/login` |

**Body:**
```json
{
  "correo": "normal@test.com",
  "contrasena": "contrasena-incorrecta"
}
```

**Esperado:** `401 Unauthorized`

---

### 3.4 Promover a Admin

En **otra terminal** (con el entorno virtual activado), ejecuta:

```cmd
python scripts/promover_admin.py admin@test.com
```

**Resultado esperado:**
```
Exito: el usuario 'admin@test.com' ahora tiene rol de administrador.
```

> **Opcional:** Vuelve a hacer login con el admin y verifica que en la respuesta `usuario.rol` sea `"admin"`.

---

### 3.5 Perfil de Usuario

#### Sin Token

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/usuarios/perfil` |

**Esperado:** `401 Unauthorized`

#### Con Token Normal

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/usuarios/perfil` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Esperado:** `200 OK` con perfil (campos `nombre`, `apellido`, `telefono` en `null`).

#### Actualizar Perfil

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/usuarios/perfil` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "telefono": "555-1234"
}
```

**Esperado:** `200 OK` con datos actualizados.

#### Verificar Cambios

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/usuarios/perfil` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Esperado:** `200 OK` con `nombre: "Juan"`, `apellido: "Perez"`, `telefono: "555-1234"`.

---

### 3.6 Autorizacion por Roles (Admin)

#### Sin Token

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/admin/usuarios` |

**Esperado:** `401 Unauthorized`

#### Con Token Normal (403)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/admin/usuarios` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Esperado:** `403 Forbidden`

```json
{
  "success": false,
  "error": {
    "message": "Permiso denegado. Se requiere rol de administrador."
  }
}
```

#### Con Token Admin

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/admin/usuarios` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Esperado:** `200 OK` con lista de usuarios (sin contrasenas).

---

### 3.7 Alojamientos (CRUD)

#### Crear sin Token

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/alojamientos` |

**Body (cualquiera):**
```json
{
  "titulo": "X",
  "descripcion": "X",
  "precio_noche": 50,
  "ciudad": "X"
}
```

**Esperado:** `401 Unauthorized`

#### Crear Alojamiento (Usuario Normal)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/alojamientos` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "titulo": "Cabanita Andina",
  "descripcion": "Hermosa cabana con vista al volcan",
  "precio_noche": 85.50,
  "ciudad": "Quito"
}
```

**Esperado:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Cabanita Andina",
    "descripcion": "Hermosa cabana con vista al volcan",
    "precio_noche": 85.5,
    "ciudad": "Quito",
    "usuario_id": 1,
    "comodidades": []
  }
}
```

> **Guarda el `id` del alojamiento** (ej. `1`). Lo necesitaras para las siguientes pruebas.

#### Listar Alojamientos (Publico)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/alojamientos` |

**Esperado:** `200 OK` con lista de alojamientos.

#### Detalle de Alojamiento (Publico)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/1` |

**Esperado:** `200 OK` con detalle completo del alojamiento.

#### Detalle Inexistente

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/99999` |

**Esperado:** `404 Not Found`

#### Actualizar Alojamiento Propio

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/1` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "titulo": "Cabanita Editada",
  "precio_noche": 95.00
}
```

**Esperado:** `200 OK` con datos actualizados.

#### Eliminar Alojamiento Propio

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `DELETE` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/1` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Esperado:** `204 No Content`

#### Verificar Eliminacion

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/1` |

**Esperado:** `404 Not Found`

#### Admin Actualiza Alojamiento Ajeno

*(Crea primero un alojamiento con el usuario normal para que el admin lo pueda editar).*

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id}` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Body:**
```json
{
  "titulo": "Editado por Admin"
}
```

**Esperado:** `200 OK`

#### Admin Elimina Alojamiento Ajeno

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `DELETE` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id}` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Esperado:** `204 No Content`

---

### 3.8 Comodidades

#### Crear con Usuario Normal (403)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "nombre": "Wifi"
}
```

**Esperado:** `403 Forbidden`

#### Crear con Admin

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Body:**
```json
{
  "nombre": "Wifi"
}
```

**Esperado:** `201 Created`

> **Guarda el `id` de la comodidad** (ej. `1`).

#### Comodidad Duplicada

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Body:**
```json
{
  "nombre": "Wifi"
}
```

**Esperado:** `400 Bad Request`

#### Crear Segunda Comodidad

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `POST` |
| **URL** | `http://localhost:5000/api/v1/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_ADMIN}` |

**Body:**
```json
{
  "nombre": "Piscina"
}
```

**Esperado:** `201 Created`

> **Guarda el `id`** (ej. `2`).

#### Listar Comodidades

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/comodidades` |

**Esperado:** `200 OK` con lista de comodidades.

#### Detalle de Comodidad

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/comodidades/1` |

**Esperado:** `200 OK` con detalle de la comodidad.

---

### 3.9 Relacion N:M (Alojamientos ↔ Comodidades)

#### 1. Crear Alojamiento para Prueba

Crea un nuevo alojamiento con el usuario normal (si no tienes uno disponible).

```
POST /api/v1/alojamientos
Headers: Authorization: Bearer {TOKEN_NORMAL}
Body: {"titulo":"Casa Playa","descripcion":"Frente al mar","precio_noche":120,"ciudad":"Cartagena"}
```

> **Guarda el `id`** del nuevo alojamiento.

#### 2. Asignar Comodidades

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id_alojamiento}/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "comodidades_ids": [1, 2]
}
```

**Esperado:** `200 OK` con alojamiento actualizado incluyendo `comodidades`.

```json
{
  "data": {
    "id": 3,
    "titulo": "Casa Playa",
    "comodidades": [
      {"id": 1, "nombre": "Wifi"},
      {"id": 2, "nombre": "Piscina"}
    ]
  }
}
```

#### 3. Verificar en el Detalle

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `GET` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id_alojamiento}` |

**Esperado:** El array `comodidades` debe contener Wifi y Piscina.

#### 4. Asignar ID Inexistente (400)

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id_alojamiento}/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "comodidades_ids": [99999]
}
```

**Esperado:** `400 Bad Request`

#### 5. Vaciar Comodidades

| Configuracion | Valor |
|---------------|-------|
| **Metodo** | `PATCH` |
| **URL** | `http://localhost:5000/api/v1/alojamientos/{id_alojamiento}/comodidades` |
| **Headers** | `Authorization: Bearer {TOKEN_NORMAL}` |

**Body:**
```json
{
  "comodidades_ids": []
}
```

**Esperado:** `200 OK` con `comodidades: []`.

---

## 4. Verificacion en Base de Datos

Abre **MySQL Workbench**, **DBeaver**, **phpMyAdmin** o la terminal de MySQL y ejecuta:

```sql
USE alojamientos_db;

-- Ver usuarios
SELECT id, correo, rol FROM usuarios;

-- Ver perfiles
SELECT id, nombre, apellido, telefono FROM perfiles;

-- Ver alojamientos
SELECT id, titulo, precio_noche, ciudad FROM alojamientos;

-- Ver comodidades
SELECT * FROM comodidades;

-- Ver tabla intermedia (relacion N:M)
SELECT * FROM alojamiento_comodidad;
```

Debes ver todos los registros creados desde la API reflejados en las tablas.

---

## 5. Tabla Resumen de Endpoints

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `GET` | `/health` | Publica | Estado del servicio |
| `POST` | `/api/v1/usuarios/registro` | Publica | Registrar usuario |
| `POST` | `/api/v1/usuarios/login` | Publica | Obtener token JWT |
| `GET` | `/api/v1/usuarios/perfil` | Token | Ver perfil |
| `PATCH` | `/api/v1/usuarios/perfil` | Token | Actualizar perfil |
| `GET` | `/api/v1/admin/usuarios` | Admin | Listar usuarios |
| `POST` | `/api/v1/alojamientos` | Token | Crear alojamiento |
| `GET` | `/api/v1/alojamientos` | Publica | Listar alojamientos |
| `GET` | `/api/v1/alojamientos/<id>` | Publica | Detalle alojamiento |
| `PATCH` | `/api/v1/alojamientos/<id>` | Token (dueno/admin) | Actualizar |
| `DELETE` | `/api/v1/alojamientos/<id>` | Token (dueno/admin) | Eliminar |
| `POST` | `/api/v1/comodidades` | Admin | Crear comodidad |
| `GET` | `/api/v1/comodidades` | Publica | Listar comodidades |
| `GET` | `/api/v1/comodidades/<id>` | Publica | Detalle comodidad |
| `PATCH` | `/api/v1/alojamientos/<id>/comodidades` | Token (dueno/admin) | Asignar comodidades |

---

## 6. Limpieza

Cuando termines de probar:

1. **Deten el servidor** con `Ctrl + C` en la terminal donde corre `app.py`.
2. **Cierra tu cliente HTTP** (Postman, Insomnia, etc.).

Si quieres reiniciar desde cero en el futuro:

```sql
DROP DATABASE alojamientos_db;
```

Luego vuelve a ejecutar:
```cmd
python scripts/create_db.py
python -m flask db upgrade
```

---

## 7. Preguntas Frecuentes

### ¿Por que el perfil tiene campos `NULL`?
Al registrar un usuario, el sistema crea un perfil vacio. Los campos `nombre`, `apellido` y `telefono` solo se llenan cuando el usuario actualiza su perfil via `PATCH /api/v1/usuarios/perfil`.

### ¿Por que `alojamiento_comodidad` esta vacia?
La tabla intermedia solo tiene registros cuando se asignan comodidades a un alojamiento via `PATCH /alojamientos/<id>/comodidades`. Si envias `{"comodidades_ids": []}`, se vacia.

### ¿Puedo probar sin MySQL?
Los tests automatizados (`pytest`) usan SQLite en memoria y no requieren MySQL. Pero esta guia de validacion manual requiere MySQL corriendo localmente.

### ¿Que pasa si me equivoco en un paso?
No te preocupes. Puedes continuar desde el siguiente paso. Cada request es independiente. Si necesitas reiniciar, elimina la BD y vuelve a aplicar las migraciones.
