package com.example.authservice.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public class TokenProperties {

    /**
     * Issuer claim (`iss`) that appears in the issued access tokens.
     */
    private String issuer = "http://localhost:8080";

    /**
     * Audience claim (`aud`) that every resource server validates.
     */
    private String audience = "myco-apis";

    /**
     * Lifetime for issued tokens. Requirement: 15-60 minutes. Default: 30 minutes.
     */
    private Duration ttl = Duration.ofMinutes(30);

    /**
     * RSA key size to use when generating new key pairs.
     */
    private int keySize = 4096;

    /**
     * Maximum number of JWKS entries to keep published. Allows old+new keys during rotation.
     */
    private int maxPublishedKeys = 2;

    // HttpOnly cookie settings for customer JWT
    private String cookieName = "customer_access_token";
    private String cookiePath = "/";
    private String cookieDomain; // optional; omit for host-only (recommended for localhost)
    private String cookieSameSite = "Lax"; // Lax | Strict | None
    private boolean cookieSecure = false; // set true in production (required for SameSite=None)

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public Duration getTtl() {
        return ttl;
    }

    public void setTtl(Duration ttl) {
        this.ttl = ttl;
    }

    public int getKeySize() {
        return keySize;
    }

    public void setKeySize(int keySize) {
        this.keySize = keySize;
    }

    public int getMaxPublishedKeys() {
        return maxPublishedKeys;
    }

    public void setMaxPublishedKeys(int maxPublishedKeys) {
        this.maxPublishedKeys = maxPublishedKeys;
    }

    public String getCookieName() {
        return cookieName;
    }

    public void setCookieName(String cookieName) {
        this.cookieName = cookieName;
    }

    public String getCookiePath() {
        return cookiePath;
    }

    public void setCookiePath(String cookiePath) {
        this.cookiePath = cookiePath;
    }

    public String getCookieDomain() {
        return cookieDomain;
    }

    public void setCookieDomain(String cookieDomain) {
        this.cookieDomain = cookieDomain;
    }

    public String getCookieSameSite() {
        return cookieSameSite;
    }

    public void setCookieSameSite(String cookieSameSite) {
        this.cookieSameSite = cookieSameSite;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public void setCookieSecure(boolean cookieSecure) {
        this.cookieSecure = cookieSecure;
    }
}
