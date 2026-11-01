package com.comet.app.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.IdTokenCredentials;
import com.google.auth.oauth2.IdTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.io.IOException;

@Configuration
public class OpenSERPConfig {

    @Bean
    public RestClient openSerpRestClient(
            @Value("${openserp.base-url}") String baseUrl,
            @Value("${openserp.auth-enabled}") boolean authEnabled) throws IOException {

        RestClient.Builder builder = RestClient.builder().baseUrl(baseUrl);

        if (authEnabled) {
            // On Cloud Run, default credentials are the comet-backend service account
            GoogleCredentials creds = GoogleCredentials.getApplicationDefault();
            IdTokenCredentials idCreds = IdTokenCredentials.newBuilder()
                    .setIdTokenProvider((IdTokenProvider) creds)
                    .setTargetAudience(baseUrl.replaceAll("/+$", ""))
                    .build();

            builder.requestInterceptor((request, body, execution) -> {
                idCreds.refreshIfExpired();
                request.getHeaders().setBearerAuth(idCreds.getIdToken().getTokenValue());
                return execution.execute(request, body);
            });
        }
        return builder.build();
    }
}