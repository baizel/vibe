// src/main/java/com/freshtrio/entity/Order.java
package com.freshtrio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }
    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }
    @Id
    @GeneratedValue
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;
    
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "payment_method")
    private String paymentMethod = "cash_on_delivery";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();


    public record Orders(
            UUID id,
            User user,
            Address address,
            LocalDate deliveryDate,
            OrderStatus status,
            BigDecimal totalAmount,
            String paymentMethod,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String specialInstructions,
            List<OrderItem> items
    ) { }
}
