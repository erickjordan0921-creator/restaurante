# Contrato backend frontend

Este documento define cómo debe hablar la SPA vanilla del frontend con el backend real de alojamientos. El objetivo es que el estudiante entienda qué enviar, qué recibe y cómo manejar permisos sin inventar rutas ni flujos que el servidor no expone.

## 1. Base URL y entorno

La base URL local sugerida es:

```text
http://localhost:5000/api/v1
```

La variable de entorno esperada en el frontend es:

```text
VITE_API_URL
```

Ejemplo en desarrollo:

```text
VITE_API_URL=http://localhost:5000/api/v1
```

El frontend debe construir sus peticiones desde esa variable para no depender de valores fijos dentro del código.

## 2. Regla principal del contrato

El backend responde en JSON y el frontend debe tratar las respuestas de forma uniforme:

- leer el estado HTTP;
- convertir la respuesta a objeto JavaScript cuando exista cuerpo;
- mostrar mensajes claros;
- centralizar el acceso a la API en un cliente único.

Si el backend usa nombres de campos concretos, el frontend debe respetarlos tal como llegan.

## 3. Formato general de respuesta exitosa

La forma general de una respuesta correcta es:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {}
}
```

Cuando el recurso es una lista, `data` debe ser un arreglo.

## 4. Formato general de respuesta de error

El backend usa este formato general para errores:

```json
{
  "success": false,
  "error": {
    "message": "...",
    "details": {}
  }
}
```

Puntos importantes para el frontend:

- `error.message` es el mensaje principal que debe mostrar la UI.
- `error.details` suele usarse en errores de validación para explicar campos concretos.
- En errores simples, `details` puede venir vacío o no ser necesario para la vista.

## 5. Status codes esperados

| Status | Significado | Uso esperado en este backend |
| --- | --- | --- |
| `200 OK` | Petición correcta | Listados, detalle, login, perfil, edición y asignación de comodidades |
| `201 Created` | Recurso creado | Registro, creación de alojamiento y creación de comodidad |
| `204 No Content` | Éxito sin cuerpo | Eliminación de alojamiento |
| `400 Bad Request` | Datos inválidos | Validaciones de DTO, formatos incorrectos, IDs inválidos de comodidades |
| `401 Unauthorized` | Falta autenticación o token inválido | Token ausente, expirado, inválido o credenciales incorrectas en login |
| `403 Forbidden` | Usuario autenticado sin permiso | Acciones de admin o de propietario cuando el usuario no tiene acceso |
| `404 Not Found` | Recurso no encontrado | Perfil, alojamiento o comodidad inexistente, o ruta inválida |
| `500 Internal Server Error` | Error inesperado | Fallos no controlados del servidor |

## 6. Autorización con JWT

Cuando una ruta requiera autenticación, el frontend debe enviar:

```http
Authorization: Bearer <token>
```

Reglas prácticas:

- el token se obtiene al hacer login;
- el cliente HTTP centralizado lo agrega automáticamente;
- no se debe copiar el token a mano en cada vista;
- en `DELETE /alojamientos/:id` el frontend debe manejar `204` sin intentar leer JSON.

## 7. Diferencia entre 401 y 403

| Código | Significado | Interpretación frontend |
| --- | --- | --- |
| `401` | No autenticado o token inválido | Pedir login de nuevo, limpiar sesión si corresponde |
| `403` | Autenticado pero sin permiso | Mantener la sesión, pero bloquear la acción o ruta |

También conviene recordar que el login con credenciales inválidas responde `401`.

## 8. Permisos por tipo de endpoint

### 8.1 Públicos

Se pueden consultar sin iniciar sesión:

- `POST /usuarios/registro`
- `POST /usuarios/login`
- `GET /alojamientos`
- `GET /alojamientos/:id`
- `GET /comodidades`
- `GET /comodidades/:id`

### 8.2 Requieren token

Se necesita JWT válido:

- `GET /usuarios/perfil`
- `PATCH /usuarios/perfil`
- `POST /alojamientos`
- `PATCH /alojamientos/:id`
- `DELETE /alojamientos/:id`
- `PATCH /alojamientos/:id/comodidades`

### 8.3 Requieren propietario o admin

El usuario debe ser el propietario del alojamiento o tener rol admin:

- `PATCH /alojamientos/:id`
- `DELETE /alojamientos/:id`
- `PATCH /alojamientos/:id/comodidades`

El frontend puede usar `usuario_id` para decidir si muestra botones como Editar o Eliminar, pero la validación real de propietario o administrador siempre la hace el backend.

Importante: estas rutas requieren token y además una verificación de propiedad o rol.

### 8.4 Requieren rol admin

Además del token, el usuario debe tener rol admin:

- `GET /admin/usuarios`
- `POST /comodidades`

### 8.5 Alojamiento creado por usuario autenticado

`POST /alojamientos` requiere token, pero no rol admin.

El backend toma el `usuario_id` desde el JWT y no desde el payload.

## 9. Endpoints reales disponibles

### 9.1 Usuarios

| Método | Ruta | Acceso | Uso esperado |
| --- | --- | --- | --- |
| `POST` | `/usuarios/registro` | Público | Crear una cuenta nueva |
| `POST` | `/usuarios/login` | Público | Iniciar sesión y recibir JWT |
| `GET` | `/usuarios/perfil` | Token requerido | Obtener el perfil del usuario autenticado |
| `PATCH` | `/usuarios/perfil` | Token requerido | Actualizar datos del perfil |
| `GET` | `/admin/usuarios` | Token + rol admin | Listar usuarios para administración |

### 9.2 Alojamientos

| Método | Ruta | Acceso | Uso esperado |
| --- | --- | --- | --- |
| `GET` | `/alojamientos` | Público | Listar alojamientos |
| `GET` | `/alojamientos/:id` | Público | Ver detalle de un alojamiento |
| `POST` | `/alojamientos` | Token requerido | Crear alojamiento para el usuario autenticado |
| `PATCH` | `/alojamientos/:id` | Token + propietario o admin | Editar alojamiento |
| `DELETE` | `/alojamientos/:id` | Token + propietario o admin | Eliminar alojamiento |
| `PATCH` | `/alojamientos/:id/comodidades` | Token + propietario o admin | Reemplazar comodidades del alojamiento |

### 9.3 Comodidades

| Método | Ruta | Acceso | Uso esperado |
| --- | --- | --- | --- |
| `GET` | `/comodidades` | Público | Listar comodidades |
| `GET` | `/comodidades/:id` | Público | Ver detalle de una comodidad |
| `POST` | `/comodidades` | Token + rol admin | Crear comodidad |

## 10. Payloads reales de ejemplo

### 10.1 `POST /usuarios/registro`

El registro solo requiere correo y contrasena.

```json
{
  "correo": "ana@example.com",
  "contrasena": "Secreta123"
}
```

Nota: el campo se llama `contrasena` sin ñ porque así está definido en el contrato JSON del backend.

Respuesta exitosa `201 Created`:

```json
{
  "success": true,
  "message": "Usuario creado con éxito.",
  "data": {
    "id": 7,
    "correo": "ana@example.com"
  }
}
```

### 10.2 `POST /usuarios/login`

El login usa los mismos campos base:

```json
{
  "correo": "ana@example.com",
  "contrasena": "Secreta123"
}
```

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 7,
      "correo": "ana@example.com",
      "fecha_creacion": "2026-05-26T10:15:00",
      "rol": "usuario"
    }
  }
}
```

### 10.3 `GET /usuarios/perfil`

Este endpoint requiere token y devuelve el perfil del usuario autenticado.

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Perfil obtenido.",
  "data": {
    "id": 4,
    "nombre": "Ana",
    "apellido": "Pérez",
    "telefono": "3001234567",
    "usuario_id": 7
  }
}
```

### 10.4 `PATCH /usuarios/perfil`

La actualización del perfil es parcial. Se puede enviar uno o varios campos:

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "telefono": "3001234567"
}
```

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Perfil actualizado.",
  "data": {
    "id": 4,
    "nombre": "Ana",
    "apellido": "Pérez",
    "telefono": "3001234567",
    "usuario_id": 7
  }
}
```

### 10.5 `GET /alojamientos`

Este endpoint es público y `data` siempre debe interpretarse como un arreglo. Si no hay resultados, el arreglo puede venir vacío.

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Lista de alojamientos.",
  "data": [
    {
      "id": 12,
      "titulo": "Apartamento central",
      "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
      "precio_noche": 120000.0,
      "ciudad": "Medellín",
      "usuario_id": 7,
      "fecha_creacion": "2026-05-26T11:40:00",
      "comodidades": []
    },
    {
      "id": 13,
      "titulo": "Casa familiar",
      "descripcion": "Casa amplia para estadías largas.",
      "precio_noche": 180000.0,
      "ciudad": "Bogotá",
      "usuario_id": 8,
      "fecha_creacion": "2026-05-26T12:05:00",
      "comodidades": [
        {
          "id": 1,
          "nombre": "Wifi"
        },
        {
          "id": 3,
          "nombre": "Parqueadero"
        }
      ]
    }
  ]
}
```

### 10.6 `GET /alojamientos/:id`

Este endpoint devuelve un solo alojamiento con sus comodidades.

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Detalle de alojamiento.",
  "data": {
    "id": 12,
    "titulo": "Apartamento central",
    "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
    "precio_noche": 120000.0,
    "ciudad": "Medellín",
    "usuario_id": 7,
    "fecha_creacion": "2026-05-26T11:40:00",
    "comodidades": [
      {
        "id": 1,
        "nombre": "Wifi"
      },
      {
        "id": 3,
        "nombre": "Parqueadero"
      }
    ]
  }
}
```

### 10.7 `POST /alojamientos`

Este endpoint requiere token, pero no rol admin. El backend toma el propietario desde la sesión.

```json
{
  "titulo": "Apartamento central",
  "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
  "precio_noche": 120000,
  "ciudad": "Medellín"
}
```

Respuesta exitosa `201 Created`:

```json
{
  "success": true,
  "message": "Alojamiento creado con éxito.",
  "data": {
    "id": 12,
    "titulo": "Apartamento central",
    "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
    "precio_noche": 120000.0,
    "ciudad": "Medellín",
    "usuario_id": 7,
    "fecha_creacion": "2026-05-26T11:40:00",
    "comodidades": []
  }
}
```

### 10.8 `PATCH /alojamientos/:id`

La edición es parcial. Se puede enviar cualquier combinación de campos permitidos:

```json
{
  "titulo": "Apartamento central renovado",
  "precio_noche": 135000
}
```

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Alojamiento actualizado.",
  "data": {
    "id": 12,
    "titulo": "Apartamento central renovado",
    "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
    "precio_noche": 135000.0,
    "ciudad": "Medellín",
    "usuario_id": 7,
    "fecha_creacion": "2026-05-26T11:40:00",
    "comodidades": []
  }
}
```

### 10.9 `POST /comodidades`

Solo admin puede crear comodidades.

```json
{
  "nombre": "Wifi"
}
```

Respuesta exitosa `201 Created`:

```json
{
  "success": true,
  "message": "Comodidad creada con éxito.",
  "data": {
    "id": 3,
    "nombre": "Wifi"
  }
}
```

### 10.10 `PATCH /alojamientos/:id/comodidades`

Este endpoint reemplaza la lista completa de comodidades del alojamiento.

```json
{
  "comodidades_ids": [1, 3, 5]
}
```

También puede usarse para vaciar comodidades:

```json
{
  "comodidades_ids": []
}
```

Respuesta exitosa `200 OK`:

```json
{
  "success": true,
  "message": "Comodidades asignadas.",
  "data": {
    "id": 12,
    "titulo": "Apartamento central renovado",
    "descripcion": "Apartamento amoblado cerca al centro de la ciudad.",
    "precio_noche": 135000.0,
    "ciudad": "Medellín",
    "usuario_id": 7,
    "fecha_creacion": "2026-05-26T11:40:00",
    "comodidades": [
      {
        "id": 1,
        "nombre": "Wifi"
      },
      {
        "id": 3,
        "nombre": "Parqueadero"
      }
    ]
  }
}
```

### 10.11 `DELETE /alojamientos/:id`

Este endpoint no devuelve JSON cuando elimina correctamente.

Respuesta exitosa `204 No Content`:

```http
HTTP/1.1 204 No Content
```

No hay cuerpo. En el frontend no se debe llamar `response.json()` para este caso.

## 11. Errores comunes que debe manejar la SPA

### 11.1 Error de validación

```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos.",
    "details": {
      "correo": ["Not a valid email address."]
    }
  }
}
```

### 11.2 Error de token

```json
{
  "success": false,
  "error": {
    "message": "Token inválido."
  }
}
```

### 11.3 Error de permiso

```json
{
  "success": false,
  "error": {
    "message": "Permiso denegado. Se requiere rol de administrador."
  }
}
```

## 12. Endpoints no documentados en esta versión

No deben tratarse como disponibles en esta etapa:

- Imágenes.
- Reservas.
- Búsqueda avanzada o disponibilidad si depende de rutas no creadas.
- Favoritos.
- Reseñas.

Estas funcionalidades pertenecen al roadmap futuro.

## 13. Criterios de integración para el frontend

Para que la SPA sea mantenible:

- todas las peticiones deben pasar por un cliente HTTP central;
- la lógica de autenticación debe vivir en un módulo dedicado;
- las pantallas deben recibir datos ya normalizados;
- los errores deben transformarse en mensajes comprensibles para el usuario;
- los `204 No Content` deben manejarse sin intentar parsear JSON.

## 14. Resumen operativo

Este contrato deja una base clara para la SPA vanilla:

- URL base configurable con `VITE_API_URL`;
- JSON como formato de intercambio;
- JWT en `Authorization: Bearer <token>`;
- permisos distintos para público, token, propietario y admin;
- solo endpoints reales del backend actual.

Con esto, el frontend puede implementarse sin inventar rutas que el servidor todavía no ofrece.

