# Conceptos Fundamentales del Proyecto

> Guia conceptual completa para entender todos los temas necesarios para construir y comprender este backend Flask, desde cero.

---

## Tabla de Contenidos

1. [Fundamentos de la Web](#1-fundamentos-de-la-web)
2. [Qué es una API](#2-qué-es-una-api)
3. [APIs REST](#3-apis-rest)
4. [Python para Backend](#4-python-para-backend)
5. [Flask: Framework Web](#5-flask-framework-web)
6. [Bases de Datos Relacionales](#6-bases-de-datos-relacionales)
7. [ORM y SQLAlchemy](#7-orm-y-sqlalchemy)
8. [Migraciones de Base de Datos](#8-migraciones-de-base-de-datos)
9. [Autenticación y Autorización](#9-autenticación-y-autorización)
10. [JWT: JSON Web Tokens](#10-jwt-json-web-tokens)
11. [Validación de Datos](#11-validación-de-datos)
12. [Arquitectura por Capas](#12-arquitectura-por-capas)
13. [Patrones de Diseño](#13-patrones-de-diseño)
14. [Pruebas Automatizadas](#14-pruebas-automatizadas)
15. [Control de Versiones con Git](#15-control-de-versiones-con-git)
16. [Variables de Entorno](#16-variables-de-entorno)
17. [Seguridad en APIs](#17-seguridad-en-apis)
18. [Herramientas del Proyecto](#18-herramientas-del-proyecto)

---

## 1. Fundamentos de la Web

### 1.1 ¿Cómo funciona la Web?

La web se basa en un modelo **cliente-servidor**:

```
Cliente (navegador, app móvil, Postman)
    │
    │  HTTP Request (petición)
    ▼
┌─────────────────┐
│    Servidor     │
│  (tu backend)   │
└─────────────────┘
    │
    │  HTTP Response (respuesta)
    ▼
Cliente recibe datos
```

**Conceptos clave:**
- **Cliente**: quien hace la petición (navegador, app, script).
- **Servidor**: quien recibe la petición, la procesa y responde.
- **HTTP**: protocolo que define cómo se comunican cliente y servidor.
- **URL**: dirección del recurso (ej. `http://localhost:5000/api/v1/usuarios`).

### 1.2 Métodos HTTP

Cada petición HTTP usa un método que indica qué acción se quiere realizar:

| Método | Significado | Uso típico |
|--------|-------------|------------|
| `GET` | Obtener datos | Leer un recurso (no modifica nada) |
| `POST` | Crear | Enviar datos para crear un nuevo recurso |
| `PUT` | Reemplazar | Actualizar un recurso completo |
| `PATCH` | Actualizar parcialmente | Modificar solo algunos campos |
| `DELETE` | Eliminar | Borrar un recurso |

### 1.3 Códigos de Estado HTTP

El servidor responde con un código numérico que indica el resultado:

| Rango | Significado | Ejemplos comunes |
|-------|-------------|------------------|
| `2xx` | Éxito | `200 OK`, `201 Created`, `204 No Content` |
| `3xx` | Redirección | `301 Moved Permanently` |
| `4xx` | Error del cliente | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `5xx` | Error del servidor | `500 Internal Server Error` |

**Los más importantes para este proyecto:**
- **200**: Todo bien, respuesta con datos.
- **201**: Recurso creado exitosamente.
- **204**: Operación exitosa sin cuerpo de respuesta (ej. eliminación).
- **400**: El cliente envió datos inválidos.
- **401**: No está autenticado (falta token).
- **403**: Está autenticado pero no tiene permiso.
- **404**: El recurso no existe.
- **500**: Error interno del servidor (algo falló en el código).

---

## 2. ¿Qué es una API?

**API** (Application Programming Interface) es una interfaz que permite que dos sistemas se comuniquen.

### 2.1 Analogía

Imagina un restaurante:
- **Tú (cliente)**: haces un pedido.
- **El mesero (API)**: recibe tu pedido, lo lleva a la cocina y te trae la respuesta.
- **La cocina (servidor)**: prepara la comida.

Tú no necesitas saber cómo funciona la cocina; solo interactúas con el mesero. Así funciona una API.

### 2.2 API Web

Una **API web** es un servidor que expone endpoints (rutas) a los que otros programas pueden enviar peticiones HTTP y recibir datos en respuesta, generalmente en formato **JSON**.

**Ejemplo:**
```
Cliente envía: GET http://localhost:5000/api/v1/usuarios/1
Servidor responde:
{
  "id": 1,
  "correo": "juan@ejemplo.com",
  "rol": "usuario"
}
```

### 2.3 ¿Por qué usar una API?

- **Separación**: el backend (lógica) y el frontend (interfaz) son independientes.
- **Multiplataforma**: la misma API sirve para web, móvil, escritorio.
- **Escalabilidad**: puedes agregar más servidores sin cambiar el cliente.
- **Reutilización**: otros servicios pueden consumir tu API.

---

## 3. APIs REST

### 3.1 ¿Qué es REST?

**REST** (Representational State Transfer) es un estilo arquitectónico para diseñar APIs. No es un protocolo ni una tecnología; es un conjunto de **principios de diseño**.

### 3.2 Principios REST

| Principio | Explicación |
|-----------|-------------|
| **Recursos** | Todo es un recurso (usuario, alojamiento, comodidad). Cada recurso tiene una URL única. |
| **Verbos HTTP** | Usa métodos HTTP semánticos: GET para leer, POST para crear, PATCH para actualizar, DELETE para eliminar. |
| **Sin estado (Stateless)** | Cada petición contiene toda la información necesaria. El servidor no guarda estado entre peticiones. |
| **Representaciones** | Los recursos se representan en un formato (JSON). El mismo recurso puede tener múltiples representaciones. |
| **Respuestas estándar** | Usa códigos HTTP apropiados y mensajes de error consistentes. |

### 3.3 Ejemplos de endpoints REST

| Operación | Método | URL | Descripción |
|-----------|--------|-----|-------------|
| Listar usuarios | `GET` | `/api/v1/usuarios` | Devuelve todos los usuarios |
| Ver un usuario | `GET` | `/api/v1/usuarios/1` | Devuelve el usuario con ID 1 |
| Crear usuario | `POST` | `/api/v1/usuarios` | Crea un nuevo usuario |
| Actualizar usuario | `PATCH` | `/api/v1/usuarios/1` | Modifica el usuario con ID 1 |
| Eliminar usuario | `DELETE` | `/api/v1/usuarios/1` | Elimina el usuario con ID 1 |

### 3.4 Características de una buena API REST

- **URLs descriptivas**: `/api/v1/alojamientos` en lugar de `/api/v1/getData`.
- **Verbos correctos**: `GET` para leer, nunca `POST /api/v1/getUsuarios`.
- **Respuestas JSON consistentes**: misma estructura para éxito y error.
- **Códigos HTTP correctos**: 201 al crear, 404 si no existe, etc.
- **Versionado**: `/api/v1/` permite evolucionar sin romper clientes existentes.

---

## 4. Python para Backend

### 4.1 ¿Por qué Python?

- **Legibilidad**: sintaxis clara y fácil de aprender.
- **Ecosistema**: miles de librerías para todo (web, bases de datos, testing).
- **Comunidad**: documentación abundante y soporte activo.
- **Versatilidad**: sirve para web, datos, automatización, IA.

### 4.2 Conceptos clave de Python

#### 4.2.1 Variables: ¿qué son?

Una **variable** es un espacio en la memoria de la computadora donde guardas un valor para usarlo después. Piensa en ella como una **caja con etiqueta**:

```
┌─────────────┐
│   nombre    │  ← etiqueta (nombre de la variable)
│   "Juan"    │  ← contenido (valor guardado)
└─────────────┘
```

```python
nombre = "Juan"
```

- `nombre` es la etiqueta de la caja.
- `=` significa "guarda el valor de la derecha en la caja de la izquierda".
- `"Juan"` es lo que guardas dentro.

**Reglas para nombrar variables:**
- Pueden contener letras, números y guiones bajos (`_`).
- No pueden empezar con número.
- Son sensibles a mayúsculas: `nombre` y `Nombre` son variables diferentes.
- Usa nombres descriptivos: `correo_usuario` en lugar de `x`.

#### 4.2.2 Tipos de datos: ¿qué son?

Un **tipo de dato** indica qué clase de valor guarda una variable. Python tiene varios tipos principales:

**String (`str`) — Texto:**
```python
nombre = "Juan"
correo = "juan@ejemplo.com"
```
- Secuencia de caracteres entre comillas simples (`'`) o dobles (`"`).
- Es inmutable: no puedes cambiar un carácter individual, solo reemplazar todo el valor.

**Integer (`int`) — Número entero:**
```python
edad = 30
cantidad = -5
```
- Números sin parte decimal.
- Pueden ser positivos, negativos o cero.

**Float (`float`) — Número decimal:**
```python
precio = 85.50
temperatura = -3.14
```
- Números con parte decimal (punto flotante).
- Importante: en este proyecto usamos `Decimal` para dinero porque `float` puede tener errores de precisión.

**Boolean (`bool`) — Verdadero o Falso:**
```python
activo = True
eliminado = False
```
- Solo dos valores posibles: `True` o `False`.
- Se usa para condiciones y banderas.

**Cómo saber el tipo de una variable:**
```python
type(nombre)    # <class 'str'>
type(edad)      # <class 'int'>
type(precio)    # <class 'float'>
type(activo)    # <class 'bool'>
```

#### 4.2.3 Operaciones básicas

**Con números:**
```python
suma = 10 + 5       # 15
resta = 10 - 5      # 5
multiplicacion = 10 * 5   # 50
division = 10 / 3   # 3.333...
division_entera = 10 // 3   # 3 (sin decimales)
modulo = 10 % 3     # 1 (resto de la división)
potencia = 2 ** 3   # 8 (2 elevado a 3)
```

**Con texto:**
```python
saludo = "Hola" + " " + "Juan"   # "Hola Juan" (concatenación)
repetido = "Hola" * 3            # "HolaHolaHola"
longitud = len("Hola")           # 4 (cantidad de caracteres)
```

**Comparaciones (devuelven `bool`):**
```python
10 > 5      # True
10 < 5      # False
10 == 10    # True (igualdad: dos signos =)
10 != 5     # True (desigualdad)
10 >= 10    # True (mayor o igual)
```

#### 4.2.4 Condicionales: `if`, `elif`, `else`

Un **condicional** ejecuta código solo si se cumple una condición.

```python
edad = 20

if edad >= 18:
    print("Eres mayor de edad")
elif edad >= 13:
    print("Eres adolescente")
else:
    print("Eres menor de edad")
```

**¿Cómo funciona?**
1. Evalúa la condición después de `if`.
2. Si es `True`, ejecuta el bloque indentado y termina.
3. Si es `False`, pasa al `elif` (si hay) y repite.
4. Si ninguna condición se cumple, ejecuta el `else` (si hay).

**Importante:** la indentación (espacios al inicio) es obligatoria en Python. Define qué código pertenece a cada bloque.

#### 4.2.5 Listas: ¿qué son?

Una **lista** es una colección ordenada de elementos. Piensa en ella como una **fila de casilleros** numerados:

```
Índice:    0        1        2
        ┌──────┬──────┬──────┐
        │ Ana  │ Juan │ María│
        └──────┴──────┴──────┘
```

```python
usuarios = ["Ana", "Juan", "María"]
```

**Características:**
- **Ordenada**: los elementos mantienen el orden en que los agregaste.
- **Indexada**: accedes por posición empezando desde 0.
- **Mutable**: puedes agregar, eliminar o cambiar elementos.
- **Permite duplicados**: puedes tener el mismo valor varias veces.

**Operaciones comunes:**
```python
# Crear
nombres = ["Ana", "Juan", "María"]
vacia = []

# Acceder por índice
primero = nombres[0]    # "Ana"
ultimo = nombres[-1]    # "María" (-1 = último)

# Modificar
nombres[1] = "Pedro"    # ["Ana", "Pedro", "María"]

# Agregar
nombres.append("Luis")  # Agrega al final
nombres.insert(1, "Sara")  # Agrega en posición 1

# Eliminar
nombres.remove("Ana")   # Elimina por valor
eliminado = nombres.pop()  # Elimina y devuelve el último

# Información
cantidad = len(nombres)    # Cuántos elementos
existe = "Juan" in nombres # True o False

# Recorrer con for
for nombre in nombres:
    print(nombre)
```

**¿Cuándo usar una lista?**
- Cuando necesitas una colección ordenada de elementos del mismo tipo.
- Ejemplo: lista de usuarios, lista de alojamientos, lista de IDs.

#### 4.2.6 Diccionarios: ¿qué son?

Un **diccionario** es una colección de pares **clave-valor**. Piensa en él como un **diccionario real**: buscas una palabra (clave) y obtienes su definición (valor).

```python
usuario = {
    "id": 1,
    "correo": "juan@ejemplo.com",
    "nombre": "Juan",
    "activo": True
}
```

**Características:**
- **No ordenado** (antes de Python 3.7 no garantizaba orden).
- **Acceso por clave**: no por posición numérica.
- **Claves únicas**: no puedes tener dos claves iguales.
- **Valores de cualquier tipo**: pueden ser strings, números, listas, otros diccionarios.

**Operaciones comunes:**
```python
# Crear
persona = {"nombre": "Juan", "edad": 30}
vacio = {}

# Acceder
nombre = persona["nombre"]    # "Juan"
edad = persona.get("edad")    # 30 (get no da error si no existe)
telefono = persona.get("tel", "N/A")  # "N/A" (valor por defecto)

# Modificar
persona["edad"] = 31
persona["telefono"] = "555-1234"  # Agrega nueva clave

# Eliminar
del persona["telefono"]
edad = persona.pop("edad")

# Información
claves = persona.keys()     # ["nombre", "edad"]
valores = persona.values()  # ["Juan", 30]
pares = persona.items()     # [("nombre", "Juan"), ("edad", 30)]

# Recorrer
for clave, valor in persona.items():
    print(f"{clave}: {valor}")
```

**¿Cuándo usar un diccionario?**
- Cuando necesitas asociar claves con valores.
- Ejemplo: datos de un usuario, configuración, respuesta JSON de una API.

**JSON vs Diccionario:**
JSON es un formato de texto. Los diccionarios de Python son la representación en memoria. Son muy similares:

```json
{"id": 1, "correo": "juan@ejemplo.com"}
```
```python
{"id": 1, "correo": "juan@ejemplo.com"}
```

#### 4.2.7 Tuplas: ¿qué son?

Una **tupla** es como una lista pero **inmutable** (no puedes cambiar sus elementos después de crearla).

```python
coordenadas = (10, 20)
colores_rgb = (255, 0, 0)
```

**¿Cuándo usar una tupla?**
- Cuando tienes un grupo de valores relacionados que no van a cambiar.
- Ejemplo: coordenadas, configuración fija, retornar múltiples valores de una función.

#### 4.2.8 Bucles: `for` y `while`

Un **bucle** repite un bloque de código múltiples veces.

**`for` — cuando sabes cuántas veces repetir o quieres recorrer una colección:**
```python
# Recorrer una lista
nombres = ["Ana", "Juan", "María"]
for nombre in nombres:
    print(nombre)

# Recorrer un rango de números
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

# Recorrer con índice
for i, nombre in enumerate(nombres):
    print(f"{i}: {nombre}")

# Recorrer un diccionario
usuario = {"nombre": "Juan", "edad": 30}
for clave, valor in usuario.items():
    print(f"{clave}: {valor}")
```

**`while` — cuando no sabes cuántas veces repetir y depende de una condición:**
```python
contador = 0
while contador < 5:
    print(contador)
    contador += 1  # Incrementar (muy importante para evitar bucle infinito)
```

**Control de bucles:**
```python
for i in range(10):
    if i == 3:
        continue  # Salta esta iteración, continúa con la siguiente
    if i == 7:
        break     # Termina el bucle completamente
    print(i)
# Imprime: 0, 1, 2, 4, 5, 6
```

#### 4.2.9 Funciones: ¿qué son?

Una **función** es un bloque de código reutilizable con un nombre. Piensa en ella como una **receta**: defines los pasos una vez y los ejecutas cada vez que los necesitas.

```python
def saludar(nombre):
    """Devuelve un saludo personalizado."""
    return f"Hola, {nombre}!"

# Uso:
mensaje = saludar("Juan")
print(mensaje)  # "Hola, Juan!"
```

**Partes de una función:**
- `def`: palabra clave que indica que estás definiendo una función.
- `saludar`: nombre de la función.
- `(nombre)`: parámetros (datos que recibe).
- `"""..."""`: docstring (documentación de qué hace).
- `return`: valor que devuelve la función.

**Parámetros con valor por defecto:**
```python
def calcular_precio(precio, impuesto=0.16):
    return precio * (1 + impuesto)

calcular_precio(100)       # 116.0 (usa impuesto por defecto)
calcular_precio(100, 0.21) # 121.0 (usa impuesto explícito)
```

**`*args` y `**kwargs` — parámetros variables:**
```python
def sumar(*numeros):
    """Suma cualquier cantidad de números."""
    return sum(numeros)

sumar(1, 2, 3)      # 6
sumar(10, 20)       # 30

def mostrar_info(**datos):
    """Recibe cualquier cantidad de pares clave-valor."""
    for clave, valor in datos.items():
        print(f"{clave}: {valor}")

mostrar_info(nombre="Juan", edad=30, ciudad="Madrid")
```

**¿Cuándo usar una función?**
- Cuando tienes código que se repite en varios lugares.
- Para organizar el código en bloques lógicos.
- Para hacer el código más legible y testeable.

#### 4.2.10 Clases y Objetos: ¿qué son?

Una **clase** es un molde para crear objetos. Un **objeto** es una instancia de una clase con datos y comportamiento propios.

**Analogía:**
- **Clase**: el plano de una casa.
- **Objeto**: cada casa construida a partir del plano.

```python
class Usuario:
    """Clase que representa un usuario del sistema."""
    
    def __init__(self, correo, contrasena):
        """Constructor: se ejecuta al crear un nuevo objeto."""
        self.correo = correo
        self.contrasena = contrasena
        self.activo = True
    
    def to_dict(self):
        """Convierte el objeto a un diccionario."""
        return {
            "correo": self.correo,
            "activo": self.activo
        }

# Crear objetos (instancias)
usuario1 = Usuario("juan@ejemplo.com", "hash123")
usuario2 = Usuario("maria@ejemplo.com", "hash456")

# Acceder a atributos
print(usuario1.correo)  # "juan@ejemplo.com"

# Llamar a métodos
print(usuario1.to_dict())  # {"correo": "juan@ejemplo.com", "activo": True}
```

**Conceptos clave:**
- `class`: define una nueva clase.
- `__init__`: método constructor, se ejecuta automáticamente al crear un objeto.
- `self`: referencia al objeto actual. Permite acceder a sus atributos y métodos.
- **Atributos**: datos del objeto (`self.correo`, `self.contrasena`).
- **Métodos**: funciones del objeto (`to_dict()`).

**Herencia: una clase que hereda de otra:**
```python
class Admin(Usuario):
    """Administrador: hereda de Usuario con permisos extra."""
    
    def __init__(self, correo, contrasena):
        super().__init__(correo, contrasena)  # Llama al constructor padre
        self.rol = "admin"
    
    def eliminar_usuario(self, usuario_id):
        """Solo los admins pueden eliminar usuarios."""
        print(f"Usuario {usuario_id} eliminado")
```

**¿Cuándo usar clases?**
- Cuando necesitas modelar entidades del mundo real con datos y comportamiento.
- Ejemplo: `Usuario`, `Alojamiento`, `Comodidad` en este proyecto.

#### 4.2.11 Excepciones: manejo de errores

Una **excepción** es un error que ocurre durante la ejecución del programa. Python permite capturar y manejar estos errores.

```python
try:
    resultado = 10 / 0
except ZeroDivisionError:
    print("No puedes dividir por cero")
except Exception as e:
    print(f"Error inesperado: {e}")
else:
    print("Todo salió bien")  # Se ejecuta si no hubo error
finally:
    print("Esto siempre se ejecuta")  # Limpieza
```

**Crear tus propias excepciones:**
```python
class UsuarioNoEncontradoError(Exception):
    """Se lanza cuando no se encuentra un usuario."""
    pass

# Uso:
if not usuario:
    raise UsuarioNoEncontradoError("El usuario no existe")
```

**¿Cuándo usar excepciones?**
- Cuando algo puede fallar y necesitas manejarlo sin que el programa termine abruptamente.
- En este proyecto: usuario no encontrado, credenciales inválidas, permiso denegado.

#### 4.2.12 Comprensión de listas (List Comprehensions)

Una forma concisa de crear listas:

```python
# Forma tradicional
cuadrados = []
for i in range(10):
    cuadrados.append(i ** 2)

# Con comprensión de listas (más Pythonico)
cuadrados = [i ** 2 for i in range(10)]

# Con condición
pares = [i for i in range(10) if i % 2 == 0]
```

---

### 4.3 Módulos y paquetes

#### 4.3.1 ¿Qué es un módulo?

Un **módulo** es simplemente un archivo `.py` con código Python. Puedes importar sus funciones, clases y variables en otro archivo.

```python
# archivo: operaciones.py
def sumar(a, b):
    return a + b

def restar(a, b):
    return a - b
```

```python
# archivo: main.py
import operaciones

resultado = operaciones.sumar(5, 3)  # 8
```

#### 4.3.2 Formas de importar

```python
# Importar todo el módulo
import math
math.sqrt(16)  # 4.0

# Importar algo específico
from math import sqrt
sqrt(16)  # 4.0

# Importar con alias
import numpy as np
np.array([1, 2, 3])

# Importar todo (no recomendado)
from math import *
```

#### 4.3.3 ¿Qué es un paquete?

Un **paquete** es una carpeta que contiene módulos y un archivo especial `__init__.py`.

```
mi_proyecto/
├── __init__.py          # Hace que esta carpeta sea un paquete
├── usuarios.py          # Módulo
├── alojamientos.py      # Módulo
└── servicios/
    ├── __init__.py      # Sub-paquete
    └── auth.py          # Módulo
```

**¿Para qué sirve `__init__.py`?**
- Indica a Python que la carpeta es un paquete importable.
- Puede estar vacío o contener código de inicialización.

#### 4.3.4 Importar en este proyecto

```python
# Importar desde app/__init__.py
from app import db

# Importar desde un módulo específico
from app.dominios.usuarios.modelos import Usuario

# Importar un blueprint
from app.dominios.usuarios.controladores import usuarios_bp
```

### 4.4 Entorno virtual

#### 4.4.1 ¿Qué es un entorno virtual?

Un **entorno virtual** es un espacio aislado donde instalas las dependencias de un proyecto sin afectar otros proyectos.

**Analogía:**
Sin entorno virtual es como tener una cocina compartida: si un proyecto necesita harina y otro azúcar, se mezclan. Con entorno virtual, cada proyecto tiene su propia cocina independiente.

```bash
# Crear
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Linux/Mac)
source venv/bin/activate
```

**¿Cómo saber si está activado?**
Tu terminal mostrará `(venv)` al inicio del prompt.

### 4.5 pip y requirements.txt

#### 4.5.1 ¿Qué es pip?

**pip** es el gestor de paquetes de Python. Instala, actualiza y desinstala librerías.

```bash
# Instalar una librería
pip install flask

# Instalar desde archivo
pip install -r requirements.txt

# Ver paquetes instalados
pip list

# Actualizar un paquete
pip install --upgrade flask
```

#### 4.5.2 ¿Qué es requirements.txt?

Es un archivo de texto con la lista de dependencias del proyecto y sus versiones exactas:

```
Flask==3.1.3
Flask-SQLAlchemy==3.1.1
PyJWT==2.10.1
```

**¿Por qué versiones exactas?**
- Garantiza que todos los desarrolladores usen las mismas versiones.
- Evita errores inesperados cuando una librería se actualiza.

---

## 5. Flask: Framework Web

### 5.1 ¿Qué es Flask?

Flask es un **microframework** web para Python. "Micro" no significa pequeño en capacidad, sino que es **minimalista**: te da lo esencial y te deja elegir las extensiones que necesitas.

### 5.2 ¿Qué hace Flask?

- Recibe peticiones HTTP.
- Las enruta a funciones (vistas/controladores).
- Devuelve respuestas HTTP.

### 5.3 Ejemplo mínimo

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/saludo', methods=['GET'])
def saludo():
    return jsonify({"mensaje": "¡Hola mundo!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

**¿Qué hace?**
1. Crea la app Flask.
2. Define una ruta `/saludo` que responde a `GET`.
3. Cuando alguien visita `http://localhost:5000/saludo`, devuelve JSON.

### 5.4 App Factory Pattern

En lugar de crear la app directamente, usamos una **función factory** que la crea y configura:

```python
def crear_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # Registrar rutas, extensiones, etc.
    return app

# Uso:
app = crear_app()
```

**Ventajas:**
- Permite crear múltiples instancias (útil para testing).
- Separa configuración de creación.
- Facilita el testing con diferentes configuraciones.

### 5.5 Blueprints

Un **Blueprint** es una forma de organizar rutas en módulos separados:

```python
# app/dominios/usuarios/controladores.py
from flask import Blueprint

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/registro', methods=['POST'])
def registro():
    # ...
```

```python
# app/__init__.py
from app.dominios.usuarios.controladores import usuarios_bp

app.register_blueprint(usuarios_bp, url_prefix='/api/v1/usuarios')
```

**Ventajas:**
- Código organizado por dominios.
- Múltiples equipos pueden trabajar en módulos separados.
- Rutas agrupadas con prefijo (`/api/v1/usuarios/...`).

### 5.6 Extensiones de Flask

Flask tiene un ecosistema de extensiones que agregan funcionalidad:

| Extensión | Para qué sirve |
|-----------|----------------|
| **Flask-SQLAlchemy** | Integra SQLAlchemy (ORM) con Flask |
| **Flask-Migrate** | Gestión de migraciones de base de datos |
| **Flask-CORS** | Permite peticiones desde otros dominios (frontend) |

---

## 6. Bases de Datos Relacionales

### 6.1 ¿Qué es una base de datos relacional?

Una base de datos relacional organiza datos en **tablas** con filas y columnas, y permite definir **relaciones** entre ellas.

### 6.2 Conceptos clave

| Concepto | Explicación |
|----------|-------------|
| **Tabla** | Colección de datos de un tipo (ej. `usuarios`) |
| **Columna (campo)** | Un atributo de los datos (ej. `correo`, `contrasena`) |
| **Fila (registro)** | Una entrada en la tabla (un usuario específico) |
| **Primary Key (PK)** | Identificador único de cada fila (ej. `id`) |
| **Foreign Key (FK)** | Referencia a la PK de otra tabla (relación) |
| **Índice** | Estructura que acelera las búsquedas |

### 6.3 Tipos de relaciones

**One-to-One (1:1):** Un usuario tiene un solo perfil.
```
usuarios (1) ─── (1) perfiles
```

**One-to-Many (1:N):** Un usuario tiene muchos alojamientos.
```
usuarios (1) ─── (N) alojamientos
```

**Many-to-Many (N:M):** Un alojamiento tiene muchas comodidades y una comodidad pertenece a muchos alojamientos.
```
alojamientos (N) ─── alojamiento_comodidad ─── (N) comodidades
                (tabla intermedia)
```

### 6.4 MySQL

MySQL es el sistema de gestión de base de datos relacional que usa este proyecto.

**Comandos básicos:**
```sql
-- Crear base de datos
CREATE DATABASE alojamientos_db;

-- Usar base de datos
USE alojamientos_db;

-- Crear tabla
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);

-- Insertar datos
INSERT INTO usuarios (correo, contrasena) VALUES ('juan@ejemplo.com', 'hash123');

-- Consultar datos
SELECT * FROM usuarios WHERE correo = 'juan@ejemplo.com';
```

---

## 7. ORM y SQLAlchemy

### 7.1 ¿Qué es un ORM?

**ORM** (Object-Relational Mapping) es una técnica que permite trabajar con la base de datos usando **objetos de Python** en lugar de escribir SQL directamente.

**Sin ORM (SQL directo):**
```python
cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
usuario = cursor.fetchone()
```

**Con ORM:**
```python
usuario = db.session.get(Usuario, 1)
```

### 7.2 SQLAlchemy

SQLAlchemy es el ORM más popular de Python. Flask-SQLAlchemy es la integración con Flask.

### 7.3 Modelos

Un **modelo** es una clase Python que representa una tabla de la base de datos:

```python
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), server_default='usuario')
```

**¿Qué hace?**
- `db.Model`: indica que es un modelo SQLAlchemy.
- `__tablename__`: nombre de la tabla en la BD.
- `db.Column`: define cada columna con su tipo y restricciones.

### 7.4 Operaciones CRUD con ORM

```python
# CREATE: crear un usuario
usuario = Usuario(correo='juan@ejemplo.com', contrasena='hash123')
db.session.add(usuario)
db.session.commit()

# READ: leer un usuario
usuario = db.session.get(Usuario, 1)
todos = db.session.query(Usuario).all()

# UPDATE: actualizar
usuario.correo = 'nuevo@ejemplo.com'
db.session.commit()

# DELETE: eliminar
db.session.delete(usuario)
db.session.commit()
```

### 7.5 Relaciones en SQLAlchemy

```python
# One-to-Many: un usuario tiene muchos alojamientos
class Usuario(db.Model):
    alojamientos = db.relationship('Alojamiento', backref='usuario', lazy=True)

class Alojamiento(db.Model):
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)

# Many-to-Many: alojamientos ↔ comodidades
alojamiento_comodidad = db.Table(
    'alojamiento_comodidad',
    db.Column('alojamiento_id', db.Integer, db.ForeignKey('alojamientos.id'), primary_key=True),
    db.Column('comodidad_id', db.Integer, db.ForeignKey('comodidades.id'), primary_key=True),
)

class Alojamiento(db.Model):
    comodidades = db.relationship('Comodidad', secondary=alojamiento_comodidad, back_populates='alojamientos')
```

---

## 8. Migraciones de Base de Datos

### 8.1 ¿Qué es una migración?

Una **migración** es un script que modifica el esquema de la base de datos (crear tablas, agregar columnas, etc.) de forma controlada y versionada.

### 8.2 ¿Por qué usar migraciones?

- **Historial**: sabes exactamente qué cambios se hicieron y en qué orden.
- **Reproducibilidad**: cualquier persona puede aplicar las migraciones y tener la misma BD.
- **Rollback**: puedes revertir cambios si algo sale mal.
- **Colaboración**: varios desarrolladores pueden trabajar en cambios de BD sin conflictos.

### 8.3 Flask-Migrate y Alembic

Flask-Migrate usa **Alembic** (herramienta de migraciones de SQLAlchemy) para gestionar migraciones.

**Flujo de trabajo:**

```bash
# 1. Inicializar (solo una vez)
flask db init

# 2. Generar una migración (cuando cambias modelos)
flask db migrate -m "crear tabla usuarios"

# 3. Aplicar la migración
flask db upgrade

# 4. Ver historial
flask db history

# 5. Revertir última migración
flask db downgrade
```

### 8.4 Estructura de una migración

```python
# migrations/versions/abc123_crear_tabla_usuarios.py

def upgrade():
    op.create_table('usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('correo', sa.String(255), nullable=False),
        sa.Column('contrasena', sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('correo')
    )

def downgrade():
    op.drop_table('usuarios')
```

---

## 9. Autenticación y Autorización

### 9.1 Diferencia clave

| Concepto | Pregunta que responde | Ejemplo |
|----------|----------------------|---------|
| **Autenticación** | ¿Quién eres? | Verificar correo y contraseña |
| **Autorización** | ¿Qué puedes hacer? | Verificar si eres admin para acceder a ciertos endpoints |

**Primero te autenticas, luego se autoriza.**

### 9.2 Autenticación en este proyecto

El proyecto usa **JWT (JSON Web Tokens)** para autenticación sin estado (stateless).

**Flujo:**
1. Usuario envía correo + contraseña a `/api/v1/usuarios/login`.
2. Servidor verifica credenciales.
3. Si son válidas, genera un token JWT y lo devuelve.
4. El cliente guarda el token.
5. En cada petición posterior, el cliente envía el token en el header `Authorization: Bearer <token>`.
6. El servidor valida el token y permite el acceso.

### 9.3 Autorización por roles

El proyecto tiene dos roles:

| Rol | Permisos |
|-----|----------|
| **usuario** | Crear sus propios alojamientos, ver/editar su perfil |
| **admin** | Todo lo anterior + crear comodidades, listar todos los usuarios |

La autorización se verifica en cada endpoint protegido:
- `@requiere_token`: verifica que hay un token válido.
- `@requiere_admin`: verifica que el usuario tiene rol `admin`.

---

## 10. JWT: JSON Web Tokens

### 10.1 ¿Qué es un JWT?

Un **JWT** es un token que contiene información (claims) firmada criptográficamente. Se usa para autenticar usuarios sin guardar estado en el servidor.

### 10.2 Estructura de un JWT

Un JWT tiene tres partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzAwMDAwMDAwfQ.signature
```

| Parte | Contenido |
|-------|-----------|
| **Header** | Algoritmo de firma (`HS256`) y tipo (`JWT`) |
| **Payload** | Datos del usuario (id, rol, expiración) |
| **Signature** | Firma criptográfica que verifica la integridad |

### 10.3 Claims (datos del payload)

| Claim | Significado | Ejemplo |
|-------|-------------|---------|
| `sub` | Subject: identifica al usuario | `"1"` (ID del usuario) |
| `iat` | Issued at: cuándo se creó el token | `1700000000` (timestamp) |
| `exp` | Expiration: cuándo expira | `1700000900` (15 minutos después) |

### 10.4 Cómo funciona en el proyecto

**Generación del token:**
```python
import jwt
from datetime import datetime, timedelta, timezone

ahora = datetime.now(timezone.utc)
payload = {
    'sub': str(usuario.id),
    'iat': ahora,
    'exp': ahora + timedelta(minutes=15),
}
token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

**Validación del token:**
```python
payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
usuario_id = payload['sub']  # ID del usuario autenticado
```

### 10.5 Ventajas de JWT

- **Sin estado**: el servidor no necesita guardar sesiones en memoria o BD.
- **Escalable**: funciona con múltiples servidores sin compartir estado.
- **Portátil**: el token viaja con cada petición.

### 10.6 Desventajas

- No se puede revocar fácilmente (hasta que expire).
- Si el token es robado, cualquiera puede usarlo hasta que expire.
- No almacenes información sensible en el payload (es legible, solo está codificado en Base64).

---

## 11. Validación de Datos

### 11.1 ¿Por qué validar?

Nunca confíes en los datos que envía el cliente. La validación asegura que:
- Los campos requeridos están presentes.
- Los tipos de datos son correctos.
- Los valores cumplen las reglas del negocio.

### 11.2 DTOs con Marshmallow

Un **DTO** (Data Transfer Object) es un esquema que define qué datos se esperan y cómo validarlos.

```python
from marshmallow import Schema, fields, validate

class RegistroUsuarioDTO(Schema):
    correo = fields.Email(required=True)
    contrasena = fields.String(required=True, validate=validate.Length(min=6))
```

**¿Qué hace?**
- `required=True`: el campo es obligatorio.
- `fields.Email`: valida que sea un email válido.
- `validate.Length(min=6)`: la contraseña debe tener al menos 6 caracteres.

### 11.3 Uso en el controlador

```python
dto = RegistroUsuarioDTO()
try:
    datos_validados = dto.load(datos)  # Valida y transforma
except ValidationError as err:
    return jsonify({"error": err.messages}), 400

# datos_validados solo contiene datos válidos
usuario = servicio.registrar_usuario(datos_validados)
```

### 11.4 Tipos de validación

| Validación | Ejemplo |
|------------|---------|
| Campo requerido | `required=True` |
| Tipo de dato | `fields.Integer()`, `fields.String()` |
| Longitud mínima/máxima | `validate.Length(min=1, max=200)` |
| Rango numérico | `validate.Range(min=0.01)` |
| Formato email | `fields.Email()` |
| Valores únicos | `unique=True` en el modelo |

---

## 12. Arquitectura por Capas

### 12.1 ¿Qué es?

La **arquitectura por capas** organiza el código en niveles separados, donde cada capa tiene una responsabilidad específica.

### 12.2 Capas del proyecto

```
┌─────────────────────────────────────────┐
│          Controladores (API)            │ ← Recibe HTTP, valida DTOs, responde
├─────────────────────────────────────────┤
│            Servicios                    │ ← Lógica de negocio, reglas
├─────────────────────────────────────────┤
│          Repositorios                   │ ← Acceso a datos (CRUD)
├─────────────────────────────────────────┤
│            Modelos                      │ ← Estructura de la BD
└─────────────────────────────────────────┘
```

### 12.3 Responsabilidad de cada capa

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Controlador** | Recibe petición HTTP, valida DTO, llama servicio, devuelve respuesta | `@usuarios_bp.route('/registro')` |
| **Servicio** | Lógica de negocio: reglas, cálculos, excepciones de dominio | `UsuarioServicio.registrar_usuario()` |
| **Repositorio** | Acceso a datos: consultas, inserts, updates, deletes | `UsuarioRepositorio.obtener_por_correo()` |
| **Modelo** | Estructura de la tabla: columnas, tipos, relaciones | `class Usuario(db.Model)` |

### 12.4 ¿Por qué separar en capas?

- **Mantenibilidad**: si cambias la BD, solo modificas repositorios.
- **Testeabilidad**: puedes probar cada capa por separado.
- **Legibilidad**: el código es más fácil de entender.
- **Escalabilidad**: múltiples equipos pueden trabajar en capas diferentes.

### 12.5 Flujo de una petición

```
1. Cliente envía POST /api/v1/usuarios/registro con JSON
2. Controlador recibe la petición
3. Controlador valida datos con DTO (RegistroUsuarioDTO)
4. Si válido, llama al servicio: servicio.registrar_usuario(datos)
5. Servicio aplica lógica: verifica duplicado, hashea contraseña
6. Servicio llama al repositorio: repositorio.guardar_usuario(usuario)
7. Repositorio ejecuta: db.session.add(usuario); db.session.commit()
8. Servicio devuelve el usuario creado
9. Controlador devuelve respuesta HTTP 201 con JSON
```

---

## 13. Patrones de Diseño

### 13.1 ¿Qué es un patrón de diseño?

Un **patrón de diseño** es una solución probada a un problema común en el diseño de software.

### 13.2 Factory Pattern (App Factory)

**Problema**: crear la app Flask de forma flexible para diferentes entornos (desarrollo, testing, producción).

**Solución**: una función que crea y configura la app.

```python
def crear_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app
```

### 13.3 Repository Pattern

**Problema**: el código de acceso a datos está mezclado con la lógica de negocio.

**Solución**: una capa intermedia (repositorio) que encapsula todas las consultas.

```python
class UsuarioRepositorio:
    @staticmethod
    def obtener_por_correo(correo):
        return db.session.query(Usuario).filter_by(correo=correo).first()
```

### 13.4 Decorator Pattern

**Problema**: necesitas verificar autenticación en múltiples endpoints sin repetir código.

**Solución**: un decorador que envuelve la función.

```python
def requiere_token(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Verificar token
        return f(*args, usuario_id=usuario_id, **kwargs)
    return wrapper

@usuarios_bp.route('/perfil')
@requiere_token
def obtener_perfil(usuario_id):
    # Esta función solo se ejecuta si el token es válido
```

### 13.5 Dependency Injection

**Problema**: el servicio necesita configuración (`SECRET_KEY`, `JWT_EXP_MINUTES`) que solo está disponible en el app factory.

**Solución**: inyectar las dependencias desde fuera.

```python
# En el app factory:
servicio = UsuarioServicio(
    secret_key=app.config['SECRET_KEY'],
    jwt_exp_minutes=app.config['JWT_EXP_MINUTES'],
)
```

---

## 14. Pruebas Automatizadas

### 14.1 ¿Por qué hacer tests?

- **Confianza**: sabes que el código funciona antes de hacer deploy.
- **Prevención**: detectas errores antes de que lleguen a producción.
- **Documentación**: los tests muestran cómo se usa el código.
- **Refactorización**: puedes cambiar código con seguridad.

### 14.2 Tipos de tests

| Tipo | Qué prueba | Ejemplo |
|------|------------|---------|
| **Unitario** | Una función/método aislado | `test_hash_password()` |
| **Integración** | Múltiples componentes juntos | `test_registro_usuario()` |
| **End-to-End** | Flujo completo desde el cliente | `test_flujo_registro_login_perfil()` |

Este proyecto usa **tests de integración** con pytest.

### 14.3 pytest

pytest es el framework de testing más popular de Python.

**Estructura de un test:**
```python
def test_registro_exitoso(client):
    # Arrange: preparar datos
    datos = {'correo': 'nuevo@ejemplo.com', 'contrasena': '123456'}
    
    # Act: ejecutar la acción
    resp = client.post('/api/v1/usuarios/registro', json=datos)
    
    # Assert: verificar el resultado
    assert resp.status_code == 201
```

### 14.4 Fixtures

Un **fixture** es una función que prepara el entorno para los tests:

```python
@pytest.fixture
def client(app):
    """Cliente HTTP para pruebas."""
    return app.test_client()

@pytest.fixture
def usuario_auth(client):
    """Crea un usuario y devuelve headers con token."""
    # Crear usuario, hacer login, devolver token
    return {'Authorization': f'Bearer {token}'}
```

**Uso:**
```python
def test_perfil_con_token(client, usuario_auth):
    resp = client.get('/api/v1/usuarios/perfil', headers=usuario_auth)
    assert resp.status_code == 200
```

### 14.5 Testing con SQLite en memoria

Para tests, usamos SQLite en memoria en lugar de MySQL:
- **Rápido**: no hay red ni disco.
- **Aislado**: cada test empieza limpio.
- **No requiere MySQL**: el estudiante puede correr tests sin instalar MySQL.

### 14.6 Ejecutar tests

```bash
# Todos los tests
pytest

# Con detalle
pytest -v

# Un archivo específico
pytest tests/test_usuarios.py -v
```

---

## 15. Control de Versiones con Git

### 15.1 ¿Qué es Git?

Git es un sistema de control de versiones que rastrea cambios en los archivos de tu proyecto.

### 15.2 Conceptos clave

| Concepto | Explicación |
|----------|-------------|
| **Repositorio** | Carpeta del proyecto rastreada por Git |
| **Commit** | Una instantánea de los cambios |
| **Branch (rama)** | Línea de desarrollo independiente |
| **Remote (remoto)** | Repositorio en otro lugar (GitHub) |
| **Push** | Enviar commits al remoto |
| **Pull** | Traer commits del remoto |

### 15.3 Comandos esenciales

```bash
# Inicializar repositorio
git init

# Ver estado
git status

# Agregar archivos al staging
git add .

# Crear commit
git commit -m "feat: agregar registro de usuarios"

# Conectar con remoto
git remote add origin https://github.com/tu-usuario/repo.git

# Subir a GitHub
git push -u origin main
```

### 15.4 .gitignore

El archivo `.gitignore` indica qué archivos **NO** debe rastrear Git:

```
# Entorno virtual
venv/

# Variables de entorno (contienen secretos)
.env

# Cache de Python
__pycache__/
*.pyc
```

### 15.5 Mensajes de commit

Usa mensajes descriptivos con prefijos:

| Prefijo | Significado | Ejemplo |
|---------|-------------|---------|
| `feat:` | Nueva funcionalidad | `feat: agregar login con JWT` |
| `fix:` | Corrección de bug | `fix: corregir validación de email` |
| `docs:` | Documentación | `docs: actualizar README` |
| `style:` | Formato (sin cambiar lógica) | `style: formatear con black` |
| `refactor:` | Reestructurar sin cambiar comportamiento | `refactor: extraer servicio de usuarios` |
| `test:` | Tests | `test: agregar tests de registro` |

---

## 16. Variables de Entorno

### 16.1 ¿Qué son?

Las **variables de entorno** son valores configurables fuera del código, accesibles desde cualquier parte del programa.

### 16.2 ¿Por qué usarlas?

- **Seguridad**: no hardcodeas contraseñas ni claves secretas.
- **Flexibilidad**: puedes cambiar configuración sin tocar el código.
- **Portabilidad**: cada entorno (desarrollo, staging, producción) tiene su propia configuración.

### 16.3 `.env` vs `.env.example`

| Archivo | Propósito | ¿Se versiona? |
|---------|-----------|---------------|
| `.env` | Configuración real con valores sensibles | **NO** (está en `.gitignore`) |
| `.env.example` | Plantilla con estructura, sin valores reales | **SÍ** |

### 16.4 Flujo de trabajo

```bash
# 1. Copiar plantilla
cp .env.example .env

# 2. Editar con valores reales
# (abrir .env en editor y completar)

# 3. El código lee las variables automáticamente
```

### 16.5 Variables del proyecto

| Variable | Uso | Ejemplo |
|----------|-----|---------|
| `SECRET_KEY` | Firmar tokens JWT | `a1b2c3d4...` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `miPassword123` |
| `DB_HOST` | Servidor MySQL | `localhost` |
| `DB_PORT` | Puerto MySQL | `3306` |
| `DB_NAME` | Nombre de la BD | `alojamientos_db` |
| `DB_CHARSET` | Juego de caracteres | `utf8mb4` |
| `JWT_EXP_MINUTES` | Expiración del token | `15` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos | `http://localhost:3000` |

### 16.6 python-dotenv

La librería `python-dotenv` carga las variables del archivo `.env` al entorno de Python:

```python
from dotenv import load_dotenv
load_dotenv()  # Carga .env

import os
SECRET_KEY = os.getenv('SECRET_KEY')
```

---

## 17. Seguridad en APIs

### 17.1 Principios básicos

| Principio | Explicación |
|-----------|-------------|
| **Nunca confíes en el cliente** | Valida siempre los datos de entrada |
| **No expongas datos sensibles** | Nunca devuelvas contraseñas en respuestas |
| **Usa HTTPS en producción** | Cifra la comunicación entre cliente y servidor |
| **Protege secretos** | Usa variables de entorno, nunca hardcodees |

### 17.2 Hashing de contraseñas

**NUNCA almacenes contraseñas en texto plano.** Usa hashing:

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Al registrar: hashear
contrasena_hash = generate_password_hash('miPassword123')
# Resultado: 'scrypt:32768:8:1$abc123...'

# Al hacer login: verificar
es_valida = check_password_hash(contrasena_hash, 'miPassword123')
# Resultado: True o False
```

**¿Por qué hash y no cifrado?**
- El hash es **unidireccional**: no se puede revertir.
- El cifrado es **bidireccional**: se puede descifrar con la clave.
- Para contraseñas, solo necesitas verificar, nunca recuperar.

### 17.3 CORS (Cross-Origin Resource Sharing)

CORS controla qué orígenes (dominios) pueden hacer peticiones a tu API.

```python
CORS(app, origins=[
    'http://localhost:3000',  # Frontend en desarrollo
    'https://miapp.com',      # Frontend en producción
])
```

**Reglas:**
- En desarrollo: permite `localhost`.
- En producción: define explícitamente los orígenes permitidos.
- **NUNCA uses `*` en producción** (permite cualquier origen).

### 17.4 Validación de entrada

Siempre valida lo que recibe el servidor:

```python
# Mal: sin validación
datos = request.get_json()
usuario = Usuario(correo=datos['correo'])

# Bien: con validación
dto = RegistroUsuarioDTO()
datos_validados = dto.load(datos)  # Lanza error si es inválido
usuario = Usuario(correo=datos_validados['correo'])
```

---

## 18. Herramientas del Proyecto

### 18.1 Herramientas de desarrollo

| Herramienta | Para qué sirve |
|-------------|----------------|
| **VS Code** | Editor de código recomendado |
| **Postman** | Probar APIs manualmente |
| **MySQL Workbench** | Administrar base de datos visualmente |
| **Git** | Control de versiones |
| **Terminal** | Ejecutar comandos |

### 18.2 Librerías del proyecto

| Librería | Versión | Uso |
|----------|---------|-----|
| **Flask** | 3.x | Framework web principal |
| **Flask-SQLAlchemy** | 3.x | ORM integrado con Flask |
| **Flask-Migrate** | 4.x | Migraciones de base de datos |
| **Flask-CORS** | 6.x | Control de orígenes cruzados |
| **PyJWT** | 2.x | Generar y validar tokens JWT |
| **PyMySQL** | 1.x | Driver para conectar con MySQL |
| **marshmallow** | 3.x | Validación y serialización de datos |
| **pytest** | 9.x | Framework de pruebas |
| **python-dotenv** | 1.x | Cargar variables de entorno |
| **Werkzeug** | 3.x | Hashing de contraseñas |
| **SQLAlchemy** | 2.x | Motor ORM |

### 18.3 Herramientas de calidad de código (opcionales)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Black** | Formateador automático de código Python |
| **Ruff** | Linter rápido: detecta errores y estilo inconsistente |

### 18.4 Scripts de utilidad

| Script | Para qué sirve |
|--------|----------------|
| `scripts/generate_secret.py` | Generar una `SECRET_KEY` segura |
| `scripts/create_db.py` | Crear la base de datos MySQL |
| `scripts/promover_admin.py` | Promover un usuario a rol admin |

### 18.5 Estructura completa del proyecto

```
alojamientos/
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore                      # Archivos a excluir de Git
├── app.py                          # Punto de entrada
├── requirements.txt                # Dependencias de producción
├── requirements-dev.txt            # Dependencias de desarrollo
├── pytest.ini                      # Configuración de pytest
├── pyproject.toml                  # Configuración de black y ruff
├── app/
│   ├── __init__.py                 # App factory + extensiones
│   ├── config.py                   # Configuración desde .env
│   ├── seguridad.py                # Decoradores de autenticación
│   ├── migrate.py                  # Re-export de migrate
│   └── dominios/
│       ├── usuarios/
│       │   ├── __init__.py
│       │   ├── modelos.py          # Modelos Usuario y PerfilUsuario
│       │   ├── dtos.py             # DTOs de validación
│       │   ├── repositorios.py     # Acceso a datos
│       │   ├── servicios.py        # Lógica de negocio
│       │   └── controladores.py    # Endpoints (Blueprint)
│       ├── alojamientos/
│       │   ├── __init__.py
│       │   ├── modelos.py          # Modelo Alojamiento
│       │   ├── dtos.py
│       │   ├── repositorios.py
│       │   ├── servicios.py
│       │   └── controladores.py
│       └── comodidades/
│           ├── __init__.py
│           ├── modelos.py          # Modelo Comodidad + tabla N:M
│           ├── dtos.py
│           ├── repositorios.py
│           ├── servicios.py
│           └── controladores.py
├── migrations/                     # Migraciones de Alembic
├── scripts/                        # Scripts de utilidad
├── tests/                          # Tests automatizados
├── uploads/                        # Archivos subidos (futuro)
└── docs/                           # Documentación del proyecto
```

---

## Glosario Rápido

| Término | Definición |
|---------|------------|
| **API** | Interfaz que permite comunicación entre sistemas |
| **REST** | Estilo arquitectónico para diseñar APIs |
| **Endpoint** | URL específica que acepta peticiones |
| **JSON** | Formato de datos ligero (JavaScript Object Notation) |
| **HTTP** | Protocolo de comunicación web |
| **ORM** | Mapeo objeto-relacional (BD ↔ objetos Python) |
| **JWT** | Token web JSON para autenticación sin estado |
| **Blueprint** | Módulo de rutas en Flask |
| **DTO** | Objeto de transferencia de datos (validación) |
| **Fixture** | Función que prepara el entorno de testing |
| **Migración** | Script que modifica el esquema de la BD |
| **Hash** | Función unidireccional para proteger contraseñas |
| **CORS** | Control de orígenes cruzados |
| **Factory** | Patrón que crea objetos de forma flexible |
| **Decorador** | Función que envuelve otra para agregar comportamiento |

---

> **Nota:** Este documento es una referencia conceptual. No es necesario dominar todos los temas antes de empezar el Sprint 1. Cada concepto se introduce de forma progresiva a lo largo de los sprints.
