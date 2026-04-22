package com.realestate.controller;

import com.realestate.blockchain.service.BlockchainService;
import com.realestate.model.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

/**
 * PropertyController
 * ------------------
 * REST Controller providing endpoints to read data from the blockchain.
 * This layer acts as an API gateway for the frontend.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow access from frontend
public class PropertyController {

    private final BlockchainService blockchainService;

    @Autowired
    public PropertyController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    /**
     * GET /api/properties
     * Returns a list of all properties.
     */
    @GetMapping("/properties")
    public ResponseEntity<List<Property>> getAllProperties() {
        try {
            List<Property> properties = blockchainService.getAllProperties();
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/property/{id}
     * Returns details of a specific property.
     */
    @GetMapping("/property/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable("id") String id) {
        try {
            BigInteger tokenId = new BigInteger(id);
            Property property = blockchainService.getPropertyById(tokenId);
            if (property == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(property);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/status")
    public String getStatus() {
        try {
            return "Connected to Blockchain: " + blockchainService.getClientVersion();
        } catch (Exception e) {
            return "Connection Failed: " + e.getMessage();
        }
    }
}
