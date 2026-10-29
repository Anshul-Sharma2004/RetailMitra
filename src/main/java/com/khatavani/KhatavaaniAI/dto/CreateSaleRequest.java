package com.khatavani.KhatavaaniAI.dto;

import com.khatavani.KhatavaaniAI.model.enums.PaymentMode;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateSaleRequest {
    private Long customerId; // Nullable agar walk-in cash customer hai[cite: 1, 3]
    private PaymentMode paymentMode;
    private BigDecimal discountAmount;
    private List<SaleItemRequest> items;
}