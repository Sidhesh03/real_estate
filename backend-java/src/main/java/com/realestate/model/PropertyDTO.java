package com.realestate.model;

import java.math.BigInteger;

/**
 * PropertyDTO
 * -----------
 * Data Transfer Object for sending property information to the frontend.
 * This separates the blockchain struct from the REST API response.
 */
public class PropertyDTO {
    private String tokenId;
    private String owner;
    private String price;
    private boolean isForSale;

    public PropertyDTO() {}

    public PropertyDTO(String tokenId, String owner, String price, boolean isForSale) {
        this.tokenId = tokenId;
        this.owner = owner;
        this.price = price;
        this.isForSale = isForSale;
    }

    // Getters and Setters
    public String getTokenId() { return tokenId; }
    public void setTokenId(String tokenId) { this.tokenId = tokenId; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public boolean isForSale() { return isForSale; }
    public void setForSale(boolean forSale) { isForSale = forSale; }
}
