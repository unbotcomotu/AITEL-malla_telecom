package org.example.cursosservice.Dto;

public class SubcategoriaRequest {
    private String name;
    private String description;
    private String color;
    private Integer cycle;
    private Integer requiredCourses;
    private Boolean requiresAll;
    private Boolean isFrozen;
    private Boolean isHidden;

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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getCycle() {
        return cycle;
    }

    public void setCycle(Integer cycle) {
        this.cycle = cycle;
    }

    public Integer getRequiredCourses() {
        return requiredCourses;
    }

    public void setRequiredCourses(Integer requiredCourses) {
        this.requiredCourses = requiredCourses;
    }

    public Boolean getRequiresAll() {
        return requiresAll;
    }

    public void setRequiresAll(Boolean requiresAll) {
        this.requiresAll = requiresAll;
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
}
