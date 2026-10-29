package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNo(String invoiceNo);

    // AI Copilot & Reports ke liye: Total sales amount between two dates
    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalRevenueBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    List<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}