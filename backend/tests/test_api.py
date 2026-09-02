"""
Backend test suite.

Run with:
    pytest

Uses an isolated on-disk SQLite file (test_pizza_delivery.db) that is created
fresh and torn down for every test, so it never touches your real dev database.
"""
import os
import sys

os.environ["DATABASE_URL"] = "sqlite:///./test_pizza_delivery.db"

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient

from database import Base, engine
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def signup(username="john", is_staff=False):
    return client.post(
        "/auth/signup",
        json={
            "username": username,
            "email": f"{username}@test.com",
            "password": "password123",
            "is_staff": is_staff,
            "is_active": True,
        },
    )


def login(username="john", password="password123"):
    resp = client.post("/auth/login", json={"username": username, "password": password})
    return resp.json()["access"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_signup_and_login():
    resp = signup()
    assert resp.status_code == 201
    assert resp.json()["username"] == "john"

    token = login()
    assert token


def test_duplicate_signup_rejected():
    signup()
    resp = signup()
    assert resp.status_code == 400


def test_login_wrong_password_rejected():
    signup()
    resp = client.post("/auth/login", json={"username": "john", "password": "wrong"})
    assert resp.status_code == 400


def test_place_order_requires_auth():
    resp = client.post("/orders/order", json={"quantity": 1, "pizza_size": "SMALL"})
    assert resp.status_code == 401


def test_place_and_fetch_order():
    signup()
    token = login()

    resp = client.post(
        "/orders/order",
        json={"quantity": 2, "pizza_size": "LARGE"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["total_price"] == 26.0  # 2 * 13.00
    assert body["order_status"] == "PENDING"

    resp = client.get("/orders/user/orders", headers=auth_headers(token))
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_user_cannot_access_other_users_order():
    signup("john")
    signup("mary")
    john_token = login("john")
    mary_token = login("mary")

    order_id = client.post(
        "/orders/order", json={"quantity": 1, "pizza_size": "SMALL"}, headers=auth_headers(john_token)
    ).json()["id"]

    resp = client.put(
        f"/orders/order/update/{order_id}",
        json={"quantity": 5, "pizza_size": "LARGE"},
        headers=auth_headers(mary_token),
    )
    assert resp.status_code == 401


def test_non_staff_cannot_list_all_orders():
    signup("john")
    token = login("john")

    resp = client.get("/orders/orders", headers=auth_headers(token))
    assert resp.status_code == 401


def test_staff_can_list_and_update_status():
    signup("john", is_staff=False)
    signup("admin", is_staff=True)
    john_token = login("john")
    admin_token = login("admin")

    order_id = client.post(
        "/orders/order", json={"quantity": 1, "pizza_size": "MEDIUM"}, headers=auth_headers(john_token)
    ).json()["id"]

    resp = client.get("/orders/orders", headers=auth_headers(admin_token))
    assert resp.status_code == 200
    assert resp.json()["total"] == 1

    resp = client.patch(
        f"/orders/order/update/{order_id}",
        json={"order_status": "IN-TRANSIT"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200
    assert resp.json()["order_status"] == "IN-TRANSIT"


def test_cannot_edit_non_pending_order():
    signup("john")
    signup("admin", is_staff=True)
    john_token = login("john")
    admin_token = login("admin")

    order_id = client.post(
        "/orders/order", json={"quantity": 1, "pizza_size": "SMALL"}, headers=auth_headers(john_token)
    ).json()["id"]

    client.patch(
        f"/orders/order/update/{order_id}",
        json={"order_status": "DELIVERED"},
        headers=auth_headers(admin_token),
    )

    resp = client.put(
        f"/orders/order/update/{order_id}",
        json={"quantity": 3, "pizza_size": "LARGE"},
        headers=auth_headers(john_token),
    )
    assert resp.status_code == 400


def test_change_password():
    signup("john")
    token = login("john")

    resp = client.post(
        "/auth/change-password",
        json={"current_password": "password123", "new_password": "newpassword456"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 200

    # old password no longer works, new one does
    assert client.post("/auth/login", json={"username": "john", "password": "password123"}).status_code == 400
    assert client.post("/auth/login", json={"username": "john", "password": "newpassword456"}).status_code == 200
