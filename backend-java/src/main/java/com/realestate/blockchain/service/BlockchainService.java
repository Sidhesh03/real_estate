package com.realestate.blockchain.service;

import com.realestate.blockchain.PropertyNFT;
import com.realestate.model.Property;
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
 * Handles all READ-ONLY interactions with the smart contract using the 
 * generated Web3j wrapper (PropertyNFT.java).
 *
 * This implementation follows the clean architecture pattern by separating 
 * the blockchain logic from the REST API.
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
     * Loads the smart contract using the Web3j wrapper.
     * We use ReadonlyTransactionManager because we are only reading state.
     */
    private PropertyNFT getContract() {
        // Any valid address can be used for readonly calls, or null for most providers
        String dummyAddress = "0x0000000000000000000000000000000000000000";
        ReadonlyTransactionManager txManager = new ReadonlyTransactionManager(web3j, dummyAddress);
        return PropertyNFT.load(contractAddress, web3j, txManager, new DefaultGasProvider());
    }

    public String getClientVersion() throws Exception {
        return web3j.web3ClientVersion().send().getWeb3ClientVersion();
    }

    /**
     * Fetches a property by ID using the generated wrapper.
     */
    public Property getPropertyById(BigInteger tokenId) throws Exception {
        PropertyNFT.PropertyStruct struct = getContract().getProperty(tokenId).send();
        return mapToProperty(struct);
    }

    /**
     * Fetches all properties using the generated wrapper.
     */
    public List<Property> getAllProperties() throws Exception {
        List<PropertyNFT.PropertyStruct> structs = getContract().getAllProperties().send();
        return structs.stream()
                .map(this::mapToProperty)
                .collect(Collectors.toList());
    }

    // ─── Data Mapping ──────────────────────────────────────────

    private Property mapToProperty(PropertyNFT.PropertyStruct struct) {
        // Convert Wei (from contract) to ETH (for display)
        String priceEth = Convert.fromWei(new BigDecimal(struct.price), Convert.Unit.ETHER).toPlainString();
        
        return new Property(
                struct.tokenId.toString(),
                struct.owner,
                priceEth,
                struct.isForSale
        );
    }
}
