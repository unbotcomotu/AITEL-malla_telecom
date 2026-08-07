package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.CursoRequisito;

public class PrerequisiteResponse {
    private Long id;
    private Long source;
    private Long target;
    private String type;
    private Integer minGrade;

    public static PrerequisiteResponse from(CursoRequisito requisito, Long targetCourseId) {
        PrerequisiteResponse response = new PrerequisiteResponse();
        response.id = requisito.getId();
        response.source = requisito.getIdCursoRequisito();
        response.target = targetCourseId;
        response.type = requisito.getCondicion();
        response.minGrade = requisito.getNotaMinima();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getSource() {
        return source;
    }

    public Long getTarget() {
        return target;
    }

    public String getType() {
        return type;
    }

    public Integer getMinGrade() {
        return minGrade;
    }
}
