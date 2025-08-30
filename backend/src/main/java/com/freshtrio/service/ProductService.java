package com.freshtrio.service;

import com.freshtrio.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    private final List<Product> mockProducts;
    private final List<String> categories = Arrays.asList("all", "beef", "chicken", "pork", "seafood");
    
    public ProductService() {
        // Initialize mock products data
        mockProducts = Arrays.asList(
            createProduct("Premium Beef Ribeye", 
                "Fresh, high-quality ribeye steak perfect for grilling", 
                "beef", new BigDecimal("28.99"), "kg",
                "https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ribeye"),
                
            createProduct("Free Range Chicken Breast", 
                "Organic chicken breast fillets, hormone-free", 
                "chicken", new BigDecimal("12.99"), "kg",
                "https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Chicken"),
                
            createProduct("Fresh Salmon Fillet", 
                "Wild-caught salmon fillets, rich in omega-3", 
                "seafood", new BigDecimal("24.99"), "kg",
                "https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Salmon"),
                
            createProduct("Pork Tenderloin", 
                "Lean pork tenderloin cuts, perfect for roasting", 
                "pork", new BigDecimal("16.99"), "kg",
                "https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork"),
                
            createProduct("Ground Beef 80/20", 
                "Fresh ground beef, 80% lean, perfect for burgers", 
                "beef", new BigDecimal("8.99"), "kg",
                "https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ground+Beef"),
                
            createProduct("Chicken Thighs", 
                "Juicy chicken thighs with skin, bone-in", 
                "chicken", new BigDecimal("9.99"), "kg",
                "https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Thighs"),
                
            createProduct("Fresh Cod Fillet", 
                "White fish fillet, mild flavor, great for frying", 
                "seafood", new BigDecimal("18.99"), "kg",
                "https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Cod"),
                
            createProduct("Pork Chops", 
                "Bone-in pork chops, center cut, premium quality", 
                "pork", new BigDecimal("14.99"), "kg",
                "https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork+Chops")
        );
    }
    
    private Product createProduct(String name, String description, String category, 
                                BigDecimal price, String unit, String imageUrl) {
        Product product = new Product(name, description, category, price, unit);
        product.setId(UUID.randomUUID());
        product.setImageUrl(imageUrl);
        return product;
    }

    public Page<Product> getAllProducts(String category, Pageable pageable) {
        List<Product> filteredProducts = mockProducts;
        
        // Filter by category if specified
        if (category != null && !category.equals("all")) {
            filteredProducts = mockProducts.stream()
                .filter(product -> product.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }
        
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredProducts.size());
        
        if (start > filteredProducts.size()) {
            return new PageImpl<>(List.of(), pageable, filteredProducts.size());
        }
        
        List<Product> pageContent = filteredProducts.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filteredProducts.size());
    }

    public Product getProductById(UUID id) {
        return mockProducts.stream()
            .filter(product -> product.getId().equals(id))
            .findFirst()
            .orElse(null);
    }

    public List<String> getCategories() {
        return categories;
    }

    public Page<Product> searchProducts(String q, Pageable pageable) {
        String query = q.toLowerCase();
        List<Product> searchResults = mockProducts.stream()
            .filter(product -> 
                product.getName().toLowerCase().contains(query) ||
                product.getDescription().toLowerCase().contains(query) ||
                product.getCategory().toLowerCase().contains(query)
            )
            .collect(Collectors.toList());
            
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), searchResults.size());
        
        if (start > searchResults.size()) {
            return new PageImpl<>(List.of(), pageable, searchResults.size());
        }
        
        List<Product> pageContent = searchResults.subList(start, end);
        return new PageImpl<>(pageContent, pageable, searchResults.size());
    }
}
