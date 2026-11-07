import json


class TestRegistroUsuario:
    """Pruebas de integracion para registro de usuarios."""

    def test_registro_exitoso(self, client):
        """Registro con datos validos debe crear usuario y responder 201."""
        resp = client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "nuevo@ejemplo.com",
                "contrasena": "123456",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 201
        assert datos["success"] is True
        assert datos["data"]["correo"] == "nuevo@ejemplo.com"

    def test_email_duplicado(self, client):
        """Registro con email ya existente debe responder 400."""
        # Primer registro
        client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "duplicado@ejemplo.com",
                "contrasena": "123456",
            },
        )

        # Intento duplicado
        resp = client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "duplicado@ejemplo.com",
                "contrasena": "654321",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos["success"] is False

    def test_contrasena_corta(self, client):
        """Contrasena menor a 6 caracteres debe responder 400."""
        resp = client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "corto@ejemplo.com",
                "contrasena": "123",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos["success"] is False

    def test_email_invalido(self, client):
        """Correo sin formato de email debe responder 400."""
        resp = client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "no-es-email",
                "contrasena": "123456",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 400
        assert datos["success"] is False


class TestLogin:
    """Pruebas de integracion para login de usuarios."""

    def test_login_exitoso(self, client):
        """Login con credenciales validas debe devolver token JWT."""
        # Registrar usuario primero
        client.post(
            "/api/v1/usuarios/registro",
            json={
                "correo": "login@ejemplo.com",
                "contrasena": "123456",
            },
        )

        resp = client.post(
            "/api/v1/usuarios/login",
            json={
                "correo": "login@ejemplo.com",
                "contrasena": "123456",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert "access_token" in datos["data"]

    def test_credenciales_invalidas(self, client):
        """Login con contrasena incorrecta debe responder 401."""
        resp = client.post(
            "/api/v1/usuarios/login",
            json={
                "correo": "noexiste@ejemplo.com",
                "contrasena": "wrong",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 401
        assert datos["success"] is False

    def test_usuario_no_existente(self, client):
        """Login con usuario inexistente debe responder 401."""
        resp = client.post(
            "/api/v1/usuarios/login",
            json={
                "correo": "fantasma@ejemplo.com",
                "contrasena": "123456",
            },
        )

        assert resp.status_code == 401


class TestPerfil:
    """Pruebas de integracion para consulta y actualizacion de perfil."""

    def test_perfil_sin_token(self, client):
        """GET /perfil sin token debe responder 401."""
        resp = client.get("/api/v1/usuarios/perfil")
        assert resp.status_code == 401

    def test_perfil_con_token(self, client, usuario_auth):
        """GET /perfil con token valido debe responder 200."""
        resp = client.get("/api/v1/usuarios/perfil", headers=usuario_auth)
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True

    def test_actualizar_perfil(self, client, usuario_auth):
        """PATCH /perfil con token debe actualizar parcialmente."""
        resp = client.patch(
            "/api/v1/usuarios/perfil",
            headers=usuario_auth,
            json={
                "nombre": "Juan",
                "apellido": "Perez",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert datos["data"]["nombre"] == "Juan"

    def test_actualizacion_parcial(self, client, usuario_auth):
        """PATCH /perfil con un solo campo debe actualizar solo ese campo."""
        # Establecer estado inicial dentro del propio test
        r1 = client.patch(
            "/api/v1/usuarios/perfil",
            headers=usuario_auth,
            json={
                "nombre": "Maria",
                "apellido": "Lopez",
            },
        )
        assert r1.status_code == 200

        # Actualizar solo el telefono
        resp = client.patch(
            "/api/v1/usuarios/perfil",
            headers=usuario_auth,
            json={
                "telefono": "+34600111222",
            },
        )
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["data"]["telefono"] == "+34600111222"
        # Los campos establecidos antes no se borran
        assert datos["data"]["nombre"] == "Maria"
        assert datos["data"]["apellido"] == "Lopez"


class TestAutorizacionAdmin:
    """Pruebas de autorizacion para endpoints de administrador."""

    def test_admin_sin_token(self, client):
        """GET /admin/usuarios sin token debe responder 401."""
        resp = client.get("/api/v1/admin/usuarios")
        assert resp.status_code == 401

    def test_admin_con_usuario_normal(self, client, usuario_auth):
        """GET /admin/usuarios con usuario normal debe responder 403."""
        resp = client.get("/api/v1/admin/usuarios", headers=usuario_auth)
        assert resp.status_code == 403

    def test_admin_con_admin(self, client, admin_auth):
        """GET /admin/usuarios con admin debe responder 200 con lista."""
        resp = client.get("/api/v1/admin/usuarios", headers=admin_auth)
        datos = json.loads(resp.data)

        assert resp.status_code == 200
        assert datos["success"] is True
        assert isinstance(datos["data"], list)
        # Verificar que no se exponen contrasenas
        for usuario in datos["data"]:
            assert "contrasena" not in usuario
