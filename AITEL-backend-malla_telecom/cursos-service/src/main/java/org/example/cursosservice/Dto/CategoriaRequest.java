package org.example.cursosservice.Dto;

public class CategoriaRequest {
    private String name;
    private String description;
    private String color;
    private Boolean cycleAssociation;
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

    public Boolean getCycleAssociation() {
        return cycleAssociation;
    }

    public void setCycleAssociation(Boolean cycleAssociation) {
        this.cycleAssociation = cycleAssociation;
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
