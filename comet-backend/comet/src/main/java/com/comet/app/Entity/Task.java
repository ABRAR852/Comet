package com.comet.app.Entity;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class Task {

    private Integer id;
    private OffsetDateTime dateTime;
    private String task;
    private String taskDescription;
    private Boolean taskDone;

}