"""Datos de ejemplo del gastrobar, tomados de DatosEjemplo en sinu-control-f.html.

Las fechas de los lotes son relativas a HOY para que siempre haya lotes
vencidos, por vencer y vigentes al hacer la demostracion.
"""

from datetime import timedelta

from werkzeug.security import generate_password_hash

from app import db
from app.dominios.usuarios.modelos import Usuario
from app.utilidades import hoy

USUARIOS = [
    # usuario, contrasena, rol, nombre (mismas credenciales del HTML original)
    ("admin", "admin123", "admin", "Administrador"),
    ("mesero", "mesero123", "mesero", "Mesero"),
]

# nombre, unidad, stock minimo, dias de alerta
INSUMOS = [
    ("Pescado blanco", "kg", 5, 2),
    ("Camarón", "kg", 3, 2),
    ("Calamar", "kg", 2, 2),
    ("Arroz", "kg", 5, 30),
    ("Plátano verde", "unidad", 10, 3),
    ("Limón", "unidad", 20, 3),
    ("Aceite", "l", 3, 15),
    ("Cebolla morada", "kg", 2, 4),
    ("Leche de coco", "l", 2, 5),
    ("Cilantro", "kg", 0.5, 2),
]

# insumo, cantidad, dias de ingreso (relativo a hoy), dias de vencimiento
LOTES = [
    ("Pescado blanco", 4, -2, 1),
    ("Pescado blanco", 8, -1, 12),
    ("Camarón", 4, -2, 2),
    ("Camarón", 5, -1, 12),
    ("Calamar", 1.5, -8, -1),
    ("Calamar", 4, -1, 12),
    ("Arroz", 20, -10, 180),
    ("Plátano verde", 30, -2, 12),
    ("Limón", 25, -3, 3),
    ("Limón", 50, -1, 15),
    ("Aceite", 10, -20, 200),
    ("Cebolla morada", 6, -2, 12),
    ("Leche de coco", 2, -30, -1),
    ("Cilantro", 0.5, -1, 1),
    ("Cilantro", 0.6, 0, 8),
]

# nombre, precio COP, receta [(insumo, cantidad por plato)]
PLATOS = [
    ("Mojarra frita con patacón", 35000,
     [("Pescado blanco", 0.5), ("Plátano verde", 2), ("Limón", 1), ("Aceite", 0.15)]),
    ("Arroz con camarones", 38000,
     [("Arroz", 0.2), ("Camarón", 0.2), ("Cebolla morada", 0.05), ("Aceite", 0.03)]),
    ("Ceviche de camarón", 32000,
     [("Camarón", 0.18), ("Limón", 3), ("Cebolla morada", 0.06), ("Cilantro", 0.02)]),
    ("Cazuela de mariscos", 45000,
     [("Pescado blanco", 0.2), ("Camarón", 0.15), ("Calamar", 0.15),
      ("Cebolla morada", 0.05), ("Arroz", 0.15)]),
    ("Calamares apanados", 30000, [("Calamar", 0.25), ("Aceite", 0.1), ("Limón", 1)]),
    ("Filete en salsa de coco", 42000,
     [("Pescado blanco", 0.3), ("Leche de coco", 0.2), ("Arroz", 0.15), ("Plátano verde", 1)]),
]


def cargar_datos_ejemplo(inventario, platos):
    """Borra TODAS las tablas y carga los datos de ejemplo. Usa los servicios publicos."""
    db.drop_all()
    db.create_all()

    for usuario, clave, rol, nombre in USUARIOS:
        db.session.add(
            Usuario(usuario=usuario, contrasena=generate_password_hash(clave), rol=rol, nombre=nombre)
        )
    db.session.commit()

    ids = {}
    for nombre, unidad, minimo, dias in INSUMOS:
        insumo = inventario.guardar_insumo(
            {"nombre": nombre, "unidad": unidad, "stock_minimo": minimo, "dias_alerta": dias}
        )
        ids[nombre] = insumo.id

    base = hoy()
    for nombre, cantidad, ingreso, vence in LOTES:
        inventario.ingresar_lote(
            {
                "insumo_id": ids[nombre],
                "cantidad": cantidad,
                "fecha_ingreso": base + timedelta(days=ingreso),
                "fecha_vencimiento": base + timedelta(days=vence),
            },
            usuario="Datos de ejemplo",
        )

    for nombre, precio, receta in PLATOS:
        platos.guardar(
            {
                "nombre": nombre,
                "precio": precio,
                "activo": True,
                "receta": [{"insumo_id": ids[i], "cantidad": c} for i, c in receta],
            }
        )
