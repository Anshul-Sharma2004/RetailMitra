package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.CustomerLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerLedgerEntryRepository extends JpaRepository<CustomerLedgerEntry, Long> {
    List<CustomerLedgerEntry> findByCustomerIdOrderByTransactionDateDesc(Long customerId);
}