package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.Curso;

import java.math.BigDecimal;

public class CurriculumNodeResponse {
    private Long id;
    private String name;
    private String code;
    private BigDecimal credits;
    private Long cycle;
    private Long subcategoryId;
    private String subcategoryName;
    private String subcategoryColor;
    private Boolean subcategoryRequiresAll;
    private Long subcategoryCycle;

    public static CurriculumNodeResponse from(Curso curso) {
        CurriculumNodeResponse response = new CurriculumNodeResponse();
        response.id = curso.getId();
        response.name = curso.getNombre();
        response.code = curso.getCodigo();
        response.credits = curso.getCreditos();
        response.cycle = curso.getCiclo();
        if (curso.getSubcategoria() != null) {
            response.subcategoryId = curso.getSubcategoria().getId();
            response.subcategoryName = curso.getSubcategoria().getSubcategoria();
            response.subcategoryColor = curso.getSubcategoria().getColor();
            response.subcategoryRequiresAll = curso.getSubcategoria().getRequiereTodos();
            Integer subCiclo = curso.getSubcategoria().getCiclo();
            response.subcategoryCycle = subCiclo == null ? null : subCiclo.longValue();
        }
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public BigDecimal getCredits() {
        return credits;
    }

    public Long getCycle() {
        return cycle;
    }

    public Long getSubcategoryId() {
        return subcategoryId;
    }

    public String getSubcategoryName() {
        return subcategoryName;
    }

    public String getSubcategoryColor() {
        return subcategoryColor;
    }

    public Boolean getSubcategoryRequiresAll() {
        return subcategoryRequiresAll;
    }

    public Long getSubcategoryCycle() {
        return subcategoryCycle;
    }
}
