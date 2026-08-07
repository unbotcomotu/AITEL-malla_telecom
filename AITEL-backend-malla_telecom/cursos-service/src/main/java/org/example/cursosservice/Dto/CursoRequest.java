package org.example.cursosservice.Dto;

import java.math.BigDecimal;
import java.util.List;

public class CursoRequest {
    private String code;
    private String name;
    private String description;
    private BigDecimal credits;
    private Long cycle;
    private Long subcategoryId;
    private Boolean isFrozen;
    private Boolean isHidden;
    private HoursDto hours;
    private List<PrerequisiteRequest> prerequisites;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getCredits() {
        return credits;
    }

    public void setCredits(BigDecimal credits) {
        this.credits = credits;
    }

    public Long getCycle() {
        return cycle;
    }

    public void setCycle(Long cycle) {
        this.cycle = cycle;
    }

    public Long getSubcategoryId() {
        return subcategoryId;
    }

    public void setSubcategoryId(Long subcategoryId) {
        this.subcategoryId = subcategoryId;
    }

    public Boolean getIsFrozen() {
        return isFrozen;
    }

    public void setIsFrozen(Boolean isFrozen) {
        this.isFrozen = isFrozen;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }

    public void setIsHidden(Boolean isHidden) {
        this.isHidden = isHidden;
    }

    public List<PrerequisiteRequest> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<PrerequisiteRequest> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public HoursDto getHours() {
        return hours;
    }

    public void setHours(HoursDto hours) {
        this.hours = hours;
    }
}
