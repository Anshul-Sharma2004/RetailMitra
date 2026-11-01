package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.entity.Product;
import com.khatavani.KhatavaaniAI.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 1. GET ALL PRODUCTS (Checkout Counter & Inventory List)
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProductList();
    }

    // 2. ADD NEW PRODUCT (SKU Onboarding)
    @PostMapping("/add-products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return new ResponseEntity<>(productService.saveProduct(product), HttpStatus.CREATED);
    }

    // 3. UPDATE PRODUCT (Price/Threshold/Details edit)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    // 4. DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully with ID: " + id);
    }

    // 5. LOW STOCK PRODUCTS (Threshold Alert Engine)
    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts() {
        return productService.getLowStockProducts();
    }
}