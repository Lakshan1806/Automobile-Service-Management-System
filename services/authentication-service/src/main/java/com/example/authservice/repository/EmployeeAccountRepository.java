package com.example.authservice.repository;

import com.example.authservice.model.EmployeeAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeAccountRepository extends JpaRepository<EmployeeAccount, Long> {
    Optional<EmployeeAccount> findByEmail(String email);
    Optional<EmployeeAccount> findByInviteToken(String inviteToken);
    Optional<EmployeeAccount> findByEmployeeId(Long employeeId);
    boolean existsByEmployeeId(Long employeeId);
    boolean existsByEmail(String email);
    boolean existsByRoleIgnoreCase(String role);
}
