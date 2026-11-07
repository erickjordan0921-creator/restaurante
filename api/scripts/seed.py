"""
Carga los datos de ejemplo de SINU (usuarios, insumos, lotes y platos).

ATENCION: es una accion destructiva. Borra todas las tablas y las vuelve a crear.
Por eso pide confirmacion escribiendo SI (o se puede pasar --si).

Uso (desde la carpeta api/):
    python scripts/seed.py
    python scripts/seed.py --si
"""

import os
import sys

# Permite ejecutar el script desde api/ sin instalar el paquete
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import crear_app  # noqa: E402
from app.semilla import cargar_datos_ejemplo  # noqa: E402


def main():
    if "--si" not in sys.argv:
        respuesta = input(
            "Esto BORRARA todos los datos (pedidos, inventario, platos) y cargara los de ejemplo.\n"
            "Escriba SI para continuar: "
        )
        if respuesta.strip().upper() != "SI":
            print("Cancelado. No se modifico nada.")
            return

    app = crear_app()
    with app.app_context():
        servicios = app.extensions["sinu_servicios"]
        cargar_datos_ejemplo(servicios["inventario"], servicios["platos"])
        # Deja la tabla de versiones de Alembic al dia para que `flask db upgrade` no falle
        from flask_migrate import stamp

        stamp()
    print("Datos de ejemplo cargados. Usuarios: admin / admin123 y mesero / mesero123")


if __name__ == "__main__":
    main()
