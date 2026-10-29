package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.entity.Product;
import com.khatavani.KhatavaaniAI.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public List<Product> getAllProducts() {
        return productService.getAllProductList();
    }

    @PostMapping("/add-products")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return new ResponseEntity<>(productService.saveProduct(product), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully with ID: " + id);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public List<Product> getLowStock() {
        return productService.getLowStockProducts();
    }
}