// src/main/java/com/freshtrio/repository/ProductRepository.java
package com.freshtrio.repository;

import com.freshtrio.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    
    List<Product> findByCategoryAndIsActiveTrue(String category);
    
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.isActive = true AND p.category IS NOT NULL ORDER BY p.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category = :category AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProductsByCategory(@Param("query") String query, @Param("category") String category, Pageable pageable);
}