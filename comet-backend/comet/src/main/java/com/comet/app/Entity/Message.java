package com.comet.app.Entity;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class Message {

    private Integer id;
    private OffsetDateTime dateTime;
    private UUID conversationId;
    private String content;
    private MessageRole role;

}
