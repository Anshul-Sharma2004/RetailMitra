package com.khatavani.KhatavaaniAI.ai;

import com.khatavani.KhatavaaniAI.repository.CustomerRepository;
import com.khatavani.KhatavaaniAI.repository.ProductRepository;
import com.khatavani.KhatavaaniAI.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.function.Function;

@Configuration
@RequiredArgsConstructor
public class AiTools {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;

    // Tool 1: Product Stock & Threshold Check
    public record StockRequest(String productName) {}
    public record StockResponse(String productName, BigDecimal remainingStock, BigDecimal minThreshold, String status) {}

    @Bean
    @Description("Dukan ke stock me kisi product ki remaining quantity aur limit check karta hai")
    public Function<StockRequest, StockResponse> checkProductStock() {
        return request -> {
            var products = productRepository.findAll();
            var matched = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(request.productName().toLowerCase()))
                    .findFirst();

            if (matched.isPresent()) {
                var p = matched.get();
                String status = p.getStockQuantity().compareTo(p.getMinThreshold()) <= 0 ? "LOW_STOCK" : "SAFE";
                return new StockResponse(p.getName(), p.getStockQuantity(), p.getMinThreshold(), status);
            }
            return new StockResponse(request.productName(), BigDecimal.ZERO, BigDecimal.ZERO, "NOT_FOUND");
        };
    }

    // Tool 2: Aaj Ki Total Sales & Collection Check
    public record SalesRequest(String dummy) {}
    public record SalesResponse(BigDecimal totalRevenue, String message) {}

    @Bean
    @Description("Aaj din bhar ki dukan ki total sales aur revenue return karta hai")
    public Function<SalesRequest, SalesResponse> getTodayTotalSales() {
        return request -> {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
            BigDecimal total = saleRepository.calculateTotalRevenueBetween(startOfDay, endOfDay);
            return new SalesResponse(total, "Aaj ki total billing collection");
        };
    }
}