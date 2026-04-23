package com.realestate.controller;

import com.realestate.blockchain.service.BlockchainService;
import com.realestate.model.PropertyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

/**
 * PropertyController
 * ------------------
 * REST Controller for accessing blockchain property data.
 * Adheres to the READ-ONLY rule for backend.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PropertyController {

    private final BlockchainService blockchainService;

    @Autowired
    public PropertyController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    /**
     * GET /api/properties
     * Fetches all properties from the blockchain.
     */
    @GetMapping("/properties")
    public ResponseEntity<?> getAllProperties() {
        try {
            List<PropertyDTO> properties = blockchainService.getAllProperties();
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Blockchain connection failed: " + e.getMessage());
        }
    }

    /**
     * GET /api/properties/{id}
     * Fetches a specific property by its tokenId.
     */
    @GetMapping("/properties/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable("id") String id) {
        try {
            BigInteger tokenId = new BigInteger(id);
            PropertyDTO property = blockchainService.getPropertyById(tokenId);
            return ResponseEntity.ok(property);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid tokenId format: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Property not found or blockchain error: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint to verify blockchain connectivity.
     */
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        try {
            String version = blockchainService.getClientVersion();
            return ResponseEntity.ok("Connected to Blockchain: " + version);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Connection Failed: " + e.getMessage());
        }
    }
}
