package com.comet.app.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class OpenSERPConfig {

    @Bean
    public RestClient restClient () {
        return RestClient.builder().baseUrl("http://127.0.0.1:7000/").build();
    }
}
