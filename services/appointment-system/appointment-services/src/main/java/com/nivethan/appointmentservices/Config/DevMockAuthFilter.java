package com.nivethan.appointmentservices.Config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;

public class DevMockAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Read a fake user ID from the header
        String customerId = request.getHeader("X-Customer-ID");

        if (customerId != null) {
            // Create a fake JWT token
            Jwt mockJwt = Jwt.withTokenValue("mock-token")
                    .header("alg", "none")
                    .issuer("mock-issuer")
                    .issuedAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .claim("sub", customerId) // This is the user ID ("subject")
                    .build();

            // Create a fake Spring Security user
            Authentication auth = new JwtAuthenticationToken(
                    mockJwt,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );

            // Set this fake user as the "logged-in" user for this request
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
