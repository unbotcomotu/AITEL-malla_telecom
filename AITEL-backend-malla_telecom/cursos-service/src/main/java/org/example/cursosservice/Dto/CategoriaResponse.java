package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.Categoria;

import java.util.List;

public class CategoriaResponse {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Boolean cycleAssociation;
    private Boolean isFrozen;
    private Boolean isHidden;
    private List<SubcategoriaResponse> subcategories;

    public static CategoriaResponse from(Categoria categoria, List<SubcategoriaResponse> subcategories) {
        CategoriaResponse response = new CategoriaResponse();
        response.id = categoria.getId();
        response.name = categoria.getCategoria();
        response.description = categoria.getDescripcion();
        response.color = categoria.getColor();
        response.cycleAssociation = categoria.getAsociacionCiclo();
        response.isFrozen = categoria.getCongelada();
        response.isHidden = categoria.getOculta();
        response.subcategories = subcategories;
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

    public Boolean getCycleAssociation() {
        return cycleAssociation;
    }

    public Boolean getIsFrozen() {
        return isFrozen;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }

    public List<SubcategoriaResponse> getSubcategories() {
        return subcategories;
    }
}
