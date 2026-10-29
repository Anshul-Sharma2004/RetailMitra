package com.khatavani.KhatavaaniAI.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentReceiveRequest {
    private Long customerId;
    private BigDecimal amountPaid;
}