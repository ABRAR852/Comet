package com.comet.app.Config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.Request;
import okhttp3.RequestBody;
import okio.Buffer;
import org.springframework.ai.openai.*;
import org.springframework.ai.openai.http.okhttp.OpenAiHttpClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GroqReasoningFixConfig {

    @Bean
    public OpenAiHttpClientBuilderCustomizer stripReasoningContentCustomizer() {
        ObjectMapper mapper = new ObjectMapper();
        return builder -> builder.interceptor(chain -> {
            Request original = chain.request();
            RequestBody body = original.body();
            if (body == null) {
                return chain.proceed(original);
            }

            Buffer buffer = new Buffer();
            body.writeTo(buffer);
            JsonNode root = mapper.readTree(buffer.readUtf8());

            if (root.has("messages")) {
                for (JsonNode msg : root.get("messages")) {
                    if (msg.isObject() && "assistant".equals(msg.path("role").asText())) {
                        ((ObjectNode) msg).remove("reasoning_content");
                        ((ObjectNode) msg).remove("reasoning");
                    }
                }
            }

            RequestBody newBody = RequestBody.create(
                    mapper.writeValueAsString(root), body.contentType());
            Request patched = original.newBuilder()
                    .method(original.method(), newBody)
                    .build();
            return chain.proceed(patched);
        });
    }
}