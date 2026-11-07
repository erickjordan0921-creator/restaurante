import json


class TestAlojamientos:
    """Pruebas de integracion para el dominio de alojamientos."""

    def test_crear_alojamiento_con_auth(self, client, usuario_auth):
        """Crear alojamiento con usuario autenticado debe responder 201."""
        resp = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Cabaña Andina",
                "descripcion": "Vista al volcan",
                "precio_noche": 85.50,
                "ciudad": "Quito",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos["success"] is True
        assert datos["data"]["titulo"] == "Cabaña Andina"
        assert datos["data"]["ciudad"] == "Quito"

    def test_crear_alojamiento_sin_token(self, client):
        """Crear alojamiento sin token debe responder 401."""
        resp = client.post(
            "/api/v1/alojamientos",
            json={
                "titulo": "Cabaña Andina",
                "descripcion": "Vista al volcan",
                "precio_noche": 85.50,
                "ciudad": "Quito",
            },
        )
        assert resp.status_code == 401

    def test_listar_alojamientos_sin_auth(self, client):
        """Listar alojamientos sin auth debe responder 200."""
        resp = client.get("/api/v1/alojamientos")
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert isinstance(datos["data"], list)

    def test_detalle_alojamiento_sin_auth(self, client, usuario_auth):
        """Ver detalle sin auth debe responder 200."""
        # Primero crear un alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Detalle Test",
                "descripcion": "Para prueba",
                "precio_noche": 50.0,
                "ciudad": "Lima",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        resp = client.get(f"/api/v1/alojamientos/{alojamiento_id}")
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert datos["data"]["titulo"] == "Detalle Test"

    def test_detalle_inexistente(self, client):
        """Detalle de alojamiento inexistente debe responder 404."""
        resp = client.get("/api/v1/alojamientos/99999")
        datos = json.loads(resp.data)

        assert resp.status_code == 404
        assert datos["success"] is False

    def test_actualizar_ajeno_usuario_normal(self, client, usuario_auth, usuario_auth2):
        """Actualizar alojamiento ajeno con usuario normal debe responder 403."""
        # Primer usuario crea alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Propiedad Ajena",
                "descripcion": "No tocar",
                "precio_noche": 100.0,
                "ciudad": "Bogota",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Segundo usuario intenta actualizar
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}",
            headers=usuario_auth2,
            json={
                "titulo": "Hackeado",
            },
        )
        assert resp.status_code == 403

    def test_eliminar_ajeno_usuario_normal(self, client, usuario_auth, usuario_auth2):
        """Eliminar alojamiento ajeno con usuario normal debe responder 403."""
        # Primer usuario crea alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Propiedad Ajena 2",
                "descripcion": "No eliminar",
                "precio_noche": 75.0,
                "ciudad": "Medellin",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Segundo usuario intenta eliminar
        resp = client.delete(f"/api/v1/alojamientos/{alojamiento_id}", headers=usuario_auth2)
        assert resp.status_code == 403

    def test_actualizar_propio(self, client, usuario_auth):
        """Actualizar alojamiento propio debe responder 200."""
        # Crear alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Mi Alojamiento",
                "descripcion": "Original",
                "precio_noche": 60.0,
                "ciudad": "Santiago",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Actualizar
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}",
            headers=usuario_auth,
            json={
                "titulo": "Mi Alojamiento Editado",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["data"]["titulo"] == "Mi Alojamiento Editado"
        assert datos["data"]["descripcion"] == "Original"  # No cambia

    def test_eliminar_propio(self, client, usuario_auth):
        """Eliminar alojamiento propio debe responder 204."""
        # Crear alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Para Eliminar",
                "descripcion": "Temporal",
                "precio_noche": 40.0,
                "ciudad": "Buenos Aires",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Eliminar
        resp = client.delete(f"/api/v1/alojamientos/{alojamiento_id}", headers=usuario_auth)
        assert resp.status_code == 204

        # Verificar que ya no existe
        resp2 = client.get(f"/api/v1/alojamientos/{alojamiento_id}")
        assert resp2.status_code == 404

    def test_admin_actualiza_ajeno(self, client, admin_auth, usuario_auth):
        """Admin puede actualizar alojamiento ajeno → 200."""
        # Usuario normal crea alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Propiedad de Usuario",
                "descripcion": "Admin va a editar",
                "precio_noche": 90.0,
                "ciudad": "Caracas",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Admin edita
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}",
            headers=admin_auth,
            json={
                "titulo": "Editado por Admin",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["data"]["titulo"] == "Editado por Admin"

    def test_admin_elimina_ajeno(self, client, admin_auth, usuario_auth):
        """Admin puede eliminar alojamiento ajeno → 204."""
        # Usuario normal crea alojamiento
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Propiedad para Eliminar",
                "descripcion": "Admin va a eliminar",
                "precio_noche": 120.0,
                "ciudad": "Panama",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Admin elimina
        resp = client.delete(f"/api/v1/alojamientos/{alojamiento_id}", headers=admin_auth)
        assert resp.status_code == 204

        # Verificar que ya no existe
        resp2 = client.get(f"/api/v1/alojamientos/{alojamiento_id}")
        assert resp2.status_code == 404
