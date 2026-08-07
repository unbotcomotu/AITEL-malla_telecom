package org.example.cursosservice.Dto;

import org.example.cursosservice.Model.Entity.Curso;

import java.math.BigDecimal;

public class CurriculumNodeResponse {
    private Long id;
    private String name;
    private String code;
    private BigDecimal credits;
    private Long cycle;

    public static CurriculumNodeResponse from(Curso curso) {
        CurriculumNodeResponse response = new CurriculumNodeResponse();
        response.id = curso.getId();
        response.name = curso.getNombre();
        response.code = curso.getCodigo();
        response.credits = curso.getCreditos();
        response.cycle = curso.getCiclo();
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
}
