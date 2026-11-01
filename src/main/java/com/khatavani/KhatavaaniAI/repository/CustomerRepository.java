package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    // Cron job ke liye: Jinki due date nikal chuki hai aur udhaar baaki hai[cite: 1, 3]
    @Query("SELECT c FROM Customer c WHERE c.dueDate <= :currentDate AND c.currentDue > 0")
    List<Customer> findOverdueCustomers(@Param("currentDate") LocalDate currentDate);


    // Current dukaandar ka kul pending udhaar nikalne ke liye
    @Query("SELECT COALESCE(SUM(c.currentDue), 0) FROM Customer c WHERE c.user.id = :userId")
    BigDecimal calculateTotalPendingUdhaarByUserId(@Param("userId") Long userId);

    List<Customer> findByUserId(Long userId);
}
