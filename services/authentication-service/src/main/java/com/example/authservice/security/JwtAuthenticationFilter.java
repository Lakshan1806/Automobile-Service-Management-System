package com.example.authservice.security;

import com.example.authservice.model.Customer;
import com.example.authservice.repository.CustomerRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenService jwtTokenService;
    private final CustomerRepository customerRepository;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, CustomerRepository customerRepository) {
        this.jwtTokenService = jwtTokenService;
        this.customerRepository = customerRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String header = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    Claims claims = jwtTokenService.parseClaims(token);
                    Long customerId = Long.valueOf(claims.getSubject());
                    Optional<Customer> customerOptional = customerRepository.findById(customerId);
                    if (customerOptional.isPresent()) {
                        Customer customer = customerOptional.get();
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                new AuthenticatedCustomer(customer.getId(), customer.getName(), customer.getEmail()),
                                null,
                                Collections.emptyList());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (JwtException | IllegalArgumentException ex) {
                    log.debug("Ignoring invalid JWT token", ex);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
