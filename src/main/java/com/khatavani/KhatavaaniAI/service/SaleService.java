package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.dto.CreateSaleRequest;
import com.khatavani.KhatavaaniAI.dto.SaleItemRequest;
import com.khatavani.KhatavaaniAI.entity.*;
import com.khatavani.KhatavaaniAI.model.enums.PaymentMode;
import com.khatavani.KhatavaaniAI.model.enums.ReorderStatus;
import com.khatavani.KhatavaaniAI.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final UserRepository userRepository; // <-- Shopkeeper identify karne ke liye inject kiya[cite: 1, 2]

    @Transactional
    public Sale createSale(CreateSaleRequest request) {
        // 1. Current logged-in shopkeeper nikaalein
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in shopkeeper not found with email: " + email));

        // 2. Customer verify karein (agar provide kiya gaya ho)[cite: 1, 12]
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));
        }

        if (request.getPaymentMode() == PaymentMode.UDHAAR && customer == null) {
            throw new RuntimeException("Customer must be selected for UDHAAR transactions");
        }

        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        // 3. Sale object build karein (user link ke saath)[cite: 1, 12]
        Sale sale = Sale.builder()
                .invoiceNo("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .user(currentUser) // <-- Current Shopkeeper set ho gaya[cite: 12]
                .paymentMode(request.getPaymentMode())
                .discountAmount(discount)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 4. Products check karein, stock deduct karein aur items add karein[cite: 1, 12]
        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            if (product.getStockQuantity().compareTo(itemReq.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity[cite: 1, 12]
            product.setStockQuantity(product.getStockQuantity().subtract(itemReq.getQuantity()));
            productRepository.save(product);

            // Auto-add to ReorderList agar stock threshold limit se neeche chala jaye[cite: 1, 12]
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
        sale.setNetAmount(totalAmount.subtract(discount));

        Sale savedSale = saleRepository.save(sale);

        // 5. Agar UDHAAR payment hai toh ledger entry aur customer balance update karein[cite: 1, 12]
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