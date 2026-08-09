package org.example.semestresservice.Dto;

import org.example.semestresservice.Model.TipoHorario;

/**
 * Version minima de una seccion, para incrustar en el historial del alumno
 * sin arrastrar profesores ni bloques.
 */
public class SeccionResumen {
    private Long id;
    private TipoHorario type;
    private String code;

    public SeccionResumen(Long id, TipoHorario type, String code) {
        this.id = id;
        this.type = type;
        this.code = code;
    }

    public Long getId() {
        return id;
    }

    public TipoHorario getType() {
        return type;
    }

    public String getCode() {
        return code;
    }
}
