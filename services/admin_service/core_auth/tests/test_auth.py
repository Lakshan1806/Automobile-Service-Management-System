import pytest
from unittest.mock import patch
from rest_framework.test import APIRequestFactory
from rest_framework import exceptions
import requests
from core_auth.authentication import JwtAuthentication, AuthenticatedPrincipal
from core_auth.permissions import HasRealmAndRole

# -----------------------------
# Fixtures
# -----------------------------
@pytest.fixture
def factory():
    return APIRequestFactory()


@pytest.fixture
def dummy_jwt_claims():
    return {
        "sub": "123",
        "email": "user@example.com",
        "realm": "employees",
        "roles": ["ADMIN"],
    }

# -----------------------------
# JWT Authentication Tests
# -----------------------------
def test_authenticate_valid_token(factory, dummy_jwt_claims):
    request = factory.get("/dummy", HTTP_AUTHORIZATION="Bearer validtoken")

    auth = JwtAuthentication()

    # Patch _decode to return our dummy claims
    with patch.object(JwtAuthentication, "_decode", return_value=dummy_jwt_claims):
        principal, token = auth.authenticate(request)

    assert principal.subject == "123"
    assert principal.email == "user@example.com"
    assert principal.realm == "employees"
    assert "ADMIN" in principal.roles
    assert token == "validtoken"


def test_authenticate_missing_header(factory):
    request = factory.get("/dummy")
    auth = JwtAuthentication()
    result = auth.authenticate(request)
    assert result is None


def test_authenticate_invalid_header(factory):
    request = factory.get("/dummy", HTTP_AUTHORIZATION="InvalidHeader")
    auth = JwtAuthentication()
    with pytest.raises(exceptions.AuthenticationFailed):
        auth.authenticate(request)


def test_authenticated_principal_has_role():
    principal = AuthenticatedPrincipal(sub="1", roles=["admin", "manager"])
    assert principal.has_role("ADMIN")
    assert principal.has_role("manager")
    assert not principal.has_role("customer")


# -----------------------------
# HasRealmAndRole Permission Tests
# -----------------------------
class DummyUser:
    def __init__(self, roles=None, realm=None):
        self.roles = roles or []
        self.realm = realm
        self.is_authenticated = True


class DummyView:
    def __init__(self, roles=("ADMIN",), realm="employees"):
        self.required_roles = roles
        self.required_realm = realm


def test_permission_allows():
    user = DummyUser(roles=["ADMIN"], realm="employees")
    view = DummyView(roles=("ADMIN",), realm="employees")
    perm = HasRealmAndRole()
    request = type("Req", (), {"user": user})()
    assert perm.has_permission(request, view)


def test_permission_denies_wrong_role():
    user = DummyUser(roles=["MANAGER"], realm="employees")
    view = DummyView(roles=("ADMIN",), realm="employees")
    perm = HasRealmAndRole()
    request = type("Req", (), {"user": user})()
    assert not perm.has_permission(request, view)


def test_permission_denies_wrong_realm():
    user = DummyUser(roles=["ADMIN"], realm="customers")
    view = DummyView(roles=("ADMIN",), realm="employees")
    perm = HasRealmAndRole()
    request = type("Req", (), {"user": user})()
    assert not perm.has_permission(request, view)


def test_permission_denies_unauthenticated():
    user = type("User", (), {"is_authenticated": False})()
    view = DummyView()
    perm = HasRealmAndRole()
    request = type("Req", (), {"user": user})()
    assert not perm.has_permission(request, view)


# -----------------------------
# JWKS fetch / select helpers
# -----------------------------
@patch("core_auth.authentication.requests.get")
def test_fetch_jwks_failure(mock_get):
    auth = JwtAuthentication()
    mock_get.side_effect = requests.ConnectionError("Network error")  # <--- Use RequestException subclass

    with pytest.raises(exceptions.AuthenticationFailed):
        auth._fetch_jwks()

