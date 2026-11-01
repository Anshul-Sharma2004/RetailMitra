package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Fast Barcode lookup at Billing counter
    Optional<Product> findByBarcode(String barcode);

    // Low stock items check (stock <= min_threshold)
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.minThreshold")
    List<Product> findLowStockProducts();

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByUserId(Long userId);

    List<Product> findLowStockProductsByUserId(Long id);

    // Dukaandar ke total items count
    long countByUserId(Long userId);

    // Dukaandar ke low stock items count
    @Query("SELECT COUNT(p) FROM Product p WHERE p.user.id = :userId AND p.stockQuantity <= p.minThreshold")
    long countLowStockByUserId(@Param("userId") Long userId);
}
