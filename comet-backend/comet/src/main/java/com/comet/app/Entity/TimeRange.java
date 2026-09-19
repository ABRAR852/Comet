package com.comet.app.Entity;
import com.fasterxml.jackson.annotation.JsonCreator;

public enum TimeRange {
    DAY, WEEK, MONTH, YEAR;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static TimeRange from(String value) {
        return TimeRange.valueOf(value.trim().toUpperCase());
    }
}