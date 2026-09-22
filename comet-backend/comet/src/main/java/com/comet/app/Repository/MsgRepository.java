package com.comet.app.Repository;

import com.comet.app.Entity.Message;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Repository
public class MsgRepository {

    private final JdbcTemplate jdbcTemplate;

    public MsgRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String createTable(){
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY," +
                    "dateTime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, conversation_id VARCHAR (50) NOT NULL" +
                    ", content TEXT NOT NULL, role VARCHAR(20) NOT NULL)");
            return "TABLE CREATED";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void addMsg(Message userMessage, Message aiMessage){
        try {
            jdbcTemplate.update("INSERT INTO messages (conversation_id, content, role) VALUES (?, ?, ?)",
                    userMessage.getConversationId(), userMessage.getContent(), userMessage.getRole().name());
            jdbcTemplate.update("INSERT INTO messages (conversation_id, content, role) VALUES (?, ?, ?)",
                    aiMessage.getConversationId(), aiMessage.getContent(), aiMessage.getRole().name());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<org.springframework.ai.chat.messages.Message> getMsgHistory(UUID conversationId){
        try {
            String sql = "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY datetime DESC LIMIT 10";
            List<org.springframework.ai.chat.messages.Message> messages = jdbcTemplate.query(sql, (rs, rowNum) -> {
                String role = rs.getString("role");
                String content = rs.getString("content");

                if ("USER".equalsIgnoreCase(role)) {
                    return new UserMessage(content);
                } else {
                    return new AssistantMessage(content);
                }

            }, conversationId);
            Collections.reverse(messages);
            return messages;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
