package com.example.authservice.controller;

import com.example.authservice.config.TokenProperties;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.ChangePasswordRequest;
import com.example.authservice.dto.CustomerResponse;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.SignupRequest;
import com.example.authservice.dto.UpdateCustomerRequest;
import com.example.authservice.security.JwtTokenService;
import com.example.authservice.service.CustomerService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Collection;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customers")

public class CustomerController {

    private final CustomerService customerService;
    private final TokenProperties tokenProperties;
    private final JwtTokenService jwtTokenService;

    public CustomerController(CustomerService customerService, TokenProperties tokenProperties, JwtTokenService jwtTokenService) {
        this.customerService = customerService;
        this.tokenProperties = tokenProperties;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse signup(@Valid @RequestBody SignupRequest request) {
        return customerService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = customerService.login(request);

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(tokenProperties.getCookieName(), auth.getAccessToken())
                .httpOnly(true)
                .secure(tokenProperties.isCookieSecure())
                .path(tokenProperties.getCookiePath())
                .maxAge(auth.getExpiresIn())
                .sameSite(tokenProperties.getCookieSameSite());

        String domain = tokenProperties.getCookieDomain();
        if (domain != null && !domain.isBlank()) {
            builder = builder.domain(domain);
        }

        ResponseCookie cookie = builder.build();
//        auth.setAccessToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(auth);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(tokenProperties.getCookieName(), "")
                .httpOnly(true)
                .secure(tokenProperties.isCookieSecure())
                .path(tokenProperties.getCookiePath())
                .maxAge(0)
                .sameSite(tokenProperties.getCookieSameSite());

        String domain = tokenProperties.getCookieDomain();
        if (domain != null && !domain.isBlank()) {
            builder = builder.domain(domain);
        }

        ResponseCookie cookie = builder.build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, CustomerResponse>> me(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Jwt jwt;
        try {
            jwt = jwtTokenService.decodeToken(token);
        } catch (IllegalArgumentException | JwtException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!isCustomerToken(jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CustomerResponse customer = new CustomerResponse();
        try {
            customer.setId(Long.parseLong(jwt.getSubject()));
        } catch (NumberFormatException ignore) {
            // leave id unset if subject isn't numeric
        }
        Object name = jwt.getClaims().get("name");
        Object email = jwt.getClaims().get("email");
        customer.setName(name != null ? name.toString() : null);
        customer.setEmail(email != null ? email.toString() : null);

        return ResponseEntity.ok(Map.of("customer", customer));
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomer(@PathVariable Long id) {
        return customerService.getCustomer(id);
    }

    @PutMapping("/me")
    public CustomerResponse updateMe(@Valid @RequestBody UpdateCustomerRequest request, HttpServletRequest httpRequest) {
        Long customerId = requireCustomerId(httpRequest);
        return customerService.updateCustomerDetails(customerId, request);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        Long customerId = requireCustomerId(httpRequest);
        customerService.changePassword(customerId, request);
    }

    private String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (tokenProperties.getCookieName().equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        String authz = request.getHeader("Authorization");
        if (authz != null && authz.startsWith("Bearer ")) {
            String token = authz.substring(7).trim();
            if (!token.isEmpty()) {
                return token;
            }
        }
        return null;
    }

    private Long requireCustomerId(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication token");
        }

        Jwt jwt;
        try {
            jwt = jwtTokenService.decodeToken(token);
        } catch (IllegalArgumentException | JwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication token");
        }

        if (!isCustomerToken(jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token does not belong to a customer");
        }

        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token subject is invalid");
        }
    }

    private boolean isCustomerToken(Jwt jwt) {
        Object realm = jwt.getClaims().get("realm");
        if (realm instanceof String realmStr && "customers".equalsIgnoreCase(realmStr.trim())) {
            return true;
        }
        Object rolesClaim = jwt.getClaims().get("roles");
        if (rolesClaim instanceof Collection<?> roles) {
            for (Object role : roles) {
                if (role != null && "CUSTOMER".equalsIgnoreCase(role.toString().trim())) {
                    return true;
                }
            }
        }
        return false;
    }
}
