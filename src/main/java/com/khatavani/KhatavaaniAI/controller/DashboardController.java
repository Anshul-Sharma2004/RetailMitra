package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.dto.DashboardStatsResponse;
import com.khatavani.KhatavaaniAI.entity.User;
import com.khatavani.KhatavaaniAI.repository.CustomerRepository;
import com.khatavani.KhatavaaniAI.repository.ProductRepository;
import com.khatavani.KhatavaaniAI.repository.SaleRepository;
import com.khatavani.KhatavaaniAI.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Shopkeeper user not found"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        User user = getCurrentUser();
        Long userId = user.getId();

        // 1. Aaj ki sale (Aaj subah 00:00 se lekar raat 23:59 tak)
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        BigDecimal todaySales = saleRepository.calculateTodaySalesByUserId(userId, startOfDay, endOfDay);

        // 2. Dukaandar ka total pending udhaar
        BigDecimal pendingUdhaar = customerRepository.calculateTotalPendingUdhaarByUserId(userId);

        // 3. Low stock count aur total SKUs
        long lowStockCount = productRepository.countLowStockByUserId(userId);
        long totalSkus = productRepository.countByUserId(userId);

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .todaySales(todaySales != null ? todaySales : BigDecimal.ZERO)
                .pendingUdhaar(pendingUdhaar != null ? pendingUdhaar : BigDecimal.ZERO)
                .lowStockCount(lowStockCount)
                .totalSkus(totalSkus)
                .build();

        return ResponseEntity.ok(response);
    }
}