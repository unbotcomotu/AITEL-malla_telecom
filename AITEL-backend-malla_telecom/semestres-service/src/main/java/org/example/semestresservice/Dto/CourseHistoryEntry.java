package org.example.semestresservice.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class CourseHistoryEntry {
    private Long id;
    private String code;
    private String name;
    private BigDecimal credits;
    private Long grade;
    private boolean exception;
    private boolean isElective;
    private Long subcategoryId;

    public CourseHistoryEntry(Long id, String code, String name, BigDecimal credits, Long grade, boolean exception, boolean isElective, Long subcategoryId) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.grade = grade;
        this.exception = exception;
        this.isElective = isElective;
        this.subcategoryId = subcategoryId;
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

    public Long getGrade() {
        return grade;
    }

    public boolean isException() {
        return exception;
    }

    @JsonProperty("isElective")
    public boolean isElective() {
        return isElective;
    }

    public Long getSubcategoryId() {
        return subcategoryId;
    }
}
