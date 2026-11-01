package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.entity.Product;
import com.khatavani.KhatavaaniAI.entity.User;
import com.khatavani.KhatavaaniAI.repository.ProductRepository;
import com.khatavani.KhatavaaniAI.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Helper: JWT Token se current logged-in user nikalna
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in shopkeeper not found with email: " + email));
    }

    // 1. Sirf logged in shopkeeper ke products return honge
    public List<Product> getAllProductList() {
        User user = getCurrentUser();
        return productRepository.findByUserId(user.getId());
    }

    // 2. Product add karte waqt current user set hoga
    public Product saveProduct(Product product) {
        User user = getCurrentUser();
        product.setUser(user);
        return productRepository.save(product);
    }

    // 3. Update karte waqt check karein ki product usi shopkeeper ka hai
    public Product updateProduct(Long id, Product updatedProduct) {
        User user = getCurrentUser();
        Product existing = productRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized"));

        existing.setName(updatedProduct.getName());
        existing.setBarcode(updatedProduct.getBarcode());
        existing.setUnit(updatedProduct.getUnit());
        existing.setCostPrice(updatedProduct.getCostPrice());
        existing.setSellingPrice(updatedProduct.getSellingPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        existing.setMinThreshold(updatedProduct.getMinThreshold());

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> getLowStockProducts() {
        User user = getCurrentUser();
        return productRepository.findLowStockProductsByUserId(user.getId());
    }
}