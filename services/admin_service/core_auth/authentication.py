from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.conf import settings
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import requests
import logging

logger = logging.getLogger(__name__)

_JWKS_CACHE = {
    "keys": None,
    "expires_at": datetime.min.replace(tzinfo=timezone.utc),
}

class AuthenticatedPrincipal:
    """Represents the authenticated user or employee."""
    def __init__(self, sub=None, email=None, realm=None, roles=None, claims=None):
        self.subject = sub
        self.email = email
        self.realm = realm
        self.roles = [role.upper() for role in (roles or [])]
        self.claims = claims or {}

    @property
    def is_authenticated(self):
        return True

    def has_role(self, role: str) -> bool:
        return role.upper() in self.roles


class JwtAuthentication(BaseAuthentication):
    """Generic JWT authentication for employees and customers."""
    keyword = "Bearer"

    def authenticate(self, request):
        header = request.headers.get("Authorization")
        if not header:
            return None

        parts = header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            raise exceptions.AuthenticationFailed("Authorization header must contain Bearer token")

        token = parts[1]
        claims = self._decode(token)

        principal = AuthenticatedPrincipal(
            sub=claims.get("sub"),
            email=claims.get("email"),
            realm=claims.get("realm"),
            roles=claims.get("roles", []),
            claims=claims
        )
        return principal, token

    def authenticate_header(self, request):
        return self.keyword

    # Internal helper methods
    def _decode(self, token: str) -> dict:
        keys = self._fetch_jwks()
        jwk_dict = self._select_jwk(token, keys)

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

    def _fetch_jwks(self) -> list[dict]:
        now = datetime.now(tz=timezone.utc)
        ttl = getattr(settings, "AUTH_JWKS_CACHE_SECONDS", 300)

        if _JWKS_CACHE["keys"] and now < _JWKS_CACHE["expires_at"]:
            return _JWKS_CACHE["keys"]

        jwks_url = getattr(settings, "AUTH_SERVICE_JWKS_URL", None)
        if not jwks_url:
            raise exceptions.AuthenticationFailed("JWKS url is not configured")

        try:
            resp = requests.get(jwks_url, timeout=5)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as exc:
            logger.error("Failed to download JWKS from %s", jwks_url, exc_info=True)
            raise exceptions.AuthenticationFailed("Unable to verify access token") from exc

        keys = data.get("keys")
        if not isinstance(keys, list):
            raise exceptions.AuthenticationFailed("Invalid JWKS payload received")

        _JWKS_CACHE["keys"] = keys
        _JWKS_CACHE["expires_at"] = now + timedelta(seconds=ttl)
        return keys

    def _select_jwk(self, token: str, keys: list[dict]) -> dict:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        alg = header.get("alg", "RS256")

        matching = next((k for k in keys if k.get("kid") == kid), None)
        if matching:
            matching.setdefault("alg", alg)
            return matching

        # Refresh cache once more
        _JWKS_CACHE["keys"] = None
        fresh_keys = self._fetch_jwks()
        matching = next((k for k in fresh_keys if k.get("kid") == kid), None)
        if matching:
            matching.setdefault("alg", alg)
            return matching

        raise exceptions.AuthenticationFailed("Token signed with an unknown key")
