package com.khatavani.KhatavaaniAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {

    private BigDecimal todaySales;
    private BigDecimal pendingUdhaar;
    private long lowStockCount;
    private long totalSkus;


    private long todayBillCount;
    private BigDecimal avgBasketValue;
    private double stockHealthPercentage;
    private double udhaarCollectionScore;


    private List<DailyTrendDTO> dailyTrends;


    private List<TopProductDTO> topProducts;
    private List<RecentSaleDTO> recentSales;

    @Data
    @AllArgsConstructor
    public static class DailyTrendDTO {
        private String date;
        private BigDecimal sales;
        private BigDecimal stockSold;
        private long bills;
    }

    @Data
    @AllArgsConstructor
    public static class TopProductDTO {
        private String name;
        private String unit;
        private BigDecimal soldQty;
        private BigDecimal revenue;
        private BigDecimal remainingStock;
    }

    @Data
    @AllArgsConstructor
    public static class RecentSaleDTO {
        private String invoiceNo;
        private String customerName;
        private String paymentMode;
        private BigDecimal amount;
        private String time;
    }
}