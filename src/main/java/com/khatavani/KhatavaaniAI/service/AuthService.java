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
    private final EmailService emailService; // <-- YAHAN ADD KIYA HAI, ISSE BUILD ERROR KHATAM HO JAYEGA!

    // 1. REGISTER METHOD
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
                .shopName(user.getShopName())
                .role(user.getRole().name())
                .plan(user.getPlan().name())
                .build();
    }

    // 2. LOGIN METHOD
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
                .shopName(user.getShopName())
                .role(user.getRole().name())
                .plan(user.getPlan().name())
                .build();
    }

    // 3. SEND OTP FOR FORGOT PASSWORD
    public void sendPasswordResetOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Is email ke sath koi shopkeeper account registered nahi hai: " + email));

        // 6-digit random OTP generate karein
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        user.setResetOtp(otp);
        user.setOtpExpiryTime(java.time.LocalDateTime.now().plusMinutes(10)); // 10 minute valid
        userRepository.save(user);

        // Send Email (Ab emailService mil jayega aur koi error nahi aayegi)
        emailService.sendPasswordResetOtp(email, otp);
    }

    // 4. VERIFY OTP & SET NEW PASSWORD
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User account nahi mila"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp.trim())) {
            throw new RuntimeException("Invalid ya Galat OTP enter kiya hai!");
        }

        if (user.getOtpExpiryTime() == null || user.getOtpExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expire ho chuka hai! Kripya dobara generate karein.");
        }

        // New password encrypt (BCrypt) karke save karein
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null); // Clear OTP
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }
}