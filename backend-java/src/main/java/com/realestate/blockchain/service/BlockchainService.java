package com.realestate.blockchain.service;

import com.realestate.blockchain.PropertyNFT;
import com.realestate.model.PropertyDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.tx.ReadonlyTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.stream.Collectors;

/**
 * BlockchainService
 * -----------------
 * Handles READ-ONLY interactions with the smart contract using the Web3j wrapper.
 * No private keys are used; we use a dummy address for read operations.
 */
@Service
public class BlockchainService {

    private final Web3j web3j;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    public BlockchainService(Web3j web3j) {
        this.web3j = web3j;
    }

    /**
     * Loads the smart contract in read-only mode.
     */
    private PropertyNFT getContract() {
        // Read-only calls don't need a real private key.
        String dummyAddress = "0x0000000000000000000000000000000000000000";
        ReadonlyTransactionManager txManager = new ReadonlyTransactionManager(web3j, dummyAddress);
        return PropertyNFT.load(contractAddress, web3j, txManager, new DefaultGasProvider());
    }

    /**
     * Fetches all properties and maps them to DTOs.
     */
    public List<PropertyDTO> getAllProperties() throws Exception {
        List<PropertyNFT.Property> properties = getContract().getAllProperties().send();
        return properties.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Fetches a single property by ID.
     */
    public PropertyDTO getPropertyById(BigInteger tokenId) throws Exception {
        PropertyNFT.Property property = getContract().getProperty(tokenId).send();
        return mapToDTO(property);
    }

    /**
     * Helper to map blockchain struct to API DTO.
     */
    private PropertyDTO mapToDTO(PropertyNFT.Property property) {
        // Convert Wei to ETH for readability
        String priceEth = Convert.fromWei(new BigDecimal(property.price), Convert.Unit.ETHER).toPlainString();
        
        return new PropertyDTO(
                property.tokenId.toString(),
                property.owner,
                priceEth,
                property.isForSale
        );
    }

    public String getClientVersion() throws Exception {
        return web3j.web3ClientVersion().send().getWeb3ClientVersion();
    }
}
