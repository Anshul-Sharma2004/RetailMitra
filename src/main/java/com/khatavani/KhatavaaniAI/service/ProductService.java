package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.entity.Product;
import com.khatavani.KhatavaaniAI.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProductList() {
        return productRepository.findAll();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

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
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
}