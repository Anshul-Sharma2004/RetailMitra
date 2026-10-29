package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.ReorderList;
import com.khatavani.KhatavaaniAI.model.enums.ReorderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReorderListRepository extends JpaRepository<ReorderList, Long> {
    List<ReorderList> findByStatus(ReorderStatus status);
    Optional<ReorderList> findByProductIdAndStatus(Long productId, ReorderStatus status);
}
