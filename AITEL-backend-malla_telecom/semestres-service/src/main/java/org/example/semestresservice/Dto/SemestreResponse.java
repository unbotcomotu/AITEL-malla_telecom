package org.example.semestresservice.Dto;

import org.example.semestresservice.Model.Entity.Semestre;

public class SemestreResponse {
    private Long id;
    private String semestre;
    private Boolean activo;

    public static SemestreResponse from(Semestre semestre) {
        SemestreResponse response = new SemestreResponse();
        response.id = semestre.getId();
        response.semestre = semestre.getSemestre();
        response.activo = semestre.getActivo();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getSemestre() {
        return semestre;
    }

    public Boolean getActivo() {
        return activo;
    }
}
