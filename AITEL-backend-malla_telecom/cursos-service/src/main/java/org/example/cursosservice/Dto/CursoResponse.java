package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.Curso;

import java.math.BigDecimal;
import java.util.List;

public class CursoResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal credits;
    private Long cycle;
    private Long subcategoryId;
    private String subcategoryName;
    private Integer subcategoryRequiredCourses;
    private Boolean subcategoryRequiresAll;
    private Integer subcategoryTotalCourses;
    private Long categoryId;
    private String categoryName;
    private Boolean isFrozen;
    private Boolean isHidden;
    private HoursDto hours;
    private List<PrerequisiteResponse> prerequisites;

    public static CursoResponse from(Curso curso, List<PrerequisiteResponse> prerequisites, Integer subcategoryTotalCourses) {
        CursoResponse response = new CursoResponse();
        response.id = curso.getId();
        response.code = curso.getCodigo();
        response.name = curso.getNombre();
        response.description = curso.getDescripcion();
        response.credits = curso.getCreditos();
        response.cycle = curso.getCiclo();
        response.isFrozen = curso.getCongelada();
        response.isHidden = curso.getOculta();
        response.hours = new HoursDto(curso.getHorasTeoria(), curso.getHorasPractica(), curso.getHorasLaboratorio());
        response.prerequisites = prerequisites;

        if (curso.getSubcategoria() != null) {
            response.subcategoryId = curso.getSubcategoria().getId();
            response.subcategoryName = curso.getSubcategoria().getSubcategoria();
            response.subcategoryRequiredCourses = curso.getSubcategoria().getCursosRequeridos();
            response.subcategoryRequiresAll = curso.getSubcategoria().getRequiereTodos();
            response.subcategoryTotalCourses = subcategoryTotalCourses;
            if (curso.getSubcategoria().getCategoria() != null) {
                response.categoryId = curso.getSubcategoria().getCategoria().getId();
                response.categoryName = curso.getSubcategoria().getCategoria().getCategoria();
            }
        }
        return response;
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

    public String getDescription() {
        return description;
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

    public Integer getSubcategoryRequiredCourses() {
        return subcategoryRequiredCourses;
    }

    public Boolean getSubcategoryRequiresAll() {
        return subcategoryRequiresAll;
    }

    public Integer getSubcategoryTotalCourses() {
        return subcategoryTotalCourses;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Boolean getIsFrozen() {
        return isFrozen;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }

    public List<PrerequisiteResponse> getPrerequisites() {
        return prerequisites;
    }

    public HoursDto getHours() {
        return hours;
    }
}
