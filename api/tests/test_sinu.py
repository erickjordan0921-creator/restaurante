"""Pruebas del flujo principal: login por rol, FEFO, estados del pedido y alertas."""

API = "/api/v1"


def _plato_id(client, headers, nombre):
    menu = client.get(f"{API}/platos", headers=headers).get_json()["data"]
    return next(f["plato"]["id"] for f in menu if f["plato"]["nombre"] == nombre)


def _insumo(client, admin, nombre):
    filas = client.get(f"{API}/insumos", headers=admin).get_json()["data"]
    return next(f for f in filas if f["insumo"]["nombre"] == nombre)


# ---------------- Autenticacion y roles ----------------


def test_login_devuelve_token_y_rol(client):
    resp = client.post(f"{API}/usuarios/login", json={"usuario": "mesero", "contrasena": "mesero123"})
    assert resp.status_code == 200
    assert resp.get_json()["data"]["usuario"]["rol"] == "mesero"


def test_login_invalido(client):
    resp = client.post(f"{API}/usuarios/login", json={"usuario": "admin", "contrasena": "x"})
    assert resp.status_code == 401


def test_mesero_no_accede_a_inventario(client, mesero):
    assert client.get(f"{API}/insumos", headers=mesero).status_code == 403
    assert client.get(f"{API}/tablero/resumen", headers=mesero).status_code == 403


def test_sin_token(client):
    assert client.get(f"{API}/mesas").status_code == 401


# ---------------- Inventario ----------------


def test_stock_excluye_lotes_vencidos(client, admin):
    # Calamar: 1,5 kg vencido + 4 kg vigente -> disponible 4, vencido 1,5
    calamar = _insumo(client, admin, "Calamar")
    assert calamar["disponible"] == 4
    assert calamar["vencido"] == 1.5


def test_crud_insumo(client, admin):
    resp = client.post(
        f"{API}/insumos",
        headers=admin,
        json={"nombre": "Pargo rojo", "unidad": "kg", "stock_minimo": 2, "dias_alerta": None},
    )
    assert resp.status_code == 201
    insumo_id = resp.get_json()["data"]["id"]

    dup = client.post(
        f"{API}/insumos", headers=admin, json={"nombre": "pargo rojo", "unidad": "kg", "stock_minimo": 1}
    )
    assert dup.status_code == 409

    assert client.delete(f"{API}/insumos/{insumo_id}", headers=admin).status_code == 204


def test_no_elimina_insumo_en_receta(client, admin):
    arroz = _insumo(client, admin, "Arroz")
    lotes = client.get(f"{API}/lotes?todos=1", headers=admin).get_json()["data"]
    assert any(l["insumo_id"] == arroz["insumo"]["id"] for l in lotes)
    assert client.delete(f"{API}/insumos/{arroz['insumo']['id']}", headers=admin).status_code == 409


# ---------------- Pedidos y FEFO ----------------


def test_pedido_consume_fefo_y_cancelar_devuelve(client, admin, mesero):
    # Mojarra usa 0,5 kg de pescado; el lote que vence primero (4 kg, vence en 1 dia) debe bajar
    plato = _plato_id(client, mesero, "Mojarra frita con patacón")
    resp = client.post(
        f"{API}/pedidos", headers=mesero, json={"mesa": "3", "items": [{"plato_id": plato, "cantidad": 2}]}
    )
    assert resp.status_code == 201
    pedido = resp.get_json()["data"]
    assert pedido["total"] == 70000

    lotes = client.get(f"{API}/lotes", headers=admin).get_json()["data"]
    pescado = [l for l in lotes if l["insumo"] == "Pescado blanco"]
    assert pescado[0]["cantidad_actual"] == 3  # 4 - 1 (FEFO)
    assert pescado[1]["cantidad_actual"] == 8  # intacto

    mesas = client.get(f"{API}/mesas", headers=mesero).get_json()["data"]
    assert mesas[2]["estado"] == "ocupada"

    resp = client.patch(f"{API}/pedidos/{pedido['id']}/cancelar", headers=mesero)
    assert resp.get_json()["data"]["stock_devuelto"] is True
    assert _insumo(client, admin, "Pescado blanco")["disponible"] == 12


def test_pedido_sin_stock_es_rechazado(client, mesero):
    plato = _plato_id(client, mesero, "Filete en salsa de coco")  # leche de coco vencida
    resp = client.post(
        f"{API}/pedidos", headers=mesero, json={"mesa": "1", "items": [{"plato_id": plato, "cantidad": 1}]}
    )
    assert resp.status_code == 409


def test_flujo_estados_y_alerta(client, admin, mesero):
    # 8 calamares apanados = 2 kg de calamar -> quedan 2 kg = minimo -> alerta "stock bajo"
    plato = _plato_id(client, mesero, "Calamares apanados")
    pedido = client.post(
        f"{API}/pedidos", headers=mesero, json={"mesa": "3", "items": [{"plato_id": plato, "cantidad": 8}]}
    ).get_json()["data"]

    cola = client.get(f"{API}/pedidos/cocina", headers=admin).get_json()["data"]
    assert cola[0]["pedido"]["id"] == pedido["id"]

    # El mesero no puede mover la cocina
    assert client.patch(f"{API}/pedidos/{pedido['id']}/avanzar", headers=mesero).status_code == 403

    for esperado in ("en preparación", "listo"):
        resp = client.patch(f"{API}/pedidos/{pedido['id']}/avanzar", headers=admin)
        assert resp.get_json()["data"]["estado"] == esperado

    mesas = client.get(f"{API}/mesas", headers=mesero).get_json()["data"]
    assert mesas[2]["estado"] == "lista"

    alertas = client.get(f"{API}/alertas", headers=mesero).get_json()["data"]
    assert any(a["tipo"] == "stock-bajo" and "Calamar" in a["mensaje"] for a in alertas)

    resumen = client.get(f"{API}/tablero/resumen", headers=admin).get_json()["data"]
    assert resumen["ventas_hoy"] == {"total": 240000, "cantidad": 1}

    # El mesero entrega y libera la mesa
    assert client.patch(f"{API}/pedidos/{pedido['id']}/avanzar", headers=mesero).status_code == 200
    assert client.post(f"{API}/mesas/3/liberar", headers=mesero).status_code == 200
