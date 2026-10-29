package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    // AI insights: Kaunsa product sabse zyada bik raha hai[cite: 1, 2]
    @Query("SELECT si.product.id, SUM(si.quantity) as totalQty " +
            "FROM SaleItem si GROUP BY si.product.id ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProductIds();
}