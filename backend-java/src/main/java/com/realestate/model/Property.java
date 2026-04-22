package com.realestate.model;

/**
 * Property POJO
 * -------------
 * Represents a real estate property fetched from the blockchain.
 * This class is used for JSON serialization in the REST API.
 */
public class Property {
    private String tokenId;
    private String owner;
    private String price; // In ETH
    private boolean isForSale;

    public Property() {}

    public Property(String tokenId, String owner, String price, boolean isForSale) {
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
