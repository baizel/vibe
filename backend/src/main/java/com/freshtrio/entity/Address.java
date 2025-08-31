package com.freshtrio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String street;

    private String city;

    private String state;

    private String postalCode;

    private String country;

    // Optional: you can add a label to differentiate addresses
    private String label; // e.g., "Head Office", "Billing", "Shipping"
}
