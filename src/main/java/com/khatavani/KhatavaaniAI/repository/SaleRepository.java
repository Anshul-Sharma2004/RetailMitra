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

//    Optional<Sale> findByInvoiceNo(String invoiceNo);
//
//
//    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate")
//    BigDecimal calculateTotalRevenueBetween(
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate
//    );
//
//
//    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end")
//    BigDecimal calculateTodaySalesByUserId(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    List<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);


    Optional<Sale> findByInvoiceNo(String invoiceNo);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end")
    BigDecimal calculateTodaySalesByUserId(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end")
    long countTodayBillsByUserId(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    @Query(value = """
        SELECT 
            TO_CHAR(s.created_at, 'DD Mon') AS sale_date,
            DATE(s.created_at) AS raw_date,
            COALESCE(SUM(s.net_amount), 0) AS daily_sales,
            COALESCE(SUM(si.quantity), 0) AS units_sold,
            COUNT(DISTINCT s.id) AS bill_count
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE s.user_id = :userId AND s.created_at >= :startDate
        GROUP BY DATE(s.created_at), TO_CHAR(s.created_at, 'DD Mon')
        ORDER BY raw_date ASC
    """, nativeQuery = true)
    List<Object[]> getDailySalesAndStockTrend(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query(value = """
        SELECT 
            p.name,
            p.unit,
            COALESCE(SUM(si.quantity), 0) AS total_qty_sold,
            COALESCE(SUM(si.subtotal), 0) AS total_revenue,
            p.stock_quantity AS remaining_stock
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN products p ON si.product_id = p.id
        WHERE s.user_id = :userId
        GROUP BY p.id, p.name, p.unit, p.stock_quantity
        ORDER BY total_qty_sold DESC
        LIMIT 5
    """, nativeQuery = true)
    List<Object[]> getTopSellingProducts(@Param("userId") Long userId);

    List<Sale> findTop6ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalRevenueBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}