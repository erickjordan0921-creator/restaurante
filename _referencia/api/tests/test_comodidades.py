import json


class TestComodidades:
    """Pruebas de integracion para el dominio de comodidades y relacion N:M."""

    def test_crear_comodidad_con_admin(self, client, admin_auth):
        """Crear comodidad con admin debe responder 201."""
        resp = client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Wifi",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos["success"] is True
        assert datos["data"]["nombre"] == "Wifi"

    def test_crear_comodidad_con_usuario_normal(self, client, usuario_auth):
        """Crear comodidad con usuario normal debe responder 403."""
        resp = client.post(
            "/api/v1/comodidades",
            headers=usuario_auth,
            json={
                "nombre": "Piscina",
            },
        )
        assert resp.status_code == 403

    def test_crear_comodidad_nombre_duplicado(self, client, admin_auth):
        """Crear comodidad con nombre duplicado debe responder 400."""
        # Primero crear
        client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Estacionamiento",
            },
        )
        # Intentar duplicar
        resp = client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Estacionamiento",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos["success"] is False

    def test_listar_comodidades_sin_auth(self, client):
        """Listar comodidades sin auth debe responder 200."""
        resp = client.get("/api/v1/comodidades")
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert isinstance(datos["data"], list)

    def test_asignar_comodidades_a_alojamiento_propio(self, client, usuario_auth, admin_auth):
        """Asignar comodidades a alojamiento propio debe responder 200."""
        # Crear comodidad como admin
        r1 = client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Cocina",
            },
        )
        d1 = json.loads(r1.data)
        comodidad_id = d1["data"]["id"]

        # Crear alojamiento con usuario normal
        r2 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Mi Casa",
                "descripcion": "Bonita casa",
                "precio_noche": 50.0,
                "ciudad": "Medellin",
            },
        )
        d2 = json.loads(r2.data)
        alojamiento_id = d2["data"]["id"]

        # Asignar comodidad como propietario
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}/comodidades",
            headers=usuario_auth,
            json={
                "comodidades_ids": [comodidad_id],
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert len(datos["data"]["comodidades"]) == 1

    def test_asignar_comodidades_a_alojamiento_ajeno(
        self, client, usuario_auth, usuario_auth2, admin_auth
    ):
        """Asignar comodidades a alojamiento ajeno con usuario normal debe responder 403."""
        # Crear comodidad como admin
        r1 = client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Piscina S5",
            },
        )
        d1 = json.loads(r1.data)
        comodidad_id = d1["data"]["id"]

        # Usuario 1 crea alojamiento
        r2 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Casa Ajena",
                "descripcion": "No es tuya",
                "precio_noche": 80.0,
                "ciudad": "Bogota",
            },
        )
        d2 = json.loads(r2.data)
        alojamiento_id = d2["data"]["id"]

        # Usuario 2 intenta asignar
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}/comodidades",
            headers=usuario_auth2,
            json={
                "comodidades_ids": [comodidad_id],
            },
        )
        assert resp.status_code == 403

    def test_asignar_comodidades_con_id_inexistente(self, client, usuario_auth):
        """Asignar comodidades con ID inexistente debe responder 400."""
        # Crear alojamiento propio
        r1 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Casa Prueba",
                "descripcion": "Para test",
                "precio_noche": 30.0,
                "ciudad": "Lima",
            },
        )
        d1 = json.loads(r1.data)
        alojamiento_id = d1["data"]["id"]

        # Intentar asignar comodidad inexistente
        resp = client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}/comodidades",
            headers=usuario_auth,
            json={
                "comodidades_ids": [99999],
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos["success"] is False

    def test_detalle_alojamiento_incluye_comodidades(self, client, usuario_auth, admin_auth):
        """Detalle de alojamiento debe incluir comodidades asignadas."""
        # Crear comodidad como admin
        r1 = client.post(
            "/api/v1/comodidades",
            headers=admin_auth,
            json={
                "nombre": "Aire Acondicionado",
            },
        )
        d1 = json.loads(r1.data)
        comodidad_id = d1["data"]["id"]

        # Crear alojamiento
        r2 = client.post(
            "/api/v1/alojamientos",
            headers=usuario_auth,
            json={
                "titulo": "Suite Premium",
                "descripcion": "Con aire",
                "precio_noche": 120.0,
                "ciudad": "Quito",
            },
        )
        d2 = json.loads(r2.data)
        alojamiento_id = d2["data"]["id"]

        # Asignar comodidad
        client.patch(
            f"/api/v1/alojamientos/{alojamiento_id}/comodidades",
            headers=usuario_auth,
            json={
                "comodidades_ids": [comodidad_id],
            },
        )

        # Verificar que el detalle incluye comodidades
        resp = client.get(f"/api/v1/alojamientos/{alojamiento_id}")
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert "comodidades" in datos["data"]
        assert isinstance(datos["data"]["comodidades"], list)
        assert len(datos["data"]["comodidades"]) == 1
        assert datos["data"]["comodidades"][0]["nombre"] == "Aire Acondicionado"
