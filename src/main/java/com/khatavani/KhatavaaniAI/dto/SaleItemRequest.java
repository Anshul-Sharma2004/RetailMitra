package com.khatavani.KhatavaaniAI.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaleItemRequest {
    private Long productId;
    private BigDecimal quantity;
}