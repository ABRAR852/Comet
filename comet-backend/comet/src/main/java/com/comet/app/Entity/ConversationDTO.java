package com.comet.app.Entity;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ConversationDTO {

    private UUID id;
    private String title;
    private OffsetDateTime updated_at;
    private OffsetDateTime created_at;

}
