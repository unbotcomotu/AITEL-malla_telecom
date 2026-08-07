package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.Subcategoria;

public class SubcategoriaResponse {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Integer cycle;
    private Integer requiredCourses;
    private Boolean requiresAll;
    private Long categoryId;
    private Boolean isFrozen;
    private Boolean isHidden;

    public static SubcategoriaResponse from(Subcategoria subcategoria) {
        SubcategoriaResponse response = new SubcategoriaResponse();
        response.id = subcategoria.getId();
        response.name = subcategoria.getSubcategoria();
        response.description = subcategoria.getDescripcion();
        response.color = subcategoria.getColor();
        response.cycle = subcategoria.getCiclo();
        response.requiredCourses = subcategoria.getCursosRequeridos();
        response.requiresAll = subcategoria.getRequiereTodos();
        response.categoryId = subcategoria.getCategoria().getId();
        response.isFrozen = subcategoria.getCongelada();
        response.isHidden = subcategoria.getOculta();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getColor() {
        return color;
    }

    public Integer getCycle() {
        return cycle;
    }

    public Integer getRequiredCourses() {
        return requiredCourses;
    }

    public Boolean getRequiresAll() {
        return requiresAll;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Boolean getIsFrozen() {
        return isFrozen;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }
}
