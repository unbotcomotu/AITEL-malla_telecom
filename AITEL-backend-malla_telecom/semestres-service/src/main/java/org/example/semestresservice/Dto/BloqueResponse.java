package org.example.semestresservice.Dto;

import java.time.LocalTime;

/**
 * Una franja de una seccion. Se expone el dia como numero (1-7) y tambien con
 * su nombre, para que el front no tenga que mantener su propia tabla de
 * equivalencias.
 */
public class BloqueResponse {
    private static final String[] NOMBRES = {
            "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
    };

    private Long id;
    private Integer day;
    private String dayName;
    private String startTime;
    private String endTime;
    private String classroom;

    public BloqueResponse(Long id, Integer day, LocalTime horaInicio, LocalTime horaFin, String aula) {
        this.id = id;
        this.day = day;
        this.dayName = (day != null && day >= 1 && day <= 7) ? NOMBRES[day - 1] : null;
        this.startTime = horaInicio == null ? null : horaInicio.toString();
        this.endTime = horaFin == null ? null : horaFin.toString();
        this.classroom = aula;
    }

    public Long getId() {
        return id;
    }

    public Integer getDay() {
        return day;
    }

    public String getDayName() {
        return dayName;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public String getClassroom() {
        return classroom;
    }
}
