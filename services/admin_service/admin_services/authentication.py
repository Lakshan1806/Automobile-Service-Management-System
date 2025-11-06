from __future__ import annotations
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import requests
from django.conf import settings
from jose import jwt
from jose.exceptions import JWTError
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication

logger = logging.getLogger(__name__)


_JWKS_CACHE: dict[str, object] = {
    "keys": None,
    "expires_at": datetime.min.replace(tzinfo=timezone.utc),
}


def _fetch_jwks() -> list[dict]:
    """Fetch JWKS from the authentication service with caching."""
    now = datetime.now(tz=timezone.utc)
    ttl = getattr(settings, "AUTH_JWKS_CACHE_SECONDS", 300)
    if _JWKS_CACHE["keys"] and now < _JWKS_CACHE["expires_at"]:
        return _JWKS_CACHE["keys"]  # type: ignore[return-value]

    jwks_url = getattr(settings, "AUTH_SERVICE_JWKS_URL", None)
    if not jwks_url:
        raise exceptions.AuthenticationFailed("JWKS url is not configured")

    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        logger.error("Failed to download JWKS from %s", jwks_url, exc_info=True)
        raise exceptions.AuthenticationFailed("Unable to verify access token") from exc
    except ValueError as exc:
        logger.error("JWKS response could not be parsed as JSON", exc_info=True)
        raise exceptions.AuthenticationFailed("Invalid JWKS payload received") from exc

    keys = data.get("keys")
    if not isinstance(keys, list):
        logger.error("JWKS response did not include 'keys' array: %s", data)
        raise exceptions.AuthenticationFailed("Invalid JWKS payload received")

    _JWKS_CACHE["keys"] = keys
    _JWKS_CACHE["expires_at"] = now + timedelta(seconds=ttl)
    return keys


def _select_jwk(token: str, keys: list[dict]) -> dict:
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    alg = header.get("alg", "RS256")

    matching = next((key for key in keys if key.get("kid") == kid), None)
    if matching:
        matching.setdefault("alg", alg)
        return matching

    # Cache might be stale (key rotation). Refresh once more.
    _JWKS_CACHE["keys"] = None
    fresh_keys = _fetch_jwks()
    matching = next((key for key in fresh_keys if key.get("kid") == kid), None)
    if matching:
        matching.setdefault("alg", alg)
        return matching

    raise exceptions.AuthenticationFailed("Token signed with an unknown key")


def _decode(token: str) -> dict:
    keys = _fetch_jwks()
    jwk_dict = _select_jwk(token, keys)

    issuer = getattr(settings, "AUTH_SERVICE_ISSUER", None)
    audience = getattr(settings, "AUTH_SERVICE_AUDIENCE", None)
    try:
        return jwt.decode(
            token,
            jwk_dict,
            algorithms=[jwk_dict.get("alg", "RS256")],
            audience=audience,
            issuer=issuer,
            options={"verify_aud": bool(audience)},
        )
    except JWTError as exc:
        logger.debug("Failed to decode JWT: %s", exc, exc_info=True)
        raise exceptions.AuthenticationFailed("Invalid or expired access token") from exc


@dataclass
class AuthenticatedPrincipal:
    subject: Optional[str]
    email: Optional[str]
    realm: Optional[str]
    roles: list[str]
    claims: dict

    @property
    def is_authenticated(self) -> bool:  # pragma: no cover - simple property
        return True

    def has_role(self, role: str) -> bool:
        return role.upper() in self.roles


class JwtEmployeeAuthentication(BaseAuthentication):
    """Authenticate requests using RS256 JWTs minted by the authentication service."""

    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[AuthenticatedPrincipal, str]]:
        header = request.headers.get("Authorization")
        if not header:
            return None

        parts = header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            raise exceptions.AuthenticationFailed("Authorization header must contain Bearer token")

        token = parts[1]
        claims = _decode(token)

        principal = AuthenticatedPrincipal(
            subject=claims.get("sub"),
            email=claims.get("email"),
            realm=claims.get("realm"),
            roles=[role.upper() for role in claims.get("roles", [])],
            claims=claims,
        )
        return principal, token

    def authenticate_header(self, request) -> str:
        return self.keyword
    
class JwtCustomerAuthentication(BaseAuthentication):
    """Authenticate requests using RS256 JWTs for customer/user realm."""

    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[AuthenticatedPrincipal, str]]:
        header = request.headers.get("Authorization")
        if not header:
            return None

        parts = header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            raise exceptions.AuthenticationFailed("Authorization header must contain Bearer token")

        token = parts[1]
        claims = _decode(token)

        # Ensure it's a user token (not employee)
        if claims.get("realm") != "customers":
            raise exceptions.AuthenticationFailed("Token not issued for user realm")

        principal = AuthenticatedPrincipal(
            subject=claims.get("sub"),
            email=claims.get("email"),
            realm=claims.get("realm"),
            roles=[role.upper() for role in claims.get("roles", [])],
            claims=claims,
        )
        return principal, token

    def authenticate_header(self, request) -> str:
        return self.keyword

