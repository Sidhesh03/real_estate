package com.realestate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

/**
 * Web3jConfig — creates a singleton Web3j bean.
 *
 * Web3j communicates with Ganache over HTTP JSON-RPC.
 * The backend is READ-ONLY — no private keys are used.
 */
@Configuration
public class Web3jConfig {

    @Value("${blockchain.url}")
    private String blockchainUrl;

    @Bean
    public Web3j web3j() {
        System.out.println("[Web3jConfig] Connecting to Blockchain at: " + blockchainUrl);
        return Web3j.build(new HttpService(blockchainUrl));
    }
}
