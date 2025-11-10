package com.example.authservice.repository;

import com.example.authservice.model.SignupOtp;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupOtpRepository extends JpaRepository<SignupOtp, Long> {

    Optional<SignupOtp> findByEmailIgnoreCase(String email);

    void deleteByEmailIgnoreCase(String email);
}
