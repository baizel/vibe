package com.freshtrio.service;

import com.freshtrio.entity.Product;
import com.freshtrio.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public Page<Product> getAllProducts(String category, Pageable pageable) {
        if (category == null || category.equals("all")) {
            return productRepository.findByIsActiveTrue(pageable);
        } else {
            return productRepository.findByCategoryAndIsActiveTrue(category, pageable);
        }
    }

    public Optional<Product> getProductById(UUID id) {
        return productRepository.findById(id);
    }

    public List<String> getCategories() {
        List<String> categories = new ArrayList<>();
        categories.add("all");
        categories.addAll(productRepository.findDistinctCategories());
        return categories;
    }

    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable);
    }
    
    public Page<Product> searchProductsByCategory(String query, String category, Pageable pageable) {
        if (category == null || category.equals("all")) {
            return searchProducts(query, pageable);
        } else {
            return productRepository.searchProductsByCategory(query, category, pageable);
        }
    }
    
    // Admin methods for managing products
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    
    public void deleteProduct(UUID id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product p = product.get();
            p.setIsActive(false); // Soft delete
            productRepository.save(p);
        }
    }
    
    public List<Product> getAllProductsIncludingInactive() {
        return productRepository.findAll();
    }
}