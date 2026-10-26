package com.comet.app.Entity;
import com.fasterxml.jackson.annotation.JsonCreator;

public enum SearchDepth {
    FAST, ADVANCED;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static SearchDepth from(String value) {
        return SearchDepth.valueOf(value.trim().toUpperCase());
    }
}