package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.dto.DashboardOverviewResponse;
import com.khatavani.KhatavaaniAI.dto.DashboardOverviewResponse.*;
import com.khatavani.KhatavaaniAI.entity.Sale;
import com.khatavani.KhatavaaniAI.entity.User;
import com.khatavani.KhatavaaniAI.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

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

    @GetMapping("/overview")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<DashboardOverviewResponse> getFullDashboard(@RequestParam(defaultValue = "7") int days) {
        User user = getCurrentUser();
        Long userId = user.getId();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);


        BigDecimal todaySales = saleRepository.calculateTodaySalesByUserId(userId, startOfDay, endOfDay);
        todaySales = todaySales != null ? todaySales : BigDecimal.ZERO;

        long todayBills = saleRepository.countTodayBillsByUserId(userId, startOfDay, endOfDay);
        BigDecimal pendingUdhaar = customerRepository.calculateTotalPendingUdhaarByUserId(userId);
        pendingUdhaar = pendingUdhaar != null ? pendingUdhaar : BigDecimal.ZERO;

        long lowStockCount = productRepository.countLowStockByUserId(userId);
        long totalSkus = productRepository.countByUserId(userId);


        BigDecimal avgBasket = todayBills > 0
                ? todaySales.divide(BigDecimal.valueOf(todayBills), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double stockHealth = totalSkus > 0
                ? Math.round(((double) (totalSkus - lowStockCount) / totalSkus) * 100.0)
                : 100.0;

        BigDecimal totalCreditLimit = customerRepository.calculateTotalCreditLimitByUserId(userId);
        double udhaarScore = (totalCreditLimit != null && totalCreditLimit.compareTo(BigDecimal.ZERO) > 0)
                ? Math.max(0, 100.0 - (pendingUdhaar.divide(totalCreditLimit, 2, RoundingMode.HALF_UP).doubleValue() * 100))
                : 100.0;


        LocalDateTime trendStart = LocalDate.now().minusDays(days - 1).atStartOfDay();
        List<Object[]> rawTrends = saleRepository.getDailySalesAndStockTrend(userId, trendStart);
        List<DailyTrendDTO> dailyTrends = rawTrends.stream().map(row -> new DailyTrendDTO(
                (String) row[0],
                new BigDecimal(row[2].toString()),
                new BigDecimal(row[3].toString()),
                Long.parseLong(row[4].toString())
        )).collect(Collectors.toList());


        List<Object[]> rawTopProducts = saleRepository.getTopSellingProducts(userId);
        List<TopProductDTO> topProducts = rawTopProducts.stream().map(row -> new TopProductDTO(
                (String) row[0],
                (String) row[1],
                new BigDecimal(row[2].toString()),
                new BigDecimal(row[3].toString()),
                new BigDecimal(row[4].toString())
        )).collect(Collectors.toList());


        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("hh:mm a");
        List<Sale> recentSalesList = saleRepository.findTop6ByUserIdOrderByCreatedAtDesc(userId);
        List<RecentSaleDTO> recentSales = recentSalesList.stream().map(s -> new RecentSaleDTO(
                s.getInvoiceNo(),
                s.getCustomer() != null ? s.getCustomer().getName() : "Walk-in Customer",
                s.getPaymentMode().name(),
                s.getNetAmount(),
                s.getCreatedAt() != null ? s.getCreatedAt().format(timeFmt) : "Today"
        )).collect(Collectors.toList());

        return ResponseEntity.ok(DashboardOverviewResponse.builder()
                .todaySales(todaySales)
                .pendingUdhaar(pendingUdhaar)
                .lowStockCount(lowStockCount)
                .totalSkus(totalSkus)
                .todayBillCount(todayBills)
                .avgBasketValue(avgBasket)
                .stockHealthPercentage(stockHealth)
                .udhaarCollectionScore(Math.round(udhaarScore))
                .dailyTrends(dailyTrends)
                .topProducts(topProducts)
                .recentSales(recentSales)
                .build());
    }
}