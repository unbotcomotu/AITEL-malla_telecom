package org.example.semestresservice.Dto;

import java.math.BigDecimal;

public class CurrentCourseResponse {
    private Long id;
    private String code;
    private String name;
    private BigDecimal credits;
    private String schedule;

    public CurrentCourseResponse(Long id, String code, String name, BigDecimal credits, String schedule) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.schedule = schedule;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getCredits() {
        return credits;
    }

    public String getSchedule() {
        return schedule;
    }
}
