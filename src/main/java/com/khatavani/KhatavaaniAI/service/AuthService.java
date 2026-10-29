package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.dto.AuthResponse;
import com.khatavani.KhatavaaniAI.dto.LoginRequest;
import com.khatavani.KhatavaaniAI.dto.RegisterRequest;
import com.khatavani.KhatavaaniAI.entity.User;
import com.khatavani.KhatavaaniAI.model.enums.PlanTier;
import com.khatavani.KhatavaaniAI.model.enums.Role;
import com.khatavani.KhatavaaniAI.repository.UserRepository;
import com.khatavani.KhatavaaniAI.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        Role assignedRole = (request.getRole() != null) ? request.getRole() : Role.ROLE_SHOPKEEPER;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .shopName(request.getShopName())
                .phone(request.getPhone())
                .role(assignedRole)
                .plan(PlanTier.FREE_TRIAL)
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(
                user,
                Map.of("role", user.getRole().name(), "plan", user.getPlan().name())
        );

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .plan(user.getPlan().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(
                user,
                Map.of("role", user.getRole().name(), "plan", user.getPlan().name())
        );

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .plan(user.getPlan().name())
                .build();
    }
}