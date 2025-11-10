package com.example.authservice;

import com.example.authservice.config.AdminProperties;
import com.example.authservice.config.SignupOtpProperties;
import com.example.authservice.config.TokenProperties;
import com.example.authservice.config.UserServiceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
		TokenProperties.class,
		UserServiceProperties.class,
		AdminProperties.class,
		SignupOtpProperties.class
})
public class AuthserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthserviceApplication.class, args);
	}

}
