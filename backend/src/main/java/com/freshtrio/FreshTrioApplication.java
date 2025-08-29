// src/main/java/com/freshtrio/FreshTrioApplication.java
package com.freshtrio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FreshTrioApplication {
    public static void main(String[] args) {
        SpringApplication.run(FreshTrioApplication.class, args);
    }
}