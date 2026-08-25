package com.gamingevents.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health Check", description = "Platform health check and deployment status probe")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    @Operation(summary = "Liveness and database connectivity probe")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbHealthy = true;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            dbHealthy = false;
        }

        Map<String, Object> status = Map.of(
                "status", dbHealthy ? "UP" : "DEGRADED",
                "app", "ARCADIA Gaming Event Platform",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "database", dbHealthy ? "CONNECTED" : "DISCONNECTED"
        );

        return dbHealthy ? ResponseEntity.ok(status) : ResponseEntity.status(503).body(status);
    }
}
