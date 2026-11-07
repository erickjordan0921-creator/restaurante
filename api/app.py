from app import crear_app

# Creamos la aplicacion
app = crear_app()

if __name__ == "__main__":
    # Modo debug para reinicio automatico al guardar cambios
    app.run(debug=True, port=5000)
