package com.khatavani.KhatavaaniAI.entity;

import com.khatavani.KhatavaaniAI.model.enums.ReorderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reorder_list")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "suggested_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal suggestedQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReorderStatus status = ReorderStatus.PENDING;

    @Column(name = "distributor_name")
    private String distributorName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}