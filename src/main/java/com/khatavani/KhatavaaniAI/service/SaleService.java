package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.dto.CreateSaleRequest;
import com.khatavani.KhatavaaniAI.dto.SaleItemRequest;
import com.khatavani.KhatavaaniAI.entity.*;
import com.khatavani.KhatavaaniAI.model.enums.PaymentMode;
import com.khatavani.KhatavaaniAI.model.enums.ReorderStatus;
import com.khatavani.KhatavaaniAI.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CustomerLedgerEntryRepository ledgerEntryRepository;
    private final ReorderListRepository reorderListRepository;

    @Transactional
    public Sale createSale(CreateSaleRequest request) {
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        if (request.getPaymentMode() == PaymentMode.UDHAAR && customer == null) {
            throw new RuntimeException("Customer must be selected for UDHAAR transactions");
        }

        Sale sale = Sale.builder()
                .invoiceNo("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .paymentMode(request.getPaymentMode())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            if (product.getStockQuantity().compareTo(itemReq.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity
            product.setStockQuantity(product.getStockQuantity().subtract(itemReq.getQuantity()));
            productRepository.save(product);

            // Auto-add to ReorderList if stock drops <= minThreshold
            if (product.getStockQuantity().compareTo(product.getMinThreshold()) <= 0) {
                if (reorderListRepository.findByProductIdAndStatus(product.getId(), ReorderStatus.PENDING).isEmpty()) {
                    ReorderList reorder = ReorderList.builder()
                            .product(product)
                            .suggestedQuantity(product.getMinThreshold().multiply(BigDecimal.valueOf(2)))
                            .status(ReorderStatus.PENDING)
                            .build();
                    reorderListRepository.save(reorder);
                }
            }

            BigDecimal subtotal = product.getSellingPrice().multiply(itemReq.getQuantity());
            totalAmount = totalAmount.add(subtotal);

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .subtotal(subtotal)
                    .build();

            sale.getItems().add(saleItem);
        }

        sale.setTotalAmount(totalAmount);
        sale.setNetAmount(totalAmount.subtract(sale.getDiscountAmount()));

        Sale savedSale = saleRepository.save(sale);

        // Update Udhaar Ledger if payment mode is UDHAAR
        if (request.getPaymentMode() == PaymentMode.UDHAAR && customer != null) {
            BigDecimal newDue = customer.getCurrentDue().add(savedSale.getNetAmount());
            customer.setCurrentDue(newDue);
            customerRepository.save(customer);

            CustomerLedgerEntry ledgerEntry = CustomerLedgerEntry.builder()
                    .customer(customer)
                    .sale(savedSale)
                    .amountTaken(savedSale.getNetAmount())
                    .amountPaid(BigDecimal.ZERO)
                    .balance(newDue)
                    .build();
            ledgerEntryRepository.save(ledgerEntry);
        }

        return savedSale;
    }
}