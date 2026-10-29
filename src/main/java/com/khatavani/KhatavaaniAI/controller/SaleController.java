package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.dto.CreateSaleRequest;
import com.khatavani.KhatavaaniAI.entity.Sale;
import com.khatavani.KhatavaaniAI.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<Sale> createSale(@RequestBody CreateSaleRequest request) {
        return new ResponseEntity<>(saleService.createSale(request), HttpStatus.CREATED);
    }
}