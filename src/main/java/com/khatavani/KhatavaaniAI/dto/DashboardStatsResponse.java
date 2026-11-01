package com.khatavani.KhatavaaniAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal todaySales;
    private long lowStockCount;
    private BigDecimal pendingUdhaar;
    private long totalSkus;
}