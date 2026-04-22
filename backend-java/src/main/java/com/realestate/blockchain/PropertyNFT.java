package com.realestate.blockchain;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

/**
 * PropertyNFT Java Wrapper
 * ------------------------
 * This class is a simplified version of what Web3j CLI generates.
 * It provides a type-safe way to interact with the smart contract.
 *
 * In a real scenario, this is generated using:
 * web3j generate solidity -a PropertyNFT.abi -b PropertyNFT.bin -o src/main/java -p com.realestate.blockchain
 */
public class PropertyNFT extends Contract {

    protected PropertyNFT(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider gasProvider) {
        super("", contractAddress, web3j, credentials, gasProvider);
    }

    protected PropertyNFT(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        super("", contractAddress, web3j, transactionManager, gasProvider);
    }

    public static PropertyNFT load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        return new PropertyNFT(contractAddress, web3j, transactionManager, gasProvider);
    }

    public RemoteFunctionCall<PropertyStruct> getProperty(BigInteger tokenId) {
        final Function function = new Function("getProperty",
                Arrays.asList(new Uint256(tokenId)),
                Arrays.asList(new TypeReference<PropertyStruct>() {}));
        return executeRemoteCallSingleValueReturn(function, PropertyStruct.class);
    }

    public RemoteFunctionCall<List<PropertyStruct>> getAllProperties() {
        final Function function = new Function("getAllProperties",
                Arrays.asList(),
                Arrays.asList(new TypeReference<DynamicArray<PropertyStruct>>() {}));
        return executeRemoteCallSingleValueReturn(function, (Class<List<PropertyStruct>>) (Class) List.class);
    }

    public static class PropertyStruct extends StaticStruct {
        public BigInteger tokenId;
        public String owner;
        public BigInteger price;
        public Boolean isForSale;

        public PropertyStruct(BigInteger tokenId, String owner, BigInteger price, Boolean isForSale) {
            super(new Uint256(tokenId), new Address(owner), new Uint256(price), new Bool(isForSale));
            this.tokenId = tokenId;
            this.owner = owner;
            this.price = price;
            this.isForSale = isForSale;
        }

        public PropertyStruct(Uint256 tokenId, Address owner, Uint256 price, Bool isForSale) {
            super(tokenId, owner, price, isForSale);
            this.tokenId = tokenId.getValue();
            this.owner = owner.getValue();
            this.price = price.getValue();
            this.isForSale = isForSale.getValue();
        }
    }
}
