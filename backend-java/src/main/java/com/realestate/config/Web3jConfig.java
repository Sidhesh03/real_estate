package com.realestate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

/**
 * Web3jConfig — creates a singleton Web3j bean.
 *
 * Web3j communicates with Ganache over HTTP JSON-RPC (the same protocol
 * MetaMask uses). The backend is READ-ONLY — no private keys are used.
 *
 * The Ganache URL is read from application.properties so it can be changed
 * without modifying code.
 */
@Configuration
public class Web3jConfig {

    @Value("${blockchain.ganache.url}")
    private String ganacheUrl;

    @Bean
    public Web3j web3j() {
        System.out.println("[Web3jConfig] Connecting to Ganache at: " + ganacheUrl);
        return Web3j.build(new HttpService(ganacheUrl));
    }
}
