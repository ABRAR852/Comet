package com.comet.app.Repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class ConvRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConvRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String createTable() {
        try {
            jdbcTemplate.execute("CREATE TABLE Conversations (Id uuid primary key default gen_random_uuid()," +
                    "user_id uuid not null default gen_random_uuid(), title TEXT, updated_at TIMESTAMPTZ default now()," +
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
}
