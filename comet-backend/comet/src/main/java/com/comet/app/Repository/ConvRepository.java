package com.comet.app.Repository;
import com.comet.app.Entity.ConversationDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class ConvRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ChatClient chatClient;

    public ConvRepository(JdbcTemplate jdbcTemplate,
                          ChatClient.Builder chatClientBuilder) {
        this.jdbcTemplate = jdbcTemplate;
        this.chatClient = chatClientBuilder.build();
    }

    public String createTable() {
        try {
            jdbcTemplate.execute("CREATE TABLE Conversations (Id uuid primary key default gen_random_uuid()," +
                    "user_id uuid not null default gen_random_uuid(), title TEXT default 'New Chat', updated_at TIMESTAMPTZ default now()," +
                    "created_at TIMESTAMPTZ default now() )");
            return "TABLE CREATED";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void addConv(UUID conversation) {
        try {
            jdbcTemplate.update("INSERT INTO conversations (id) VALUES (?) ON CONFLICT (id) DO NOTHING", conversation);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean getConvTitleById(String convId) {
        try {
            List<String> title = jdbcTemplate.queryForList("SELECT title from conversations where id = ? AND title IS NOT NULL AND title != ''", String.class, UUID.fromString(convId));
            return !title.isEmpty() && "New Chat".equalsIgnoreCase(title.get(0));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<ConversationDTO> getAllConv() {
        try {
            return jdbcTemplate.query("SELECT * FROM conversations",
                        new BeanPropertyRowMapper<>(ConversationDTO.class));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Async
    public void addConvTitle(String convId, String userQuery, String aiResponse) {
        try {
            String titleSystemPrompt = """
                You are an automated title generator for an AI assistant sidebar.
                Create a 2 to 4 word topic title based on the first conversation exchange.
            
                STRICT RULES:
                1. Output ONLY the title text—no quotes, no prefixes, no punctuation.
                2. NEVER use meta-verbs or action descriptions like "Inquiring about", "Asking for", "Discussion on", "Requesting help".
                3. Focus on the core subject/noun, not the action.
                4. Capitalize each word (Title Case).
                """;
            String titlePrompt = """
                Task: Convert the conversation start into a 2-4 word sidebar title.
            
                Examples:
                User: "How do I fix a NullPointerException in Spring Boot JDBC?"
                Title: Spring Boot JDBC Fix
            
                User: "I am feeling a bit down and stressed today."
                Title: Stress & Mood Check
            
                User: "Write a React Native drawer component in Expo Router."
                Title: React Native Drawer Setup
            
                User: "What is the capital of France?"
                Title: Capital of France
            
                ---
                User Query: %s
                AI Response: %s
                Title:
                """.formatted(userQuery, aiResponse);

            String rawTitle = chatClient.prompt(titlePrompt).system(titleSystemPrompt).call().content();

            if(rawTitle != null && !rawTitle.isBlank()){

                String cleanTitle = rawTitle.replaceAll("^\"|\"$", "").trim();

                jdbcTemplate.update("INSERT INTO conversations (id, title) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title", UUID.fromString(convId), cleanTitle);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
