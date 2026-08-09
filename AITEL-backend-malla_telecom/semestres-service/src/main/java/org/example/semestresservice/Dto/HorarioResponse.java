package org.example.semestresservice.Dto;

import org.example.semestresservice.Model.TipoHorario;

import java.util.List;

public class HorarioResponse {
    private Long id;
    private Long courseId;
    private String cycle;
    private String schedule;
    private TipoHorario type;
    private String typeLabel;
    private List<BloqueResponse> blocks;
    private List<ProfesorResumen> professors;
    private int studentsCount;

    public HorarioResponse(Long id, Long courseId, String cycle, String schedule, TipoHorario type,
                            List<BloqueResponse> blocks, List<ProfesorResumen> professors, int studentsCount) {
        this.id = id;
        this.courseId = courseId;
        this.cycle = cycle;
        this.schedule = schedule;
        this.type = type;
        this.typeLabel = type == null ? null : type.getEtiqueta();
        this.blocks = blocks;
        this.professors = professors;
        this.studentsCount = studentsCount;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCycle() {
        return cycle;
    }

    public String getSchedule() {
        return schedule;
    }

    public TipoHorario getType() {
        return type;
    }

    public String getTypeLabel() {
        return typeLabel;
    }

    public List<BloqueResponse> getBlocks() {
        return blocks;
    }

    public List<ProfesorResumen> getProfessors() {
        return professors;
    }

    public int getStudentsCount() {
        return studentsCount;
    }
}
