package com.freshtrio.service;

import com.freshtrio.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public class ProductService {
    public Page<Product> getAllProducts(String category, Pageable pageable) {
        return Page.empty();
    }

    public Product getProductById(UUID id) {
        return null;
    }

    public List<String> getCategories() {
        return List.of();
    }

    public Page<Product> searchProducts(String q, Pageable pageable) {
        return Page.empty();
    }
}
